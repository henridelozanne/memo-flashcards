<template>
  <div class="h-full p-6">
    <PageHeader :title="$t('stats.title')" :back-button-visible="true" @back="$router.back()" />

    <!-- Tabs -->
    <div ref="tabsContainer" class="mb-6 flex gap-2 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :ref="(el) => setTabRef(tab.id, el)"
        class="whitespace-nowrap rounded-[15px] px-4 py-2 text-sm font-medium transition"
        :class="
          currentTab === tab.id
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-[var(--color-white)] text-[var(--color-secondary)]'
        "
        @click="selectTab(tab.id)"
      >
        {{ $t(tab.label) }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="relative">
      <Transition :name="slideDirection" mode="out-in">
        <!-- Activité générale -->
        <div v-if="currentTab === 'activity'" key="activity" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <StatCard :label="$t('stats.totalCards')" :value="totalCards" />
            <StatCard :label="$t('stats.totalCollections')" :value="totalCollections" />
            <StatCard :label="$t('stats.totalReviews')" :value="totalReviews" />
            <StatCard :label="$t('stats.totalSessions')" :value="totalSessions" />
          </div>

          <div class="rounded-[15px] bg-[var(--color-white)] p-4 shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-4 text-sm text-[var(--color-secondary)]">{{ $t('stats.globalSuccessRate') }}</div>
            <ProgressBar :current="globalSuccessRate" :total="100" :full-width="true" :show-tooltip="true" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <StatCard :label="$t('stats.cardsCreatedToday')" :value="cardsCreatedToday" />
            <StatCard :label="$t('stats.cardsReviewedToday')" :value="cardsReviewedToday" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <StatCard :label="$t('stats.cardsCreatedThisMonth')" :value="cardsCreatedThisMonth" />
            <StatCard :label="$t('stats.cardsReviewedThisMonth')" :value="cardsReviewedThisMonth" />
          </div>
        </div>

        <!-- Progression -->
        <div v-else-if="currentTab === 'progress'" key="progress" class="space-y-4">
          <div class="rounded-[15px] bg-[var(--color-white)] p-6 shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-4 text-sm font-medium text-[var(--color-secondary)]">
              {{ $t('stats.cardsByCompartment') }}
            </div>
            <CompartmentBarChart :compartment-data="compartmentData" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-[15px] bg-[var(--color-white)] p-4 shadow-[0px_4px_32px_#0000000a]">
              <div class="mb-3 text-sm text-[var(--color-secondary)]">{{ $t('stats.globalCoverage') }}</div>
              <div class="flex justify-center">
                <ProgressCircle
                  :current="globalCoverageRate"
                  :total="100"
                  :show-percentage="true"
                  color-variant="purple"
                />
              </div>
              <div class="mt-3 text-center text-xs text-[var(--color-secondary)]">
                {{ $t('stats.globalCoverageTooltip', { percentage: globalCoverageRate }) }}
              </div>
            </div>
            <StatCard :label="$t('stats.overdueCards')" :value="overdueCards" />
          </div>
        </div>

        <!-- Rythme de révision -->
        <div v-else-if="currentTab === 'rhythm'" key="rhythm" class="space-y-4">
          <div class="rounded-[15px] bg-[var(--color-white)] p-6 shadow-[0px_4px_32px_#0000000a]">
            <MonthCalendar />
          </div>

          <div class="rounded-[15px] bg-[var(--color-white)] p-4 shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-3 text-sm text-[var(--color-secondary)]">
              {{ $t('stats.daysWithReviewAllTime') }}
            </div>
            <ProgressBar :current="daysWithReviewAllTime" :total="100" :full-width="true" :show-tooltip="true" />
          </div>

          <div class="rounded-[15px] bg-[var(--color-white)] p-4 shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-3 text-sm text-[var(--color-secondary)]">
              {{ $t('stats.daysWithReviewThisMonth') }}
            </div>
            <ProgressBar :current="daysWithReviewThisMonth" :total="100" :full-width="true" :show-tooltip="true" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <StatCard
              :label="$t('stats.longestStreakWith')"
              :value="longestStreakWith"
              :subtitle="longestStreakWith <= 1 ? $t('stats.day') : $t('stats.days')"
            />
            <StatCard
              :label="$t('stats.longestStreakWithout')"
              :value="longestStreakWithout"
              :subtitle="longestStreakWithout <= 1 ? $t('stats.day') : $t('stats.days')"
            />
          </div>
        </div>

        <!-- Habitudes -->
        <div v-else-if="currentTab === 'habits'" key="habits" class="space-y-4">
          <div class="rounded-[15px] bg-[var(--color-white)] p-6 shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-4 text-sm font-medium text-[var(--color-secondary)]">
              {{ $t('stats.reviewsByHour') }}
            </div>
            <HourlyReviewChart :hourly-data="hourlyReviewData" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <StatCard :label="$t('stats.avgTimePerReview')" :value="'47s'" />
            <StatCard :label="$t('stats.totalTimeInReview')" :value="'2h36'" />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type ComponentPublicInstance, onMounted } from 'vue'
import PageHeader from '~/components/PageHeader.vue'
import ProgressBar from '~/components/ProgressBar.vue'
import ProgressCircle from '~/components/ProgressCircle.vue'
import StatCard from '~/components/StatCard.vue'
import CompartmentBarChart from '~/components/CompartmentBarChart.vue'
import HourlyReviewChart from '~/components/HourlyReviewChart.vue'
import MonthCalendar from '~/components/MonthCalendar.vue'
import { useStatistics } from '~/composables/useStatistics'

defineOptions({ name: 'StatsPage' })

const currentTab = ref('activity')
const tabsContainer = ref<HTMLElement | null>(null)
const tabRefs = ref<Record<string, HTMLElement | null>>({})
const slideDirection = ref<'slide-left' | 'slide-right'>('slide-right')

// Stats data
const {
  totalCards,
  totalCollections,
  totalReviews,
  totalSessions,
  globalSuccessRate,
  cardsCreatedThisMonth,
  cardsReviewedThisMonth,
  cardsCreatedToday,
  cardsReviewedToday,
  compartmentData,
  globalCoverageRate,
  overdueCards,
  daysWithReviewAllTime,
  daysWithReviewThisMonth,
  longestStreakWith,
  longestStreakWithout,
  hourlyReviewData,
  loadStatistics,
} = useStatistics()

const tabs = [
  { id: 'activity', label: 'stats.tabs.activity' },
  { id: 'progress', label: 'stats.tabs.progress' },
  { id: 'rhythm', label: 'stats.tabs.rhythm' },
  { id: 'habits', label: 'stats.tabs.habits' },
]

onMounted(async () => {
  await loadStatistics()
})

function setTabRef(tabId: string, el: Element | ComponentPublicInstance | null) {
  if (el) {
    tabRefs.value[tabId] = el as HTMLElement
  }
}

function selectTab(tabId: string) {
  // Determine slide direction based on tab position
  const currentIndex = tabs.findIndex((t) => t.id === currentTab.value)
  const newIndex = tabs.findIndex((t) => t.id === tabId)

  slideDirection.value = newIndex > currentIndex ? 'slide-left' : 'slide-right'

  currentTab.value = tabId

  // Scroll to make the selected tab visible
  const tabElement = tabRefs.value[tabId]
  if (tabElement && tabsContainer.value && typeof tabElement.scrollIntoView === 'function') {
    tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}
</script>

<style scoped>
/* Slide left animation (going to next tab) */
.slide-left-enter-active {
  transition: all 0.3s ease;
}

.slide-left-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Slide right animation (going to previous tab) */
.slide-right-enter-active {
  transition: all 0.3s ease;
}

.slide-right-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
