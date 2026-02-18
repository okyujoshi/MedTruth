import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

const ADMIN_EMAIL = 'hutz@nifty.com'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'ログインが必要です。' })
  }
  if ((user.email ?? '').toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw createError({ statusCode: 403, message: '管理者のみ実行できます。' })
  }

  const body = await readBody<{
    id: string
    question?: string
    answer?: string
    reference_url?: string | null
    is_true?: boolean
  }>(event)
  const { id, question, answer, reference_url, is_true } = body ?? {}

  if (!id?.trim()) {
    throw createError({ statusCode: 400, message: 'id は必須です。' })
  }

  const payload: Record<string, unknown> = {}
  if (question !== undefined) payload.question = String(question).trim()
  if (answer !== undefined) payload.answer = String(answer).trim()
  if (reference_url !== undefined) payload.reference_url = reference_url?.trim() || null
  if (typeof is_true === 'boolean') payload.is_true = is_true

  if (Object.keys(payload).length === 0) {
    throw createError({ statusCode: 400, message: '更新する項目がありません。' })
  }

  const supabase = serverSupabaseServiceRole(event)
  const { error } = await supabase
    .from('medtruth_topics')
    .update(payload)
    .eq('id', id.trim())

  if (error) {
    throw createError({ statusCode: 500, message: `更新に失敗しました: ${error.message}` })
  }

  return { success: true }
})
