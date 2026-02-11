<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()

async function signOut () {
  await supabase.auth.signOut()
}
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
          <NuxtLink to="/add-topic" class="nav-link">トピック追加</NuxtLink>
        </nav>
        <div class="auth-area">
          <template v-if="user">
            <span class="user-email">{{ user.email }}</span>
            <button type="button" class="btn-header btn-outline" @click="signOut">ログアウト</button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="btn-header btn-primary">ログイン</NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <main class="main">
      <NuxtPage />
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <NuxtLink to="/">トップ</NuxtLink>
        <p class="footer-copy">© 2025 MedTruth</p>
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
  --border-subtle: #e2e8f0;
  --bg-page: #eef2f6;
  --bg-card: #ffffff;
  --text-primary: #1e293b;
  --text-muted: #64748b;
}
.layout {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4f8 0%, #eef2f6 100%);
  color: var(--text-primary);
  font-family: 'Segoe UI', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-subtle);
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
.logo { text-decoration: none; color: inherit; font-weight: 700; font-size: 1.1rem; }
.logo:hover .logo-text { color: var(--hirono-blue); }
.nav { display: flex; gap: 1rem; }
.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
}
.nav-link:hover { color: var(--text-primary); }
.nav-link.router-link-active { color: var(--hirono-blue); font-weight: 600; }
.auth-area { margin-left: auto; display: flex; align-items: center; gap: 0.75rem; }
.user-email { font-size: 0.85rem; color: var(--text-muted); max-width: 160px; overflow: hidden; text-overflow: ellipsis; }
.btn-header {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: opacity 0.2s, background 0.2s;
}
.btn-header:hover { opacity: 0.9; }
.btn-primary { background: var(--hirono-blue); color: #fff; }
.btn-primary:hover { background: var(--hirono-blue-light); }
.btn-outline { background: transparent; color: var(--text-muted); border: 1px solid var(--border-subtle); }
.btn-outline:hover { color: var(--hirono-blue); border-color: var(--hirono-blue-light); }
.main { flex: 1; }
.site-footer {
  border-top: 1px solid var(--border-subtle);
  padding: 1rem 1.5rem;
  background: var(--bg-card);
}
.footer-inner { max-width: 960px; margin: 0 auto; text-align: center; }
.footer-inner a { color: var(--text-muted); text-decoration: none; }
.footer-inner a:hover { color: var(--hirono-blue); }
.footer-copy { margin: 0.5rem 0 0; font-size: 0.85rem; color: var(--text-muted); }
</style>
