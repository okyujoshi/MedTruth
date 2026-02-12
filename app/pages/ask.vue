<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const openAuth = inject<(mode: 'login' | 'signup') => void>('openAuth')

const question = ref('')
const sourceUrl = ref('')
const photoUrl = ref('')
const photoFile = ref<File | null>(null)
const uploading = ref(false)
const loading = ref(false)
const message = ref('')

async function onPhotoFileChange (e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !file.type.startsWith('image/')) {
    message.value = '画像ファイル（JPEG, PNGなど）を選択してください。'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    message.value = '画像は5MB以下にしてください。'
    return
  }
  photoUrl.value = ''
  photoFile.value = file
  uploading.value = true
  message.value = ''
  try {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${user?.value?.id ?? 'anon'}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('verification-photos').upload(path, file, { upsert: true })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('verification-photos').getPublicUrl(path)
    photoUrl.value = publicUrl
  } catch (e: unknown) {
    message.value = (e as { message?: string })?.message ?? 'アップロードに失敗しました。'
  } finally {
    uploading.value = false
    photoFile.value = null
    input.value = ''
  }
}

function clearPhoto () {
  photoUrl.value = ''
  photoFile.value = null
}

async function submit () {
  const q = question.value.trim()
  if (!q) {
    message.value = '質問を入力してください。'
    return
  }
  message.value = ''
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; id?: string }>('/api/submit-verification-request', {
      method: 'POST',
      body: {
        question: q,
        source_url: sourceUrl.value.trim() || undefined,
        photo_url: photoUrl.value.trim() || undefined
      }
    })
    if (res.success) {
      message.value = 'リクエストを送信しました。運営が検証します。'
      question.value = ''
      sourceUrl.value = ''
      photoUrl.value = ''
      photoFile.value = null
    }
  } catch (e: unknown) {
    const err = e as { statusCode?: number; data?: { message?: string }; message?: string }
    message.value = err?.data?.message ?? err?.message ?? 'エラーが発生しました。'
    if (err?.statusCode === 401) {
      openAuth?.('login')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-ask">
    <header class="page-header">
      <h1>これってどうなの？</h1>
      <p class="page-desc">
        ネットやSNSで見た医療・健康情報について「本当かどうか確認してほしい」と思ったら、ここからリクエストしてください。運営が検証し、トピックとして追加します。
      </p>
    </header>

    <main class="page-content">
      <div v-if="!user" class="card auth-required-card">
        <p class="auth-required-text">リクエストするには、ログインまたは新規登録が必要です。</p>
        <button type="button" class="btn btn-primary" @click="openAuth?.('login')">
          ログイン / 新規登録
        </button>
      </div>

      <form v-else class="card form-card" @submit.prevent="submit">
        <label class="field">
          <span class="label">確認してほしい内容（質問）</span>
          <textarea
            v-model="question"
            class="textarea"
            placeholder="例: 〇〇は体に良いって本当？"
            rows="4"
            required
          />
        </label>
        <label class="field">
          <span class="label">参照元URL（任意）</span>
          <input
            v-model="sourceUrl"
            type="url"
            class="input"
            placeholder="https://... （Web記事・SNSのリンク）"
          />
        </label>
        <label class="field">
          <span class="label">画像（任意）</span>
          <input
            v-model="photoUrl"
            type="url"
            class="input"
            placeholder="https://... （画像URLを貼り付け）"
          />
          <span class="field-hint">URLを貼るか、下のボタンからファイルをアップロード</span>
          <div class="photo-upload-row">
            <input
              type="file"
              accept="image/*"
              class="file-input"
              :disabled="uploading"
              @change="onPhotoFileChange"
            />
            <button v-if="photoUrl" type="button" class="btn-clear" @click="clearPhoto">画像を消す</button>
          </div>
          <p v-if="uploading" class="uploading-text">アップロード中…</p>
        </label>
        <p v-if="message" class="message" :class="{ error: message.includes('エラー') || message.includes('失敗') }">
          {{ message }}
        </p>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '送信中…' : 'リクエストを送信' }}
        </button>
      </form>

      <p v-if="user" class="hint">
        <NuxtLink to="/">トップ</NuxtLink>へ戻る
      </p>
    </main>
  </div>
</template>

<style scoped>
.page-ask { padding-bottom: 3rem; }
.page-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}
.page-header h1 { font-size: 1.35rem; margin: 0 0 0.35rem; color: var(--text-primary); }
.page-desc { margin: 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; }

.page-content { max-width: 560px; margin: 0 auto; padding: 2rem 1.5rem; }

.card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.auth-required-card {
  padding: 2rem;
  text-align: center;
}
.auth-required-text {
  margin: 0 0 1.25rem;
  font-size: 1rem;
  color: var(--text-primary);
}
.form-card { padding: 1.5rem; }
.field { display: block; margin-bottom: 1.25rem; }
.label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.35rem; }
.field-hint { display: block; margin-top: 0.25rem; font-size: 0.8rem; color: var(--text-muted); }
.photo-upload-row { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem; }
.file-input { font-size: 0.85rem; }
.btn-clear {
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
  border: 1px solid var(--border-subtle);
  background: var(--bg-page);
  color: var(--text-muted);
  border-radius: 6px;
  cursor: pointer;
}
.btn-clear:hover { color: var(--text-primary); }
.uploading-text { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--text-muted); }
.input,
.textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  font-size: 1rem;
  color: var(--text-primary);
  box-sizing: border-box;
  font-family: inherit;
}
.textarea { resize: vertical; min-height: 80px; }
.input:focus,
.textarea:focus {
  outline: none;
  border-color: var(--hirono-blue);
}
.message { margin: 0 0 1rem; font-size: 0.9rem; color: var(--hirono-blue); }
.message.error { color: #b91c1c; }
.btn {
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: var(--hirono-blue);
  color: #fff;
  width: 100%;
}
.btn:hover:not(:disabled) { background: var(--hirono-blue-light); opacity: 0.95; }
.btn:disabled { opacity: 0.7; cursor: not-allowed; }
.hint { margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted); }
.hint a { color: var(--hirono-blue); text-decoration: none; }
.hint a:hover { text-decoration: underline; }
</style>
