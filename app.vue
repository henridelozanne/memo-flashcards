<template>
  <div class="app-container">
    <NuxtPage />
  </div>
</template>

<style>
.app-container {
  /* Safe area support for iOS */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  min-height: 100vh;
}

/* Ensure the viewport meta tag is properly configured */
@supports (padding: max(0px)) {
  .app-container {
    padding-top: max(env(safe-area-inset-top), 0px);
    padding-bottom: max(env(safe-area-inset-bottom), 0px);
    padding-left: max(env(safe-area-inset-left), 0px);
    padding-right: max(env(safe-area-inset-right), 0px);
  }
}
</style>
