import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'ログインが必要です。メールアドレスで新規登録またはログインしてください。'
    })
  }

  const body = await readBody<{ question: string; source_url?: string; photo_url?: string }>(event)
  const { question, source_url, photo_url } = body ?? {}

  if (!question?.trim()) {
    throw createError({
      statusCode: 400,
      message: '質問を入力してください。'
    })
  }

  const supabase = await serverSupabaseClient(event)
  const { data: row, error } = await supabase
    .from('medtruth_verification_requests')
    .insert({
      user_id: user.id,
      question: question.trim(),
      source_url: source_url?.trim() || null,
      photo_url: photo_url?.trim() || null,
      status: 'pending'
    })
    .select('id')
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `保存に失敗しました: ${error.message}`
    })
  }

  return { success: true, id: row?.id }
})
