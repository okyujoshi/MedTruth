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

  const body = await readBody<{ id: string }>(event)
  const id = body?.id?.trim()
  if (!id) {
    throw createError({ statusCode: 400, message: 'id は必須です。' })
  }

  const supabase = serverSupabaseServiceRole(event)
  const { error } = await supabase.from('medtruth_topics').delete().eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, message: `削除に失敗しました: ${error.message}` })
  }

  return { success: true }
})
