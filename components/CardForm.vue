<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-6">
      <div class="mb-2 flex items-center justify-between">
        <label for="front" class="text-sm font-medium text-gray-700"> {{ $t('cards.front') }} * </label>
        <RichTextToggle v-model="isRichTextFront" :label="$t('cards.richTextMode')" />
      </div>
      <TipTapEditor
        v-if="isRichTextFront"
        v-model="localFront"
        :placeholder="$t('cards.frontPlaceholder')"
        data-testid="front-input"
      />
      <input
        v-else
        id="front"
        v-model="localFront"
        type="text"
        :placeholder="$t('cards.frontPlaceholder')"
        class="w-full rounded-[15px] border border-gray-300 px-4 py-2 focus:border-[var(--color-primary)] focus:outline-none"
        data-testid="front-input"
      />
      <p v-if="frontError" class="mt-1 text-sm text-[var(--color-accent-red)]">
        {{ frontError }}
      </p>
    </div>

    <div class="mb-6">
      <div class="mb-2 flex items-center justify-between">
        <label for="back" class="text-sm font-medium text-gray-700"> {{ $t('cards.back') }} * </label>
        <RichTextToggle v-model="isRichTextBack" :label="$t('cards.richTextMode')" />
      </div>
      <TipTapEditor
        v-if="isRichTextBack"
        v-model="localBack"
        :placeholder="$t('cards.backPlaceholder')"
        data-testid="back-input"
      />
      <textarea
        v-else
        id="back"
        v-model="localBack"
        :placeholder="$t('cards.backPlaceholder')"
        rows="4"
        class="w-full rounded-[15px] border border-gray-300 px-4 py-2 focus:border-[var(--color-primary)] focus:outline-none"
        data-testid="back-input"
      ></textarea>
      <p v-if="backError" class="mt-1 text-sm text-[var(--color-accent-red)]">{{ backError }}</p>
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
        data-testid="add-card-submit"
      >
        {{ isSubmitting ? $t('common.loading') : submitLabel || $t('common.add') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TipTapEditor from '~/components/TipTapEditor.vue'
import RichTextToggle from '~/components/RichTextToggle.vue'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    front?: string
    back?: string
    isSubmitting?: boolean
    submitLabel?: string
  }>(),
  {
    front: '',
    back: '',
    isSubmitting: false,
    submitLabel: '',
  }
)

const emit = defineEmits<{
  (e: 'submit', front: string, back: string): void
  (e: 'cancel'): void
}>()

const localFront = ref(props.front ?? '')
const localBack = ref(props.back ?? '')
const frontError = ref<string | null>(null)
const backError = ref<string | null>(null)
const isRichTextFront = ref(false)
const isRichTextBack = ref(false)

// Expose a reset method for parent to call
defineExpose({
  reset: () => {
    localFront.value = ''
    localBack.value = ''
    frontError.value = null
    backError.value = null
  },
})

function validateFront() {
  const front = localFront.value.trim()
  if (front.length === 0) {
    frontError.value = t('form.frontRequired') as string
  } else {
    frontError.value = null
  }
}

function validateBack() {
  const back = localBack.value.trim()
  if (back.length === 0) {
    backError.value = t('form.backRequired') as string
  } else {
    backError.value = null
  }
}

function handleSubmit() {
  validateFront()
  validateBack()
  if (frontError.value || backError.value) return
  emit('submit', localFront.value.trim(), localBack.value.trim())
}

// Reset form when props change (for edit mode)
watch(
  () => [props.front, props.back],
  () => {
    localFront.value = props.front ?? ''
    localBack.value = props.back ?? ''
    frontError.value = null
    backError.value = null
  },
  { immediate: true }
)
</script>
