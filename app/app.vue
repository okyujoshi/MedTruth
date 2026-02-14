<script setup lang="ts">
const user = useSupabaseUser();
const supabase = useSupabaseClient();

const authOpen = ref(false);
const authMode = ref<"login" | "signup">("login");
const authEmail = ref("");
const authPassword = ref("");
const authMessage = ref("");
const authLoading = ref(false);

async function handleAuth() {
  authMessage.value = "";
  authLoading.value = true;
  try {
    if (authMode.value === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail.value,
        password: authPassword.value,
      });
      if (error) throw error;
      authOpen.value = false;
      authEmail.value = "";
      authPassword.value = "";
    } else {
      const { error } = await supabase.auth.signUp({
        email: authEmail.value,
        password: authPassword.value,
      });
      if (error) throw error;
      authMessage.value =
        "確認メールを送りました。メール内のリンクで有効化してください。";
    }
  } catch (e: unknown) {
    authMessage.value =
      (e as { message?: string })?.message ?? "エラーが発生しました";
  } finally {
    authLoading.value = false;
  }
}

async function signOut() {
  await supabase.auth.signOut();
  authOpen.value = false;
}

function openAuth(mode: "login" | "signup") {
  authMode.value = mode;
  authOpen.value = true;
}
provide("openAuth", openAuth);
</script>

<template>
  <div class="layout">
    <header class="site-header">
      <div class="header-inner">
        <NuxtLink to="/" class="logo">
          <span class="logo-text">MedTruth</span>
        </NuxtLink>
        <nav class="nav">
          <NuxtLink to="/" class="nav-link">トップ</NuxtLink>
          <NuxtLink to="/ask" class="nav-link">これってどうなの？</NuxtLink>
          <NuxtLink to="/add-topic" class="nav-link">トピック追加</NuxtLink>
          <NuxtLink to="/donate" class="nav-link">寄付</NuxtLink>
        </nav>
        <div class="auth-area">
          <template v-if="user">
            <span class="user-email">{{ user.email }}</span>
            <button
              type="button"
              class="btn-header btn-outline"
              @click="signOut"
            >
              ログアウト
            </button>
          </template>
          <template v-else>
            <button
              type="button"
              class="btn-header btn-primary"
              @click="authOpen = true"
            >
              ログイン
            </button>
          </template>
        </div>
      </div>
      <!-- ログイン/新規登録モーダル -->
      <Teleport to="body">
        <div
          v-if="authOpen"
          class="auth-overlay"
          @click.self="authOpen = false"
        >
          <div class="auth-card">
            <div class="auth-card-header">
              <h2>{{ authMode === "login" ? "ログイン" : "新規登録" }}</h2>
              <button
                type="button"
                class="auth-close"
                aria-label="閉じる"
                @click="authOpen = false"
              >
                ×
              </button>
            </div>
            <form class="auth-form" @submit.prevent="handleAuth">
              <input
                v-model="authEmail"
                type="email"
                placeholder="メールアドレス"
                required
                class="auth-input"
              />
              <input
                v-model="authPassword"
                type="password"
                placeholder="パスワード（6文字以上）"
                required
                minlength="6"
                class="auth-input"
              />
              <p v-if="authMessage" class="auth-message">{{ authMessage }}</p>
              <button type="submit" class="btn-auth" :disabled="authLoading">
                {{
                  authLoading
                    ? "送信中…"
                    : authMode === "login"
                      ? "ログイン"
                      : "登録"
                }}
              </button>
            </form>
            <p class="auth-switch">
              <button
                type="button"
                class="link-btn"
                @click="
                  authMode = authMode === 'login' ? 'signup' : 'login';
                  authMessage = '';
                "
              >
                {{
                  authMode === "login" ? "アカウントを作成" : "ログインに戻る"
                }}
              </button>
            </p>
          </div>
        </div>
      </Teleport>
    </header>

    <main class="main">
      <NuxtPage />
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <NuxtLink to="/">トップ</NuxtLink>
        <p class="footer-copy">© 2026 MedTruth</p>
      </div>
    </footer>
  </div>
</template>

<style>
:root {
  --hirono-blue: #2d8fbf;
  --hirono-blue-light: #5aadd9;
  --hirono-blue-dim: rgba(45, 143, 191, 0.12);
  --hirono-green: #3a9b4a;
  --hirono-green-light: #52b563;
  --hirono-green-dim: rgba(58, 155, 74, 0.1);
  --border-subtle: #e2e8f0;
  --bg-page: #eef2f6;
  --bg-card: #ffffff;
  --text-primary: #1e293b;
  --text-muted: #64748b;
}
.layout {
  min-height: 100vh;
  background:
    linear-gradient(135deg, rgba(45, 143, 191, 0.06) 0%, transparent 40%),
    linear-gradient(225deg, rgba(58, 155, 74, 0.05) 0%, transparent 45%),
    linear-gradient(180deg, #eef6f9 0%, #eaf4f0 35%, #e8f2ec 65%, #eef6f0 100%);
  color: var(--text-primary);
  font-family: "Segoe UI", system-ui, sans-serif;
  display: flex;
  flex-direction: column;
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-subtle);
}
.site-header::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--hirono-blue) 0%, var(--hirono-green) 100%);
}
.header-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.logo {
  text-decoration: none;
  color: inherit;
  font-weight: 700;
  font-size: 1.1rem;
}
.logo:hover .logo-text {
  color: var(--hirono-blue);
}
.nav {
  display: flex;
  gap: 1rem;
}
.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
}
.nav-link:hover {
  color: var(--text-primary);
}
.nav-link.router-link-active {
  color: var(--hirono-blue);
  font-weight: 600;
}
.auth-area {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.user-email {
  font-size: 0.85rem;
  color: var(--text-muted);
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.btn-header {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition:
    opacity 0.2s,
    background 0.2s;
}
.btn-header:hover {
  opacity: 0.9;
}
.btn-primary {
  background: var(--hirono-blue);
  color: #fff;
}
.btn-primary:hover {
  background: var(--hirono-blue-light);
}
.btn-outline {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}
.btn-outline:hover {
  color: var(--hirono-blue);
  border-color: var(--hirono-blue-light);
}

/* Auth modal */
.auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}
.auth-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.auth-card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}
.auth-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 0 0.25rem;
}
.auth-close:hover {
  color: var(--text-primary);
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.auth-input {
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  background: #f8fafc;
  color: var(--text-primary);
  font-size: 1rem;
}
.auth-input::placeholder {
  color: var(--text-muted);
}
.auth-input:focus {
  outline: none;
  border-color: var(--hirono-blue);
  background: #fff;
}
.auth-message {
  margin: 0;
  font-size: 0.85rem;
  color: #b45309;
}
.btn-auth {
  padding: 0.65rem;
  border-radius: 8px;
  border: none;
  background: var(--hirono-blue);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.25rem;
}
.btn-auth:hover:not(:disabled) {
  background: var(--hirono-blue-light);
  opacity: 0.95;
}
.btn-auth:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.auth-switch {
  margin: 0.75rem 0 0;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
}
.link-btn {
  background: none;
  border: none;
  color: var(--hirono-blue);
  cursor: pointer;
  text-decoration: underline;
}
.link-btn:hover {
  color: var(--hirono-blue-light);
}

.main {
  flex: 1;
}
.site-footer {
  border-top: 1px solid var(--border-subtle);
  padding: 1rem 1.5rem;
  background: linear-gradient(180deg, var(--bg-card) 0%, #f8faf8 100%);
}
.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
}
.footer-inner a {
  color: var(--text-muted);
  text-decoration: none;
}
.footer-inner a:hover {
  color: var(--hirono-blue);
}
.footer-copy {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
