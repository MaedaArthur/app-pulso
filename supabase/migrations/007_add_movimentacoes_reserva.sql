create table if not exists movimentacoes_reserva (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  valor numeric not null,
  descricao text,
  created_at timestamptz default now()
);

alter table movimentacoes_reserva enable row level security;

create policy "user manages own movimentacoes_reserva"
  on movimentacoes_reserva for all
  using (auth.uid() = user_id);
