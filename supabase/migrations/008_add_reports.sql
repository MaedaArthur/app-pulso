create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  tipo text not null,
  descricao text not null,
  created_at timestamptz default now()
);

alter table reports enable row level security;

create policy "user can insert own reports"
  on reports for insert
  with check (auth.uid() = user_id);
