-- LaTeX Studio: 数式ログテーブル
-- Supabase ダッシュボード > SQL Editor でこのファイルの内容を実行してください
-- (既存プロジェクトを更新する場合は supabase/migrations/ 内のSQLを実行)

create table if not exists public.equations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  latex text not null,
  display boolean not null default true,
  color text not null default '#000000',
  title text,
  created_at timestamptz not null default now()
);

create index if not exists equations_user_created
  on public.equations (user_id, created_at desc);

-- Row Level Security: 自分の行だけ読み書きできる
alter table public.equations enable row level security;

create policy "select own equations"
  on public.equations for select
  using (auth.uid() = user_id);

create policy "insert own equations"
  on public.equations for insert
  with check (auth.uid() = user_id);

create policy "update own equations"
  on public.equations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own equations"
  on public.equations for delete
  using (auth.uid() = user_id);
