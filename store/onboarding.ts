import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOnboardingStore = defineStore('onboarding', () => {
  // État de l'onboarding
  const firstName = ref<string>('')
  const goal = ref<string>('')
  const situation = ref<string>('')
  const notificationHour = ref<string>('')
  const currentStep = ref<number>(1)
  const hasCompletedOnboarding = ref<boolean>(true)

  // Nombre total d'étapes (10 steps + 1 welcome = 11 écrans, mais totalSteps = 10 pour la progress bar)
  const totalSteps = 10

  // Fonction de validation de l'étape courante (enregistrée par chaque page)
  const currentStepValidation = ref<(() => boolean | Promise<boolean>) | null>(null)

  // Enregistrer la validation de l'étape courante
  function registerStepValidation(validationFn: () => boolean | Promise<boolean>) {
    currentStepValidation.value = validationFn
  }

  // Valider l'étape courante avant de continuer
  async function validateCurrentStep(): Promise<boolean> {
    if (currentStepValidation.value) {
      const result = currentStepValidation.value()
      // Support des validations synchrones et asynchrones
      return result instanceof Promise ? await result : result
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
