<template>
  <div
    v-if="message"
    class="mt-4 rounded-md p-4"
    :class="message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
  >
    {{ message.text }}
  </div>
</template>

<script setup lang="ts">
interface Message {
  type: 'success' | 'error'
  text: string
}

defineProps<{
  message: Message | null
}>()
</script>
