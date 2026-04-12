create table if not exists categorias_usuario (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  merchant_key text not null,
  categoria text not null,
  created_at timestamptz default now(),
  unique(user_id, merchant_key)
);

alter table categorias_usuario enable row level security;

create policy "user manages own categorias"
  on categorias_usuario for all
  using (auth.uid() = user_id);
