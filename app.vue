<template>
  <div class="app-container">
    <BackgroundEffects />
    <div class="app-content">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup>
// Design : https://www.figma.com/design/V15DbYppzpLTKLMGpOmXxf/Task-management---to-do-list-app--Community-?node-id=1-87&p=f&t=g7PKTuPvHqPTjuhe-0
import BackgroundEffects from '~/components/BackgroundEffects.vue'
</script>

<style>
.app-container {
  /* Safe area support for iOS */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  height: 100vh;
  background: white;
  position: relative;
}

.app-content {
  position: relative;
  z-index: 1;
  isolation: isolate;
  height: 100%;
}
</style>
