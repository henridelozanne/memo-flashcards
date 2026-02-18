<template>
  <NuxtLayout name="onboarding">
    <!-- Contenu de l'écran 1 -->
    <div class="flex h-full flex-col justify-between py-8">
      <!-- Logo et nom de l'app -->
      <div class="flex flex-row items-center justify-center gap-4 pt-12">
        <img src="/MemoLooper_logo.png" alt="Memo Flashcards" class="h-12 w-12 rounded-xl" />
        <h1 class="text-3xl font-bold text-[var(--color-black)]">{{ $t('onboarding.appName') }}</h1>
      </div>

      <!-- Animation d'éventail de cartes (version réduite) -->
      <div class="relative flex items-center justify-center py-8">
        <div class="cards-fan relative h-48 w-48">
          <!-- Carte 5 (arrière-plan) -->
          <div class="card-fan card-5 absolute left-1/2 top-1/2 h-44 w-36 -translate-x-1/2 -translate-y-1/2">
            <div
              class="flex h-full w-full flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-3 shadow-[0px_4px_32px_#0000000a]"
            ></div>
          </div>

          <!-- Carte 4 (arrière-plan) -->
          <div class="card-fan card-4 absolute left-1/2 top-1/2 h-44 w-36 -translate-x-1/2 -translate-y-1/2">
            <div
              class="flex h-full w-full flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-3 shadow-[0px_4px_32px_#0000000a]"
            ></div>
          </div>

          <!-- Carte 3 : Date de la Révolution française / 1789 -->
          <div class="card-fan card-3 absolute left-1/2 top-1/2 h-44 w-36 -translate-x-1/2 -translate-y-1/2">
            <div
              class="flex h-full w-full flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-3 shadow-[0px_4px_32px_#0000000a]"
            >
              <div class="mb-1 text-center text-xs font-medium leading-tight text-gray-900">
                {{ $t('onboarding.step6.card3Question') }}
              </div>
              <div class="my-1 h-px w-6 bg-gray-300 opacity-50"></div>
              <div class="text-center text-[10px] leading-tight text-gray-500">
                {{ $t('onboarding.step6.card3Answer') }}
              </div>
            </div>
          </div>

          <!-- Carte 2 : Température d'ébullition de l'eau / 100°C -->
          <div class="card-fan card-2 absolute left-1/2 top-1/2 h-44 w-36 -translate-x-1/2 -translate-y-1/2">
            <div
              class="flex h-full w-full flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-3 shadow-[0px_4px_32px_#0000000a]"
            >
              <div class="mb-1 text-center text-xs font-medium leading-tight text-gray-900">
                {{ $t('onboarding.step6.card2Question') }}
              </div>
              <div class="my-1 h-px w-6 bg-gray-300 opacity-50"></div>
              <div class="text-center text-[10px] leading-tight text-gray-500">
                {{ $t('onboarding.step6.card2Answer') }}
              </div>
            </div>
          </div>

          <!-- Carte 1 : Bonjour / おはよう -->
          <div class="card-fan card-1 absolute left-1/2 top-1/2 h-44 w-36 -translate-x-1/2 -translate-y-1/2">
            <div
              class="flex h-full w-full flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-3 shadow-[0px_4px_32px_#0000000a]"
            >
              <div class="mb-1 text-center text-xs font-medium leading-tight text-gray-900">
                {{ $t('onboarding.step6.card1Question') }}
              </div>
              <div class="my-1 h-px w-6 bg-gray-300 opacity-50"></div>
              <div class="text-center text-[10px] leading-tight text-gray-500">おはよう</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Phrase d'accroche -->
      <div class="flex flex-col items-center gap-2 text-center">
        <p class="text-xl font-semibold text-[var(--color-black)]">{{ $t('onboarding.welcome.tagline1') }}</p>
        <p class="text-xl font-semibold text-[var(--color-secondary)]">{{ $t('onboarding.welcome.tagline2') }}</p>
      </div>

      <!-- Espace pour pousser le bouton vers le bas (géré par le layout) -->
      <div></div>
    </div>

    <!-- Personnalisation du texte du bouton -->
    <template #button-label>{{ $t('onboarding.start') }}</template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useOnboardingStore } from '~/store/onboarding'

const onboardingStore = useOnboardingStore()

// Initialiser l'étape à 1 au montage
onboardingStore.currentStep = 0

defineOptions({ name: 'OnboardingWelcomePage' })
</script>

<style scoped>
@keyframes fanOut1 {
  from {
    transform: translate(-50%, -50%) rotate(0deg) translateX(0);
  }
  to {
    transform: translate(-50%, -50%) rotate(-12deg) translateX(-20px);
  }
}

@keyframes fanOut2 {
  from {
    transform: translate(-50%, -50%) rotate(0deg) translateX(0);
  }
  to {
    transform: translate(-50%, -50%) rotate(-6deg) translateX(-10px);
  }
}

@keyframes fanOut3 {
  from {
    transform: translate(-50%, -50%) rotate(0deg) translateX(0);
  }
  to {
    transform: translate(-50%, -50%) rotate(0deg);
  }
}

@keyframes fanOut4 {
  from {
    transform: translate(-50%, -50%) rotate(0deg) translateX(0);
  }
  to {
    transform: translate(-50%, -50%) rotate(6deg) translateX(10px);
  }
}

@keyframes fanOut5 {
  from {
    transform: translate(-50%, -50%) rotate(0deg) translateX(0);
  }
  to {
    transform: translate(-50%, -50%) rotate(12deg) translateX(20px);
  }
}

.cards-fan {
  perspective: 1000px;
}

.card-fan {
  animation-duration: 0.6s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
  transform-origin: center bottom;
  transform: translate(-50%, -50%) rotate(0deg) translateX(0);
}

/* Carte 1 (devant, à gauche) */
.card-1 {
  z-index: 5;
  animation-name: fanOut1;
  animation-delay: 0.5s;
  opacity: 1;
}

/* Carte 2 */
.card-2 {
  z-index: 4;
  animation-name: fanOut2;
  animation-delay: 0.6s;
  opacity: 1;
}

/* Carte 3 (milieu) */
.card-3 {
  z-index: 3;
  animation-name: fanOut3;
  animation-delay: 0.7s;
  opacity: 1;
}

/* Carte 4 (arrière-plan) */
.card-4 {
  z-index: 2;
  animation-name: fanOut4;
  animation-delay: 0.8s;
  opacity: 1;
}

/* Carte 5 (arrière-plan) */
.card-5 {
  z-index: 1;
  animation-name: fanOut5;
  animation-delay: 0.9s;
  opacity: 1;
}
</style>
