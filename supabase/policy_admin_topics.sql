-- 管理画面からトピックの更新・削除を可能にする
-- ログインユーザー（認証済み）のみ実行可能
-- SQL Editor で実行してください。

create policy "Allow authenticated update medtruth_topics"
  on medtruth_topics for update
  to authenticated
  using (true)
  with check (true);

create policy "Allow authenticated delete medtruth_topics"
  on medtruth_topics for delete
  to authenticated
  using (true);
