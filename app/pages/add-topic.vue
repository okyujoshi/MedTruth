<script setup lang="ts">
const user = useSupabaseUser()
const openAuth = inject<(mode: 'login' | 'signup') => void>('openAuth')

const question = ref('')
const answer = ref('')
const isTrue = ref<boolean>(true)
const referenceUrl = ref('')
const mode = ref<'ai' | 'manual'>('manual')
const loading = ref(false)
const message = ref('')
const lastAnswer = ref('')

async function submit () {
  const q = question.value.trim()
  if (!q) {
    message.value = '質問を入力してください。'
    return
  }
  if (mode.value === 'manual') {
    const a = answer.value.trim()
    if (!a) {
      message.value = '解説を入力してください。'
      return
    }
  }
  message.value = ''
  loading.value = true
  lastAnswer.value = ''
  try {
    if (mode.value === 'ai') {
      const res = await $fetch<{ success: boolean; topic_id?: string; answer?: string }>(
        '/api/generate-and-save-topic',
        {
          method: 'POST',
          body: {
            question: q,
            is_true: isTrue.value,
            reference_url: referenceUrl.value.trim() || undefined
          }
        }
      )
      if (res.success) {
        message.value = 'トピックを追加しました。'
        lastAnswer.value = res.answer ?? ''
        question.value = ''
        referenceUrl.value = ''
      }
    } else {
      const res = await $fetch<{ success: boolean; topic_id?: string }>(
        '/api/save-topic',
        {
          method: 'POST',
          body: {
            question: q,
            answer: answer.value.trim(),
            is_true: isTrue.value,
            reference_url: referenceUrl.value.trim() || undefined
          }
        }
      )
      if (res.success) {
        message.value = 'トピックを追加しました。'
        question.value = ''
        answer.value = ''
        referenceUrl.value = ''
      }
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
  <div class="page-add-topic">
    <header class="page-header">
      <h1>トピック追加</h1>
      <p class="page-desc">
        AI で解説を自動生成するか、手動で解説を入力してDBに保存できます。 APIキーがなくても手動入力で追加可能です。
      </p>
    </header>

    <main class="page-content">
      <div v-if="!user" class="card auth-required-card">
        <p class="auth-required-text">トピックを追加するには、ログインまたは新規登録が必要です。</p>
        <button type="button" class="btn btn-primary" @click="openAuth?.('login')">
          ログイン / 新規登録
        </button>
      </div>
      <form v-else class="card form-card" @submit.prevent="submit">
        <div class="field mode-row">
          <span class="label">追加方法</span>
          <div class="radio-row">
            <label class="radio">
              <input v-model="mode" type="radio" value="manual" />
              手動で入力（APIキー不要）
            </label>
            <label class="radio">
              <input v-model="mode" type="radio" value="ai" />
              AIで自動生成（OPENAI_API_KEY必要）
            </label>
          </div>
        </div>

        <label class="field">
          <span class="label">質問（クイズの文言）</span>
          <input
            v-model="question"
            type="text"
            class="input"
            placeholder="例: 〇〇は体に良い？"
            required
          />
        </label>
        <label class="field">
          <span class="label">正解</span>
          <div class="radio-row">
            <label class="radio">
              <input v-model="isTrue" type="radio" :value="true" />
              True（正しい）
            </label>
            <label class="radio">
              <input v-model="isTrue" type="radio" :value="false" />
              False（誤り）
            </label>
          </div>
        </label>
        <label v-if="mode === 'manual'" class="field">
          <span class="label">解説（200字程度）</span>
          <textarea
            v-model="answer"
            class="textarea"
            placeholder="医学的に正しい説明を入力…"
            rows="5"
            required
          />
        </label>
        <label class="field">
          <span class="label">参考文献URL（任意）</span>
          <input
            v-model="referenceUrl"
            type="url"
            class="input"
            placeholder="https://..."
          />
        </label>
        <p v-if="message" class="message" :class="{ error: message.startsWith('エラー') || message.includes('失敗') || message.includes('設定') }">
          {{ message }}
        </p>
        <div v-if="lastAnswer" class="last-answer">
          <span class="last-answer-label">生成した解説:</span>
          <p class="last-answer-text">{{ lastAnswer }}</p>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading
            ? (mode === 'ai' ? '生成・保存中…' : '保存中…')
            : (mode === 'ai' ? '解説を自動生成してDBに保存' : 'DBに保存')
          }}
        </button>
      </form>

      <p v-if="user" class="hint">
        <NuxtLink to="/">トップ</NuxtLink>でクイズに反映されます。
        <span v-if="mode === 'ai'">AI利用時は .env に <code>OPENAI_API_KEY</code> を設定してください。</span>
      </p>
    </main>
  </div>
</template>

<style scoped>
.page-add-topic { padding-bottom: 3rem; }
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
.field.mode-row { margin-bottom: 1.5rem; }
.label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.35rem; }
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
.textarea { resize: vertical; min-height: 100px; }
.input:focus,
.textarea:focus {
  outline: none;
  border-color: var(--hirono-blue);
}
.radio-row { display: flex; flex-wrap: wrap; gap: 1rem; }
.radio { display: flex; align-items: center; gap: 0.35rem; font-size: 0.95rem; color: var(--text-primary); cursor: pointer; }
.message { margin: 0 0 1rem; font-size: 0.9rem; color: var(--hirono-blue); }
.message.error { color: #b91c1c; }
.last-answer { margin-bottom: 1rem; padding: 1rem; background: var(--bg-page); border-radius: 8px; }
.last-answer-label { font-size: 0.85rem; color: var(--text-muted); }
.last-answer-text { margin: 0.35rem 0 0; font-size: 0.95rem; line-height: 1.6; color: var(--text-primary); }
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
.hint code { font-size: 0.8rem; background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; }
</style>
