<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-container">
          <!-- Icône Premium -->
          <div class="modal-icon">
            <div class="premium-badge">⭐</div>
          </div>

          <!-- Titre -->
          <h2 class="modal-title">{{ $t('upgrade.limitReached') }}</h2>

          <!-- Description -->
          <p class="modal-description">
            {{ description }}
          </p>

          <!-- Actions -->
          <div class="modal-actions">
            <button class="btn-primary" @click="handleUpgrade">
              {{ $t('upgrade.upgradeToPremium') }}
            </button>
            <button class="btn-secondary" @click="handleCancel">
              {{ $t('upgrade.later') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  isOpen: boolean
  description?: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

function handleUpgrade() {
  emit('close')
  router.push('/paywall')
}

function handleCancel() {
  emit('close')
}

// Empêcher le scroll du body quand la modale est ouverte
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.modal-icon {
  margin-bottom: 16px;
}

.premium-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-radius: 50%;
  font-size: 32px;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-black);
  margin-bottom: 12px;
}

.modal-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  padding: 14px 24px;
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  padding: 14px 24px;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  font-size: 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
