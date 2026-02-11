<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const message = ref('')
const loading = ref(false)

async function signIn () {
  message.value = ''
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    if (error) throw error
    await navigateTo('/')
  } catch (e: unknown) {
    message.value = (e as { message?: string })?.message ?? 'ログインに失敗しました'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-login">
    <div class="card">
      <h1>ログイン</h1>
      <form @submit.prevent="signIn">
        <input v-model="email" type="email" placeholder="メール" required class="input" />
        <input v-model="password" type="password" placeholder="パスワード" required class="input" />
        <p v-if="message" class="message">{{ message }}</p>
        <button type="submit" class="btn" :disabled="loading">{{ loading ? '送信中…' : 'ログイン' }}</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-login { max-width: 360px; margin: 2rem auto; padding: 0 1rem; }
.card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  padding: 1.5rem;
}
.card h1 { font-size: 1.25rem; margin: 0 0 1rem; }
.input { width: 100%; padding: 0.5rem; margin-bottom: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 8px; box-sizing: border-box; }
.message { color: #dc2626; font-size: 0.9rem; margin: 0 0 0.5rem; }
.btn { width: 100%; padding: 0.6rem; background: var(--hirono-blue); color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
