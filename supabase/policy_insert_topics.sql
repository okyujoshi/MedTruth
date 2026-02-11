-- 解説自動生成APIからトピックを追加できるようにする
-- SQL Editor で一度だけ実行してください。

create policy "Allow public insert medtruth_topics"
  on medtruth_topics for insert with check (true);
