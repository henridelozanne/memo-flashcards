<template>
  <div class="unlock-message">
    <IconStar class="h-4 w-4 text-yellow-500" />
    <span>{{ $t('stats.upgradeToUnlock') }}</span>
  </div>
</template>

<script setup lang="ts">
import IconStar from '~/components/icons/IconStar.vue'

defineOptions({ name: 'UnlockMessage' })
</script>

<style scoped>
.unlock-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
  pointer-events: none;
}
</style>
