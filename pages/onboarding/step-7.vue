<template>
  <NuxtLayout name="onboarding">
    <div class="flex h-full flex-col items-center px-6 pt-6">
      <!-- Titre -->
      <h1 class="mb-12 max-w-md text-center text-2xl font-bold leading-tight text-[var(--color-black)]">
        {{ $t('onboarding.step7.title') }}
      </h1>

      <!-- Animation d'éventail de cartes -->
      <div class="relative flex flex-1 items-center justify-center">
        <div class="cards-fan relative h-80 w-64">
          <!-- Carte 5 (arrière-plan, partiellement masquée) -->
          <div class="card-fan card-5 absolute left-1/2 top-1/2 h-72 w-56 -translate-x-1/2 -translate-y-1/2">
            <div
              class="flex h-full w-full flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-4 shadow-[0px_4px_32px_#0000000a]"
            ></div>
          </div>

          <!-- Carte 4 (arrière-plan, partiellement masquée) -->
          <div class="card-fan card-4 absolute left-1/2 top-1/2 h-72 w-56 -translate-x-1/2 -translate-y-1/2">
            <div
              class="flex h-full w-full flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-4 shadow-[0px_4px_32px_#0000000a]"
            ></div>
          </div>

          <!-- Carte 3 : Date de la Révolution française / 1789 -->
          <div class="card-fan card-3 absolute left-1/2 top-1/2 h-72 w-56 -translate-x-1/2 -translate-y-1/2">
            <div
              class="flex h-full w-full flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-4 shadow-[0px_4px_32px_#0000000a]"
            >
              <div class="mb-2 text-center text-sm font-medium leading-tight text-gray-900">
                {{ $t('onboarding.step7.card3Question') }}
              </div>
              <div class="my-2 h-px w-8 bg-gray-300 opacity-50"></div>
              <div class="text-center text-xs leading-tight text-gray-500">
                {{ $t('onboarding.step7.card3Answer') }}
              </div>
            </div>
          </div>

          <!-- Carte 2 : Température d'ébullition de l'eau / 100°C -->
          <div class="card-fan card-2 absolute left-1/2 top-1/2 h-72 w-56 -translate-x-1/2 -translate-y-1/2">
            <div
              class="flex h-full w-full flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-4 shadow-[0px_4px_32px_#0000000a]"
            >
              <div class="mb-2 text-center text-sm font-medium leading-tight text-gray-900">
                {{ $t('onboarding.step7.card2Question') }}
              </div>
              <div class="my-2 h-px w-8 bg-gray-300 opacity-50"></div>
              <div class="text-center text-xs leading-tight text-gray-500">
                {{ $t('onboarding.step7.card2Answer') }}
              </div>
            </div>
          </div>

          <!-- Carte 1 : Bonjour / おはよう -->
          <div class="card-fan card-1 absolute left-1/2 top-1/2 h-72 w-56 -translate-x-1/2 -translate-y-1/2">
            <div
              class="flex h-full w-full flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-4 shadow-[0px_4px_32px_#0000000a]"
            >
              <div class="mb-2 text-center text-sm font-medium leading-tight text-gray-900">
                {{ $t('onboarding.step7.card1Question') }}
              </div>
              <div class="my-2 h-px w-8 bg-gray-300 opacity-50"></div>
              <div class="text-center text-xs leading-tight text-gray-500">おはよう</div>
            </div>
          </div>
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
  onboardingStore.currentStep = 7
})

defineOptions({ name: 'OnboardingStep7Page' })
</script>

<style scoped>
@keyframes fanOut1 {
  from {
    transform: translate(-50%, -50%) rotate(0deg) translateX(0);
  }
  to {
    transform: translate(-50%, -50%) rotate(-12deg) translateX(-30px);
  }
}

@keyframes fanOut2 {
  from {
    transform: translate(-50%, -50%) rotate(0deg) translateX(0);
  }
  to {
    transform: translate(-50%, -50%) rotate(-6deg) translateX(-15px);
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
    transform: translate(-50%, -50%) rotate(6deg) translateX(15px);
  }
}

@keyframes fanOut5 {
  from {
    transform: translate(-50%, -50%) rotate(0deg) translateX(0);
  }
  to {
    transform: translate(-50%, -50%) rotate(12deg) translateX(30px);
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
  animation-delay: 1s;
  opacity: 1;
}

/* Carte 2 */
.card-2 {
  z-index: 4;
  animation-name: fanOut2;
  animation-delay: 1.1s;
  opacity: 1;
}

/* Carte 3 (milieu) */
.card-3 {
  z-index: 3;
  animation-name: fanOut3;
  animation-delay: 1.2s;
  opacity: 1;
}

/* Carte 4 (arrière-plan) */
.card-4 {
  z-index: 2;
  animation-name: fanOut4;
  animation-delay: 1.3s;
  opacity: 0.7;
}

/* Carte 5 (arrière-plan) */
.card-5 {
  z-index: 1;
  animation-name: fanOut5;
  animation-delay: 1.4s;
  opacity: 0.5;
}
</style>
