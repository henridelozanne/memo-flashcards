<template>
  <div class="flex items-center justify-center py-12" data-testid="loading">
    <div
      class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600 dark:border-[var(--color-accent-purple)]"
    ></div>
    <span class="ml-2 text-gray-600 dark:text-[var(--color-secondary)]">{{ message || $t('common.loading') }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>
