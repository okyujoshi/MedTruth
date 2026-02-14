// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase'],
  supabase: {
    redirect: false
  },
  runtimeConfig: {
    public: {
      donateKofiUrl: process.env.DONATE_KOFI_URL ?? '',
      donatePaypalUrl: process.env.DONATE_PAYPAL_URL ?? ''
    }
  }
})
