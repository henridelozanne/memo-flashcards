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

    <!-- Sélecteur de couleur -->
    <div class="mb-6">
      <label class="mb-3 block text-sm font-medium text-gray-700">
        {{ $t('collections.backgroundColorLabel') }}
      </label>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="color in COLLECTION_COLORS"
          :key="color"
          type="button"
          :aria-label="color"
          class="h-10 w-full rounded-[7px] transition-transform hover:scale-105"
          :style="{ background: color }"
          :class="
            localColor === color ? 'ring-2 ring-[var(--color-accent-blue)] ring-offset-2' : 'ring-1 ring-gray-200'
          "
          @click="selectColor(color)"
        />
      </div>
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

// 10 couleurs vives en dégradé + blanc en dernière position
const COLLECTION_COLORS = [
  'linear-gradient(135deg, #9333ea, #7c3aed)', // violet
  'linear-gradient(135deg, #db2777, #e11d48)', // rose
  'linear-gradient(135deg, #0284c7, #4f46e5)', // bleu-indigo
  'linear-gradient(135deg, #059669, #0d9488)', // menthe-teal
  'linear-gradient(135deg, #ea580c, #d97706)', // orange
  'linear-gradient(135deg, #be185d, #9d174d)', // rose foncé
  'linear-gradient(135deg, #92400e, #78350f)', // marron
  '#ffffff', // blanc
]

const props = withDefaults(
  defineProps<{
    name?: string
    color?: string | null
    isSubmitting?: boolean
    submitLabel?: string
  }>(),
  {
    name: '',
    color: null,
    isSubmitting: false,
    submitLabel: 'Enregistrer',
  }
)
const emit = defineEmits<{
  (e: 'submit', payload: { name: string; color: string }): void
  (e: 'cancel'): void
}>()

const localName = ref(props.name ?? '')
const localColor = ref<string>(props.color ?? '#ffffff')
const error = ref<string | null>(null)

function selectColor(color: string) {
  localColor.value = color
}

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
  emit('submit', { name: localName.value.trim(), color: localColor.value })
}
</script>
