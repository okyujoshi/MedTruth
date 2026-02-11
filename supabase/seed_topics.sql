-- MedTruth: スターター用トピック 5件（日本語・約200字の解説＋参考文献）
-- schema.sql 実行後に、このファイルを SQL Editor で実行してください。
-- 既にデータがある場合はスキップします。

insert into medtruth_topics (question, answer, reference_url, is_true)
select * from (values
(
  '鎮痛剤は頭痛がなくても飲んだ方がよい？',
  'いいえ。鎮痛剤を常用すると「薬物乱用頭痛」になり、かえって頭痛が増えることがあります。痛みがないときの予防的な服用は避け、必要なときだけ、できるだけ少ない量で使い、月に10日以上は使わないようにすることが推奨されています。減らすときは医師に相談してください。',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3226773/',
  false
),
(
  'ペットボトルの水は水道水より体に良い？',
  '必ずしもそうではありません。日本の水道水は水質基準が厳しく、そのまま飲んでも安全です。ペットボトルは便利ですが、コストや環境負荷がかかります。「体に良い」という宣伝に惑わされず、水道水で十分な場合が多いです。',
  'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/topics/bukyoku/kenkou/suido/index.html',
  false
),
(
  'ビタミンCのサプリで風邪は予防できる？',
  '日常的にビタミンCをとっても、風邪の予防効果はほとんどないという研究結果が多くあります。一部では症状の期間がわずかに短くなる可能性はありますが、「風邪を防ぐ」という宣伝は過大解釈です。バランスのよい食事と手洗いの方が重要です。',
  'https://www.cochrane.org/CD000980/ARI_vitamin-c-for-preventing-and-treating-the-common-cold',
  false
),
(
  '熱があるときは解熱剤で熱を下げた方がよい？',
  '熱は体がウイルスなどと戦っている反応なので、無理に下げなくてもよい場合があります。つらいときだけ解熱剤を使い、使いすぎに注意しましょう。子どもではアスピリンは使わず、使うならアセトアミノフェンなど医師の指示に従ってください。',
  'https://www.ncbi.nlm.nih.gov/books/NBK546686/',
  true
),
(
  '「デトックス」のサプリで毒素が抜ける？',
  '「毒素を抜く」という科学的根拠はほとんどありません。肝臓や腎臓が通常の代謝で老廃物を処理しており、特別なサプリで「デトックス」する必要はありません。高額なデトックス商品は効果が証明されておらず、注意が必要です。',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6124846/',
  false
)) as t(question, answer, reference_url, is_true)
where not exists (select 1 from medtruth_topics limit 1);
