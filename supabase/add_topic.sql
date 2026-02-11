-- トピックを 1 件追加するときの例
-- Supabase → SQL Editor に貼り付けて、内容を書き換えてから実行

insert into medtruth_topics (question, answer, reference_url, is_true) values
(
  'ここに質問文を書く（例: ○○は体に良い？）',
  'ここに解説を書く（日本語・200字程度）。正しい情報と根拠を簡潔に。',
  'https://example.com/参考リンク',
  true   -- 正解が「正しい」なら true、「誤り」なら false
);
