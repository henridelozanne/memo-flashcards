<template>
  <div class="flex flex-col items-center">
    <img src="/cortx_yeah_transparent_background.png" alt="Cortx" class="brain-entrance mb-4 w-40" />
    <div class="w-full max-w-md rounded-[15px] bg-white p-8 text-center shadow-[0px_4px_32px_#0000000a]">
      <div class="mb-2 text-2xl font-bold">
        {{ $t('review.sessionFinished') }}
      </div>
      <div class="mb-4 text-lg text-gray-700">{{ $t('review.congrats') }}</div>
      <div class="my-4 text-5xl font-bold text-black">{{ goodCount }} / {{ cardsReviewedCount }}</div>
      <div class="mb-2 text-gray-500">
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
        @click="$emit('back')"
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

interface AnsweredCard {
  question: string
  answer: string
  correct: boolean
}

const props = defineProps({
  cardsReviewedCount: { type: Number, required: true },
  goodCount: { type: Number, required: true },
  successRate: { type: Number, required: true },
  answeredCards: { type: Array as () => AnsweredCard[], default: () => [] },
  returnLabel: { type: String, default: '' },
})
defineEmits(['back'])

const confettiCanvas = ref<HTMLCanvasElement | null>(null)
let cleanup: (() => void) | null = null

onMounted(() => {
  if (props.successRate >= 50 && confettiCanvas.value) {
    cleanup = launchConfetti(confettiCanvas.value)
  }
})

onUnmounted(() => {
  cleanup?.()
})
</script>

<style scoped>
.brain-entrance {
  animation: brainEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.confetti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
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
