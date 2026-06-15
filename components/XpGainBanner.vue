<template>
  <Transition name="xp-banner">
    <div v-if="visible" class="flex flex-col items-center gap-0.5">
      <div v-if="isBoost" class="streak-line text-sm font-bold">
        {{ $t('review.boostStreak', { count: boostMilestone }) }}
      </div>
      <div class="flex items-center gap-1">
        <span class="plain-text text-xl">{{ compartment }} × 10</span>
        <span v-if="isBoost" class="plain-text text-xl font-black">× 2</span>
        <span class="plain-text text-xl"> = </span>
        <span class="xp-gradient text-xl font-extrabold">+{{ compartment * 10 * (isBoost ? 2 : 1) }} !</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineOptions({ name: 'XpGainBanner' })
defineProps<{ visible: boolean; compartment: number; isBoost?: boolean; boostMilestone?: number }>()
</script>

<style scoped>
.plain-text {
  color: var(--color-accent-yellow);
}

.streak-line {
  color: var(--color-accent-yellow);
}

.xp-gradient {
  background: linear-gradient(
    180deg,
    var(--color-flame-top) 0%,
    var(--color-flame-mid) 60%,
    var(--color-flame-bottom) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.xp-banner-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.xp-banner-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.xp-banner-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.xp-banner-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.xp-banner-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
