<template>
  <div class="month-calendar">
    <!-- En-tête avec mois et année -->
    <div class="mb-4 flex items-center justify-between">
      <button class="rounded-lg p-2 hover:bg-gray-100" @click="previousMonth">
        <IconArrowLeft class="h-5 w-5" />
      </button>
      <div class="text-base font-semibold">{{ monthYearLabel }}</div>
      <button class="rounded-lg p-2 hover:bg-gray-100" @click="nextMonth">
        <IconArrowRight class="h-5 w-5" />
      </button>
    </div>

    <!-- Jours de la semaine -->
    <div class="mb-2 grid grid-cols-7 gap-1">
      <div v-for="day in weekDays" :key="day" class="text-center text-xs font-medium text-[var(--color-secondary)]">
        {{ day }}
      </div>
    </div>

    <!-- Grille du calendrier -->
    <div class="grid grid-cols-7 gap-1">
      <!-- Cases vides avant le premier jour -->
      <div v-for="i in startDayOfWeek" :key="`empty-${i}`" class="aspect-square"></div>

      <!-- Jours du mois -->
      <div
        v-for="day in daysInMonth"
        :key="`${animationKey}-${day}`"
        class="day-cell relative aspect-square rounded-lg"
        :class="getDayClass(day)"
        :style="{ animationDelay: `${(day - 1) * 15}ms` }"
      >
        <div class="flex h-full items-center justify-center">
          <span class="text-xs">{{ day }}</span>
        </div>
        <svg
          v-if="
            reviewDates.has(
              `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            )
          "
          class="absolute right-0.5 top-0.5"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" fill="#10b981" stroke="white" stroke-width="1.5" />
          <path d="M8 12l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import IconArrowLeft from '~/components/icons/IconArrowLeft.vue'
import IconArrowRight from '~/components/icons/IconArrowRight.vue'
import { useDatabase } from '~/composables/useDatabase'

defineOptions({ name: 'MonthCalendar' })

const { tm, locale } = useI18n()
const currentDate = ref(new Date())
const reviewDates = ref<Set<string>>(new Set())
const animationKey = ref(0)

const weekDays = computed(() => tm('date.weekDays') as string[])

const monthYearLabel = computed(() => {
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
  const label = currentDate.value.toLocaleDateString(locale.value, options)
  return label.charAt(0).toUpperCase() + label.slice(1)
})

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

const startDayOfWeek = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  // Convertir dimanche (0) en 7, puis décaler pour commencer à lundi
  return firstDay === 0 ? 6 : firstDay - 1
})

function getDayClass(day: number) {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const date = new Date(year, month, day)
  // Format YYYY-MM-DD sans décalage UTC
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const today = new Date()
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  const isFuture = date > today
  const hasReview = reviewDates.value.has(dateStr)

  if (isFuture) {
    return 'bg-gray-100 text-gray-400'
  }

  if (hasReview) {
    return isToday
      ? 'bg-[#10b981] text-white ring-2 ring-[var(--color-accent-purple)] ring-offset-2'
      : 'bg-[#10b981] text-white'
  }

  return isToday
    ? 'bg-gray-200 text-[var(--color-black)] ring-2 ring-[var(--color-accent-purple)] ring-offset-2'
    : 'bg-gray-200 text-[var(--color-black)]'
}

async function loadReviewDates() {
  const { getDbConnection } = useDatabase()
  const db = await getDbConnection()

  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const startOfMonth = new Date(year, month, 1).getTime()
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).getTime()

  const result = await db.all<{ review_date: string }>(
    `SELECT DISTINCT DATE(reviewed_at / 1000, 'unixepoch') as review_date 
     FROM review_logs 
     WHERE user_id = ? AND reviewed_at >= ? AND reviewed_at <= ?
     ORDER BY review_date`,
    ['default-user', startOfMonth, endOfMonth]
  )

  reviewDates.value = new Set(result.map((r) => r.review_date))
}

function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  animationKey.value += 1
  loadReviewDates()
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  animationKey.value += 1
  loadReviewDates()
}

onMounted(() => {
  loadReviewDates()
})
</script>

<style scoped>
.month-calendar {
  width: 100%;
}

.day-cell {
  animation: scaleIn 0.3s ease-out both;
}

@keyframes scaleIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
