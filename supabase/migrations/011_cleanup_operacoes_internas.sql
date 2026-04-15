-- Remove gastos persistidos no banco que correspondem a operações internas
-- do extrato (pagamento de fatura, aplicação/resgate RDB). Essas linhas não
-- são gastos reais — são movimentações entre conta corrente, RDB e fatura —
-- mas podem ter entrado na tabela em imports antigos, antes do filtro em
-- csvParser.ts ser adicionado.

create extension if not exists unaccent;

delete from gastos
where origem = 'csv'
  and (
    lower(unaccent(titulo)) like '%pagamento de fatura%'
    or lower(unaccent(titulo)) like '%aplicacao rdb%'
    or lower(unaccent(titulo)) like '%resgate rdb%'
  );
