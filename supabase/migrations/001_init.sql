-- Perfil do usuário (complementa auth.users)
create table perfis (
  id uuid references auth.users(id) on delete cascade primary key,
  nome text,
  dinheiro_guardado numeric default 0,
  meta_poupanca_mensal numeric default 0,
  gastos_fixos_mensais numeric default 0,
  renda_mensal_estimada numeric default 0,
  como_recebe text,
  onde_guarda text,
  foco text,
  onboarding_completo boolean default false,
  dica_csv_vista boolean default false,
  created_at timestamptz default now()
);

alter table perfis enable row level security;

create policy "perfis: usuario acessa apenas o proprio"
  on perfis for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- Entradas de renda
create table entradas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  valor numeric not null,
  fonte text not null,
  data date not null,
  created_at timestamptz default now()
);

alter table entradas enable row level security;

create policy "entradas: usuario acessa apenas as proprias"
  on entradas for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Gastos (importados via CSV)
create table gastos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  valor numeric not null,
  titulo text not null,
  categoria text not null,
  data date not null,
  origem text default 'csv',
  hash text not null,
  created_at timestamptz default now(),
  unique(user_id, hash)
);

alter table gastos enable row level security;

create policy "gastos: usuario acessa apenas os proprios"
  on gastos for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Analytics
create table events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  event text not null,
  properties jsonb,
  created_at timestamptz default now()
);

alter table events enable row level security;

create policy "events: usuario insere apenas os proprios"
  on events for insert
  with check (user_id = auth.uid());

-- Trigger: criar perfil automaticamente após signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis (id, nome)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
