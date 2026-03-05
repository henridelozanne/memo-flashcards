<template>
  <Teleport to="body">
    <Transition name="ai-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex flex-col bg-white"
        style="padding-top: env(safe-area-inset-top)"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <button
            type="button"
            class="flex items-center gap-1 text-sm text-gray-500 transition active:opacity-60"
            @click="$emit('close')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            {{ $t('common.close') }}
          </button>

          <span v-if="!isLoading" class="text-sm font-medium text-gray-400">
            {{ $t('aiCards.progress', { current: currentIndex + 1, total: proposals.length }) }}
          </span>
        </div>

        <!-- Progress bar -->
        <div v-if="!isLoading" class="h-1 w-full bg-gray-100">
          <div
            class="h-1 bg-[var(--color-primary)] transition-all duration-300"
            :style="{ width: `${((currentIndex + 1) / proposals.length) * 100}%` }"
          />
        </div>

        <!-- Loading / Content -->
        <Transition name="fade" mode="out-in">
          <div v-if="isLoading" key="loading" class="flex flex-1 flex-col items-center justify-center px-8">
            <img src="/cortx_writing.png" alt="" class="floating mb-10 w-52 object-contain" />
            <div class="mb-4 scale-150 transform">
              <ProgressCircle color-variant="purple" :current="loadingProgress" :total="100" :numbers-visible="false" />
            </div>
            <Transition name="fade" mode="out-in">
              <p :key="loadingMessageIndex" class="mt-6 text-center text-sm font-medium text-gray-400">
                {{ loadingMessages[loadingMessageIndex] }}
              </p>
            </Transition>
          </div>
          <!-- Content -->
          <div
            v-else
            key="proposals"
            class="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8"
          >
            <p
              class="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] opacity-70"
            >
              {{ $t('aiCards.suggestion') }}
            </p>

            <Transition :name="transitionName" mode="out-in">
              <div
                :key="currentIndex"
                class="w-full max-w-md rounded-[var(--border-radius-md)] border border-gray-100 bg-white p-8 shadow-[var(--shadow-light)]"
              >
                <!-- Question -->
                <div class="mb-6">
                  <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {{ $t('aiCards.question') }}
                  </p>
                  <p class="text-lg font-medium text-gray-900">
                    {{ currentProposal?.question }}
                  </p>
                </div>

                <!-- Divider -->
                <div class="mb-6 h-px w-full bg-gray-100" />

                <!-- Answer -->
                <div>
                  <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {{ $t('aiCards.answer') }}
                  </p>
                  <p class="text-lg font-medium text-gray-900">
                    {{ currentProposal?.answer }}
                  </p>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>

        <!-- Actions -->
        <div v-if="!isLoading" class="border-t border-gray-100 px-6 pb-10 pt-4">
          <div class="mx-auto flex max-w-md gap-3">
            <!-- Reject -->
            <button
              type="button"
              class="ai-action-button ai-action-button--reject flex-1"
              :disabled="isAccepting"
              @click="handleReject"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              {{ $t('aiCards.reject') }}
            </button>

            <!-- Accept -->
            <button
              type="button"
              class="ai-action-button ai-action-button--accept flex-1"
              :disabled="isAccepting"
              @click="handleAccept"
            >
              <template v-if="isAccepting">
                <svg class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </template>
              <template v-else>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </template>
              {{ $t('aiCards.add') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AiCardProposal } from '~/composables/useAiCards'

const props = defineProps<{
  isOpen: boolean
  isLoading?: boolean
  proposals: AiCardProposal[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'accept', proposal: AiCardProposal): Promise<void> | void
  (e: 'finished'): void
}>()

const currentIndex = ref(0)
const isAccepting = ref(false)
const transitionName = ref('slide-left')

const currentProposal = computed(() => props.proposals[currentIndex.value] ?? null)

// Loading animation
const { t } = useI18n()
const loadingProgress = ref(0)
const loadingMessageIndex = ref(0)
let progressInterval: ReturnType<typeof setInterval> | null = null
let messageInterval: ReturnType<typeof setInterval> | null = null

const loadingMessages = computed(() => [
  t('aiCards.loadingStep1'),
  t('aiCards.loadingStep2'),
  t('aiCards.loadingStep3'),
  t('aiCards.loadingStep4'),
])

function startLoadingAnimation() {
  loadingProgress.value = 0
  loadingMessageIndex.value = 0
  progressInterval = setInterval(() => {
    if (loadingProgress.value < 85) {
      loadingProgress.value += 1
    }
  }, 70)
  messageInterval = setInterval(() => {
    loadingMessageIndex.value = (loadingMessageIndex.value + 1) % 4
  }, 2000)
}

function stopLoadingAnimation() {
  if (progressInterval) clearInterval(progressInterval)
  if (messageInterval) clearInterval(messageInterval)
  progressInterval = null
  messageInterval = null
}

function advance() {
  if (currentIndex.value < props.proposals.length - 1) {
    transitionName.value = 'slide-left'
    currentIndex.value += 1
  } else {
    emit('finished')
  }
}

function handleReject() {
  advance()
}

async function handleAccept() {
  if (!currentProposal.value || isAccepting.value) return
  isAccepting.value = true
  try {
    await emit('accept', currentProposal.value)
  } finally {
    isAccepting.value = false
    advance()
  }
}

// Reset index when the modal is re-opened
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      currentIndex.value = 0
    }
  }
)

watch(
  () => props.isLoading,
  (val) => {
    if (val) {
      startLoadingAnimation()
    } else {
      stopLoadingAnimation()
    }
  }
)

onUnmounted(() => {
  stopLoadingAnimation()
})
</script>

<style scoped>
.ai-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
}

.ai-action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-action-button--reject {
  background: #f3f4f6;
  color: #374151;
}

.ai-action-button--reject:not(:disabled):active {
  background: var(--color-gray-200);
}

.ai-action-button--accept {
  background: var(--color-primary);
  color: white;
}

.ai-action-button--accept:not(:disabled):active {
  opacity: 0.85;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal enter/leave */
.ai-modal-enter-active,
.ai-modal-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.ai-modal-enter-from,
.ai-modal-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Card slide transitions */
.slide-left-enter-active,
.slide-left-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Floating animation */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.floating {
  animation: float 3s ease-in-out infinite;
}
</style>
