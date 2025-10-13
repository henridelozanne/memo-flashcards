<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-6">
      <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
        {{ $t('collections.nameLabel') }} *
      </label>
      <input
        id="name"
        v-model="localName"
        type="text"
        required
        maxlength="100"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        :class="{ 'border-red-500': error }"
        :placeholder="$t('collections.namePlaceholder')"
      />
      <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    </div>
    <div class="flex gap-3">
      <button
        type="button"
        class="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
        @click="$emit('cancel')"
      >
        {{ $t('common.cancel') }}
      </button>
      <button
        type="submit"
        :disabled="isSubmitting || !isFormValid"
        class="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        data-testid="create-btn"
      >
        {{ isSubmitting ? $t('collections.submitting') : submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = withDefaults(defineProps<{
  name?: string
  isSubmitting?: boolean
  submitLabel?: string
}>(), {
  name: '',
  isSubmitting: false,
  submitLabel: 'Enregistrer'
})
const emit = defineEmits<{
  (e: 'submit', name: string): void
  (e: 'cancel'): void
}>()

const localName = ref(props.name ?? '')
const error = ref<string | null>(null)

const isFormValid = computed(() => localName.value.trim().length > 0 && !error.value)

function validateName() {
  const name = localName.value.trim()
  if (!name) {
    error.value = 'Le nom est obligatoire'
  } else if (name.length < 2) {
    error.value = 'Le nom doit contenir au moins 2 caractères'
  } else if (name.length > 100) {
    error.value = 'Le nom ne peut pas dépasser 100 caractères'
  } else {
    error.value = null
  }
}

watch(() => localName.value, validateName)

function handleSubmit() {
  validateName()
  if (!isFormValid.value) return
  emit('submit', localName.value.trim())
}
</script>
