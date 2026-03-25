<template>
  <button
    type="button"
    class="text-[var(--color-secondary)] active:text-[var(--color-black)]"
    :aria-label="$t('common.backButton')"
    @click="$emit('click')"
  >
    <IconArrowLeft />
  </button>
</template>

<script setup lang="ts">
import IconArrowLeft from '~/components/icons/IconArrowLeft.vue'

defineEmits<{
  click: []
}>()
</script>
