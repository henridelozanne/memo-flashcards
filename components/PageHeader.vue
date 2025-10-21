<template>
  <div class="mb-6 flex items-center" :class="linksVisible || $slots.actions ? 'justify-between' : ''">
    <!-- Groupe gauche: bouton retour + titre -->
    <div class="flex items-center">
      <button
        v-if="backButtonVisible"
        class="mr-4 text-gray-600 hover:text-gray-800"
        :aria-label="$t('common.backButton')"
        @click="handleBackClick"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <h1 class="text-2xl font-bold" :data-testid="testId">{{ title }}</h1>
    </div>

    <div v-if="linksVisible || $slots.actions" class="flex gap-2">
      <button v-if="linksVisible" class="rounded bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
        {{ $t('common.premium') }}
      </button>
      <button v-if="linksVisible" class="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700">
        {{ $t('common.help') }}
      </button>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PageHeader' })

defineProps({
  title: { type: String, required: true },
  testId: { type: String, default: '' },
  linksVisible: { type: Boolean, default: false },
  backButtonVisible: { type: Boolean, default: false },
})

const emit = defineEmits(['back'])

function handleBackClick() {
  emit('back')
}
</script>
