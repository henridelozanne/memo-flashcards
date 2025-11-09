import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOnboardingStore = defineStore('onboarding', () => {
  // État de l'onboarding
  const firstName = ref<string>('')
  const goal = ref<string>('')
  const situation = ref<string>('')
  const notificationHour = ref<string>('')
  const currentStep = ref<number>(9)
  const hasCompletedOnboarding = ref<boolean>(false)

  // Nombre total d'étapes
  const totalSteps = 11

  // Fonction de validation de l'étape courante (enregistrée par chaque page)
  const currentStepValidation = ref<(() => boolean) | null>(null)

  // Enregistrer la validation de l'étape courante
  function registerStepValidation(validationFn: () => boolean) {
    currentStepValidation.value = validationFn
  }

  // Valider l'étape courante avant de continuer
  function validateCurrentStep(): boolean {
    if (currentStepValidation.value) {
      return currentStepValidation.value()
    }
    return true // Pas de validation = on peut continuer
  }

  // Réinitialiser l'onboarding
  function resetOnboarding() {
    firstName.value = ''
    goal.value = ''
    situation.value = ''
    notificationHour.value = ''
    currentStep.value = 1
    hasCompletedOnboarding.value = false
    currentStepValidation.value = null
  }

  // Passer à l'étape suivante
  function nextStep() {
    if (currentStep.value < totalSteps) {
      currentStep.value++
      // Réinitialiser la validation pour la nouvelle étape
      currentStepValidation.value = null
    }
  }

  // Revenir à l'étape précédente
  function previousStep() {
    if (currentStep.value > 1) {
      currentStep.value--
      // Réinitialiser la validation pour la nouvelle étape
      currentStepValidation.value = null
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
    currentStepValidation,

    // Actions
    registerStepValidation,
    validateCurrentStep,
    resetOnboarding,
    nextStep,
    previousStep,
    completeOnboarding,
  }
})
