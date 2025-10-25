<template>
  <div class="mb-6 flex items-center" :class="$slots.actions ? 'justify-between' : ''">
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
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PageHeader' })

defineProps({
  title: { type: String, required: true },
  testId: { type: String, default: '' },
  backButtonVisible: { type: Boolean, default: false },
})

const emit = defineEmits(['back'])

function handleBackClick() {
  emit('back')
}
</script>
