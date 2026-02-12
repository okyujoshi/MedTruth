<script setup lang="ts">
// ログインはヘッダーのモーダルで行います。 /login にアクセスした場合はトップへリダイレクト
await navigateTo('/', { replace: true })
</script>

<template>
  <div class="page-redirect">
    <p>トップへリダイレクトしています…</p>
  </div>
</template>
