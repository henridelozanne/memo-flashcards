<template>
  <button :type="type" :disabled="disabled" :class="buttonClasses" @click="$emit('click', $event)">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  rounded?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  rounded: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const classes = ['transition']

  // Variants
  if (props.variant === 'primary') {
    classes.push(
      'bg-[var(--color-primary)]',
      'text-[var(--color-white)]',
      'hover:opacity-90',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    )
  } else if (props.variant === 'secondary') {
    classes.push(
      'bg-[var(--color-white)]',
      'text-[var(--color-primary)]',
      'border',
      'border-[var(--color-primary)]',
      'hover:bg-[var(--color-light-purple)]',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    )
  } else if (props.variant === 'icon') {
    classes.push('rounded-full', 'p-2', 'hover:bg-[var(--color-gray-200)]')
  } else if (props.variant === 'ghost') {
    classes.push('hover:bg-[var(--color-gray-200)]', 'text-[var(--color-black)]')
  }

  // Sizes (not applied to icon variant)
  if (props.variant !== 'icon') {
    if (props.size === 'sm') {
      classes.push('px-3', 'py-1.5', 'text-sm')
    } else if (props.size === 'md') {
      classes.push('px-4', 'py-2', 'text-base')
    } else if (props.size === 'lg') {
      classes.push('px-6', 'py-3', 'text-lg')
    }
  }

  // Rounded
  if (props.rounded && props.variant !== 'icon') {
    classes.push('rounded-full')
  } else if (props.variant !== 'icon') {
    classes.push('rounded-lg')
  }

  return classes
})

defineOptions({ name: 'BaseButton' })
</script>
