<script setup lang="ts">
type Topic = {
  id: string
  question: string
  answer: string
  reference_url: string | null
  is_true: boolean
  created_at: string
}

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { public: config } = useRuntimeConfig()
const adminEmail = (config.adminEmail as string) || 'hutz@nifty.com'
const isAdmin = computed(() => (user.value?.email ?? '').toLowerCase() === adminEmail.toLowerCase())

const topics = ref<Topic[]>([])
const loading = ref(true)
const error = ref('')
const message = ref('')

const formOpen = ref(false)
const editingId = ref<string | null>(null)
const formLoading = ref(false)
const formError = ref('')

const form = ref({
  question: '',
  answer: '',
  reference_url: '',
  is_true: true
})

async function fetchTopics () {
  loading.value = true
  error.value = ''
  try {
    const { data, err } = await supabase
      .from('medtruth_topics')
      .select('id, question, answer, reference_url, is_true, created_at')
      .order('created_at', { ascending: false })
    if (err) {
      error.value = err.message
      return
    }
    topics.value = (data ?? []) as Topic[]
  } finally {
    loading.value = false
  }
}

function openAddForm () {
  editingId.value = null
  form.value = {
    question: '',
    answer: '',
    reference_url: '',
    is_true: true
  }
  formError.value = ''
  formOpen.value = true
}

function openEditForm (row: Topic) {
  editingId.value = row.id
  form.value = {
    question: row.question,
    answer: row.answer,
    reference_url: row.reference_url ?? '',
    is_true: row.is_true
  }
  formError.value = ''
  formOpen.value = true
}

function closeForm () {
  formOpen.value = false
  editingId.value = null
}

async function submitForm () {
  formError.value = ''
  formLoading.value = true
  try {
    const payload = {
      question: form.value.question.trim(),
      answer: form.value.answer.trim(),
      reference_url: form.value.reference_url.trim() || null,
      is_true: form.value.is_true
    }
    if (!payload.question || !payload.answer) {
      formError.value = '質問と解説は必須です。'
      return
    }

    if (editingId.value) {
      try {
        await $fetch('/api/admin-topic-update', {
          method: 'PATCH',
          body: { id: editingId.value, ...payload }
        })
      } catch (e: unknown) {
        const err = e as { data?: { message?: string }; message?: string }
        formError.value = err?.data?.message ?? err?.message ?? '更新に失敗しました。'
        return
      }
      message.value = '更新しました。'
    } else {
      const { error: e } = await supabase.from('medtruth_topics').insert(payload)
      if (e) {
        formError.value = e.message
        return
      }
      message.value = '追加しました。'
    }
    closeForm()
    await fetchTopics()
    setTimeout(() => { message.value = '' }, 3000)
  } finally {
    formLoading.value = false
  }
}

async function deleteRow (row: Topic) {
  if (!confirm(`「${row.question.slice(0, 30)}…」を削除してよろしいですか？`)) return
  try {
    await $fetch('/api/admin-topic-delete', {
      method: 'POST',
      body: { id: row.id }
    })
    message.value = '削除しました。'
    await fetchTopics()
    setTimeout(() => { message.value = '' }, 3000)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message ?? err?.message ?? '削除に失敗しました。'
    setTimeout(() => { error.value = '' }, 5000)
  }
}

onMounted(() => {
  if (isAdmin.value) fetchTopics()
})

watch(isAdmin, (ok) => {
  if (ok) fetchTopics()
})
</script>

<template>
  <div class="admin-page">
    <h1 class="admin-title">トピック管理</h1>

    <template v-if="!user">
      <p class="admin-msg">管理画面を利用するにはログインしてください。</p>
      <NuxtLink to="/" class="admin-link">トップへ</NuxtLink>
    </template>

    <template v-else-if="!isAdmin">
      <p class="admin-msg">このページは管理者のみ利用できます。</p>
      <NuxtLink to="/" class="admin-link">トップへ</NuxtLink>
    </template>

    <template v-else>
      <p v-if="message" class="admin-flash">{{ message }}</p>
      <p v-if="error" class="admin-error">{{ error }}</p>

      <div class="admin-actions">
        <button type="button" class="btn-admin btn-add" @click="openAddForm">
          新規追加
        </button>
      </div>

      <div v-if="loading" class="admin-loading">読み込み中…</div>
      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>質問（抜粋）</th>
              <th>正解</th>
              <th>参考文献</th>
              <th>作成日</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in topics" :key="t.id">
              <td class="cell-question">{{ t.question }}</td>
              <td>{{ t.is_true ? 'True' : 'False' }}</td>
              <td class="cell-url">{{ t.reference_url || '—' }}</td>
              <td class="cell-date">{{ new Date(t.created_at).toLocaleDateString('ja-JP') }}</td>
              <td>
                <button type="button" class="btn-admin btn-edit" @click="openEditForm(t)">編集</button>
                <button type="button" class="btn-admin btn-delete" @click="deleteRow(t)">削除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!topics.length" class="admin-empty">登録データがありません。「新規追加」でトピックを追加してください。</p>
      </div>

      <!-- 新規追加 / 編集モーダル -->
      <Teleport to="body">
        <div v-if="formOpen" class="admin-overlay" @click.self="closeForm">
          <div class="admin-form-card">
            <div class="admin-form-header">
              <h2>{{ editingId ? '編集' : '新規追加' }}</h2>
              <button type="button" class="admin-form-close" @click="closeForm">×</button>
            </div>
            <form class="admin-form" @submit.prevent="submitForm">
              <p v-if="formError" class="admin-form-error">{{ formError }}</p>
              <label>
                <span>質問（question） *</span>
                <input v-model="form.question" type="text" class="admin-input" placeholder="例: 鎮痛剤は頭痛がなくても飲んだ方がよい？" required />
              </label>
              <label>
                <span>解説（answer） *</span>
                <textarea v-model="form.answer" class="admin-textarea" placeholder="200字程度の解説" rows="5" required />
              </label>
              <label>
                <span>参考文献URL（任意）</span>
                <input v-model="form.reference_url" type="url" class="admin-input" placeholder="https://..." />
              </label>
              <label class="admin-check">
                <input v-model="form.is_true" type="checkbox" />
                <span>正解は True（正しい）</span>
              </label>
              <div class="admin-form-actions">
                <button type="button" class="btn-admin btn-outline" @click="closeForm">キャンセル</button>
                <button type="submit" class="btn-admin btn-primary" :disabled="formLoading">
                  {{ formLoading ? '送信中…' : (editingId ? '更新' : '追加') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
}
.admin-title {
  font-size: 1.5rem;
  margin: 0 0 1rem;
  color: var(--text-primary);
}
.admin-msg {
  color: var(--text-muted);
  margin: 0 0 0.5rem;
}
.admin-link {
  color: var(--hirono-blue);
  text-decoration: none;
}
.admin-link:hover { text-decoration: underline; }
.admin-hint {
  font-size: 0.9rem;
  display: block;
  margin-top: 0.25rem;
}
.admin-flash {
  padding: 0.5rem 0.75rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 8px;
  margin: 0 0 1rem;
}
.admin-error {
  padding: 0.5rem 0.75rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  margin: 0 0 1rem;
}
.admin-actions { margin-bottom: 1rem; }
.btn-admin {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}
.btn-admin:hover:not(:disabled) { opacity: 0.9; }
.btn-admin:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-add { background: var(--hirono-blue); color: #fff; }
.btn-edit { background: #0ea5e9; color: #fff; margin-right: 0.5rem; }
.btn-delete { background: #ef4444; color: #fff; }
.btn-outline { background: transparent; color: var(--text-muted); border: 1px solid var(--border-subtle); }
.btn-primary { background: var(--hirono-blue); color: #fff; }
.admin-loading { color: var(--text-muted); padding: 1rem 0; }
.admin-table-wrap { overflow-x: auto; }
.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.admin-table th,
.admin-table td {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-subtle);
  text-align: left;
}
.admin-table th { background: #f1f5f9; font-weight: 600; }
.cell-question { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-url { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.85rem; }
.cell-date { white-space: nowrap; }
.admin-empty { color: var(--text-muted); padding: 1rem 0; }

.admin-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.admin-form-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 560px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
}
.admin-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.admin-form-header h2 { margin: 0; font-size: 1.25rem; }
.admin-form-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
  padding: 0 0.25rem;
}
.admin-form-close:hover { color: var(--text-primary); }
.admin-form { display: flex; flex-direction: column; gap: 0.75rem; }
.admin-form-error { color: #dc2626; font-size: 0.9rem; margin: 0; }
.admin-form label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; }
.admin-form label span { font-weight: 500; color: var(--text-primary); }
.admin-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  font-size: 1rem;
}
.admin-input:focus { outline: none; border-color: var(--hirono-blue); }
.admin-textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  font-size: 0.95rem;
  min-height: 100px;
  resize: vertical;
}
.admin-textarea:focus { outline: none; border-color: var(--hirono-blue); }
.admin-check { flex-direction: row !important; align-items: center; }
.admin-check input { width: auto; }
.admin-form-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
</style>
