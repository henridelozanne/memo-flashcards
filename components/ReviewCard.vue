<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="mx-auto w-full max-w-md">
    <div
      class="relative flex w-full select-none items-center justify-center"
      style="perspective: 1000px; aspect-ratio: 3/4; max-height: calc(100svh - 160px)"
      @touchstart="onDragStart"
      @touchmove="onDragMove"
      @touchend="onDragEnd"
      @mousedown="onDragStart"
    >
      <div v-if="currentCard" class="flip-card h-full w-full" :style="dragCardStyle">
        <div class="flip-card-inner h-full w-full" :class="{ 'back-visible': isBackVisible }">
          <!-- Recto -->
          <div
            class="flip-card-front flex h-full w-full flex-col overflow-hidden rounded-[15px] bg-white p-8 text-center shadow-[0px_4px_32px_#0000000a]"
          >
            <div class="flex flex-1 flex-col items-center justify-center overflow-y-auto">
              <div
                class="break-words font-medium text-gray-900"
                :class="questionFontSize"
                v-html="sanitizedQuestion"
              ></div>
            </div>
            <div class="mt-6 flex justify-center">
              <button
                :key="currentCard?.id"
                ref="showBackBtn"
                class="rounded-[15px] bg-[var(--color-light-purple)] px-6 py-3 text-base font-medium text-[var(--color-primary)] shadow-sm transition focus:outline-none active:bg-[var(--color-accent-purple)]"
                @click="handleShowBack"
              >
                {{ $t('review.showAnswer') }}
              </button>
            </div>
          </div>
          <!-- Verso -->
          <div
            class="flip-card-back absolute left-0 top-0 flex h-full w-full flex-col overflow-hidden rounded-[15px] bg-white p-8 text-center shadow-[0px_4px_32px_#0000000a]"
          >
            <div class="flex flex-1 flex-col items-center justify-center gap-10 overflow-y-auto">
              <div
                class="break-words font-medium text-gray-900"
                :class="questionFontSizeBack"
                v-html="sanitizedQuestion"
              ></div>
              <div class="break-words text-gray-700" :class="answerFontSize" v-html="sanitizedAnswer"></div>
            </div>
            <div class="mt-6 flex justify-between gap-2">
              <button
                v-for="(choice, index) in userChoices"
                :key="index"
                class="flex flex-1 items-center justify-center gap-2 rounded-[15px] border bg-white px-2 py-3 text-base font-medium text-gray-900 shadow-sm focus:outline-none"
                :style="getButtonStyle(choice)"
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
import { ref, computed, onUnmounted } from 'vue'
import type { Card, UserChoice } from '~/lib/types'
import { sanitizeHtml } from '~/utils/sanitize'

const userChoices: UserChoice[] = [
  { value: false, label: 'review.again' },
  { value: true, label: 'review.good' },
]

const emit = defineEmits<{
  'show-back': []
  answer: [value: boolean]
}>()

const showBackBtn = ref<HTMLButtonElement | null>(null)

const props = defineProps<{
  currentCard: Card | null
  isBackVisible: boolean
}>()

// --- Swipe logic ---
const SWIPE_THRESHOLD = 80
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const dragOffset = ref(0)

const dragCardStyle = computed(() => {
  if (dragOffset.value === 0) return {}
  const rotation = dragOffset.value * 0.04
  return {
    transform: `translateX(${dragOffset.value}px) rotate(${rotation}deg)`,
    transition: isDragging.value ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  }
})

function getButtonStyle(choice: UserChoice): Record<string, string> {
  const progress = Math.min(Math.abs(dragOffset.value) / SWIPE_THRESHOLD, 1)
  const isLeft = dragOffset.value < 0 // swiping left activates "again" (value=false)
  const isRight = dragOffset.value > 0 // swiping right activates "good" (value=true)

  if (isLeft && choice.value === false) {
    // "again" button is active
    return {
      borderColor: 'var(--color-accent-red)',
      borderWidth: `${1 + progress * 2}px`,
    }
  }
  if (isLeft && choice.value === true) {
    // "good" button fades
    return { opacity: `${1 - progress}` }
  }
  if (isRight && choice.value === true) {
    // "good" button is active
    return {
      borderColor: 'var(--color-accent-green)',
      borderWidth: `${1 + progress * 2}px`,
    }
  }
  if (isRight && choice.value === false) {
    // "again" button fades
    return { opacity: `${1 - progress}` }
  }
  return { borderColor: 'var(--color-gray-200)', borderWidth: '1px' }
}

function getClientXY(e: Event): { x: number; y: number } {
  if ('touches' in e) {
    const t = (e as TouchEvent).touches[0]
    return { x: t.clientX, y: t.clientY }
  }
  return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
}

function onDragMove(e: Event) {
  if (!isDragging.value) return
  const { x, y } = getClientXY(e)
  const dx = x - startX.value
  const dy = y - startY.value
  // Only track horizontal swipes; let vertical movement scroll normally
  if (Math.abs(dy) > Math.abs(dx)) return
  e.preventDefault()
  dragOffset.value = dx
}

function onDragEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
  if (Math.abs(dragOffset.value) >= SWIPE_THRESHOLD) {
    emit('answer', dragOffset.value > 0)
    // Leave dragOffset as-is; card fades out in displaced position via parent transition
  } else {
    dragOffset.value = 0
  }
}

function onDragStart(e: TouchEvent | MouseEvent) {
  if (!props.isBackVisible) return
  isDragging.value = true
  const { x, y } = getClientXY(e)
  startX.value = x
  startY.value = y
  if (!('touches' in e)) {
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)
  }
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
})
// --- End swipe logic ---

function handleShowBack() {
  showBackBtn.value?.blur()
  emit('show-back')
}

const sanitizedQuestion = computed(() => (props.currentCard ? sanitizeHtml(props.currentCard.question) : ''))

const sanitizedAnswer = computed(() => (props.currentCard ? sanitizeHtml(props.currentCard.answer) : ''))

// Fonction pour obtenir la taille de police adaptative basée sur la longueur du texte
const getFontSizeClass = (text: string, isSmaller = false) => {
  // Supprime les balises HTML pour compter le vrai texte
  const strippedText = text.replace(/<[^>]*>/g, '').trim()
  const { length } = strippedText

  if (isSmaller) {
    // Pour la réponse ou la question sur le verso (plus petit)
    if (length < 30) return 'text-2xl leading-relaxed'
    if (length < 80) return 'text-xl leading-relaxed'
    if (length < 200) return 'text-lg leading-normal'
    if (length < 400) return 'text-base leading-normal'
    return 'text-sm leading-normal'
  }

  // Pour la question sur le recto (plus grand)
  if (length < 30) return 'text-4xl leading-relaxed'
  if (length < 80) return 'text-3xl leading-relaxed'
  if (length < 200) return 'text-2xl leading-normal'
  if (length < 400) return 'text-xl leading-normal'
  return 'text-lg leading-normal'
}

// Tailles de police adaptatives pour chaque élément
const questionFontSize = computed(() => (props.currentCard ? getFontSizeClass(props.currentCard.question, false) : ''))

const questionFontSizeBack = computed(() =>
  props.currentCard ? getFontSizeClass(props.currentCard.question, true) : ''
)

const answerFontSize = computed(() => (props.currentCard ? getFontSizeClass(props.currentCard.answer, true) : ''))
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

:deep(ul) {
  list-style-type: disc;
  padding-left: 1.5em;
  margin: 0.5em 0;
}

:deep(ol) {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin: 0.5em 0;
}

:deep(li) {
  margin: 0.25em 0;
}

:deep(h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 1em 0 0.5em;
}

:deep(h3) {
  font-size: 1.25em;
  font-weight: bold;
  margin: 0.8em 0 0.4em;
}

:deep(img) {
  max-width: 100%;
  max-height: 40vh;
  object-fit: contain;
  border-radius: 8px;
  display: block;
  margin: 0 auto;
}
</style>
