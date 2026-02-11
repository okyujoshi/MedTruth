# MedTruth

Nuxt 4 + Vue 3 + Supabase で構築したプロジェクトです。

## 環境（Hirono と同じ）

- Node.js
- Nuxt 4
- Vue 3
- Supabase（@nuxtjs/supabase）

## セットアップ

1. 依存関係のインストール
   ```bash
   cd /home/usercamp_user/camp/MedTruth
   npm install
   ```

2. 環境変数
   - ルートに `.env` を作成
   - **Hirono と同じ Supabase**: `SUPABASE_URL` と `SUPABASE_KEY` を設定（Hirono の `.env` をコピー可）
   - **トピックの解説を自動生成する場合**: [OpenAI API](https://platform.openai.com/api-keys) でキーを取得し、`.env` に `OPENAI_API_KEY=sk-...` を追加

3. 開発サーバー起動
   ```bash
   npm run dev
   ```
   - ブラウザで http://localhost:3000 を開く

## ディレクトリ

- `app/app.vue` … レイアウト（ヘッダー・フッター）
- `app/pages/` … ページ（index.vue = /, login.vue = /login）
- `public/` … 静的ファイル（favicon.ico など）

## Cursor でこのプロジェクトを開く場合

1. ファイル → フォルダーを開く
2. `/home/usercamp_user/camp/MedTruth` を選択

またはターミナルで:
```bash
cd /home/usercamp_user/camp/MedTruth
cursor .
```
（cursor コマンドが使える場合）
