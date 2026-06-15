<template>
  <div class="flex flex-col items-center">
    <!-- Mascotte posée sur la carte -->
    <img
      src="/cortx_yeah_transparent_background.png"
      alt="Cortx"
      class="brain-entrance relative z-10 w-28"
      style="margin-bottom: -3.5rem"
    />
    <div
      class="w-full max-w-md rounded-[15px] bg-[var(--color-white)] px-8 pb-8 pt-16 text-center shadow-[var(--shadow-light)]"
    >
      <div class="mb-2 text-2xl font-bold text-[var(--color-black)]">
        {{ $t('review.sessionFinished') }}
      </div>
      <div class="mb-4 text-lg text-[var(--color-secondary)]">{{ $t('review.congrats') }}</div>
      <div class="my-4 text-5xl font-bold text-[var(--color-black)]">{{ goodCount }} / {{ cardsReviewedCount }}</div>
      <div class="mb-1 text-xl font-bold text-[var(--color-black)]">
        {{ $t('review.xpLabel') }} <span class="xp-score-text">{{ displayedXp }} pts</span>
      </div>
      <div class="mb-2 text-[var(--color-secondary)]">
        {{ $t('review.successRate', { percent: successRate }) }}
      </div>

      <!-- Answered cards list -->
      <div
        v-if="answeredCards.length > 0"
        class="mt-4 w-full text-sm"
        :class="answeredCards.length >= 10 ? 'max-h-52 overflow-y-auto pr-1' : ''"
      >
        <div
          v-for="(item, index) in answeredCards"
          :key="index"
          class="mb-1 flex items-center gap-2 rounded-lg px-3 py-2"
          :class="item.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
        >
          <span class="min-w-0 flex-1 truncate text-left">{{ item.question }}</span>
          <span class="shrink-0 font-bold">→</span>
          <span class="min-w-0 flex-1 truncate text-right">{{ item.answer }}</span>
        </div>
      </div>

      <button
        class="mt-6 rounded-[15px] bg-[var(--color-primary)] px-6 py-2 text-base font-medium text-white shadow-sm transition hover:bg-[var(--color-dark-purple)]"
        @click="handleBack"
      >
        {{ returnLabel || $t('review.backToCollections') }}
      </button>
    </div>
  </div>

  <!-- Confetti canvas -->
  <canvas ref="confettiCanvas" class="confetti-canvas" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { launchConfetti } from '~/utils/confetti'
import { useRateApp } from '~/composables/useRateApp'

interface AnsweredCard {
  question: string
  answer: string
  correct: boolean
}

const props = defineProps({
  cardsReviewedCount: { type: Number, required: true },
  goodCount: { type: Number, required: true },
  successRate: { type: Number, required: true },
  xpScore: { type: Number, default: 0 },
  answeredCards: { type: Array as () => AnsweredCard[], default: () => [] },
  returnLabel: { type: String, default: '' },
})
const emit = defineEmits(['back'])

const { requestReviewIfEligible } = useRateApp()

async function handleBack() {
  await requestReviewIfEligible()
  emit('back')
}

const confettiCanvas = ref<HTMLCanvasElement | null>(null)
let cleanup: (() => void) | null = null
let animFrame: ReturnType<typeof requestAnimationFrame> | null = null

const displayedXp = ref(0)

onMounted(() => {
  if (props.successRate >= 50 && confettiCanvas.value) {
    cleanup = launchConfetti(confettiCanvas.value)
  }
  // Compteur animé sur 3.5s
  const target = props.xpScore
  if (target === 0) {
    displayedXp.value = 0
    return
  }
  const DURATION = 3500
  const startTime = performance.now()
  function step(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / DURATION, 1)
    const ease = 1 - (1 - progress) ** 3
    displayedXp.value = Math.round(target * ease)
    if (progress < 1) {
      animFrame = requestAnimationFrame(step)
    } else {
      displayedXp.value = target
      animFrame = null
    }
  }
  animFrame = requestAnimationFrame(step)
})

onUnmounted(() => {
  cleanup?.()
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<style scoped>
.xp-score-text {
  background: linear-gradient(
    180deg,
    var(--color-flame-top) 0%,
    var(--color-flame-mid) 60%,
    var(--color-flame-bottom) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brain-entrance {
  animation: brainEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes brainEntrance {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
