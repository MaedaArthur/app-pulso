-- Adiciona mes_referencia em gastos e entradas (cash-basis).
-- Backfill determinístico: mes_referencia = 1º dia do mês da coluna `data`.
-- Preserva o comportamento pré-feature. Correções retroativas são manuais,
-- via UI de edição ou reimport com substituir = true.

alter table gastos   add column mes_referencia date;
alter table entradas add column mes_referencia date;

update gastos   set mes_referencia = date_trunc('month', data)::date;
update entradas set mes_referencia = date_trunc('month', data)::date;

alter table gastos   alter column mes_referencia set not null;
alter table entradas alter column mes_referencia set not null;

create index if not exists gastos_user_mes_idx   on gastos   (user_id, mes_referencia);
create index if not exists entradas_user_mes_idx on entradas (user_id, mes_referencia);
