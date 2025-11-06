import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOnboardingStore = defineStore('onboarding', () => {
  // État de l'onboarding
  const firstName = ref<string>('')
  const goal = ref<string>('')
  const situation = ref<string>('')
  const notificationHour = ref<string>('')
  const currentStep = ref<number>(1)
  const hasCompletedOnboarding = ref<boolean>(false)

  // Nombre total d'étapes
  const totalSteps = 11

  // Réinitialiser l'onboarding
  function resetOnboarding() {
    firstName.value = ''
    goal.value = ''
    situation.value = ''
    notificationHour.value = ''
    currentStep.value = 1
    hasCompletedOnboarding.value = false
  }

  // Passer à l'étape suivante
  function nextStep() {
    if (currentStep.value < totalSteps) {
      currentStep.value++
    }
  }

  // Revenir à l'étape précédente
  function previousStep() {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  // Aller à une étape spécifique
  function goToStep(step: number) {
    if (step >= 1 && step <= totalSteps) {
      currentStep.value = step
    }
  }

  // Marquer l'onboarding comme terminé
  function completeOnboarding() {
    hasCompletedOnboarding.value = true
    currentStep.value = totalSteps
  }

  return {
    // État
    firstName,
    goal,
    situation,
    notificationHour,
    currentStep,
    hasCompletedOnboarding,
    totalSteps,

    // Actions
    resetOnboarding,
    nextStep,
    previousStep,
    goToStep,
    completeOnboarding,
  }
})
