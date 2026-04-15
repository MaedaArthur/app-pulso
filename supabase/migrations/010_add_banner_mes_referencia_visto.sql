-- Flag para o banner informativo sobre a feature de mês de referência.
-- Usuários pré-existentes veem o banner uma vez (false). Novos usuários
-- cadastrados após o deploy não precisam ver — o default da coluna é true.

alter table perfis
  add column banner_mes_referencia_visto boolean default true;

-- Pré-existentes veem o banner.
update perfis set banner_mes_referencia_visto = false;
