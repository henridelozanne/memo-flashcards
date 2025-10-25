<template>
  <div
    class="relative flex aspect-[3/4] h-72 w-full max-w-56 cursor-pointer flex-col items-center justify-center rounded-[15px] border border-gray-100 bg-white p-4 shadow-[0px_4px_32px_#0000000a] transition"
    @click="$emit('click', card.id)"
  >
    <div class="flex w-full flex-1 flex-col items-center justify-center overflow-hidden text-center">
      <!-- Front (question) -->
      <div class="mb-2 line-clamp-3 break-words text-sm font-medium leading-tight text-gray-900">
        {{ card.question }}
      </div>
      <!-- Divider -->
      <div class="my-2 h-px w-8 bg-gray-300 opacity-50"></div>
      <!-- Back (answer) -->
      <div class="line-clamp-4 break-words text-xs leading-tight text-gray-500">
        {{ card.answer }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card } from '~/lib/types'

defineProps<{
  card: Card
}>()

defineEmits<{
  click: [id: string]
}>()
</script>
