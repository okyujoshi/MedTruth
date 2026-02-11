import { createClient } from '@supabase/supabase-js'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ question: string; is_true: boolean; reference_url?: string }>(event)
  const { question, is_true, reference_url } = body ?? {}

  if (!question || typeof is_true !== 'boolean') {
    throw createError({
      statusCode: 400,
      message: 'question と is_true は必須です。'
    })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'OPENAI_API_KEY が設定されていません。.env に追加してください。'
    })
  }

  const prompt = `あなたは医療・健康情報を一般向けに分かりやすく伝える専門家です。
以下のクイズの「正解」が ${is_true ? '「正しい」' : '「誤り」'} である場合の解説を、日本語で200字程度で書いてください。
一般の人に誤解を招かないよう、根拠を簡潔に述べ、不安を煽らない表現にしてください。
出力は解説文のみとし、「解説:」などの見出しや改行は付けないでください。

質問: ${question}`

  let answer: string
  try {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.5
      })
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenAI API error: ${res.status} ${err}`)
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const raw = data?.choices?.[0]?.message?.content?.trim?.()
    if (!raw) throw new Error('OpenAI が解説を返しませんでした。')
    answer = raw
  } catch (e) {
    const message = e instanceof Error ? e.message : '解説の生成に失敗しました。'
    throw createError({ statusCode: 502, message })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      message: 'SUPABASE_URL / SUPABASE_KEY が設定されていません。'
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data: row, error } = await supabase
    .from('medtruth_topics')
    .insert({
      question,
      answer,
      reference_url: reference_url || null,
      is_true
    })
    .select('id')
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `DB への保存に失敗しました: ${error.message}`
    })
  }

  return { success: true, topic_id: row?.id, answer }
})
