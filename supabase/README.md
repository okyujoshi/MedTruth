# Supabase（MedTruth）

MedTruth は **Hirono と同じ Supabase プロジェクト** を共有できます。MedTruth 用のテーブルは別名なので、Hirono の `word_groups` と共存します。

## MedTruth 用テーブル

| テーブル | 説明 |
|---------|------|
| `medtruth_topics` | クイズのトピック（質問・解説・参考文献・正解 True/False） |
| `medtruth_feedback` | トピックへの「役に立った」投票（👍/👎） |
| `medtruth_verification_requests` | 「これってどうなの？」ユーザーからの検証リクエスト |

## 初回セットアップ

1. **Dashboard** → **SQL Editor** で次を順に実行する。

2. **スキーマ作成**  
   `schema.sql` の内容を貼り付けて実行。

3. **スターター 5 トピック投入**  
   `seed_topics.sql` の内容を貼り付けて実行。（既にトピックが 1 件以上ある場合は何もしません。）

4. **解説の自動生成APIからトピックを追加する場合**  
   `policy_insert_topics.sql` を実行し、`medtruth_topics` への INSERT を許可する。

5. **「これってどうなの？」機能を使う場合**  
   `schema_verification_requests.sql` を実行し、`medtruth_verification_requests` テーブルを作成する。  
   画像アップロードを使う場合は、`storage_verification_photos.sql` を実行するか、Dashboard → Storage で `verification-photos` バケット（公開）を手動作成する。

## トピックの追加方法

**方法 A: SQL Editor**

1. Supabase Dashboard → **SQL Editor** を開く。
2. `add_topic.sql` を開き、`question`・`answer`・`reference_url`・`is_true` を書き換える。
3. その SQL を SQL Editor に貼り付けて **Run** する。  
   複数件追加する場合は、`values` を `('Q1','A1','URL1',true), ('Q2','A2','URL2',false)` のようにカンマでつなげる。

**方法 C: 解説を自動生成してDBに保存（おすすめ）**

1. アプリの **トップ** → ヘッダーの **トピック追加** を開く。
2. **質問**（例: 〇〇は体に良い？）と **正解**（True / False）を入力。参考文献URLは任意。
3. **「解説を自動生成してDBに保存」** を押す。OpenAI が解説文を生成し、そのまま DB に保存される。
4. `.env` に `OPENAI_API_KEY=sk-...` を設定しておくこと。未設定の場合はエラーになる。

**方法 B: Table Editor**

1. **Table Editor** → **medtruth_topics** を開く。
2. **Insert row** で行を追加する。
3. 各列: `question`（質問）, `answer`（解説）, `reference_url`（URL・空欄可）, `is_true`（正解が「正しい」なら true）。

## 環境変数

`.env` に Hirono と同じ値（または MedTruth 専用プロジェクトの値）を設定する。

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key
```

## 今後の拡張（掲示板・認証）

- **掲示板**: 例）`medtruth_posts`（topic_id, user_id, body, created_at）と `medtruth_post_replies` を追加。
- **認証**: すでに `app.vue` と `/login` で Supabase Auth を利用可能。掲示板では `auth.users` の `user_id` で投稿者を紐づける。
