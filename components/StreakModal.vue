<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="streak-modal-backdrop" @click.self="$emit('close')">
        <div class="streak-modal-card">
          <!-- Close button -->
          <button class="streak-modal-close" @click="$emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- Flame icon -->
          <div class="streak-flame-wrapper">
            <!-- sparkles: 4-pointed stars -->
            <svg class="streak-sparkle streak-sparkle-tl" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0 L11.8 8.2 L20 10 L11.8 11.8 L10 20 L8.2 11.8 L0 10 L8.2 8.2 Z" fill="#fbbf24" />
            </svg>
            <svg class="streak-sparkle streak-sparkle-tr" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0 L11.8 8.2 L20 10 L11.8 11.8 L10 20 L8.2 11.8 L0 10 L8.2 8.2 Z" fill="#f97316" />
            </svg>
            <svg class="streak-sparkle streak-sparkle-br" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0 L11.8 8.2 L20 10 L11.8 11.8 L10 20 L8.2 11.8 L0 10 L8.2 8.2 Z" fill="#fde047" />
            </svg>
            <IconFlame width="72" height="105" />
          </div>

          <!-- Title -->
          <h2 class="streak-title">{{ $t('dailyReview.streakModal.title', { count: streakCount }, streakCount) }}</h2>
          <p class="streak-subtitle">{{ $t('dailyReview.streakModal.subtitle') }}</p>

          <!-- Week: day letters + progress bar -->
          <div class="streak-week">
            <div class="streak-days-row">
              <div v-for="(label, i) in weekDays" :key="i" class="streak-day-col">
                <span :class="['streak-day-letter', getDayLetterClass(i)]">{{ label }}</span>
              </div>
            </div>
            <div class="streak-progress-track">
              <div class="streak-progress-fill" :style="{ left: fillStart, width: fillWidth }"></div>
              <!-- Small dots for reviewed days outside the current streak -->
              <div
                v-for="(day, i) in weekStatus"
                v-show="day.reviewed && i < streakStartIndex"
                :key="'dot-' + i"
                class="streak-dot"
                :style="{ left: `${(((i + 0.5) / 7) * 100).toFixed(2)}%` }"
              ></div>
              <div class="streak-progress-marker" :style="{ left: markerPosition }">
                <IconFlame width="18" height="21" color="white" />
              </div>
            </div>
          </div>

          <!-- Continue button -->
          <button class="streak-continue-btn" @click="$emit('close')">
            {{ $t('common.continue') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStreakData, type WeekDayStatus } from '~/composables/useStreakData'
import IconFlame from '~/components/icons/IconFlame.vue'

const props = defineProps<{ isOpen: boolean }>()
defineEmits(['close'])

const { tm } = useI18n()
const { getCurrentWeekStatus, getStreakCount } = useStreakData()

const allWeekDayLabels = computed(() => tm('date.weekDays') as string[])
const weekStatus = ref<WeekDayStatus[]>([])
const streakCount = ref(1)
// Dynamic labels from actual dates (today always at index 6)
const weekDays = computed(() =>
  weekStatus.value.length
    ? weekStatus.value.map((s) => allWeekDayLabels.value[(s.date.getDay() + 6) % 7])
    : allWeekDayLabels.value
)

// Today is always index 6 (rightmost). Marker always at far right.
const markerPosition = '92.86%' // (6.5 / 7) * 100

// Streak start: leftmost contiguous reviewed day ending at today (index 6)
const streakStartIndex = computed(() => {
  let start = 6
  for (let i = 5; i >= 0; i -= 1) {
    if (weekStatus.value[i]?.reviewed) start = i
    else break
  }
  return start
})

// Bar covers from center of streak start to center of today (index 6)
const fillStart = computed(() => `${(((streakStartIndex.value + 0.5) / 7) * 100).toFixed(2)}%`)
const fillWidth = computed(() => `${(((6.5 - streakStartIndex.value - 0.5) / 7) * 100).toFixed(2)}%`)

function getDayLetterClass(i: number): string {
  const day = weekStatus.value[i]
  if (!day) return 'future'
  return day.reviewed ? 'reviewed' : 'missed'
}

async function load() {
  try {
    const [week, count] = await Promise.all([getCurrentWeekStatus(), getStreakCount()])
    weekStatus.value = week
    streakCount.value = count
  } catch (e) {
    console.error('[StreakModal] Failed to load streak data', e)
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) load()
  },
  { immediate: true }
)
</script>

<style scoped>
.streak-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}

.streak-modal-card {
  position: relative;
  background: var(--color-white);
  border-radius: 24px;
  padding: 40px 28px 28px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.streak-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  cursor: pointer;
}

.streak-flame-wrapper {
  position: relative;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 6px 16px rgba(249, 115, 22, 0.5));
}

.streak-sparkle {
  position: absolute;
  pointer-events: none;
}

.streak-sparkle-tl {
  width: 16px;
  height: 16px;
  top: 4px;
  left: -12px;
}

.streak-sparkle-tr {
  width: 10px;
  height: 10px;
  top: 8px;
  right: -8px;
}

.streak-sparkle-br {
  width: 12px;
  height: 12px;
  bottom: 18px;
  right: -12px;
}

.streak-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-black);
  text-align: center;
  margin-bottom: 8px;
  line-height: 1.2;
}

.streak-subtitle {
  font-size: 14px;
  color: var(--color-gray-500);
  text-align: center;
  margin-bottom: 32px;
  padding: 0 12px;
  line-height: 1.5;
}

/* Week view */
.streak-week {
  width: 100%;
  margin-bottom: 32px;
}

.streak-days-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 20px;
}

.streak-day-col {
  display: flex;
  justify-content: center;
}

.streak-day-letter {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-gray-500);
  transition: color 0.3s ease;
}

.streak-day-letter.reviewed {
  color: var(--color-black);
}

.streak-day-letter.missed,
.streak-day-letter.future {
  color: var(--color-gray-500);
}

/* Dots for reviewed days outside the streak */
.streak-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(to right, #fde047, #fb923c);
}

/* Progress bar */
.streak-progress-track {
  position: relative;
  height: 10px;
  background: var(--color-gray-200);
  border-radius: 10px;
}

.streak-progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(to right, #fde047, #fb923c);
  transition: width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.streak-progress-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--color-flame-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: var(--shadow-flame);
  transition: left 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Continue button */
.streak-continue-btn {
  width: 100%;
  padding: 18px;
  border-radius: 16px;
  background: var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: opacity 0.15s ease;
}

.streak-continue-btn:active {
  opacity: 0.85;
}

/* Modal transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
