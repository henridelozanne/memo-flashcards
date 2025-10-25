<template>
  <button
    class="text-gray-600 hover:text-gray-800"
    :aria-label="$t('common.backButton')"
    @click="$emit('click')"
  >
    <IconArrowLeft />
  </button>
</template>

<script setup lang="ts">
import IconArrowLeft from '~/components/IconArrowLeft.vue'

defineEmits<{
  click: []
}>()
</script>