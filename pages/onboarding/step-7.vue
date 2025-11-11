<template>
  <NuxtLayout name="onboarding">
    <div class="flex h-full flex-col items-center px-6 pt-6">
      <!-- Titre -->
      <h1 class="mb-16 max-w-md text-center text-2xl font-bold leading-tight text-[var(--color-black)]">
        {{ $t('onboarding.step7.title') }}
      </h1>

      <!-- Animation Leitner carousel -->
      <div class="relative flex flex-1 items-center justify-center">
        <div class="leitner-carousel-container relative" style="height: 350px; width: 100%; max-width: 400px">
          <!-- Conteneur des boîtes qui va slider -->
          <div class="boxes-track absolute flex items-center gap-8">
            <!-- Boîte 1 -->
            <div class="leitner-box">
              <div class="box-back"></div>
              <div class="box-front"></div>
              <div class="box-number">
                <span class="text-sm font-bold text-gray-700">1</span>
              </div>
            </div>

            <!-- Boîte 2 -->
            <div class="leitner-box">
              <div class="box-back"></div>
              <div class="box-front"></div>
              <div class="box-number">
                <span class="text-sm font-bold text-gray-700">2</span>
              </div>
            </div>

            <!-- Boîte 3 -->
            <div class="leitner-box">
              <div class="box-back"></div>
              <div class="box-front"></div>
              <div class="box-number">
                <span class="text-sm font-bold text-gray-700">3</span>
              </div>
            </div>

            <!-- Boîte 4 -->
            <div class="leitner-box">
              <div class="box-back"></div>
              <div class="box-front"></div>
              <div class="box-number">
                <span class="text-sm font-bold text-gray-700">4</span>
              </div>
            </div>

            <!-- Boîte 5 -->
            <div class="leitner-box">
              <div class="box-back"></div>
              <div class="box-front"></div>
              <div class="box-number box-number-5">
                <span class="box-5-number text-sm font-bold text-gray-700">5</span>
                <svg class="box-5-check absolute opacity-0" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 12l3 3 7-7"
                    stroke="white"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Carte animée (identique à la Carte 1 de step-7) -->
          <div class="jumping-card absolute">
            <div
              class="flex h-full w-full flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-4 shadow-[0px_4px_32px_#0000000a]"
            >
              <div class="mb-2 text-center text-sm font-medium leading-tight text-gray-900">
                {{ $t('onboarding.step6.card1Question') }}
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
.leitner-carousel-container {
  overflow: visible;
}

/* Boîte Leitner avec effet 3D */
.leitner-box {
  position: relative;
  width: 200px;
  height: 240px;
  flex-shrink: 0;
}

/* Face arrière de la boîte (fond) */
.box-back {
  position: absolute;
  top: 8px;
  left: 8px;
  right: -8px;
  bottom: 0;
  background: #e5e7eb;
  border-radius: 0 0 12px 12px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.1);
}

/* Face avant de la boîte */
.box-front {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 8px;
  background: white;
  border: 2px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 2;
}

/* Numéro de la boîte */
.box-number {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: white;
  z-index: 3;
}

/* Track contenant toutes les boîtes */
.boxes-track {
  left: 50%;
  top: 50%;
  transform: translate(-100px, -120px);
  animation: slideBoxes 8s ease-in-out forwards;
}

/* Animation du carousel de boîtes */
@keyframes slideBoxes {
  0% {
    transform: translate(-100px, -120px);
  }
  15% {
    transform: translate(-100px, -120px);
  }
  20% {
    transform: translate(calc(-100px - 228px), -120px);
  }
  35% {
    transform: translate(calc(-100px - 228px), -120px);
  }
  40% {
    transform: translate(calc(-100px - 456px), -120px);
  }
  55% {
    transform: translate(calc(-100px - 456px), -120px);
  }
  60% {
    transform: translate(calc(-100px - 684px), -120px);
  }
  75% {
    transform: translate(calc(-100px - 684px), -120px);
  }
  80% {
    transform: translate(calc(-100px - 912px), -120px);
  }
  100% {
    transform: translate(calc(-100px - 912px), -120px);
  }
}

/* Carte qui saute */
.jumping-card {
  width: 140px;
  height: 180px;
  left: 50%;
  top: 50%;
  transform: translate(-70px, -90px);
  z-index: 1;
  animation: jumpCard 8s ease-in-out forwards;
}

/* Animation de saut de la carte */
@keyframes jumpCard {
  /* Boîte 1 */
  0%,
  15% {
    transform: translate(-70px, -90px);
  }
  /* Saut vers boîte 2 */
  17% {
    transform: translate(-70px, -150px);
  }
  20% {
    transform: translate(-70px, -90px);
  }
  35% {
    transform: translate(-70px, -90px);
  }
  /* Saut vers boîte 3 */
  37% {
    transform: translate(-70px, -150px);
  }
  40% {
    transform: translate(-70px, -90px);
  }
  55% {
    transform: translate(-70px, -90px);
  }
  /* Saut vers boîte 4 */
  57% {
    transform: translate(-70px, -150px);
  }
  60% {
    transform: translate(-70px, -90px);
  }
  75% {
    transform: translate(-70px, -90px);
  }
  /* Saut vers boîte 5 */
  77% {
    transform: translate(-70px, -150px);
  }
  80% {
    transform: translate(-70px, -90px);
  }
  100% {
    transform: translate(-70px, -90px);
  }
}

/* Animation pour transformer le 5 en check vert */
.box-number-5 {
  animation: transformToCheck 8s ease-in-out forwards;
}

.box-5-number {
  animation: fadeOutNumber 0.3s ease-in-out 7.5s forwards;
}

.box-5-check {
  animation: fadeInCheck 0.3s ease-in-out 7.5s forwards;
}

@keyframes fadeOutNumber {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes fadeInCheck {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes transformToCheck {
  0%,
  93% {
    background: white;
    border-color: #d1d5db;
  }
  100% {
    background: #10b981;
    border-color: #10b981;
  }
}
</style>
