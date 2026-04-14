#!/usr/bin/env bash
# scripts/pre-pr.sh — auto-fix + verify all CI checks locally before opening a PR.
# Mirrors the checks run by .github/workflows/pr-checks.yml.
#
# Actions vs checks:
#   lint       → npm run lint        (reports errors; ESLint --fix is NOT run to avoid hidden surprises)
#   typecheck  → npm run typecheck   (tsc --noEmit, check only)
#   test       → npm run test        (vitest run, check only)
#   npm_audit  → npm audit fix       (auto-fixes what it can; remaining high vulns fail the gate)
#   build      → npm run build       (tsc -b + vite build, check only)
#   gitleaks   → gitleaks detect     (optional — skipped if not installed)
#
# Dependency graph:
#   Wave 1 (parallel): lint | typecheck | test | gitleaks
#   Wave 2:            npm_audit   ← needs lint + typecheck
#   Wave 3:            build       ← needs npm_audit + test
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# ── Node version guard ─────────────────────────────────────────────────────────
NODE_MAJOR=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  echo -e "\033[0;31m\033[1mNode.js >= 20 required (found v$(node -v | tr -d v)). Run: nvm use 20\033[0m"
  exit 1
fi

# ── colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; DIM='\033[2m'; RESET='\033[0m'

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

declare -A PIDS STATUS
declare -a ORDER PENDING

# ── helpers ───────────────────────────────────────────────────────────────────
banner()   { echo -e "\n${CYAN}${BOLD}── $* ──${RESET}"; }
has_tool() { command -v "$1" &>/dev/null; }

# ── hints (shown on failure) ──────────────────────────────────────────────────
declare -A HINTS
HINTS[lint]="fix ESLint errors: npm run lint — or run eslint --fix on specific files"
HINTS[typecheck]="fix TypeScript errors above; run: npm run typecheck for details"
HINTS[test]="fix the failing tests above; run: npm run test -- --reporter=verbose"
HINTS[npm_audit]="npm audit fix could not resolve all high vulnerabilities; upgrade packages manually"
HINTS[build]="fix the build errors above; run: npm run build for details"
HINTS[gitleaks]="remove the secret from history; see: git-filter-repo or BFG"

# ── launch ────────────────────────────────────────────────────────────────────
launch() {
    local name="$1"; shift
    ORDER+=("$name")
    PENDING+=("$name")
    local log="${WORKDIR}/${name}.log"
    local sf="${WORKDIR}/${name}.status"
    (
        "$@" > "$log" 2>&1
        echo $? > "$sf"
    ) &
    PIDS["$name"]=$!
    printf "${DIM}  %-14s started${RESET}\n" "$name"
}

# ── mark_skip ─────────────────────────────────────────────────────────────────
mark_skip() {
    local name="$1" reason="$2"
    ORDER+=("$name")
    STATUS["$name"]=skip
    echo -e "\n${YELLOW}${BOLD}┌─ $name${RESET}"
    echo -e "${YELLOW}│${RESET}  skipped — $reason"
    echo -e "${YELLOW}${BOLD}└─ SKIP${RESET}"
}

# ── print_section ─────────────────────────────────────────────────────────────
print_section() {
    local name="$1"
    local code="${STATUS[$name]}"
    local log="${WORKDIR}/${name}.log"
    local color label
    if [[ "$code" -eq 0 ]]; then color="$GREEN"; label="PASS"
    else                          color="$RED";   label="FAIL"
    fi

    echo -e "\n${color}${BOLD}┌─ $name${RESET}"
    if [[ -f "$log" && -s "$log" ]]; then
        while IFS= read -r line; do
            printf "${color}│${RESET}  %s\n" "$line"
        done < "$log"
    fi
    echo -e "${color}${BOLD}└─ $label${RESET}"
    if [[ "$code" -ne 0 && -n "${HINTS[$name]:-}" ]]; then
        echo -e "   ${DIM}hint: ${HINTS[$name]}${RESET}"
    fi
}

# ── flush_completed ───────────────────────────────────────────────────────────
flush_completed() {
    local still_pending=()
    for name in "${PENDING[@]+"${PENDING[@]}"}"; do
        local sf="${WORKDIR}/${name}.status"
        if [[ -f "$sf" ]]; then
            wait "${PIDS[$name]}" 2>/dev/null || true
            STATUS["$name"]=$(cat "$sf")
            print_section "$name"
        else
            still_pending+=("$name")
        fi
    done
    PENDING=("${still_pending[@]+"${still_pending[@]}"}")
}

# ── wait_for ──────────────────────────────────────────────────────────────────
wait_for() {
    while true; do
        flush_completed
        local all_done=true
        for name in "$@"; do
            [[ "${STATUS[$name]+_}" ]] || { all_done=false; break; }
        done
        $all_done && break
        sleep 0.1
    done
}

# ── gate_ok ───────────────────────────────────────────────────────────────────
gate_ok() {
    for name in "$@"; do
        local s="${STATUS[$name]:-1}"
        [[ "$s" =~ ^[0-9]+$ && "$s" -eq 0 ]] || return 1
    done
}

# ─────────────────────────────────────────────────────────────────────────────
# Wave 0 — npm install
# ─────────────────────────────────────────────────────────────────────────────
banner "Wave 0 — npm install"
npm install
if [[ $? -ne 0 ]]; then
    echo -e "${RED}${BOLD}npm install failed — cannot proceed.${RESET}"
    exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# Wave 1 — parallel independent checks
# ─────────────────────────────────────────────────────────────────────────────
banner "Wave 1 — parallel: lint | typecheck | test | gitleaks"

launch lint      npm run lint
launch typecheck npm run typecheck
launch test      npm run test

if has_tool gitleaks; then
    launch gitleaks gitleaks detect --source . -v
else
    mark_skip gitleaks "not installed — https://github.com/gitleaks/gitleaks#installing"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Gate: wait for lint + typecheck before npm audit
# ─────────────────────────────────────────────────────────────────────────────
banner "Gate — lint | typecheck"
wait_for lint typecheck

# ─────────────────────────────────────────────────────────────────────────────
# Wave 2 — npm audit (needs lint + typecheck)
# ─────────────────────────────────────────────────────────────────────────────
if gate_ok lint typecheck; then
    banner "Wave 2 — npm_audit"
    launch npm_audit bash -c 'npm audit fix --audit-level=high --omit=dev; audit_rc=$?; npm install && exit $audit_rc'

    banner "Gate — npm_audit + test"
    wait_for npm_audit test

    # ── Wave 3 — build (needs npm_audit + test) ───────────────────────────
    if gate_ok npm_audit test; then
        banner "Wave 3 — build"
        launch build npm run build
        wait_for build
    else
        mark_skip build "npm_audit or test failed"
    fi
else
    mark_skip npm_audit "lint/typecheck gate failed"
    mark_skip build     "lint/typecheck gate failed"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Drain remaining wave-1 checks (gitleaks, test if still running)
# ─────────────────────────────────────────────────────────────────────────────
if [[ ${#PENDING[@]} -gt 0 ]]; then
    banner "Waiting for remaining checks…"
    while [[ ${#PENDING[@]} -gt 0 ]]; do
        flush_completed
        [[ ${#PENDING[@]} -gt 0 ]] && sleep 0.1
    done
fi

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}══════════════════════════════════════════${RESET}"
echo -e "${BOLD} Pre-PR Summary${RESET}"
echo -e "${BOLD}══════════════════════════════════════════${RESET}\n"

any_failed=false
for name in "${ORDER[@]}"; do
    s="${STATUS[$name]:-?}"
    if   [[ "$s" == skip ]]; then
        printf "  ${YELLOW}SKIP${RESET}  %s\n" "$name"
    elif [[ "$s" =~ ^[0-9]+$ && "$s" -eq 0 ]]; then
        printf "  ${GREEN}PASS${RESET}  %s\n" "$name"
    else
        printf "  ${RED}FAIL${RESET}  %s\n" "$name"
        printf "        ${DIM}hint: %s${RESET}\n" "${HINTS[$name]:-see output above}"
        any_failed=true
    fi
done

echo ""
if $any_failed; then
    echo -e "${RED}${BOLD}Fix the issues above before opening a PR.${RESET}"
    exit 1
else
    echo -e "${GREEN}${BOLD}All checks passed. Safe to open a PR.${RESET}"
    exit 0
fi
