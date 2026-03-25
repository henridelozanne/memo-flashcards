<template>
  <div class="app-container">
    <BackgroundEffects v-if="!isDark" />
    <div class="app-content">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
// Design : https://www.figma.com/design/V15DbYppzpLTKLMGpOmXxf/Task-management---to-do-list-app--Community-?node-id=1-87&p=f&t=g7PKTuPvHqPTjuhe-0
import { onMounted, onUnmounted } from 'vue'
import { isDark } from '~/composables/useIsDark'
import BackgroundEffects from '~/components/BackgroundEffects.vue'
import { useWidgetData } from '~/composables/useWidgetData'
import { useIosPhantomClickGuard } from '~/composables/useIosPhantomClickGuard'

const { syncAllCardsToWidget } = useWidgetData()

useIosPhantomClickGuard()

const onVisibilityChange = () => {
  if (document.visibilityState === 'visible') syncAllCardsToWidget()
}

onMounted(() => {
  syncAllCardsToWidget()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style>
/* Bloque brièvement les boutons de navigation après retour au premier plan
   pour éviter le phantom click iOS lors de l'apparition du clavier. */
body[data-ios-kb-resume] button[type='button'] {
  pointer-events: none;
}

.app-container {
  /* Safe area support for iOS */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  height: 100vh;
  background: var(--color-bg);
  position: relative;
}

.app-content {
  position: relative;
  z-index: 1;
  isolation: isolate;
  height: 100%;
}
</style>
