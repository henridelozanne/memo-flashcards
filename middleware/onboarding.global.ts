import { useOnboardingStore } from '~/store/onboarding'

export default defineNuxtRouteMiddleware((to) => {
  // Éviter la redirection infinie
  if (to.path === '/onboarding') {
    return
  }

  // Vérifier si l'utilisateur a complété l'onboarding
  const onboardingStore = useOnboardingStore()

  if (!onboardingStore.hasCompletedOnboarding) {
    return navigateTo('/onboarding')
  }
})
