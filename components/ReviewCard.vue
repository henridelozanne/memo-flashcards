<template>
  <div class="mx-auto w-full max-w-md">
    <div class="relative flex aspect-[3/4] w-full select-none items-center justify-center" style="perspective: 1000px">
      <div v-if="currentCard" class="flip-card h-full w-full">
        <div class="flip-card-inner h-full w-full" :class="{ 'back-visible': isBackVisible }">
          <!-- Recto -->
          <div
            class="flip-card-front flex h-full w-full flex-col items-center justify-center rounded-[15px] bg-white p-6 text-center shadow-[0px_4px_32px_#0000000a]"
          >
            <div class="line-clamp-6 break-words text-lg font-medium text-gray-900">
              {{ currentCard.question }}
            </div>
            <button
              class="mt-8 rounded-[15px] bg-[var(--color-light-purple)] px-6 py-2 text-base font-medium text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-accent-purple)] focus:outline-none"
              @click="$emit('show-back')"
            >
              {{ $t('review.showAnswer') }}
            </button>
          </div>
          <!-- Verso -->
          <div
            class="flip-card-back absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center rounded-[15px] bg-white p-6 text-center shadow-[0px_4px_32px_#0000000a]"
          >
            <div class="mb-4 line-clamp-6 break-words text-lg font-medium text-gray-900">
              {{ currentCard.question }}
            </div>
            <div class="line-clamp-8 mb-8 break-words text-base text-gray-700">
              {{ currentCard.answer }}
            </div>
            <div class="mt-auto flex justify-between gap-2">
              <button
                v-for="(choice, index) in userChoices"
                :key="index"
                class="flex flex-1 items-center justify-center gap-2 rounded-[15px] border border-gray-200 bg-white px-2 py-3 text-base font-medium text-gray-900 shadow-sm transition focus:outline-none"
                @click="$emit('answer', choice.value)"
              >
                <span>{{ $t(choice.label) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Message quand pas de carte -->
      <div v-else class="text-base text-gray-400">
        {{ $t('review.noCard') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card, UserChoice } from '~/lib/types'

const userChoices: UserChoice[] = [
  { value: false, label: 'review.again' },
  { value: true, label: 'review.good' },
]

defineProps<{
  currentCard: Card | null
  isBackVisible: boolean
}>()

defineEmits<{
  'show-back': []
  answer: [value: boolean]
}>()
</script>

<style scoped>
.flip-card {
  perspective: 1000px;
  width: 100%;
  height: 100%;
  position: relative;
}
.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}
.flip-card-inner.back-visible {
  transform: rotateY(-180deg);
}
.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  top: 0;
  left: 0;
}
.flip-card-front {
  z-index: 2;
}
.flip-card-back {
  transform: rotateY(-180deg);
  z-index: 3;
}
</style>
