<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

type Topic = {
  id: string
  question: string
  answer: string
  reference_url: string | null
  is_true: boolean
  created_at: string
}

const topics = ref<Topic[]>([])
const currentTopic = ref<Topic | null>(null)
const loading = ref(true)
const error = ref('')
const userAnswer = ref<boolean | null>(null)
const showResult = ref(false)
const feedbackCounts = ref<{ up: number; down: number } | null>(null)
const userVote = ref<'up' | 'down' | null>(null)
const feedbackSending = ref(false)

const SESSION_KEY = 'medtruth_session_id'

function getOrCreateSessionId (): string {
  if (import.meta.client) {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(SESSION_KEY, id)
    }
    return id
  }
  return ''
}

function pickRandomTopic () {
  if (!topics.value.length) {
    currentTopic.value = null
    return
  }
  const idx = Math.floor(Math.random() * topics.value.length)
  currentTopic.value = topics.value[idx] ?? null
  userAnswer.value = null
  showResult.value = false
  feedbackCounts.value = null
  userVote.value = null
  if (currentTopic.value) fetchFeedbackCounts()
}

async function fetchTopics () {
  loading.value = true
  error.value = ''
  try {
    const { data, err } = await supabase
      .from('medtruth_topics')
      .select('id, question, answer, reference_url, is_true, created_at')
    if (err) {
      error.value = err.message
      return
    }
    topics.value = (data ?? []) as Topic[]
    pickRandomTopic()
  } finally {
    loading.value = false
  }
}

async function fetchFeedbackCounts () {
  const topic = currentTopic.value
  if (!topic) return
  const { data } = await supabase
    .from('medtruth_feedback')
    .select('is_helpful')
    .eq('topic_id', topic.id)
  const up = (data ?? []).filter((r: { is_helpful: boolean }) => r.is_helpful).length
  const down = (data ?? []).filter((r: { is_helpful: boolean }) => !r.is_helpful).length
  feedbackCounts.value = { up, down }
}

function submitAnswer (answer: boolean) {
  userAnswer.value = answer
  showResult.value = true
}

async function submitFeedback (isHelpful: boolean) {
  const topic = currentTopic.value
  if (!topic || feedbackSending.value) return
  feedbackSending.value = true
  try {
    const { error: err } = await supabase.from('medtruth_feedback').insert({
      topic_id: topic.id,
      is_helpful: isHelpful,
      user_id: user.value?.id ?? null,
      session_id: user.value ? null : getOrCreateSessionId()
    })
    if (!err) {
      userVote.value = isHelpful ? 'up' : 'down'
      await fetchFeedbackCounts()
    }
  } finally {
    feedbackSending.value = false
  }
}

onMounted(() => {
  fetchTopics()
})
</script>

<template>
  <div class="page-top">
    <header class="page-header">
      <h1>MedTruth</h1>
      <p class="page-desc">
        ネットやSNSの医療情報に惑わされないために。本当かどうか、クイズで確かめましょう。
      </p>
    </header>

    <main class="page-content">
      <div v-if="loading" class="card card-loading">
        読み込み中…
      </div>
      <div v-else-if="error" class="card card-error">
        {{ error }}
        <button type="button" class="btn btn-retry" @click="fetchTopics">再試行</button>
      </div>
      <div v-else-if="!topics.length" class="card card-empty">
        <p>トピックがまだありません。</p>
        <p class="muted">Supabase で <code>supabase/schema.sql</code> と <code>supabase/seed_topics.sql</code> を実行してください。</p>
      </div>

      <template v-else-if="currentTopic">
        <!-- クイズカード -->
        <section class="card quiz-card">
          <div class="quiz-header">
            <div>
              <p class="card-label">この言い伝え、本当？</p>
              <h2 class="question-title">{{ currentTopic.question }}</h2>
            </div>
            <button type="button" class="btn btn-next-top" @click="pickRandomTopic" aria-label="別のトピックを表示">
              別のトピックを表示
            </button>
          </div>

          <div v-if="!showResult" class="buttons">
            <button type="button" class="btn btn-true" @click="submitAnswer(true)">True（正しい）</button>
            <button type="button" class="btn btn-false" @click="submitAnswer(false)">False（誤り）</button>
          </div>

          <div v-else class="result-block">
            <p
              :class="['feedback', userAnswer === currentTopic.is_true ? 'correct' : 'incorrect']"
            >
              {{ userAnswer === currentTopic.is_true ? '✓ 正解です！' : '✗ 不正解です。' }}
              <span v-if="userAnswer !== currentTopic.is_true" class="feedback-hint">
                正解は {{ currentTopic.is_true ? 'True' : 'False' }} です。
              </span>
            </p>
            <div class="answer-block">
              <h3 class="answer-heading">解説</h3>
              <p class="answer-text">{{ currentTopic.answer }}</p>
            </div>
            <div v-if="currentTopic.reference_url" class="reference-block">
              <span class="reference-label">参考文献：</span>
              <a
                :href="currentTopic.reference_url"
                target="_blank"
                rel="noopener noreferrer"
                class="reference-link"
              >
                医学文献・参考リンク
              </a>
            </div>
            <div class="feedback-actions">
              <span class="feedback-label">この情報は役に立ちましたか？</span>
              <div class="thumbs-row">
                <button
                  type="button"
                  class="btn-thumb"
                  :class="{ active: userVote === 'up' }"
                  :disabled="feedbackSending"
                  aria-label="役に立った"
                  @click="submitFeedback(true)"
                >
                  👍 <span v-if="feedbackCounts">{{ feedbackCounts.up }}</span>
                </button>
                <button
                  type="button"
                  class="btn-thumb"
                  :class="{ active: userVote === 'down' }"
                  :disabled="feedbackSending"
                  aria-label="役に立たなかった"
                  @click="submitFeedback(false)"
                >
                  👎 <span v-if="feedbackCounts">{{ feedbackCounts.down }}</span>
                </button>
              </div>
            </div>
            <button type="button" class="btn btn-next" @click="pickRandomTopic">
              別のトピックを表示
            </button>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.page-top { padding-bottom: 3rem; }

.page-header {
  text-align: center;
  padding: 2rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  background: linear-gradient(135deg, rgba(45, 143, 191, 0.04) 0%, rgba(58, 155, 74, 0.03) 100%);
}
.page-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
  color: var(--text-primary);
}
.page-desc {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.page-content {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 2px 12px rgba(45, 143, 191, 0.04), 0 4px 20px -4px rgba(58, 155, 74, 0.03);
  overflow: hidden;
}
.card-loading,
.card-empty {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}
.card-empty .muted { margin-top: 0.5rem; font-size: 0.9rem; }
.card-empty code { font-size: 0.85rem; background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; }
.card-error {
  padding: 1.5rem;
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}
.btn-retry {
  margin-top: 0.75rem;
  background: #fecaca;
  color: #b91c1c;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.quiz-card {
  padding: 1.5rem 1.75rem;
}
.quiz-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}
@media (min-width: 480px) {
  .quiz-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}
.btn-next-top {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  background: var(--bg-page);
  color: var(--hirono-blue);
  border: 1px solid var(--border-subtle);
  font-size: 0.9rem;
  white-space: nowrap;
}
.btn-next-top:hover {
  background: var(--hirono-blue-dim);
  border-color: var(--hirono-blue);
}
.card-label {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.question-title {
  margin: 0 0 1.5rem;
  font-size: 1.15rem;
  line-height: 1.5;
  color: var(--text-primary);
  font-weight: 600;
}
.buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.btn {
  padding: 0.65rem 1.35rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s, background 0.2s;
}
.btn:hover { opacity: 0.95; }
.btn-true {
  background: var(--hirono-green);
  color: #fff;
}
.btn-true:hover { background: var(--hirono-green-light); }
.btn-false {
  background: #dc6b6b;
  color: #fff;
}
.btn-false:hover { background: #e57373; }

.result-block { margin-top: 0.25rem; }
.feedback {
  margin: 0 0 1rem;
  font-weight: 600;
  font-size: 1.05rem;
}
.feedback.correct { color: var(--hirono-green); }
.feedback.incorrect { color: #c53030; }
.feedback-hint { font-weight: normal; color: var(--text-muted); font-size: 0.95rem; }

.answer-block {
  margin-bottom: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border-subtle);
}
.answer-heading {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: var(--text-muted);
  font-weight: 600;
}
.answer-text {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-primary);
}

.reference-block {
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
}
.reference-label { color: var(--text-muted); margin-right: 0.35rem; }
.reference-link {
  color: var(--hirono-blue);
  text-decoration: none;
}
.reference-link:hover { text-decoration: underline; }

.feedback-actions {
  padding: 1rem 0;
  border-top: 1px solid var(--border-subtle);
}
.feedback-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}
.thumbs-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.btn-thumb {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-page);
  color: var(--text-muted);
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.btn-thumb:hover:not(:disabled) {
  border-color: var(--hirono-blue-light);
  color: var(--hirono-blue);
}
.btn-thumb.active {
  background: var(--hirono-blue-dim);
  border-color: var(--hirono-blue);
  color: var(--hirono-blue);
}
.btn-thumb:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-next {
  width: 100%;
  padding: 1rem;
  margin-top: 0.5rem;
  background: var(--hirono-blue);
  color: #fff;
  font-size: 1rem;
}
.btn-next:hover { background: var(--hirono-blue-light); }
</style>
