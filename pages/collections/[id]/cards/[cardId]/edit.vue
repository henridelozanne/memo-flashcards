<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-md mx-auto">
      <!-- Header avec retour -->
      <div class="flex items-center mb-6">
        <button class="mr-4 text-gray-600 hover:text-gray-800" :aria-label="$t('common.backButton')" @click="$router.back()">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-2xl font-bold" data-testid="heading-edit-card">{{ $t('cards.editTitle') }}</h1>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center py-12" data-testid="loading">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">{{ $t('common.loading') }}</span>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
        <button class="ml-2 underline" @click="init">{{ $t('common.retry') }}</button>
      </div>

      <!-- Card not found -->
      <div v-else-if="!card" class="text-center text-gray-600">
        Carte introuvable
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Collection info -->
        <div v-if="collection" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-700">
            <span class="font-medium">{{ $t('collections.collection') }}:</span> {{ collection.name }}
          </p>
        </div>

        <!-- Formulaire -->
        <div class="bg-white rounded-lg shadow p-6 mb-6" data-testid="edit-card-form">
          <CardForm
            :front="card.question"
            :back="card.answer"
            :is-submitting="isSubmitting"
            :submit-label="$t('common.save')"
            @submit="onSubmit"
            @cancel="router.back()"
          />
        </div>

        <!-- Bouton supprimer -->
        <div class="bg-white rounded-lg shadow p-6">
          <button
            class="w-full px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition flex items-center justify-center gap-2"
            data-testid="delete-card-btn"
            @click="confirmDelete"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            {{ $t('cards.deleteConfirm') }}
          </button>
        </div>

        <!-- Message de succès/erreur -->
        <div v-if="message" class="mt-4 p-4 rounded-md" :class="message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
          {{ message.text }}
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <ConfirmModal
      v-if="showDeleteModal"
      :open="showDeleteModal"
      :title="$t('cards.deleteConfirm')"
      :confirm-label="$t('common.delete')"
      :loading="isDeleting"
      @cancel="showDeleteModal = false"
      @confirm="handleDelete"
    >
      {{ $t('cards.deleteMessage') }}
      <br />
      <span class="text-sm text-gray-500">{{ $t('collections.deleteWarning') }}</span>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCollections } from '~/composables/useCollections'
import { useCards } from '~/composables/useCards'
import type { Collection, Card } from '~/lib/types'

defineOptions({ name: 'EditCardPage' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { collections, loadCollections, getCollection } = useCollections()
const { cards, isLoading, error, loadCards, getCard, updateCard, deleteCard } = useCards()

const collectionId = String(route.params.id)
const cardId = String(route.params.cardId)
const collection = ref<Collection | null>(null)
const card = ref<Card | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

async function init() {
  message.value = null
  
  // Charger les collections si nécessaire
  if (!collections.value.length) {
    await loadCollections()
  }
  
  // Récupérer la collection
  collection.value = getCollection(collectionId)
  
  if (collection.value) {
    // Charger les cartes si pas déjà fait
    if (!cards.value.length) {
      await loadCards(collectionId)
    }
    
    // Récupérer la carte
    card.value = getCard(cardId)
  }
}

async function onSubmit(front: string, back: string) {
  isSubmitting.value = true
  message.value = null
  
  try {
    await updateCard(cardId, front, back)
    message.value = { type: 'success', text: t('cards.updatedSuccess') as string }
    
    // Navigate back to cards list after 1.5 seconds
    setTimeout(() => {
      router.push(`/collections/${collectionId}/cards`)
    }, 1500)
  } catch (err) {
    message.value = { 
      type: 'error', 
      text: err instanceof Error ? err.message : (t('cards.updatedError') as string)
    }
  } finally {
    isSubmitting.value = false
  }
}

function confirmDelete() {
  showDeleteModal.value = true
}

async function handleDelete() {
  isDeleting.value = true
  
  try {
    await deleteCard(cardId)
    message.value = { type: 'success', text: t('cards.deletedSuccess') as string }
    showDeleteModal.value = false
    
    // Navigate back to cards list after 1 second
    setTimeout(() => {
      router.push(`/collections/${collectionId}/cards`)
    }, 1000)
  } catch (err) {
    message.value = { 
      type: 'error', 
      text: err instanceof Error ? err.message : (t('cards.deletedError') as string)
    }
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

onMounted(init)
</script>