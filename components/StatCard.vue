<template>
  <div class="rounded-[15px] bg-[var(--color-white)] p-4 shadow-[0px_4px_32px_#0000000a]">
    <div class="mb-1 text-sm text-[var(--color-secondary)]">{{ label }}</div>
    <div class="text-2xl font-semibold text-[var(--color-black)]">{{ value }}</div>
    <div v-if="subtitle" class="mt-1 text-xs text-[var(--color-secondary)]">{{ subtitle }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  subtitle?: string
}>()

defineOptions({ name: 'StatCard' })
</script>
