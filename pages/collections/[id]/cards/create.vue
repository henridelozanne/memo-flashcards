<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mx-auto max-w-md">
      <!-- Header avec retour -->
      <PageHeader
        :title="$t('cards.createTitle')"
        test-id="heading-create-card"
        back-button-visible
        @back="$router.back()"
      />

      <!-- Collection info -->
      <div v-if="collection" class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p class="text-sm text-blue-700">
          <span class="font-medium">{{ $t('collections.collection') }}:</span>
          {{ collection.name }}
        </p>
      </div>

      <!-- Formulaire -->
      <div class="rounded-lg bg-white p-6 shadow" data-testid="create-card-form">
        <CardForm
          ref="cardFormRef"
          :is-submitting="isSubmitting"
          :submit-label="$t('common.add')"
          :show-add-another="true"
          @submit="onSubmit"
          @add-another="onAddAnother"
          @cancel="router.back()"
        />
      </div>

      <!-- Message de succès/erreur -->
      <div
        v-if="message"
        class="mt-4 rounded-md p-4"
        :class="message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
      >
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCollections } from '~/composables/useCollections'
import { useCards } from '~/composables/useCards'
import type { Collection } from '~/lib/types'

defineOptions({ name: 'CreateCardPage' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { collections, loadCollections, getCollection } = useCollections()
const { createCard } = useCards()

const collectionId = String(route.params.id)
const collection = ref<Collection | null>(null)
const isSubmitting = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const cardFormRef = ref()

async function init() {
  // Charger les collections si nécessaire
  if (!collections.value.length) {
    await loadCollections()
  }

  // Récupérer la collection
  collection.value = getCollection(collectionId)
}

async function handleCreateCard(front: string, back: string, addAnother: boolean) {
  isSubmitting.value = true
  message.value = null

  try {
    await createCard(front, back, collectionId)
    message.value = {
      type: 'success',
      text: t('cards.createdSuccess') as string,
    }

    if (addAnother) {
      // Clear the message after 2 seconds and stay on the form
      setTimeout(() => {
        message.value = null
      }, 2000)
      // Reset form fields using exposed method
      cardFormRef.value?.reset()
    } else {
      // Navigate back to cards list after 1.5 seconds
      setTimeout(() => {
        router.push(`/collections/${collectionId}/cards`)
      }, 1500)
    }
  } catch (error) {
    message.value = {
      type: 'error',
      text: error instanceof Error ? error.message : (t('cards.createdError') as string),
    }
  } finally {
    isSubmitting.value = false
  }
}

async function onSubmit(front: string, back: string) {
  await handleCreateCard(front, back, false)
}

async function onAddAnother(front: string, back: string) {
  await handleCreateCard(front, back, true)
}

onMounted(init)
</script>
