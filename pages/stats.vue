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
            <StatCard :label="$t('stats.totalCards')" :value="324" />
            <StatCard :label="$t('stats.totalCollections')" :value="18" />
            <StatCard :label="$t('stats.totalReviews')" :value="1184" />
            <StatCard :label="$t('stats.totalSessions')" :value="78" />
          </div>

          <div class="rounded-[15px] bg-[var(--color-white)] p-4 shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-3 text-sm text-[var(--color-secondary)]">{{ $t('stats.globalSuccessRate') }}</div>
            <ProgressBar :current="82" :total="100" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <StatCard :label="$t('stats.cardsCreatedThisMonth')" :value="42" />
            <StatCard :label="$t('stats.cardsReviewedToday')" :value="26" />
          </div>
        </div>

        <!-- Progression -->
        <div v-else-if="currentTab === 'progress'" key="progress" class="space-y-4">
          <div class="rounded-[15px] bg-[var(--color-white)] p-6 text-center shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-2 text-sm font-medium text-[var(--color-secondary)]">
              {{ $t('stats.cardsByCompartment') }}
            </div>
            <div class="py-8 text-[var(--color-secondary)]">{{ $t('stats.barChartComing') }}</div>
          </div>
        </div>

        <!-- Rythme de révision -->
        <div v-else-if="currentTab === 'rhythm'" key="rhythm" class="space-y-4">
          <div class="rounded-[15px] bg-[var(--color-white)] p-6 text-center shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-2 text-sm font-medium text-[var(--color-secondary)]">{{ $t('stats.currentStreak') }}</div>
            <div class="py-8 text-[var(--color-secondary)]">{{ $t('stats.streakComponentComing') }}</div>
          </div>

          <div class="rounded-[15px] bg-[var(--color-white)] p-6 text-center shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-2 text-sm font-medium text-[var(--color-secondary)]">{{ $t('stats.monthCalendar') }}</div>
            <div class="py-8 text-[var(--color-secondary)]">{{ $t('stats.calendarComing') }}</div>
          </div>

          <div class="rounded-[15px] bg-[var(--color-white)] p-4 shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-3 text-sm text-[var(--color-secondary)]">
              {{ $t('stats.daysWithReviewAllTime') }}
            </div>
            <ProgressBar :current="76" :total="100" />
          </div>

          <div class="rounded-[15px] bg-[var(--color-white)] p-4 shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-3 text-sm text-[var(--color-secondary)]">
              {{ $t('stats.daysWithReviewThisMonth') }}
            </div>
            <ProgressBar :current="88" :total="100" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <StatCard :label="$t('stats.longestStreakWith')" :value="14" :subtitle="$t('stats.days')" />
            <StatCard :label="$t('stats.longestStreakWithout')" :value="5" :subtitle="$t('stats.days')" />
          </div>
        </div>

        <!-- Habitudes -->
        <div v-else-if="currentTab === 'habits'" key="habits" class="space-y-4">
          <div class="rounded-[15px] bg-[var(--color-white)] p-6 text-center shadow-[0px_4px_32px_#0000000a]">
            <div class="mb-2 text-sm font-medium text-[var(--color-secondary)]">
              {{ $t('stats.reviewsByHour') }}
            </div>
            <div class="py-8 text-[var(--color-secondary)]">{{ $t('stats.barChart24hComing') }}</div>
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
import { ref, type ComponentPublicInstance } from 'vue'
import PageHeader from '~/components/PageHeader.vue'
import ProgressBar from '~/components/ProgressBar.vue'
import StatCard from '~/components/StatCard.vue'

defineOptions({ name: 'StatsPage' })

const currentTab = ref('activity')
const tabsContainer = ref<HTMLElement | null>(null)
const tabRefs = ref<Record<string, HTMLElement | null>>({})
const slideDirection = ref<'slide-left' | 'slide-right'>('slide-right')

const tabs = [
  { id: 'activity', label: 'stats.tabs.activity' },
  { id: 'progress', label: 'stats.tabs.progress' },
  { id: 'rhythm', label: 'stats.tabs.rhythm' },
  { id: 'habits', label: 'stats.tabs.habits' },
]

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
