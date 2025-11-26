<template>
  <div class="practice-options">
    <div class="option-item">
      <label class="option-label">
        <input
          :checked="modelValue.mostFailed"
          type="checkbox"
          class="option-checkbox"
          @change="updateOption('mostFailed', ($event.target as HTMLInputElement).checked)"
        />
        <span>{{ $t('practiceMode.mostFailed') }}</span>
      </label>
      <p class="option-description">{{ $t('practiceMode.mostFailedDesc') }}</p>
    </div>

    <div class="option-item">
      <label class="option-label">
        <input
          :checked="modelValue.onlyDue"
          type="checkbox"
          class="option-checkbox"
          @change="updateOption('onlyDue', ($event.target as HTMLInputElement).checked)"
        />
        <span>{{ $t('practiceMode.onlyDue') }}</span>
      </label>
      <p class="option-description">{{ $t('practiceMode.onlyDueDesc') }}</p>
    </div>

    <div class="option-item">
      <label class="option-label">
        <input
          :checked="modelValue.onlyNew"
          type="checkbox"
          class="option-checkbox"
          @change="updateOption('onlyNew', ($event.target as HTMLInputElement).checked)"
        />
        <span>{{ $t('practiceMode.onlyNew') }}</span>
      </label>
      <p class="option-description">{{ $t('practiceMode.onlyNewDesc') }}</p>
    </div>

    <div class="option-item">
      <label class="option-label">
        <input
          :checked="modelValue.excludeNew"
          type="checkbox"
          class="option-checkbox"
          @change="updateOption('excludeNew', ($event.target as HTMLInputElement).checked)"
        />
        <span>{{ $t('practiceMode.excludeNew') }}</span>
      </label>
      <p class="option-description">{{ $t('practiceMode.excludeNewDesc') }}</p>
    </div>

    <div class="option-item">
      <label class="option-label">
        <input
          :checked="modelValue.swapQuestionAnswer"
          type="checkbox"
          class="option-checkbox"
          @change="updateOption('swapQuestionAnswer', ($event.target as HTMLInputElement).checked)"
        />
        <span>{{ $t('practiceMode.swapQuestionAnswer') }}</span>
      </label>
      <p class="option-description">{{ $t('practiceMode.swapQuestionAnswerDesc') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
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

function updateOption(key: keyof PracticeModeOptions, value: boolean) {
  const newOptions = {
    ...props.modelValue,
    [key]: value,
  }

  // Si on coche "onlyNew", on décoche "excludeNew"
  if (key === 'onlyNew' && value === true) {
    newOptions.excludeNew = false
  }

  // Si on coche "excludeNew", on décoche "onlyNew"
  if (key === 'excludeNew' && value === true) {
    newOptions.onlyNew = false
  }

  emit('update:modelValue', newOptions)
}
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
}

.option-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-primary);
  flex-shrink: 0;
}

.option-description {
  margin: 0;
  padding-left: 32px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}
</style>
