<template>
  <div class="w-full max-w-md mx-auto">
    <!-- Collection name in italics -->
    <div v-if="collectionName" class="text-center text-sm text-gray-500 italic mb-4">
      {{ collectionName }}
    </div>
    
    <div class="relative w-full aspect-[3/4] flex items-center justify-center select-none" style="perspective: 1000px;">
      <div v-if="currentCard" class="flip-card w-full h-full">
        <div class="flip-card-inner w-full h-full" :class="{ 'back-visible': isBackVisible }">
          <!-- Recto -->
          <div class="flip-card-front w-full h-full bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center text-center p-6">
            <div class="font-medium text-lg text-gray-900 break-words line-clamp-6">{{ currentCard.question }}</div>
            <button
              class="mt-8 px-6 py-2 rounded bg-gray-100 text-gray-700 text-base font-medium shadow-sm focus:outline-none"
              @click="$emit('show-back')"
            >
              {{ $t('review.showAnswer') }}
            </button>
          </div>
          <!-- Verso -->
          <div class="flip-card-back w-full h-full bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center text-center p-6 absolute top-0 left-0">
            <div class="font-medium text-lg text-gray-900 break-words line-clamp-6 mb-4">{{ currentCard.question }}</div>
            <div class="text-base text-gray-700 break-words line-clamp-8 mb-8">{{ currentCard.answer }}</div>
            <div class="flex justify-between gap-2 mt-auto">
              <button
                v-for="choice in userChoices"
                :key="choice.value"
                class="flex-1 flex items-center justify-center gap-2 px-2 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-base font-medium shadow-sm focus:outline-none transition"
                @click="$emit('answer', choice.value)"
              >
                <span>{{ $t(choice.label) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Message quand pas de carte -->
      <div v-else class="text-gray-400 text-base">{{ $t('review.noCard') }}</div>
    </div>
  </div>
</template>


<script setup lang="ts">
import type { Card, UserChoice, ReviewChoice } from '~/lib/types'

const userChoices: UserChoice[] = [
  { value: 'false', label: 'review.again' },
  { value: 'almost', label: 'review.almost' },
  { value: 'true', label: 'review.good' },
]

defineProps<{
  currentCard: Card | null
  isBackVisible: boolean
  collectionName: string
}>()

defineEmits<{
  'show-back': []
  'answer': [value: ReviewChoice]
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
.flip-card-front, .flip-card-back {
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
