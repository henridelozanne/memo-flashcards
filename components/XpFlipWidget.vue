<template>
  <div class="flip-widget" :class="{ flipped: showXp }" @click="onTap">
    <div class="flip-widget-inner">
      <!-- Recto : progress circle -->
      <div class="flip-widget-front">
        <ProgressCircle :current="current" :total="total" :is-from-page-header="true" color-variant="purple" />
      </div>
      <!-- Verso : score XP -->
      <div class="flip-widget-back">
        <div class="relative flex h-16 w-16 items-center justify-center">
          <svg class="h-full w-full" viewBox="0 0 40 40">
            <path
              d="M20 5 a 15 15 0 1 1 0 30 a 15 15 0 1 1 0 -30"
              fill="none"
              class="stroke-amber-200"
              stroke-width="3"
            />
          </svg>
          <div class="absolute inset-1 flex items-center justify-center overflow-hidden">
            <span class="xp-counter text-[12px] font-bold text-amber-500">{{ displayedXp }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import ProgressCircle from '~/components/ProgressCircle.vue'

defineOptions({ name: 'XpFlipWidget' })

const props = defineProps<{
  current: number
  total: number
  xp: number
}>()

// --- Compteur animé ---
const ANIM_DURATION = 1200 // ms, durée fixe quelle que soit l'amplitude
const FLIP_DELAY = 500 // ms, attend la fin du flip avant d'animer
const displayedXp = ref(props.xp)
let animFrame: ReturnType<typeof requestAnimationFrame> | null = null

function animateTo(target: number) {
  if (animFrame) cancelAnimationFrame(animFrame)
  const start = displayedXp.value
  const diff = target - start
  if (diff === 0) return
  const startTime = performance.now()
  function step(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / ANIM_DURATION, 1)
    // easeOutCubic
    const ease = 1 - (1 - progress) ** 3
    displayedXp.value = Math.round(start + diff * ease)
    if (progress < 1) {
      animFrame = requestAnimationFrame(step)
    } else {
      displayedXp.value = target
      animFrame = null
    }
  }
  animFrame = requestAnimationFrame(step)
}

const showXp = ref(false)
let flipBackTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.xp,
  (newVal) => {
    setTimeout(() => animateTo(newVal), FLIP_DELAY)
    // Auto-flip pour montrer le score mis à jour
    showXp.value = true
  }
)
// --- Fin compteur animé ---

function flipBack() {
  if (flipBackTimer) clearTimeout(flipBackTimer)
  flipBackTimer = null
  showXp.value = false
}

function onTap() {
  if (showXp.value) return
  showXp.value = true
  if (flipBackTimer) clearTimeout(flipBackTimer)
  flipBackTimer = setTimeout(() => {
    showXp.value = false
    flipBackTimer = null
  }, 3000)
}

onUnmounted(() => {
  if (flipBackTimer) clearTimeout(flipBackTimer)
  if (animFrame) cancelAnimationFrame(animFrame)
})

defineExpose({ flipBack })
</script>

<style scoped>
.flip-widget {
  width: 4rem;
  height: 4rem;
  perspective: 600px;
  cursor: pointer;
}
.flip-widget-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.flip-widget.flipped .flip-widget-inner {
  transform: rotateY(180deg);
}
.flip-widget-front,
.flip-widget-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.flip-widget-back {
  transform: rotateY(180deg);
}
</style>
