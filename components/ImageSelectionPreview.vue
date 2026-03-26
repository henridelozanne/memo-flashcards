<template>
  <Teleport to="body">
    <Transition name="image-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex flex-col bg-[var(--color-white)] dark:bg-[var(--color-black)]"
        style="padding-top: env(safe-area-inset-top)"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b border-[var(--color-gray-200)] px-6 py-4 dark:border-[var(--color-gray-700)]"
        >
          <button
            type="button"
            class="mr-4 text-[var(--color-secondary)] transition active:opacity-60"
            @click="$emit('close')"
          >
            <IconArrowLeft />
          </button>

          <h2 class="text-base font-semibold text-[var(--color-black)] dark:text-[var(--color-white)]">
            {{ $t('aiCardsFromImage.title') }}
          </h2>

          <!-- Placeholder pour centrer le titre -->
          <div class="w-16" />
        </div>

        <!-- Corps -->
        <div class="flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-6">
          <!-- Message d'avertissement qualité photo -->
          <div class="mb-5 flex items-center gap-2 rounded-xl px-4 py-3" style="background-color: #fffbeb">
            <IconWarning class="h-4 w-4 shrink-0" style="color: var(--color-accent-yellow)" />
            <p class="text-xs leading-relaxed" style="color: #92400e">
              {{ $t('aiCardsFromImage.qualityWarning') }}
            </p>
          </div>

          <!-- Grille de photos sélectionnées -->
          <div class="grid grid-cols-3 gap-3">
            <!-- Thumbnails -->
            <div v-for="image in images" :key="image.id" class="relative aspect-square overflow-hidden rounded-xl">
              <img :src="image.webPath" class="h-full w-full object-cover" alt="" />
              <!-- Bouton supprimer -->
              <button
                type="button"
                class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition active:scale-90"
                @click="$emit('remove', image.id)"
              >
                <IconClose class="h-3 w-3" />
              </button>
            </div>

            <!-- Bouton "Ajouter" — visible si < 6 photos et pas en cours de chargement -->
            <button
              v-if="images.length <= 5 && !isPickingImages"
              type="button"
              :disabled="images.length >= 5"
              class="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--color-gray-300)] transition active:opacity-60 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[var(--color-gray-600)]"
              @click="showSourcePicker = true"
            >
              <IconPlus class="h-6 w-6 text-[var(--color-secondary)]" />
              <span class="text-xs text-[var(--color-secondary)]">
                {{ $t('aiCardsFromImage.addPhoto') }}
              </span>
            </button>

            <!-- Indicateur de chargement pendant la sélection -->
            <div
              v-if="isPickingImages"
              class="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-gray-300)] dark:border-[var(--color-gray-600)]"
            >
              <IconSpinner class="h-6 w-6 text-[var(--color-secondary)]" />
            </div>
          </div>

          <!-- Compteur -->
          <p v-if="images.length > 0" class="mt-3 text-center text-xs text-[var(--color-secondary)]">
            {{ $t('aiCardsFromImage.imageCount', { count: images.length }) }}
          </p>

          <!-- État vide : aucune photo encore -->
          <div v-if="images.length === 0 && !isPickingImages" class="mt-8 text-center">
            <p class="text-sm text-[var(--color-secondary)]">
              {{ $t('aiCardsFromImage.emptyHint') }}
            </p>
          </div>
        </div>

        <!-- Footer avec le CTA -->
        <div
          class="border-t border-[var(--color-gray-200)] px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 dark:border-[var(--color-gray-700)]"
        >
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-white transition active:opacity-80 disabled:opacity-40"
            style="background: var(--color-primary)"
            :disabled="isGenerating || images.length === 0"
            @click="$emit('generate')"
          >
            <template v-if="isGenerating">
              <IconSpinner class="h-5 w-5" />
              {{ $t('aiCardsFromImage.generating') }}
            </template>
            <template v-else>
              <IconSparkles class="h-5 w-5" />
              {{ $t('aiCardsFromImage.generate') }}
            </template>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Picker source : caméra ou galerie (Teleport séparé pour passer au-dessus du modal) -->
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="showSourcePicker" class="fixed inset-0 z-[60] bg-black/40" @click="showSourcePicker = false" />
    </Transition>
    <!-- Panel -->
    <Transition name="slide-up">
      <div v-if="showSourcePicker" class="fixed bottom-0 left-0 right-0 z-[61] flex justify-center">
        <div
          class="w-full max-w-md bg-[var(--color-white)] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 dark:bg-[var(--color-gray-900)]"
        >
          <div class="mx-auto mb-4 h-1 w-12 rounded-full bg-[var(--color-gray-300)] dark:bg-[var(--color-gray-600)]" />

          <button
            type="button"
            class="flex w-full items-center gap-4 rounded-2xl px-4 py-4 transition active:bg-[var(--color-gray-100)] dark:active:bg-[var(--color-gray-800)]"
            @click="onPickCamera"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl"
              style="background: var(--color-light-purple)"
            >
              <IconCamera class="h-5 w-5" style="color: var(--color-accent-purple)" />
            </div>
            <span class="text-base font-medium text-[var(--color-black)] dark:text-[var(--color-white)]">
              {{ $t('aiCardsFromImage.takePhoto') }}
            </span>
          </button>

          <button
            type="button"
            class="flex w-full items-center gap-4 rounded-2xl px-4 py-4 transition active:bg-[var(--color-gray-100)] dark:active:bg-[var(--color-gray-800)]"
            @click="onPickGallery"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl"
              style="background: var(--color-light-purple)"
            >
              <IconGallery class="h-5 w-5" style="color: var(--color-accent-purple)" />
            </div>
            <span class="text-base font-medium text-[var(--color-black)] dark:text-[var(--color-white)]">
              {{ $t('aiCardsFromImage.chooseFromLibrary') }}
            </span>
          </button>

          <button
            type="button"
            class="mt-1 w-full rounded-2xl py-4 text-center text-sm font-medium text-[var(--color-secondary)] transition active:opacity-60"
            @click="showSourcePicker = false"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SelectedImage } from '~/composables/useAiCardsFromImage'
import IconArrowLeft from '~/components/icons/IconArrowLeft.vue'
import IconCamera from '~/components/icons/IconCamera.vue'
import IconClose from '~/components/icons/IconClose.vue'
import IconGallery from '~/components/icons/IconGallery.vue'
import IconPlus from '~/components/icons/IconPlus.vue'
import IconSparkles from '~/components/icons/IconSparkles.vue'
import IconSpinner from '~/components/icons/IconSpinner.vue'
import IconWarning from '~/components/icons/IconWarning.vue'

defineProps<{
  isOpen: boolean
  images: SelectedImage[]
  isPickingImages?: boolean
  isGenerating?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'remove', id: string): void
  (e: 'pick-camera'): void
  (e: 'pick-gallery'): void
  (e: 'generate'): void
}>()

const showSourcePicker = ref(false)

function onPickCamera() {
  showSourcePicker.value = false
  emit('pick-camera')
}

function onPickGallery() {
  showSourcePicker.value = false
  emit('pick-gallery')
}
</script>

<style scoped>
.image-modal-enter-active,
.image-modal-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.image-modal-enter-from,
.image-modal-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
