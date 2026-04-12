# Study Guide — Renda Frag
_Sessão: 2026-04-12 | Nível: iniciante_

---

## Arquitetura do Projeto

**Stack:** React + TypeScript · Vite · Tailwind CSS · TanStack Query · React Router · Supabase

```
[Usuário / Mobile Browser]
        ↓
[React Router] → páginas: Home · Entradas · Gastos · Config · Auth · Onboarding
        ↓
[Componentes por página]  ←→  [Hooks (lógica + dados)]
                                        ↓
                              [TanStack Query]  (cache local + sincronização)
                                        ↓
                              [Supabase Client]  (auth + banco Postgres + RLS)
                                        ↓
                              [Supabase Cloud]
```

**Estrutura relevante:**
```
src/
├── pages/         — 6 telas principais (Auth, Onboarding, Home, Entradas, Gastos, Config)
├── components/    — UI organizada por página (home/, gastos/, entradas/, config/, onboarding/, tour/)
├── hooks/         — toda lógica de dados (13 hooks, padrão useQuery/useMutation)
├── lib/           — utilitários: csvParser, finance, categories, supabase, fmt, datas
└── types.ts       — tipagem compartilhada
supabase/migrations/ — 4 migrations do banco
```

**Fluxo principal:** o usuário loga via Supabase Auth → o app carrega o perfil (metas, parâmetros) → cada página usa hooks que consultam o Supabase via TanStack Query → dados de gastos podem vir de upload CSV do Nubank ou entrada manual → cálculos financeiros acontecem em `lib/finance.ts` → a Home exibe o diagnóstico do mês.

**Importante:** este projeto não tem backend próprio escrito em código. O Supabase faz esse papel inteiro — banco de dados, autenticação e regras de segurança (RLS). O código React só contém o frontend.

---

## Resumo da Sessão

### Bloco 1 — Auth: quem é você e o que você pode ver

**Auth** (autenticação) é o sistema de login — responde: "essa pessoa é quem ela diz que é?". O Supabase não é só banco: é um serviço completo com banco Postgres, sistema de login pronto e regras de segurança. Funciona como um "backend terceirizado".

Fluxo:
```
[Usuário digita email + senha]
        ↓
[Auth.tsx — tela de login]
        ↓ chama Supabase
[Supabase valida]
        ↓ devolve uma "session" (token — crachá temporário)
[AuthContext.tsx — guarda a session na memória do app]
        ↓
[Redireciona para Home]
```

- `src/pages/Auth.tsx` — a tela visual com formulário de email/senha
- `src/contexts/AuthContext.tsx` — "guarda-crachá" global; ouve mudanças na session e atualiza o app inteiro via Context (mecanismo do React para compartilhar informação com qualquer componente)

### Bloco 2 — Router + Guards: o porteiro das páginas

O router define qual página aparece em cada URL. Antes de qualquer página, guards verificam se o usuário tem permissão:

```
Usuário acessa qualquer URL
        ↓
[AppGuard] — "Você tem crachá?"
    ├── Não tem → /auth
    ├── Tem, mas não fez onboarding → /onboarding
    └── Tudo certo → mostra a página pedida
```

- `AppGuard` — protege Home, Entradas, Gastos e Config. Exige login E onboarding completo.
- `OnboardingGuard` — protege /onboarding. Se onboarding já foi feito, vai direto pra Home.
- `<Outlet />` — "buraco" onde a página pedida é renderizada se passar pela verificação.
- `AppLayout` — moldura de todas as páginas logadas; adiciona o TabBar em toda tela.

Arquivo: `src/router.tsx`

### Bloco 3 — Onboarding: configurando o perfil do usuário

Depois do login, antes da Home, o app coleta parâmetros financeiros do usuário (renda estimada, gastos fixos, dinheiro guardado, foco). Esses dados alimentam todos os cálculos da Home.

```
[OnboardingPages.tsx]
   passo: splash → p1 → p2 → p3 → p4 → p5 → p6 → [p7 opcional] → done
                                                         ↓
                                              só aparece se dinheiro guardado > 0
        ↓ "Entrar no app"
[useOnboarding.ts] → salva no Supabase (tabela: perfis, onboarding_completo: true)
        ↓
[AppGuard libera acesso à Home]
```

- `src/components/onboarding/OnboardingPages.tsx` — controla os passos com estado `passo`; respostas acumuladas em `respostas` até o final
- `src/hooks/useOnboarding.ts` — manda tudo de uma vez pro Supabase ao clicar "Entrar no app"

### Bloco 4 — Hooks + TanStack Query: como os dados chegam na tela

Hook é uma função do React que começa com `use`. Encapsula lógica reutilizável — qualquer página que precisar de dados só "encaixa" o hook correspondente, sem reescrever a lógica de busca.

```
[Página abre]
      ↓
[Hook chamado, ex: usePerfil()]
      ↓
[TanStack Query verifica: tenho isso em cache?]
    ├── Sim, ainda fresco → devolve direto (sem ir ao Supabase)
    └── Não → chama supabase.from('perfis').select(...)
                        ↓
              [Supabase responde com os dados]
                        ↓
              [TanStack Query guarda em cache + devolve pra página]
```

- `src/lib/supabase.ts` — cria a conexão com o Supabase usando URL e chave do `.env`
- `src/hooks/usePerfil.ts` — busca o perfil do usuário; `staleTime: 5min` evita buscas desnecessárias
- `src/hooks/useEntradas.ts` — busca entradas do mês; filtra por `user_id` e por data

Na página: `const { data: perfil, isLoading } = usePerfil()` — `data` tem os dados quando chegaram, `isLoading` é `true` enquanto carrega.

**RLS (Row Level Security):** regra configurada no próprio Supabase que impede um usuário de ver dados de outro. Por isso os hooks não precisam de verificação extra — o banco já bloqueia.

### Bloco 5 — TanStack Query: o cache inteligente

O TanStack Query gerencia o ciclo de vida dos dados:

```
[Página pede dados]
        ↓
[TanStack Query]
    ├── "Já tenho e é fresco?" → entrega na hora
    ├── "Tenho, mas está velho?" → entrega o que tem E vai buscar novo em paralelo
    └── "Não tenho" → busca no Supabase, guarda, entrega
```

O `queryKey` é o endereço do cache — muda automaticamente quando mês ou usuário muda.

Ciclo de atualização após escrita:
```
[usuário adiciona entrada]
        ↓
[useAdicionarEntrada → salva no Supabase]
        ↓
[invalidateQueries('entradas')] — marca cache como velho
        ↓
[useEntradas busca de novo automaticamente]
        ↓
[tela atualiza sem recarregar a página]
```

### Bloco 6 — Home: o diagnóstico do mês

A Home delega tudo para `useSaldo`, que agrega dados de `usePerfil`, `useEntradas` e `useGastos`, passa por `lib/finance.ts` e devolve os números prontos.

```
[Home.tsx]
    └── useSaldo()
            ├── usePerfil()   → parâmetros do usuário
            ├── useEntradas() → receitas do mês
            └── useGastos()   → gastos do mês
                    ↓
            [lib/finance.ts]
                    ↓
            saldoReal, estado, ritmo, projecaoMeta, saudeReserva...
```

As 4 funções de `lib/finance.ts`:

| Função | O que calcula |
|---|---|
| `calcularSaldo` | `dinheiro guardado + entradas - gastos` (guardado só entra se tipo = "buffer") |
| `estadoDoMes` | Verde / Amarelo / Vermelho baseado em % da renda estimada |
| `ritmoDeMes` | Compara % do mês passado com % da renda já gasta |
| `calcularSaudeReserva` | Quantos meses de colchão o dinheiro guardado cobre |

---

## Plano de Estudos

### React Hooks — a base de tudo neste projeto
- **Onde aparece:** todos os arquivos em `src/hooks/`, `AuthContext.tsx`, `OnboardingPages.tsx`
- **Ponto de partida:** pesquise `"React hooks useState useEffect explained"`
- **Indo mais fundo:** `"React custom hooks tutorial"` — entender como criar hooks como os do projeto
- **Meta:** conseguir ler qualquer hook do projeto e entender o que ele faz e quando dispara

### TanStack Query — sincronização com o banco
- **Onde aparece:** todos os hooks de dados (`usePerfil`, `useEntradas`, `useGastos`, etc.)
- **Ponto de partida:** pesquise `"TanStack Query v5 getting started"`
- **Indo mais fundo:** `"TanStack Query queryKey invalidateQueries"` — entender o ciclo de cache
- **Meta:** conseguir adicionar uma nova busca de dados seguindo o padrão dos hooks existentes

### Supabase: banco + RLS — o backend do app
- **Onde aparece:** `src/lib/supabase.ts`, todas as queries nos hooks, `supabase/migrations/`
- **Ponto de partida:** pesquise `"Supabase Row Level Security tutorial"`
- **Indo mais fundo:** `"Supabase Postgres queries select insert update"` — entender a sintaxe das queries encadeadas
- **Meta:** conseguir criar uma nova tabela com RLS e buscar os dados num hook

### React Router v6 + rotas protegidas — navegação com segurança
- **Onde aparece:** `src/router.tsx` — `AppGuard`, `OnboardingGuard`, `Outlet`
- **Ponto de partida:** pesquise `"React Router v6 protected routes"`
- **Indo mais fundo:** `"React Router Outlet nested routes"` — entender o padrão de layouts aninhados
- **Meta:** entender por que o app não deixa entrar na Home sem login, e conseguir adicionar uma nova rota protegida

### TypeScript básico para React — ler e escrever o código do projeto
- **Onde aparece:** todos os arquivos `.ts` e `.tsx` — `interface`, `type`, generics como `useState<User | null>`
- **Ponto de partida:** pesquise `"TypeScript for React developers beginner"`
- **Indo mais fundo:** `"TypeScript interface vs type"` e `"TypeScript generics explained simply"`
- **Meta:** entender qualquer anotação de tipo nos arquivos do projeto sem travar na leitura
