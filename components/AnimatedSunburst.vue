<template>
  <div class="animated-sunburst"></div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AnimatedSunburst' })
</script>

<style scoped>
.animated-sunburst {
  position: fixed;
  inset: -100%;
  left: 50%;
  top: 50%;
  width: 300%;
  height: 300%;
  transform: translate(-50%, -50%);
  background: repeating-conic-gradient(
    from 0deg,
    var(--color-primary) 0deg 15deg,
    var(--color-dark-purple) 15deg 30deg
  );
  animation: rotate-sunburst 30s linear infinite;
  z-index: 0;
}

@keyframes rotate-sunburst {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
