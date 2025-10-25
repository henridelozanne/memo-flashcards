<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-6">
      <label for="name" class="mb-2 block text-sm font-medium text-gray-700">
        {{ $t('collections.nameLabel') }} *
      </label>
      <input
        id="name"
        v-model="localName"
        type="text"
        class="w-full rounded-[15px] border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-[var(--color-accent-red)]': error }"
        :placeholder="$t('collections.namePlaceholder')"
      />
      <p v-if="error" class="mt-1 text-sm text-[var(--color-accent-red)]">{{ error }}</p>
    </div>
    <div class="flex gap-3">
      <button
        type="button"
        class="flex-1 rounded-[15px] bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300"
        @click="$emit('cancel')"
      >
        {{ $t('common.cancel') }}
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="flex-1 rounded-[15px] bg-[var(--color-primary)] px-4 py-2 text-white transition hover:bg-[var(--color-dark-purple)] disabled:cursor-not-allowed disabled:bg-gray-400"
        data-testid="create-btn"
      >
        {{ isSubmitting ? $t('collections.submitting') : submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    name?: string
    isSubmitting?: boolean
    submitLabel?: string
  }>(),
  {
    name: '',
    isSubmitting: false,
    submitLabel: 'Enregistrer',
  }
)
const emit = defineEmits<{
  (e: 'submit', name: string): void
  (e: 'cancel'): void
}>()

const localName = ref(props.name ?? '')
const error = ref<string | null>(null)

function validateName() {
  const name = localName.value.trim()
  if (name.length === 0) {
    error.value = t('form.nameRequired') as string
  } else {
    error.value = null
  }
}

function handleSubmit() {
  validateName()
  if (error.value) return
  emit('submit', localName.value.trim())
}
</script>
