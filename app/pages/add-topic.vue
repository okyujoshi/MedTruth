<script setup lang="ts">
const question = ref('')
const isTrue = ref<boolean>(true)
const referenceUrl = ref('')
const loading = ref(false)
const message = ref('')
const lastAnswer = ref('')

async function submit () {
  const q = question.value.trim()
  if (!q) {
    message.value = '質問を入力してください。'
    return
  }
  message.value = ''
  loading.value = true
  try {
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
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    message.value = err?.data?.message ?? err?.message ?? 'エラーが発生しました。'
    lastAnswer.value = ''
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
        質問と正解を入力し「解説を自動生成してDBに保存」を押すと、AI が解説文を生成してデータベースに保存します。
      </p>
    </header>

    <main class="page-content">
      <form class="card form-card" @submit.prevent="submit">
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
        <label class="field">
          <span class="label">参考文献URL（任意）</span>
          <input
            v-model="referenceUrl"
            type="url"
            class="input"
            placeholder="https://..."
          />
        </label>
        <p v-if="message" class="message" :class="{ error: message.startsWith('エラー') || message.includes('失敗') }">
          {{ message }}
        </p>
        <div v-if="lastAnswer" class="last-answer">
          <span class="last-answer-label">生成した解説:</span>
          <p class="last-answer-text">{{ lastAnswer }}</p>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '生成・保存中…' : '解説を自動生成してDBに保存' }}
        </button>
      </form>

      <p class="hint">
        <NuxtLink to="/">トップ</NuxtLink>でクイズに反映されます。.env に <code>OPENAI_API_KEY</code> を設定してください。
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
.form-card { padding: 1.5rem; }
.field { display: block; margin-bottom: 1.25rem; }
.label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.35rem; }
.input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  font-size: 1rem;
  color: var(--text-primary);
  box-sizing: border-box;
}
.input:focus {
  outline: none;
  border-color: var(--hirono-blue);
}
.radio-row { display: flex; gap: 1rem; }
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
