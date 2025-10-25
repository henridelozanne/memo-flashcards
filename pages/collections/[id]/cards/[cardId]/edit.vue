<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mx-auto max-w-md">
      <!-- Header avec retour -->
      <PageHeader
        :title="$t('cards.editTitle')"
        test-id="heading-edit-card"
        back-button-visible
        @back="$router.back()"
      />

      <!-- Loading state -->
      <Loading v-if="isLoading" />

      <!-- Error state -->
      <ErrorMessage v-else-if="error" :error="error" :on-retry="init" />

      <!-- Card not found -->
      <div v-else-if="!card" class="text-center text-gray-600">{{ $t('cards.notFound') }}</div>

      <!-- Content -->
      <div v-else>
        <!-- Collection info -->
        <CollectionInfo :collection="collection" />

        <!-- Formulaire -->
        <div class="mb-6 rounded-lg bg-white p-6 shadow" data-testid="edit-card-form">
          <CardForm
            :front="card.question"
            :back="card.answer"
            :is-submitting="isSubmitting"
            :submit-label="$t('common.save')"
            @submit="onSubmit"
            @cancel="router.back()"
          />
        </div>

        <div v-if="card.next_review_at" class="mb-6 flex items-center justify-end text-[13px] text-gray-500">
          <IconClock class="mr-2" />
          <span class="mr-1">{{ $t('cards.nextReview') }}: {{ formatReviewDate(card.next_review_at) }}</span>
        </div>

        <div v-if="card" class="mb-6 flex items-center justify-end text-[13px] text-gray-500">
          <IconBox class="mr-2 opacity-60" />
          <span class="mr-1">{{ $t('cards.compartment', { n: card.compartment, total: 6 }) }}</span>
        </div>

        <div v-if="card?.total_reviews > 0" class="mb-6 flex items-center justify-end text-[13px] text-gray-500">
          <IconStats class="mr-2 opacity-60" />
          <span class="mr-1">{{
            $t('cards.correctAnswers', { correct: card.correct_answers, total: card.total_reviews })
          }}</span>
        </div>

        <!-- Bouton supprimer -->
        <div class="rounded-lg bg-white p-6 shadow">
          <button
            class="flex w-full items-center justify-center gap-2 rounded-md bg-red-100 px-4 py-2 text-red-700 transition hover:bg-red-200"
            data-testid="delete-card-btn"
            @click="confirmDelete"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
            {{ $t('cards.deleteConfirm') }}
          </button>
        </div>

        <!-- Message de succès/erreur -->
        <StatusMessage :message="message" />
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
import IconClock from '~/components/IconClock.vue'
import IconBox from '~/components/IconBox.vue'
import IconStats from '~/components/IconStats.vue'
import { formatReviewDate } from '~/utils/date'
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
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

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
    message.value = {
      type: 'success',
      text: t('cards.updatedSuccess') as string,
    }

    router.push(`/collections/${collectionId}/cards`)
  } catch (err) {
    message.value = {
      type: 'error',
      text: err instanceof Error ? err.message : (t('cards.updatedError') as string),
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
    message.value = {
      type: 'success',
      text: t('cards.deletedSuccess') as string,
    }
    showDeleteModal.value = false

    // Navigate back to cards list immediately
    router.push(`/collections/${collectionId}/cards`)
  } catch (err) {
    message.value = {
      type: 'error',
      text: err instanceof Error ? err.message : (t('cards.deletedError') as string),
    }
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

onMounted(init)
</script>
