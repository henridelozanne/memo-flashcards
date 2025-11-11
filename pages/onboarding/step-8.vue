<template>
  <NuxtLayout name="onboarding">
    <div class="flex h-full flex-col items-center px-6 pt-6">
      <!-- Titre -->
      <h1 class="mb-16 max-w-md text-center text-2xl font-bold leading-tight text-[var(--color-black)]">
        {{ $t('onboarding.step8.title') }}
      </h1>

      <!-- Animation de streak -->
      <div class="relative flex w-full flex-1 flex-col items-center justify-center gap-8">
        <div class="streak-widget w-full">
          <div class="streak-container flex items-center gap-2">
            <!-- Jour 1 - complété -->
            <div class="streak-day completed">
              <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 12l3 3 7-7"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <!-- Jour 2 - complété -->
            <div class="streak-day completed">
              <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 12l3 3 7-7"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <!-- Jour 3 - complété -->
            <div class="streak-day completed">
              <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 12l3 3 7-7"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <!-- Jour 4 - complété -->
            <div class="streak-day completed">
              <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 12l3 3 7-7"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <!-- Jour 5 - animation -->
            <div class="streak-day day-5">
              <svg class="check-icon check-5" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 12l3 3 7-7"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <!-- Jour 6 - animation -->
            <div class="streak-day day-6">
              <svg class="check-icon check-6" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 12l3 3 7-7"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <!-- Jour 7 - aujourd'hui, animation -->
            <div class="streak-day day-7">
              <svg class="check-icon check-7" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 12l3 3 7-7"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Message de célébration -->
        <div class="celebration-message">
          <div class="celebration-icon">🎉</div>
          <div class="celebration-text">7 jours d'affilée !</div>
          <div class="celebration-subtext">Continue comme ça</div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOnboardingStore } from '~/store/onboarding'

const onboardingStore = useOnboardingStore()

onMounted(() => {
  onboardingStore.currentStep = 8
})

defineOptions({ name: 'OnboardingStep8Page' })
</script>

<style scoped>
/* Widget contenant le streak */
.streak-widget {
  background: #374151;
  border-radius: 24px;
  padding: 20px;
  border: 2px solid #9ca3af;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin: 0 8px;
}

.streak-container {
  width: 100%;
}

/* Case de jour de streak */
.streak-day {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #d1d5db;
  background: white;
  transition: all 0.3s ease;
}

/* Jours complétés */
.streak-day.completed {
  background: #10b981;
  border-color: #10b981;
}

/* Jours 5, 6, 7 - animation progressive */
.streak-day.day-5,
.streak-day.day-6,
.streak-day.day-7 {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.streak-day.day-5 {
  animation: fillDay 0.6s ease-out 1s forwards;
}

.streak-day.day-6 {
  animation: fillDay 0.6s ease-out 2.2s forwards;
}

.streak-day.day-7 {
  animation: fillDay 0.6s ease-out 3.4s forwards;
}

/* Check icons cachés par défaut pour jours 5, 6, 7 */
.check-5,
.check-6,
.check-7 {
  opacity: 0;
  transform: scale(0.5);
}

.check-5 {
  animation: showCheck 0.6s ease-out 1s forwards;
}

.check-6 {
  animation: showCheck 0.6s ease-out 2.2s forwards;
}

.check-7 {
  animation: showCheck 0.6s ease-out 3.4s forwards;
}

/* Check icon visible pour les jours complétés */
.completed .check-icon {
  opacity: 1;
}

/* Animation pour remplir une case */
@keyframes fillDay {
  from {
    background: #e5e7eb;
    border-color: #d1d5db;
  }
  to {
    background: #10b981;
    border-color: #10b981;
  }
}

/* Animation pour faire apparaître le check */
@keyframes showCheck {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Message de célébration */
.celebration-message {
  position: relative;
  text-align: center;
  opacity: 0;
  animation:
    celebrationAppear 0.6s ease-out 4.2s forwards,
    celebrationDisappear 0.6s ease-out 7s forwards;
  padding: 0 12px;
}

.celebration-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: celebrationBounce 0.8s ease-out 4.2s;
  display: block;
}

.celebration-text {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-black);
  margin-bottom: 8px;
  line-height: 1.3;
}

.celebration-subtext {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
  line-height: 1.3;
}

/* Animation d'apparition du message */
@keyframes celebrationAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation de disparition du message */
@keyframes celebrationDisappear {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Animation de rebond de l'emoji */
@keyframes celebrationBounce {
  0%,
  100% {
    transform: scale(1) translateY(0);
  }
  25% {
    transform: scale(1.2) translateY(-10px);
  }
  50% {
    transform: scale(0.9) translateY(0);
  }
  75% {
    transform: scale(1.05) translateY(-5px);
  }
}
</style>
