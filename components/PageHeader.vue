<template>
  <div class="relative mb-6 flex h-8 items-center">
    <BackButton v-if="backButtonVisible" class="absolute left-0" @click="handleBackClick" />

    <h1
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-2xl font-bold"
      :data-testid="testId"
    >
      {{ title }}
    </h1>
  </div>
</template>

<script setup lang="ts">
import BackButton from '~/components/BackButton.vue'

defineOptions({ name: 'PageHeader' })

defineProps({
  title: { type: String, required: true },
  testId: { type: String, default: '' },
  backButtonVisible: { type: Boolean, default: false },
})

const emit = defineEmits(['back'])

function handleBackClick() {
  emit('back')
}
</script>
