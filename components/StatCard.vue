<template>
  <div class="stat-card" :class="{ locked: locked }" @click="locked && $emit('unlock-required')">
    <div class="mb-1 text-sm text-[var(--color-secondary)]">{{ label }}</div>
    <div v-if="!locked" class="stat-content">
      <div class="text-2xl font-semibold text-[var(--color-black)]">{{ value }}</div>
      <div v-if="subtitle" class="mt-1 text-xs text-[var(--color-secondary)]">{{ subtitle }}</div>
    </div>
    <div v-else class="locked-content">
      <div class="blur-overlay">
        <div class="text-2xl font-semibold text-[var(--color-black)]">{{ value }}</div>
        <div v-if="subtitle" class="mt-1 text-xs text-[var(--color-secondary)]">{{ subtitle }}</div>
      </div>
      <UnlockMessage />
    </div>
  </div>
</template>

<script setup lang="ts">
import UnlockMessage from '~/components/UnlockMessage.vue'

defineProps<{
  label: string
  value: string | number
  subtitle?: string
  locked?: boolean
}>()

defineEmits<{
  'unlock-required': []
}>()

defineOptions({ name: 'StatCard' })
</script>

<style scoped>
.stat-card {
  position: relative;
  border-radius: 15px;
  background: var(--color-white);
  padding: 1rem;
  box-shadow: 0px 4px 32px #0000000a;
}

.stat-card.locked {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card.locked:active {
  transform: scale(0.98);
}

.locked-content {
  position: relative;
  min-height: 40px;
}

.blur-overlay {
  filter: blur(8px);
  user-select: none;
  pointer-events: none;
}
</style>
