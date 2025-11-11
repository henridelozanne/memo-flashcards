<template>
  <div class="progress-bar-container">
    <div class="progress-bar-background">
      <div class="progress-bar-fill" :style="{ width: `${progressPercentage}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
})

const progressPercentage = computed(() => {
  if (props.total === 0) return 0
  return Math.min((props.current / props.total) * 100, 100)
})
</script>

<style scoped>
.progress-bar-container {
  width: 100%;
  max-width: 200px;
  display: flex;
  align-items: center;
  height: 24px;
}

.progress-bar-background {
  width: 100%;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 2px;
  transition: width 0.5s ease-out;
}
</style>
