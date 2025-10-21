<template>
  <div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
    {{ error }}
    <button class="ml-2 underline" @click="onRetry">
      {{ $t('common.retry') }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error: string
  onRetry: () => void
}>()
</script>
