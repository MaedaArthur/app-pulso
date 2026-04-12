create table if not exists categorias_custom (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nome text not null,
  created_at timestamptz default now(),
  unique(user_id, nome)
);

alter table categorias_custom enable row level security;

create policy "user manages own categorias_custom"
  on categorias_custom for all
  using (auth.uid() = user_id);
