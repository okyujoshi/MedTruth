export default defineNuxtRouteMiddleware(() => {
  return navigateTo('/', { replace: true })
})
