# Renda Frag

App mobile-first de controle financeiro para quem tem renda fragmentada: freelas, plataformas, bolsas, múltiplas fontes.

## Funcionalidades

- **Home** — saldo disponível, estado do mês (verde/amarelo/vermelho), ritmo de gasto, projeção de poupança e saúde da reserva de emergência
- **Entradas** — registra receitas com valor, fonte e data; edição e exclusão inline
- **Gastos** — importa extrato Nubank (CSV de crédito e Pix/conta), categorização automática com memória de correções por merchant; re-upload com modo substituir
- **Config** — edita todos os parâmetros financeiros inline (renda estimada, meta de poupança, gastos fixos, dinheiro guardado); preferências salvas em chips

## Stack

- React + TypeScript + Vite
- Tailwind CSS v3
- TanStack Query v5
- React Router v6
- Supabase (auth + banco + RLS)
- Vitest

## Rodar localmente

```bash
cp .env.example .env
# preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## Banco de dados

Execute as migrations em ordem no SQL Editor do Supabase:

```
supabase/migrations/001_init.sql
supabase/migrations/002_add_tipo_reserva.sql
supabase/migrations/003_add_categorias_usuario.sql
```

## Testes

```bash
npm run test
```
