import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserProfileStore } from './userProfile'

export const useOnboardingStore = defineStore('onboarding', () => {
  const userProfileStore = useUserProfileStore()

  // État de l'onboarding uniquement
  const currentStep = ref<number>(1)
  const step10ConfettiShown = ref<boolean>(false)

  // Nombre total d'étapes (11 steps + 1 welcome = 12 écrans, mais totalSteps = 11 pour la progress bar)
  const totalSteps = 11

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
      return result instanceof Promise ? result : result
    }
    return true // Pas de validation = on peut continuer
  }

  // Réinitialiser l'onboarding
  function resetOnboarding() {
    currentStep.value = 1
    currentStepValidation.value = null
    step10ConfettiShown.value = false
    userProfileStore.resetProfile()
  }

  // Passer à l'étape suivante
  function nextStep() {
    if (currentStep.value < totalSteps) {
      currentStep.value += 1
      // Réinitialiser la validation pour la nouvelle étape
      currentStepValidation.value = null
    }
  }

  // Revenir à l'étape précédente
  function previousStep() {
    if (currentStep.value > 1) {
      currentStep.value -= 1
      // Réinitialiser la validation pour la nouvelle étape
      currentStepValidation.value = null
    }
  }

  // Marquer l'onboarding comme terminé
  function completeOnboarding() {
    currentStep.value = totalSteps
    userProfileStore.completeOnboarding()
  }

  return {
    // État
    currentStep,
    totalSteps,
    currentStepValidation,
    step10ConfettiShown,

    // Actions
    registerStepValidation,
    validateCurrentStep,
    resetOnboarding,
    nextStep,
    previousStep,
    completeOnboarding,
  }
})
