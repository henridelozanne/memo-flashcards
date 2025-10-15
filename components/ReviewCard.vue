<template>
  <div class="w-full max-w-md mx-auto">
    <!-- Collection name in italics -->
    <div v-if="collectionName" class="text-center text-sm text-gray-500 italic mb-4">
      {{ collectionName }}
    </div>
    
    <div class="relative w-full aspect-[3/4] flex items-center justify-center select-none" style="perspective: 1000px;">
      <div class="flip-card w-full h-full">
        <div class="flip-card-inner w-full h-full" :class="{ 'show-back': showBack }">
          <!-- Recto -->
          <div class="flip-card-front w-full h-full bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center text-center p-6">
            <div v-if="currentCard" class="font-medium text-lg text-gray-900 break-words line-clamp-6">{{ currentCard.question }}</div>
            <div v-else class="text-gray-400 text-base">{{ $t('review.noCard') }}</div>
            <button
              v-if="currentCard"
              class="mt-8 px-6 py-2 rounded bg-gray-100 text-gray-700 text-base font-medium shadow-sm focus:outline-none"
              @click="$emit('show-back')"
            >
              {{ $t('review.showAnswer') }}
            </button>
          </div>
          <!-- Verso -->
          <div class="flip-card-back w-full h-full bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center text-center p-6 absolute top-0 left-0">
            <div v-if="currentCard" class="font-medium text-lg text-gray-900 break-words line-clamp-6 mb-4">{{ currentCard.question }}</div>
            <div v-if="currentCard" class="text-base text-gray-700 break-words line-clamp-8 mb-8">{{ currentCard.answer }}</div>
            <div v-if="currentCard" class="flex justify-between gap-2 mt-auto">
              <button
                v-for="resp in responses"
                :key="resp.value"
                class="flex-1 flex items-center justify-center gap-2 px-2 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-base font-medium shadow-sm focus:outline-none transition"
                @click="$emit('answer', resp.value)"
              >
                <span>{{ $t(resp.label) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import type { Card } from '~/lib/types'

interface Response {
  value: string
  label: string
}

interface Props {
  currentCard: Card | null
  showBack: boolean
  responses: Response[]
  collectionName: string
}

defineProps<Props>()
defineEmits<{
  'show-back': []
  'answer': [value: string]
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
.flip-card-inner.show-back {
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
