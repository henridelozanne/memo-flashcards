<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-6">
      <label for="front" class="block text-sm font-medium text-gray-700 mb-2">
        {{ $t('cards.front') }} *
      </label>
      <input
        id="front"
        v-model="localFront"
        type="text"
        required
        maxlength="500"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        :class="{ 'border-red-500': frontError }"
        :placeholder="$t('cards.frontPlaceholder')"
      />
      <p v-if="frontError" class="mt-1 text-sm text-red-600">{{ frontError }}</p>
      <p class="mt-1 text-sm text-gray-500">{{ localFront.length }}/500 caractères</p>
    </div>

    <div class="mb-6">
      <label for="back" class="block text-sm font-medium text-gray-700 mb-2">
        {{ $t('cards.back') }} *
      </label>
      <textarea
        id="back"
        v-model="localBack"
        required
        maxlength="2000"
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        :class="{ 'border-red-500': backError }"
        :placeholder="$t('cards.backPlaceholder')"
      ></textarea>
      <p v-if="backError" class="mt-1 text-sm text-red-600">{{ backError }}</p>
      <p class="mt-1 text-sm text-gray-500">{{ localBack.length }}/2000 caractères</p>
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
        v-if="showAddAnother"
        type="button"
        :disabled="isSubmitting || !isFormValid"
        class="flex-1 px-4 py-2 text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
        @click="handleAddAnother"
      >
        {{ isSubmitting ? $t('common.loading') : $t('cards.addAnother') }}
      </button>
      <button
        type="submit"
        :disabled="isSubmitting || !isFormValid"
        class="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {{ isSubmitting ? $t('common.loading') : submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  front?: string
  back?: string
  isSubmitting?: boolean
  submitLabel?: string
  showAddAnother?: boolean
}>(), {
  front: '',
  back: '',
  isSubmitting: false,
  submitLabel: 'Ajouter',
  showAddAnother: false
})

const emit = defineEmits<{
  (e: 'submit', front: string, back: string): void
  (e: 'addAnother', front: string, back: string): void
  (e: 'cancel'): void
}>()

const localFront = ref(props.front ?? '')
const localBack = ref(props.back ?? '')
const frontError = ref<string | null>(null)
const backError = ref<string | null>(null)

// Expose a reset method for parent to call
defineExpose({
  reset: () => {
    localFront.value = ''
    localBack.value = ''
    frontError.value = null
    backError.value = null
  }
})

const isFormValid = computed(() => 
  localFront.value.trim().length > 0 && 
  localBack.value.trim().length > 0 && 
  !frontError.value && 
  !backError.value
)

function validateFront() {
  const front = localFront.value.trim()
  // Skip validation if field is empty and this is initial state
  if (!front && localFront.value === '') {
    frontError.value = null
    return
  }
  if (!front) {
    frontError.value = 'Le recto est obligatoire'
  } else if (front.length < 2) {
    frontError.value = 'Le recto doit contenir au moins 2 caractères'
  } else if (front.length > 500) {
    frontError.value = 'Le recto ne peut pas dépasser 500 caractères'
  } else {
    frontError.value = null
  }
}

function validateBack() {
  const back = localBack.value.trim()
  // Skip validation if field is empty and this is initial state
  if (!back && localBack.value === '') {
    backError.value = null
    return
  }
  if (!back) {
    backError.value = 'Le verso est obligatoire'
  } else if (back.length < 2) {
    backError.value = 'Le verso doit contenir au moins 2 caractères'
  } else if (back.length > 2000) {
    backError.value = 'Le verso ne peut pas dépasser 2000 caractères'
  } else {
    backError.value = null
  }
}

watch(() => localFront.value, validateFront)
watch(() => localBack.value, validateBack)

function handleSubmit() {
  validateFront()
  validateBack()
  if (!isFormValid.value) return
  emit('submit', localFront.value.trim(), localBack.value.trim())
}

function handleAddAnother() {
  validateFront()
  validateBack()
  if (!isFormValid.value) return
  emit('addAnother', localFront.value.trim(), localBack.value.trim())
}

// Reset form when props change (for edit mode)
watch(() => [props.front, props.back], () => {
  localFront.value = props.front ?? ''
  localBack.value = props.back ?? ''
}, { immediate: true })
</script>