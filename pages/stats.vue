<template>
  <div class="min-h-screen bg-gray-50 p-6 flex flex-col gap-8">
    <button class="self-start mb-4 bg-gray-200 text-gray-700 rounded px-4 py-2 text-sm hover:bg-gray-300 transition" @click="$router.push('/')">
      ← {{ $t('common.back') }}
    </button>
    <!-- Streak calendar -->
    <section>
      <h2 class="text-xl font-bold mb-2">{{ $t('stats.streakWeekTitle') }}</h2>
      <div class="flex items-center gap-3 mb-2">
        <span v-if="streakLength > 0" class="text-lg font-semibold text-blue-700">
          {{ $t('stats.currentStreak', streakLength, { count: streakLength }) }}
        </span>
      </div>
      <StreakCalendar :days="calendarDays" :streak-days="streakDaysSet" orientation="horizontal" />
    </section>



    <!-- Cartes révisées aujourd'hui -->
    <section v-if="todaySession && todaySession.cardsReviewed > 0">
      <h2 class="text-xl font-bold mb-2">{{ $t('stats.todayTitle') }}</h2>
      <div class="text-base">
        {{ $t('stats.cardsReviewedToday', todaySession.cardsReviewed) }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCollections } from '~/composables/useCollections'
import { getReviewSessions, getReviewLogs } from '~/composables/useStatsDb'

// Types
type ReviewSession = { date: string, cardsReviewed: number }
type ReviewLog = { response: string }

const { loadCollections } = useCollections()

// Données réactives
const reviewSessions = ref<ReviewSession[]>([])
const reviewLogs = ref<ReviewLog[]>([])

// Streak calendar logic (7 derniers jours)
const calendarDays = computed(() => {
  const days: string[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    days.push(d.toISOString().split('T')[0])
  }
  return days
})

const streakDaysSet = computed(() => new Set(reviewSessions.value.map((s) => s.date)))

// Calcule la longueur du streak sur les 7 derniers jours
const streakLength = computed(() => {
  // Les jours du calendrier (7 derniers jours)
  const days = calendarDays.value
  // Les jours où il y a eu une session
  const streakDays = new Set(reviewSessions.value.map((s) => s.date))
  // On compte le nombre de jours consécutifs (en partant d'aujourd'hui)
  let count = 0
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (streakDays.has(days[i])) {
      count += 1
    } else {
      break
    }
  }
  return count
})

// Cartes révisées aujourd'hui
const today = new Date().toISOString().split('T')[0]
const todaySession = computed(() => reviewSessions.value.find((s) => s.date === today))

// Charger les données
onMounted(async () => {
  await loadCollections()
  reviewSessions.value = await getReviewSessions()
  reviewLogs.value = await getReviewLogs()
})

defineOptions({ name: 'StatsPage' })
</script>
