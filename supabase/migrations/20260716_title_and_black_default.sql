-- 既存プロジェクト向けマイグレーション (2026-07-16)
-- Supabase ダッシュボード > SQL Editor で実行してください
--
-- 変更内容:
--  1. 履歴の名前変更用に title カラムを追加
--  2. 数式カラーのデフォルトを黒 (#000000) に変更
--  3. 既存の白 (#ffffff) の数式を黒に更新(白背景で見えなくなるため)
--  4. リネームに必要な UPDATE の RLS ポリシーを追加

alter table public.equations add column if not exists title text;

alter table public.equations alter column color set default '#000000';

update public.equations set color = '#000000' where color = '#ffffff';

drop policy if exists "update own equations" on public.equations;
create policy "update own equations"
  on public.equations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
