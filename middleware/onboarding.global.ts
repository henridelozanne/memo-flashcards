import type { RouteLocationNormalized } from 'vue-router'
import { useOnboardingStore } from '~/store/onboarding'

// @ts-expect-error - Auto-imported by Nuxt
export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  // Éviter la redirection infinie
  if (to.path.startsWith('/onboarding')) {
    return
  }

  // Vérifier si l'utilisateur a complété l'onboarding
  const onboardingStore = useOnboardingStore()

  if (!onboardingStore.hasCompletedOnboarding) {
    // @ts-expect-error - Auto-imported by Nuxt
    // TODO: Remettre à step-1 en production
    return navigateTo('/onboarding/step-1')
  }
})
