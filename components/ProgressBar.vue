<template>
  <div class="progress-bar-container" :class="{ 'max-width-limited': !fullWidth, 'with-tooltip': showTooltip }">
    <div class="progress-bar-background">
      <div class="progress-bar-fill" :style="{ width: `${progressPercentage}%` }"></div>
    </div>

    <!-- Tooltip flottante -->
    <div v-if="showTooltip" class="progress-tooltip" :style="{ left: `${progressPercentage}%` }">
      <div class="tooltip-content">{{ Math.round(progressPercentage) }}%</div>
      <div class="tooltip-arrow"></div>
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
  fullWidth: {
    type: Boolean,
    default: false,
  },
  showTooltip: {
    type: Boolean,
    default: false,
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
  display: flex;
  align-items: center;
  height: 24px;
  position: relative;
}

.progress-bar-container.with-tooltip {
  padding-top: 32px;
  height: 56px;
}

.progress-bar-container.max-width-limited {
  max-width: 200px;
}

.progress-bar-background {
  width: 100%;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 2px;
  transition: width 0.5s ease-out;
}

.progress-tooltip {
  position: absolute;
  bottom: 4px;
  transform: translateX(-50%);
  transition: left 0.5s ease-out;
  pointer-events: none;
}

.tooltip-content {
  background-color: var(--color-primary);
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.tooltip-arrow {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--color-primary);
  margin: 0 auto;
}
</style>
