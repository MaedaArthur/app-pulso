# Renda Frag — Design do MVP (Fase 0)

**Status:** Aprovado — brainstorm concluído em 2026-04-11.
**Próximo passo:** Executar o plano de implementação gerado por writing-plans.

---

## Contexto

App mobile-first de controle financeiro para pessoas com renda fragmentada: estagiários, bolsistas, freelancers, trabalhadores de plataforma. Responde uma pergunta central: **"tô bem esse mês?"**

Público: 10–15 milhões de pessoas no Brasil. Linguagem simples, sem jargão financeiro, gratuito na fase de validação.

---

## Escopo — Fase 0 apenas

| Feature | Descrição |
|---|---|
| Onboarding | 5 perguntas em estilo chat |
| Registro de entradas | Valor, fonte, data via formulário inline |
| Importação CSV Nubank | Crédito + débito/Pix, categorização automática, deduplicação por hash, confirmação em bottom sheet |
| Saldo disponível real | `dinheiro_guardado − total_gasto_no_mes − meta_poupanca_mensal` |
| Estado do mês | Verde / amarelo / vermelho com base na renda estimada |
| Ritmo do mês | Usa apenas gastos variáveis (total − gastos fixos declarados) |
| Conta de usuário | Email + senha via Supabase Auth |
| Analytics básico | Tabela `events` no Supabase |

---

## Navegação — APROVADO

Tab bar fixa na parte inferior com 4 abas:

| Aba | Ícone | Conteúdo |
|---|---|---|
| Início | ◉ | Overview/dashboard (tela principal) |
| Entradas | 💰 | Formulário inline + lista de entradas do mês |
| Gastos | 📄 | Categorias com barras + importação CSV |
| Config | ⚙️ | Dinheiro guardado, meta de poupança, gastos fixos, perfil |

---

## Tela Home — APROVADO

Scroll único com 4 blocos em ordem:

### Bloco 1 — Hero (status + saldo)
- Saudação com nome do usuário
- Card com gradiente verde/amarelo/vermelho conforme estado do mês
- Saldo disponível em destaque (fonte grande, ~42px)
- Legenda: "disponível depois de guardar"
- Se último import de gastos > 7 dias: aviso "⚠ gastos desatualizados · importar →" (link para tela Gastos)

### Bloco 2 — Ritmo do mês
- Label: "Faltam X dias de mês"
- Barra de progresso proporcional aos dias passados
- Linha: "Gastou R$ X até agora" + indicador "ritmo ok ✓" ou "cuidado ⚠"
- Caixa de sugestão construtiva (nunca termina em negativo, sempre com ação)

### Bloco 3 — Resumo lado a lado
- Dois cards: "↑ Entrou" e "↓ Saiu"
- Cada card: total do mês + 2–3 últimas transações + link "ver tudo →"

### Bloco 4 — Onde foi o dinheiro
- Título: "Onde foi o dinheiro?"
- Barras horizontais por categoria (não donut chart — mais legível em mobile)
- Máximo 4 categorias + "outros X% · ver completo →"

---

## Tela Entradas — APROVADO

Formulário inline sempre visível no topo, lista de entradas do mês abaixo.

### Formulário (topo, sempre visível)
- Campo de valor (destaque, fonte grande, R$ em verde)
- Campo de fonte (texto livre, ex: "salário", "freela design")
- Campo de data (default: hoje)
- Botão "Salvar"

### Lista abaixo do formulário
- Cada item: nome da fonte + data à esquerda, valor em verde à direita
- Ordenação: mais recente primeiro
- Total do mês em destaque acima da lista

---

## Tela Gastos — APROVADO

> **Escopo Fase 0:** gastos vêm exclusivamente via importação CSV Nubank. Não há formulário de adição manual de gastos nesta fase.

### Header
- Total de gastos do mês em destaque (vermelho)
- "atualizado em DD/MM" discreto abaixo do total (cinza)
- Botão "📄 CSV" discreto no canto direito

### Lista de categorias
- Cada categoria: ícone + nome à esquerda, total à direita
- Barra horizontal proporcional ao gasto em relação ao total
- Subtítulo: "X transações · toca para ver"
- Toca na categoria: expande lista de itens individuais

### Fluxo de importação CSV — APROVADO

1. Usuário toca "📄 CSV"
2. **Modal de instrução abre** (antes do seletor de arquivo):
   - Título: "Como exportar do Nubank"
   - Crédito: Abra o app → Cartão → toque na fatura → "..." → *Exportar fatura*
   - Pix/débito: Abra o app → Conta → Extrato → escolha o período → *Exportar*
   - Nota: "Você pode importar os dois — cada um cobre um tipo de gasto."
   - Botão: "Já tenho o arquivo →"
3. Toca no botão → seletor de arquivo nativo do OS
4. Arquivo selecionado → app detecta o tipo automaticamente (crédito ou Pix/débito) pela estrutura de colunas do CSV
5. Bottom sheet sobe com resumo por categoria + total
   - Ex: "23 gastos encontrados · R$ 1.240 total"
   - Agrupado por categoria com totais
   - Botão "Importar tudo ✓" / "Cancelar"
6. Confirmar → bottom sheet fecha, gastos aparecem na lista
7. Reimportações do mesmo arquivo ou períodos sobrepostos: deduplicação silenciosa por hash (sem duplicatas)

---

## Tela Config — APROVADO

Campos editáveis inline com borda colorida. Sem modais, edição direta na tela.

### Campo "Dinheiro guardado" (borda verde)
- Valor atual em destaque
- Ícone de lápis ao lado — toca para editar inline
- Subtítulo: "Toca para editar. Afeta seu saldo disponível."

### Campo "Meta de poupança / mês" (borda roxa)
- Valor atual em destaque
- Ícone de lápis ao lado — toca para editar inline
- Subtítulo: "Reservado antes de calcular o disponível."

### Campo "Contas fixas / mês" (borda azul)
- Valor atual em destaque
- Ícone de lápis ao lado — toca para editar inline
- Subtítulo: "Aluguel, internet, assinaturas — o que chega todo mês."

### Conta
- Item único no rodapé: email do usuário + seta
- "Sair da conta" abaixo

---

## Onboarding — APROVADO

Estilo chat: app faz perguntas em balões, usuário responde com chips. Uma tela única com scroll automático após cada resposta.

### Fluxo (5 perguntas)

**Tela de boas-vindas**
> "Olá! Vamos configurar. Leva menos de 1 minuto."

**Pergunta 1 — tipo de renda**
> "Que tipo de renda você tem? 👋"
> *chips multi-select:* 💼 Salário fixo · 🎨 Freela · 🛵 Plataforma · 🎓 Bolsa · + Outro

**Pergunta 2 — renda estimada**
> "Em média, quanto costuma entrar na sua conta por mês? 💸"
> *sublinhado:* "uma estimativa já ajuda — você pode ajustar depois em Config"
> *chips single-select:* até R$ 1.500 · R$ 1.500–3.000 · R$ 3.000–5.000 · acima de R$ 5.000
> *valor interno:* ponto médio da faixa (ex: R$ 2.250 para R$ 1.500–3.000)

**Pergunta 3 — gastos fixos**
> "Quanto você paga de contas fixas todo mês? 🏠"
> *sublinhado:* "aluguel, internet, Netflix, academia — o que chega todo mês independente do que você faz"
> *input numérico:* R$ ____ (valor exato, não faixa)

**Pergunta 4 — onde guarda**
> "Onde fica esse dinheiro? 🏦"
> *chips single-select:* 💚 Nubank · 🏦 Banco trad. · 💰 Poupança · 💵 Carteira

**Pergunta 5 — foco**
> "Qual é seu foco agora? 🎯"
> *chips single-select:* 🛡 Reserva de emergência · 💳 Pagar dívida · 📊 Gastar melhor

Após última resposta: botão "Entrar no app →" aparece.

**Tela de dica pós-onboarding** (aparece uma vez, antes da Home):
> "Dica: importe seu extrato Nubank toda semana pra manter o saldo certinho. Leva menos de 1 minuto."
> Botão: "Entendido →"

### Dados salvos no perfil
- `como_recebe` — chips P1 (join com "+", ex: "salario+freela")
- `renda_mensal_estimada` — ponto médio da faixa P2
- `gastos_fixos_mensais` — valor numérico P3
- `onde_guarda` — chip P4
- `foco` — chip P5

---

## Arquitetura — APROVADO

### Stack
- **Frontend:** React + Vite + TypeScript strict + Tailwind CSS
- **Gráficos:** Recharts
- **Estado server-side:** TanStack Query (cache, loading, invalidação automática)
- **Estado local:** Context do React (apenas auth/perfil) — sem Zustand no MVP
- **Backend:** Supabase (PostgreSQL + Auth + API auto-gerada)
- **Deploy:** Vercel (frontend) + Supabase (backend)

### Camadas

```
Telas (.tsx)
    ↕ chamam hooks
Hooks customizados (useEntradas, useGastos, useSaldo, useOnboarding)
    ↕ usam TanStack Query para server state
TanStack Query (cache + sincronização)
    ↕ busca dados              ↕ aplica cálculos
Supabase (banco)          finance.ts (funções puras)
```

### Módulos lib/

| Arquivo | Responsabilidade |
|---|---|
| `finance.ts` | Funções puras: `calcularSaldo()`, `estadoDoMes()`, `ritmoDeMes()` |
| `csvParser.ts` | Parse dos 2 formatos Nubank (crédito e débito/Pix) |
| `categories.ts` | Palavras-chave → categoria automática |
| `analytics.ts` | `track(event, properties)` → insere em `events` no Supabase |
| `supabase.ts` | Client singleton do Supabase |

### Estrutura de arquivos

```
src/
  components/
    home/
      HeroStatus.tsx
      RitmoDoMes.tsx
      ResumoEntradaGasto.tsx
      CategoriasGastos.tsx
    entradas/
      EntradaForm.tsx
      EntradaLista.tsx
    gastos/
      CategoriaCard.tsx
      CsvImportSheet.tsx
      CsvTutorialModal.tsx
    onboarding/
      OnboardingChat.tsx
    config/
      CampoEditavel.tsx
    shared/
  hooks/
    useEntradas.ts
    useGastos.ts
    useSaldo.ts
    useOnboarding.ts
  lib/
    finance.ts
    csvParser.ts
    categories.ts
    analytics.ts
    supabase.ts
  pages/
    Home.tsx
    Entradas.tsx
    Gastos.tsx
    Config.tsx
    Onboarding.tsx
  router.tsx
  main.tsx
```

---

## Lógica financeira

```typescript
// Saldo disponível real
saldo_real = dinheiro_guardado - total_gasto_no_mes - meta_poupanca_mensal

// Estado do mês (usa renda estimada como referência)
verde    → saldo_real > 20% de renda_mensal_estimada
amarelo  → saldo_real entre 0% e 20% de renda_mensal_estimada
vermelho → saldo_real < 0

// Ritmo do mês (exclui gastos fixos — foca no variável)
gasto_variavel = total_gasto_no_mes - gastos_fixos_mensais
dias_passados / dias_totais_mes  = % do mês consumido
gasto_variavel / renda_mensal_estimada = % da renda consumida
ritmo_ok → % gasto_variavel <= % dias_passados + margem de 10%
```

---

## Schema Supabase — APROVADO

```sql
-- Perfil do usuário (complementa auth.users)
create table perfis (
  id uuid references auth.users(id) primary key,
  nome text,
  dinheiro_guardado numeric default 0,
  meta_poupanca_mensal numeric default 0,
  gastos_fixos_mensais numeric default 0,
  renda_mensal_estimada numeric default 0,
  como_recebe text,         -- onboarding P1: ex: "salario+freela"
  onde_guarda text,         -- onboarding P4: ex: "nubank"
  foco text,                -- onboarding P5: ex: "reserva"
  created_at timestamptz default now()
);

-- Entradas de renda
create table entradas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  valor numeric not null,
  fonte text not null,
  data date not null,
  created_at timestamptz default now()
);

-- Gastos (importados via CSV)
create table gastos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  valor numeric not null,
  titulo text not null,
  categoria text not null,
  data date not null,
  origem text default 'csv',        -- 'csv' | 'manual' (manual reservado para fases futuras)
  hash text not null,               -- sha256(user_id+data+titulo+valor) para deduplicação
  created_at timestamptz default now(),
  unique(user_id, hash)             -- garante que reimportações não criem duplicatas
);

-- Analytics
create table events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  event text not null,
  properties jsonb,
  created_at timestamptz default now()
);
```

### RLS (Row Level Security)
Todas as tabelas habilitam RLS com política: `user_id = auth.uid()`. Perfis usa `id = auth.uid()`.

---

## Backlog (fases futuras)

- **Fase 1:** Integração via Pluggy (Open Finance) — elimina necessidade de exportar CSV manualmente
- **Fase 2:** Detecção automática de gastos fixos por recorrência — app identifica sozinho após 2–3 meses de dados
- **Fase 2:** Adição manual de gastos individuais
