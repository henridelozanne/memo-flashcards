<template>
  <Transition name="ios-alert">
    <div v-if="showUpdateModal" class="ios-overlay" @click.self="dismissUpdate">
      <div class="ios-alert" role="alertdialog" aria-modal="true" :aria-label="$t('appUpdate.title')">
        <div class="ios-alert__body">
          <p class="ios-alert__title">{{ $t('appUpdate.title') }}</p>
          <p class="ios-alert__message">
            {{ $t('appUpdate.message', { version: availableVersion }) }}
          </p>
        </div>
        <div class="ios-alert__divider-h" />
        <div class="ios-alert__actions">
          <button class="ios-alert__btn ios-alert__btn--cancel" @click="dismissUpdate">
            {{ $t('appUpdate.later') }}
          </button>
          <div class="ios-alert__divider-v" />
          <button class="ios-alert__btn ios-alert__btn--primary" @click="openStore">
            {{ $t('appUpdate.update') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useAppUpdate } from '~/composables/useAppUpdate'

const { showUpdateModal, availableVersion, dismissUpdate, openStore } = useAppUpdate()
</script>

<style scoped>
.ios-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}

.ios-alert {
  width: 270px;
  border-radius: 14px;
  background: rgba(242, 242, 247, 0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
}

.ios-alert__body {
  padding: 20px 16px 16px;
  text-align: center;
}

.ios-alert__title {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: #000;
  letter-spacing: -0.2px;
}

.ios-alert__message {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  color: #000;
}

.ios-alert__divider-h {
  height: 0.5px;
  background: rgba(0, 0, 0, 0.2);
}

.ios-alert__divider-v {
  width: 0.5px;
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.ios-alert__actions {
  display: flex;
  height: 44px;
}

.ios-alert__btn {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 17px;
  line-height: 1;
  color: #007aff;
  cursor: default;
  -webkit-tap-highlight-color: transparent;
}

.ios-alert__btn:active {
  background: rgba(0, 0, 0, 0.08);
}

.ios-alert__btn--cancel {
  font-weight: 400;
}

.ios-alert__btn--primary {
  font-weight: 600;
}

/* Transition */
.ios-alert-enter-active,
.ios-alert-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.ios-alert-enter-from,
.ios-alert-leave-to {
  opacity: 0;
  transform: scale(1.06);
}

.ios-alert-enter-to,
.ios-alert-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
