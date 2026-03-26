<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="mx-4 max-w-sm rounded-lg bg-[var(--color-white)] p-6">
      <h3 class="mb-4 text-lg font-semibold text-[var(--color-black)]">{{ title }}</h3>
      <div class="mb-6 text-[var(--color-secondary)]">
        <slot />
      </div>
      <div class="flex gap-3">
        <button
          class="flex-1 rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300 dark:bg-[var(--color-gray-200)] dark:text-[var(--color-black)] dark:hover:bg-[var(--color-gray-500)]"
          @click="$emit('cancel')"
        >
          {{ cancelLabel }}
        </button>
        <button
          :disabled="loading"
          class="flex-1 rounded-md px-4 py-2 text-white transition disabled:bg-gray-400"
          style="background-color: var(--color-danger)"
          @click="$emit('confirm')"
        >
          <slot name="confirmLabel">{{ loading ? $t('common.processing') : confirmLabel }}</slot>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
  }>(),
  {
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    loading: false,
  }
)

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>
