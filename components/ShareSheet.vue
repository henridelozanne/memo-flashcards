<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex flex-col justify-end"
        @click.self="$emit('update:modelValue', false)"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="$emit('update:modelValue', false)" />

        <!-- Sheet -->
        <div class="relative z-10 w-full rounded-t-[24px] bg-[var(--color-white)] px-5 pb-10 pt-5 shadow-lg">
          <!-- Handle -->
          <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-gray-200)]" />

          <!-- Aperçu image -->
          <div class="mb-5 flex items-center justify-center">
            <img v-if="imagePreviewUrl" :src="imagePreviewUrl" class="w-48 rounded-2xl shadow-md" alt="Aperçu" />
            <div v-else class="flex h-48 w-48 items-center justify-center rounded-2xl bg-[var(--color-light-purple)]">
              <div
                class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"
              />
            </div>
          </div>

          <!-- Boutons -->
          <div class="flex w-full gap-3">
            <!-- Instagram Stories -->
            <button
              class="flex flex-1 flex-col items-center justify-center gap-2 rounded-[15px] bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-2 py-4 text-xs font-semibold text-white transition active:opacity-80 disabled:opacity-50"
              :disabled="!imageFile || isSharing"
              @click="handleInstagram"
            >
              <IconInstagram class="h-6 w-6 shrink-0" />
              Instagram Stories
            </button>

            <!-- WhatsApp -->
            <button
              class="flex flex-1 flex-col items-center justify-center gap-2 rounded-[15px] bg-[#25D366] px-2 py-4 text-xs font-semibold text-white transition active:opacity-80"
              @click="handleWhatsapp"
            >
              <IconWhatsApp class="h-6 w-6 shrink-0" />
              WhatsApp
            </button>

            <!-- Partager (sheet native) -->
            <button
              class="flex flex-1 flex-col items-center justify-center gap-2 rounded-[15px] border border-[var(--color-gray-200)] bg-white px-2 py-4 text-xs font-semibold text-[var(--color-black)] transition active:bg-[var(--color-gray-50)] disabled:opacity-50"
              :disabled="!imageFile || isSharing"
              @click="handleNativeShare"
            >
              <IconShare class="h-6 w-6 shrink-0" />
              {{ $t('review.shareButton') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useInstagramShare } from '~/composables/useInstagramShare'
import IconInstagram from '~/components/icons/IconInstagram.vue'
import IconShare from '~/components/icons/IconShare.vue'
import IconWhatsApp from '~/components/icons/IconWhatsApp.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  imageFile: { type: Object as () => File | null, default: null },
  shareText: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

const { shareImageToStories } = useInstagramShare()

const isSharing = ref(false)
const imagePreviewUrl = ref<string | null>(null)

watch(
  () => props.imageFile,
  (file) => {
    if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = file ? URL.createObjectURL(file) : null
  },
  { immediate: true }
)

async function handleInstagram() {
  if (!props.imageFile || isSharing.value) return
  isSharing.value = true
  try {
    await shareImageToStories(props.imageFile)
    emit('update:modelValue', false)
  } catch {
    // ignoré
  } finally {
    isSharing.value = false
  }
}

function handleWhatsapp() {
  const encoded = encodeURIComponent(props.shareText)
  window.open(`whatsapp://send?text=${encoded}`, '_system')
  emit('update:modelValue', false)
}

async function handleNativeShare() {
  if (isSharing.value) return
  isSharing.value = true
  try {
    const file = props.imageFile
    const canShareFiles = file != null && navigator.canShare?.({ files: [file] }) === true
    if (canShareFiles && file) {
      await navigator.share({ files: [file], text: props.shareText })
    } else {
      await navigator.share({ text: props.shareText })
    }
    emit('update:modelValue', false)
  } catch {
    // ignoré
  } finally {
    isSharing.value = false
  }
}
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-active .relative,
.sheet-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .relative,
.sheet-leave-to .relative {
  transform: translateY(100%);
}
</style>
