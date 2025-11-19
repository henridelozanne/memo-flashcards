<template>
    <button
    class="relative z-10 flex w-full items-center rounded-[15px] border border-gray-100 p-4 shadow-[0px_4px_32px_#0000000a] transition hover:bg-[var(--color-gray-50)]"
    style="background-color: #ffffff"
    @click="$emit('click')"
  >
    <div class="flex flex-1 items-center gap-4">
      <div class="icon-wrapper flex h-6 w-6 flex-shrink-0 items-center justify-center text-[var(--color-primary)]">
        <slot name="icon" />
      </div>
      <span class="flex-1 text-left font-medium text-[var(--color-black)]">{{ label }}</span>
    </div>
    <div class="flex flex-shrink-0 items-center gap-2">
      <span v-if="value" class="text-sm text-gray-500">{{ value }}</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string
}>()

defineEmits<{
  click: []
}>()

defineOptions({ name: 'SettingsItem' })
</script>

<style scoped>
.icon-wrapper :deep(svg) {
  width: 24px;
  height: 24px;
}
</style>
