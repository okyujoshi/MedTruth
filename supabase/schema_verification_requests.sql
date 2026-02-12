-- MedTruth: 「これってどうなの？」検証リクエスト用
-- Supabase SQL Editor で実行してください。

-- 検証リクエスト用テーブル
create table if not exists medtruth_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  source_url text,
  photo_url text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);

comment on table medtruth_verification_requests is 'ユーザーが「本当かどうか確認してほしい」とリクエストした質問。運営が検証してトピック化する';
comment on column medtruth_verification_requests.source_url is '参照元（Web記事・SNSなど）のURL';
comment on column medtruth_verification_requests.photo_url is '添付画像のURL（SNSスクショ等のリンク）';
comment on column medtruth_verification_requests.status is 'pending=未検証, verified=トピック化済, rejected=却下';

alter table medtruth_verification_requests enable row level security;

create policy "Authenticated users can insert verification_requests"
  on medtruth_verification_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can read own verification_requests"
  on medtruth_verification_requests for select
  using (auth.uid() = user_id);
