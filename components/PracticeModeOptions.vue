<template>
  <div class="practice-options">
    <div class="option-item">
      <label class="option-label">
        <input v-model="localOptions.mostFailed" type="checkbox" class="option-checkbox" />
        <span>{{ $t('practiceMode.mostFailed') }}</span>
      </label>
      <p class="option-description">{{ $t('practiceMode.mostFailedDesc') }}</p>
    </div>

    <div class="option-item">
      <label class="option-label">
        <input v-model="localOptions.onlyDue" type="checkbox" class="option-checkbox" />
        <span>{{ $t('practiceMode.onlyDue') }}</span>
      </label>
      <p class="option-description">{{ $t('practiceMode.onlyDueDesc') }}</p>
    </div>

    <div class="option-item">
      <label class="option-label">
        <input v-model="localOptions.onlyNew" type="checkbox" class="option-checkbox" />
        <span>{{ $t('practiceMode.onlyNew') }}</span>
      </label>
      <p class="option-description">{{ $t('practiceMode.onlyNewDesc') }}</p>
    </div>

    <div class="option-item">
      <label class="option-label">
        <input v-model="localOptions.excludeNew" type="checkbox" class="option-checkbox" />
        <span>{{ $t('practiceMode.excludeNew') }}</span>
      </label>
      <p class="option-description">{{ $t('practiceMode.excludeNewDesc') }}</p>
    </div>

    <div class="option-item">
      <label class="option-label">
        <input v-model="localOptions.swapQuestionAnswer" type="checkbox" class="option-checkbox" />
        <span>{{ $t('practiceMode.swapQuestionAnswer') }}</span>
      </label>
      <p class="option-description">{{ $t('practiceMode.swapQuestionAnswerDesc') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

export interface PracticeModeOptions {
  mostFailed: boolean
  onlyDue: boolean
  onlyNew: boolean
  excludeNew: boolean
  swapQuestionAnswer: boolean
}

interface Props {
  modelValue: PracticeModeOptions
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: PracticeModeOptions]
}>()

defineOptions({ name: 'PracticeModeOptions' })

const localOptions = ref<PracticeModeOptions>({ ...props.modelValue })

watch(
  localOptions,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)

watch(
  () => props.modelValue,
  (newValue) => {
    localOptions.value = { ...newValue }
  },
  { deep: true }
)
</script>

<style scoped>
.practice-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
}

.option-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  user-select: none !important;
}

.option-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.option-description {
  margin: 0;
  padding-left: 32px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}
</style>
