<script setup lang="ts">
const config = useRuntimeConfig().public

const donationLinks = [
  {
    id: 'kofi',
    name: 'Ko-fi',
    description: 'コーヒー1杯分から気軽に支援',
    url: config.donateKofiUrl as string | undefined,
    icon: '☕'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'クレジットカード・PayPal残高で支援',
    url: config.donatePaypalUrl as string | undefined,
    icon: '💳'
  }
].filter((item): item is typeof item & { url: string } => !!item.url && item.url.trim().length > 0)
</script>

<template>
  <div class="page-donate">
    <header class="page-header">
      <h1>寄付・支援</h1>
    </header>

    <main class="page-content">
      <div class="info-grid">
        <div class="info-box">
          <h2 class="info-title">MedTruth とは</h2>
          <p class="info-text">
            医療情報の信頼性を高めるための無料サービスです。
            サーバー維持やコンテンツ拡充のため、ご支援いただけると助かります。
          </p>
        </div>
        <div class="info-box">
          <h2 class="info-title">経済的な効果</h2>
          <p class="info-text">
            ネット上の魅力的・魅惑的な言葉に騙されず詐欺を避けることは、皆さんにとって経済的な効果があります。
            うまい話には注意が必要です。
          </p>
        </div>
        <div class="info-box">
          <h2 class="info-title">専門家を頼りに</h2>
          <p class="info-text">
            病院や保健所など、自信がないときはまず専門家を頼りましょう。
          </p>
        </div>
        <div class="info-box info-box-cta">
          <h2 class="info-title">ご支援のお願い</h2>
          <p class="info-text">
            経済的な負担を減らせたと実感できましたら、是非サイト維持の支援をお願い申し上げます。
          </p>
        </div>
      </div>

      <section class="card donate-card">
        <h2 class="card-title">支援方法</h2>
        <p class="card-desc">
          下記のリンクから、お好きな方法でご支援いただけます。
          いただいた寄付は、サーバー費用・コンテンツ制作・機能改善に充てさせていただきます。
        </p>

        <div v-if="donationLinks.length" class="donate-buttons">
          <a
            v-for="item in donationLinks"
            :key="item.id"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="donate-btn"
          >
            <span class="donate-icon">{{ item.icon }}</span>
            <span class="donate-name">{{ item.name }}</span>
            <span class="donate-desc">{{ item.description }}</span>
          </a>
        </div>

        <div v-else class="donate-placeholder">
          <p class="placeholder-text">
            寄付リンクは準備中です。<br />
            <code>nuxt.config.ts</code> の <code>runtimeConfig.public</code> で
            <code>donateKofiUrl</code> や <code>donatePaypalUrl</code> を設定してください。
          </p>
        </div>
      </section>

      <p class="hint">
        <NuxtLink to="/">トップ</NuxtLink>に戻る
      </p>
    </main>
  </div>
</template>

<style scoped>
.page-donate { padding-bottom: 3rem; }
.page-header {
  text-align: center;
  padding: 2rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  background: linear-gradient(135deg, rgba(45, 143, 191, 0.04) 0%, rgba(58, 155, 74, 0.03) 100%);
}
.page-header h1 { font-size: 1.35rem; margin: 0; color: var(--text-primary); }

.page-content { max-width: 640px; margin: 0 auto; padding: 2rem 1.5rem; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 560px) {
  .info-grid { grid-template-columns: 1fr; }
}
.info-box {
  padding: 1.25rem;
  background: var(--bg-card);
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.info-box-cta {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, rgba(45, 143, 191, 0.06) 0%, rgba(58, 155, 74, 0.04) 100%);
  border-color: rgba(45, 143, 191, 0.2);
}
.info-title {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--hirono-blue);
}
.info-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--text-primary);
}

.donate-card {
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 2px 12px rgba(45, 143, 191, 0.04), 0 4px 20px -4px rgba(58, 155, 74, 0.03);
}
.card-title { margin: 0 0 0.5rem; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
.card-desc { margin: 0 0 1.5rem; font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; }

.donate-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.donate-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg-page);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  text-decoration: none;
  color: var(--text-primary);
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.donate-btn:hover {
  border-color: var(--hirono-blue-light);
  background: var(--hirono-blue-dim);
  box-shadow: 0 2px 8px rgba(45, 143, 191, 0.08);
}
.donate-icon { font-size: 1.5rem; }
.donate-name { font-weight: 600; font-size: 1rem; }
.donate-desc { margin-left: auto; font-size: 0.9rem; color: var(--text-muted); }
@media (max-width: 480px) {
  .donate-btn { flex-wrap: wrap; }
  .donate-desc { margin-left: 0; margin-top: 0.25rem; width: 100%; }
}

.donate-placeholder {
  padding: 1.5rem;
  background: var(--bg-page);
  border-radius: 8px;
  text-align: center;
}
.placeholder-text { margin: 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; }
.placeholder-text code {
  font-size: 0.85rem;
  background: #f1f5f9;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
}

.hint { margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-muted); text-align: center; }
.hint a { color: var(--hirono-blue); text-decoration: none; }
.hint a:hover { text-decoration: underline; }
</style>
