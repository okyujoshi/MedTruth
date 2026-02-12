-- MedTruth: 「これってどうなの？」写真アップロード用 Storage
-- 1. Supabase Dashboard → Storage → New bucket
--    名前: verification-photos, Public: ON
-- 2. 以下を SQL Editor で実行してポリシーを追加

-- 認証済みユーザーがアップロード可能
create policy "Authenticated users can upload verification photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'verification-photos');

-- 誰でも閲覧可能（公開バケット）
create policy "Public read verification photos"
  on storage.objects for select
  using (bucket_id = 'verification-photos');
