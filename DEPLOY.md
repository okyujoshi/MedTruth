# Vercel デプロイ手順

## 必須の環境変数

Vercel の **Project Settings → Environment Variables** で以下を設定してください。

| 変数名 | 説明 | 必須 |
|--------|------|:----:|
| `SUPABASE_URL` | Supabase プロジェクト URL | ✅ |
| `SUPABASE_KEY` | Supabase anon (public) key | ✅ |
| `SUPABASE_SERVICE_KEY` | service_role key（管理画面用） | 管理画面を使う場合 |
| `OPENAI_API_KEY` | OpenAI API キー | トピックAI生成を使う場合 |
| `DONATE_KOFI_URL` | Ko-fi 寄付リンク | 任意 |
| `DONATE_PAYPAL_URL` | PayPal 寄付リンク | 任意 |

**重要**: 環境変数を追加・変更したら **Redeploy** が必要です。

## Supabase の設定

Supabase Dashboard → **Authentication → URL Configuration** で以下を追加：

- **Site URL**: `https://medtruth-iwate.vercel.app`
- **Redirect URLs**: `https://medtruth-iwate.vercel.app/**`

## デプロイ後

1. 環境変数が正しく設定されているか確認
2. Vercel の Deployments で **Redeploy** を実行
3. ブラウザの開発者ツール（F12）→ Console でエラーを確認
