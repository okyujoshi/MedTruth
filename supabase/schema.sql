-- MedTruth: 医療情報クイズ用テーブル（Hirono と共存）
-- Supabase SQL Editor で実行してください。

-- トピック（クイズ1問 = 1トピック）
create table if not exists medtruth_topics (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  reference_url text,
  is_true boolean not null,
  created_at timestamptz not null default now()
);

comment on table medtruth_topics is '医療情報クイズのトピック（質問・解説・参考文献）';
comment on column medtruth_topics.question is 'クイズの質問文（例: 鎮痛剤は頭痛がなくても飲んだ方がよい？）';
comment on column medtruth_topics.answer is '解説（日本語・200字程度）';
comment on column medtruth_topics.reference_url is '医学文献・参考リンク';
comment on column medtruth_topics.is_true is '正解（True=正しい / False=誤り）';

alter table medtruth_topics enable row level security;
create policy "Allow public read medtruth_topics"
  on medtruth_topics for select using (true);

-- いいね/役に立った フィードバック（匿名またはログインユーザー）
create table if not exists medtruth_feedback (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references medtruth_topics(id) on delete cascade,
  is_helpful boolean not null,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_medtruth_feedback_topic on medtruth_feedback(topic_id);

comment on table medtruth_feedback is 'トピックへの「役に立った」投票（up/down）';
comment on column medtruth_feedback.is_helpful is 'true=役に立った, false=役に立たなかった';
comment on column medtruth_feedback.session_id is '未ログイン時の識別用（localStorage等）';

alter table medtruth_feedback enable row level security;
create policy "Allow public insert medtruth_feedback"
  on medtruth_feedback for insert with check (true);
create policy "Allow public read medtruth_feedback"
  on medtruth_feedback for select using (true);
