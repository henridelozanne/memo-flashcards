<template>
  <NuxtLayout name="onboarding">
    <div class="flex h-full flex-col items-center px-6 pt-6">
      <!-- Titre -->
      <h1 class="slide-up-1 mb-16 max-w-md text-center text-2xl font-bold leading-tight text-[var(--color-black)]">
        {{ $t('onboarding.step9.title') }}
      </h1>

      <!-- Time Picker -->
      <div class="slide-up-2 relative flex flex-1 items-center justify-center">
        <div class="time-picker-container">
          <input ref="timeInput" v-model="selectedTime" type="time" class="time-input" @change="handleTimeChange" />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { LocalNotifications } from '@capacitor/local-notifications'
import { ref, onMounted } from 'vue'
import { useOnboardingStore } from '~/store/onboarding'
import { useUserProfileStore } from '~/store/userProfile'

const onboardingStore = useOnboardingStore()
const userProfileStore = useUserProfileStore()
const timeInput = ref<HTMLInputElement | null>(null)
const selectedTime = ref<string>('')

// Obtenir l'heure actuelle au format HH:MM
function getCurrentTime(): string {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// Gérer le changement d'heure
function handleTimeChange() {
  userProfileStore.notificationHour = selectedTime.value
}

// Demander la permission pour les notifications
async function requestNotificationPermission() {
  try {
    const permission = await LocalNotifications.requestPermissions()
    return permission.display === 'granted'
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error)
    return false
  }
}

// Enregistrer la validation de l'étape
onboardingStore.registerStepValidation(async () => {
  if (!selectedTime.value) {
    return false
  }

  // Demander la permission pour les notifications
  await requestNotificationPermission()

  return true
})

onMounted(async () => {
  onboardingStore.currentStep = 9

  // Définir l'heure actuelle par défaut
  selectedTime.value = getCurrentTime()
  userProfileStore.notificationHour = selectedTime.value
})

defineOptions({ name: 'OnboardingStep9Page' })
</script>

<style scoped>
.time-picker-container {
  width: 100%;
  max-width: 300px;
  display: flex;
  justify-content: center;
}

.time-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  background: white;
  color: var(--color-black);
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-input:hover {
  border-color: #9ca3af;
}

.time-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Style pour le picker natif */
.time-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  font-size: 20px;
}
</style>
