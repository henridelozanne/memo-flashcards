<template>
  <div
    class="relative flex aspect-[3/4] h-72 w-full max-w-56 cursor-pointer flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-4 shadow-[0px_4px_32px_#0000000a] transition"
    @click="$emit('click', card.id)"
  >
    <div class="flex w-full flex-1 flex-col items-center justify-center overflow-hidden text-center">
      <!-- Front (question) -->
      <div
        class="mb-2 line-clamp-3 break-words text-sm font-medium leading-tight text-gray-900"
        v-html="sanitizedQuestion"
      ></div>
      <!-- Divider -->
      <div class="my-2 h-px w-8 bg-gray-300 opacity-50"></div>
      <!-- Back (answer) -->
      <div class="line-clamp-4 break-words text-xs leading-tight text-gray-500" v-html="sanitizedAnswer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '~/lib/types'
import { sanitizeHtml } from '~/utils/sanitize'

const props = defineProps<{
  card: Card
}>()

const sanitizedQuestion = computed(() => sanitizeHtml(props.card.question))
const sanitizedAnswer = computed(() => sanitizeHtml(props.card.answer))

defineEmits<{
  click: [id: string]
}>()
</script>

<style scoped>
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
</style>
