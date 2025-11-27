<template>
  <label class="flex cursor-pointer items-center gap-2 text-xs text-gray-500">
    <span>{{ label }}</span>
    <div
      class="relative inline-block h-4 w-8 cursor-pointer rounded-full transition"
      :class="modelValue ? 'bg-[var(--color-primary)]' : 'bg-gray-300'"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <div
        class="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white transition-transform duration-200"
        :class="modelValue ? 'translate-x-3.5' : 'translate-x-0'"
      ></div>
    </div>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
