<template>
  <div ref="selectRef" class="select-container">
    <button type="button" class="select-trigger" :class="{ 'select-trigger-open': isOpen }" @click="toggleDropdown">
      <span class="select-value">{{ selectedLabel }}</span>
      <svg
        class="select-arrow"
        :class="{ 'select-arrow-open': isOpen }"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 4L6 8L10 4"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <Transition name="select-dropdown">
      <div v-if="isOpen" class="select-dropdown">
        <button
          v-for="option in options"
          :key="option.value"
          class="select-option"
          :class="{ 'select-option-selected': modelValue === option.value }"
          type="button"
          @click="selectOption(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface SelectOption {
  label: string
  value: string
}

interface Props {
  modelValue: string
  options: SelectOption[]
}

defineOptions({ name: 'SelectInput' })

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const selectedLabel = computed(() => {
  const selectedOption = props.options.find((opt) => opt.value === props.modelValue)
  return selectedOption?.label || ''
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectOption(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.select-container {
  position: relative;
  display: inline-block;
}

.select-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: transparent;
  border: none;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  user-select: none !important;
}

.select-trigger:hover {
  color: #374151;
}

.select-trigger-open {
  color: var(--color-primary);
}

.select-value {
  white-space: nowrap;
  font-weight: 500;
}

.select-arrow {
  color: #6b7280;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.select-arrow-open {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 200px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 50;
}

.select-option {
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  color: #374151;
  background: white;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none !important;
}

.select-option:hover {
  background: #f3f4f6;
}

.select-option-selected {
  color: var(--color-primary);
  font-weight: 600;
  background: #f0f0ff;
}

.select-option-selected:hover {
  background: #e8e8ff;
}

/* Transition pour le dropdown */
.select-dropdown-enter-active,
.select-dropdown-leave-active {
  transition: all 0.2s ease;
}

.select-dropdown-enter-from,
.select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
