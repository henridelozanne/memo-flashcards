<template>
  <div v-if="open" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
      <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
      <div class="text-gray-600 mb-6">
        <slot />
      </div>
      <div class="flex gap-3">
        <button class="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition" @click="$emit('cancel')">
          {{ cancelLabel }}
        </button>
        <button :disabled="loading" class="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition" @click="$emit('confirm')">
          <slot name="confirmLabel">{{ loading ? 'En cours...' : confirmLabel }}</slot>
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
    loading: false
  }
)

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>
