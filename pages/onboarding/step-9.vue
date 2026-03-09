<template>
  <NuxtLayout name="onboarding">
    <div class="flex h-full flex-col items-center px-6 pt-6">
      <!-- Titre -->
      <h1 class="slide-up-1 mb-4 max-w-md text-center text-2xl font-bold leading-tight text-[var(--color-black)]">
        {{ $t('onboarding.step9.title') }}
      </h1>

      <!-- Sous-titre -->
      <p class="slide-up-2 mb-8 max-w-md text-center text-base leading-relaxed text-gray-500">
        {{ $t('onboarding.step9.subtitle') }}
      </p>

      <!-- Animation -->
      <div class="slide-up-3 w-full flex-1">
        <div class="mx-auto w-full max-w-xs">
          <!-- Ta collection -->
          <div class="mb-4">
            <div class="existing-card">
              <span class="existing-card-label">{{ $t('onboarding.step9.existingLabel') }}</span>
              <TransitionGroup name="card-item" tag="div">
                <div v-for="card in collectionCards" :key="card.id" class="existing-card-item">
                  <span class="card-text">{{ card.text }}</span>
                  <div v-if="card.isAi" class="card-ai-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12l5 5 9-9"
                        stroke="white"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <!-- Bouton IA -->
          <Transition name="btn-fade">
            <div v-if="showButton" ref="buttonWrapperRef" class="mb-4 flex justify-center">
              <div class="ai-button" :class="{ 'ai-button--active': buttonActive }">
                <span class="ai-icon">✦</span>
                <span>{{ $t('onboarding.step9.aiButton') }}</span>
              </div>
            </div>
          </Transition>

          <!-- Suggestions -->
          <div ref="suggestionsWrapperRef">
            <TransitionGroup name="suggestion" tag="div" class="suggestions-list">
              <div v-for="s in visibleSuggestions" :key="s.id" class="suggestion-card">
                <div class="suggestion-badge">{{ $t('onboarding.step9.suggestionLabel') }}</div>
                <div class="suggestion-text">{{ s.text }}</div>
                <div class="check-circle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12l5 5 9-9"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOnboardingStore } from '~/store/onboarding'

const { t } = useI18n()
const onboardingStore = useOnboardingStore()

const allSuggestions = [
  { id: 's1', text: t('onboarding.step9.suggestion1') },
  { id: 's2', text: t('onboarding.step9.suggestion2') },
  { id: 's3', text: t('onboarding.step9.suggestion3') },
]

const collectionCards = ref<Array<{ id: string; text: string; isAi?: boolean }>>([
  { id: 'c1', text: t('onboarding.step9.card1') },
  { id: 'c2', text: t('onboarding.step9.card2') },
])

const visibleSuggestions = ref<Array<{ id: string; text: string }>>([])
const showButton = ref(false)
const buttonActive = ref(false)
const buttonWrapperRef = ref<HTMLElement | null>(null)
const suggestionsWrapperRef = ref<HTMLElement | null>(null)

async function moveSuggestionToCollection(suggestionId: string, card: { id: string; text: string; isAi?: boolean }) {
  const els = [buttonWrapperRef.value, suggestionsWrapperRef.value].filter((el): el is HTMLElement => el !== null)
  const oldTops = els.map((el) => el.getBoundingClientRect().top)

  visibleSuggestions.value = visibleSuggestions.value.filter((s) => s.id !== suggestionId)
  collectionCards.value.push(card)

  await nextTick()

  els.forEach((element, i) => {
    const delta = oldTops[i] - element.getBoundingClientRect().top
    if (Math.abs(delta) < 1) return
    const node = element
    node.style.transition = 'none'
    node.style.transform = `translateY(${delta}px)`
    node.getBoundingClientRect() // force reflow
    node.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    node.style.transform = 'translateY(0)'
    node.addEventListener(
      'transitionend',
      () => {
        node.style.transition = ''
        node.style.transform = ''
      },
      { once: true }
    )
  })
}

const timers: ReturnType<typeof setTimeout>[] = []
function later(fn: () => void, ms: number) {
  timers.push(setTimeout(fn, ms))
}

onMounted(() => {
  onboardingStore.currentStep = 9

  // Phase 1 — bouton apparaît (t=1500)
  later(() => {
    showButton.value = true
  }, 1500)

  // Phase 2 — effet "press" sur le bouton (t=3000)
  later(() => {
    buttonActive.value = true
  }, 3000)
  later(() => {
    buttonActive.value = false
  }, 3250)

  // Phase 3 — suggestions tombent en cascade (t=4500, 4850, 5200)
  later(() => {
    visibleSuggestions.value.push(allSuggestions[0])
  }, 4500)
  later(() => {
    visibleSuggestions.value.push(allSuggestions[1])
  }, 4850)
  later(() => {
    visibleSuggestions.value.push(allSuggestions[2])
  }, 5200)

  // Phase 5 — échanges suggestion → carte, 1500ms entre chaque (t=6700, 8200, 9700)
  later(() => moveSuggestionToCollection('s1', { id: 'c3', text: allSuggestions[0].text, isAi: true }), 6700)
  later(() => moveSuggestionToCollection('s2', { id: 'c4', text: allSuggestions[1].text, isAi: true }), 8200)
  later(() => moveSuggestionToCollection('s3', { id: 'c5', text: allSuggestions[2].text, isAi: true }), 9700)

  // Phase 6 — bouton disparaît en fade après la dernière suggestion (t=10400)
  later(() => {
    showButton.value = false
  }, 10400)
})

onUnmounted(() => {
  timers.forEach(clearTimeout)
})

defineOptions({ name: 'OnboardingStep9Page' })
</script>

<style scoped>
/* Collection */
.existing-card {
  background: white;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.existing-card-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
  margin-bottom: 8px;
}

.existing-card-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;
  overflow: hidden;
}

.card-text {
  font-size: 13px;
  color: #374151;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
}

.card-ai-check {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
}

.existing-card-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* TransitionGroup — cartes qui s'ajoutent à la collection */
.card-item-enter-active {
  transition: all 0.35s ease;
}
.card-item-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.card-item-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* Bouton IA */
.ai-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary);
  color: white;
  border-radius: 24px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.ai-button--active {
  transform: scale(0.92);
  opacity: 0.82;
}

.ai-icon {
  font-size: 16px;
  animation: pulse-star 1.8s ease-in-out infinite;
}

@keyframes pulse-star {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.3);
  }
}

/* Transition — bouton apparition magique */
.btn-fade-enter-active {
  transition:
    opacity 0.6s ease,
    transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-fade-leave-active {
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}
.btn-fade-enter-from {
  opacity: 0;
  transform: scale(0.7);
}
.btn-fade-enter-to {
  opacity: 1;
  transform: scale(1);
}
.btn-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
.btn-fade-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* Suggestions */
.suggestion-card {
  background: white;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 8px;
  border: 1.5px solid #ede9fe;
  box-shadow: 0 2px 8px rgba(109, 40, 217, 0.07);
  display: flex;
  align-items: center;
  gap: 10px;
}

/* TransitionGroup — suggestions */
.suggestions-list {
  position: relative;
}

.suggestion-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.suggestion-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}
.suggestion-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}
.suggestion-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.suggestion-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.suggestion-leave-to {
  opacity: 0;
  transform: translateY(-14px);
}

.suggestion-move {
  transition: transform 0.3s ease;
}

.suggestion-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7c3aed;
  background: #ede9fe;
  border-radius: 6px;
  padding: 2px 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.suggestion-text {
  font-size: 13px;
  color: #374151;
  flex: 1;
  line-height: 1.3;
}

.check-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid #d8d8d8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #d1d5db;
}
</style>
