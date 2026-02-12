import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'ログインが必要です。メールアドレスで新規登録またはログインしてください。'
    })
  }

  const body = await readBody<{ question: string; answer: string; is_true: boolean; reference_url?: string }>(event)
  const { question, answer, is_true, reference_url } = body ?? {}

  if (!question?.trim() || !answer?.trim() || typeof is_true !== 'boolean') {
    throw createError({
      statusCode: 400,
      message: 'question、answer、is_true は必須です。'
    })
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
      question: question.trim(),
      answer: answer.trim(),
      reference_url: reference_url?.trim() || null,
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

  return { success: true, topic_id: row?.id }
})
