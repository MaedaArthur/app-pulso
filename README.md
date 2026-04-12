# Renda Frag

App mobile-first de controle financeiro para quem tem renda fragmentada — freelas, plataformas, bolsas, múltiplas fontes.

## O que faz

- **Home** — saldo disponível em tempo real, estado do mês (verde/amarelo/vermelho), ritmo de gasto e projeção de poupança
- **Entradas** — registra receitas com fonte e data, edição inline
- **Gastos** — importa extrato Nubank (crédito e Pix/conta), categorização automática com memória de correções por merchant
- **Reserva** — acompanha saúde da reserva de emergência (meses cobertos)
- **Config** — edita todos os parâmetros financeiros inline, sem formulário de salvar

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
