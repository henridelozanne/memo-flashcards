<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mx-auto max-w-2xl">
      <!-- Header avec retour et titre -->
      <PageHeader
        :title="collection?.name || 'Collection'"
        test-id="heading-cards"
        back-button-visible
        @back="$router.push('/')"
      />

      <!-- Loading state -->
      <div
        v-if="isLoadingCollection || isLoadingCards"
        class="flex items-center justify-center py-12"
        data-testid="loading"
      >
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">{{ $t('common.loading') }}</span>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        {{ error }}
        <button class="ml-2 underline" @click="init">
          {{ $t('common.retry') }}
        </button>
      </div>

      <!-- Collection not found -->
      <div v-else-if="!collection" class="text-center text-gray-600">
        {{ $t('collections.notFound') }}
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Résumé -->
        <div class="mb-6 rounded-lg bg-white p-6 shadow">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p class="text-lg font-medium">
                {{ cards.length }}
                {{ cards.length <= 1 ? $t('cards.card') : $t('cards.cards') }}
              </p>
              <p v-if="lastCardDate" class="text-sm text-gray-500">
                {{ $t('cards.lastAdded') }} {{ formatDate(lastCardDate) }}
              </p>
              <p v-else class="text-sm text-gray-500">
                {{ $t('cards.noCards') }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                data-testid="add-card-btn"
                @click="$router.push(`/collections/${collectionId}/cards/create`)"
              >
                <span class="text-xl">+</span>
                {{ $t('cards.addCard') }}
              </button>
              <button
                class="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="review-collection-btn"
                :disabled="cards.length === 0"
                @click="$router.push(`/collections/${collectionId}/review`)"
              >
                {{ $t('review.reviewThisCollection') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des cartes -->
        <div v-if="cards.length === 0" class="py-12 text-center" data-testid="empty-state">
          <div class="mb-2 text-lg text-gray-400">
            {{ $t('cards.noCards') }}
          </div>
          <div class="text-sm text-gray-500">
            {{ $t('cards.addFirstCard') }}
          </div>
        </div>

        <div v-else class="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="card in cards"
            :key="card.id"
            class="relative flex aspect-[3/4] h-72 w-full max-w-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 shadow-lg transition"
            data-testid="card-item"
            @click="editCard(card.id)"
          >
            <div class="flex w-full flex-1 flex-col items-center justify-center overflow-hidden text-center">
              <!-- Front (question) -->
              <div class="mb-2 line-clamp-3 break-words text-sm font-medium leading-tight text-gray-900">
                {{ card.question }}
              </div>
              <!-- Divider -->
              <div class="my-2 h-px w-8 bg-gray-300 opacity-50"></div>
              <!-- Back (answer) -->
              <div class="line-clamp-4 break-words text-xs leading-tight text-gray-500">
                {{ card.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCollections } from '~/composables/useCollections'
import { useCards } from '~/composables/useCards'
import type { Collection } from '~/lib/types'

defineOptions({ name: 'CollectionCardsPage' })

const route = useRoute()
const router = useRouter()
const {
  collections,
  isLoading: isLoadingCollection,
  error: collectionError,
  loadCollections,
  getCollection,
} = useCollections()
const { cards, isLoading: isLoadingCards, error: cardsError, loadCards, getLastCardDate } = useCards()

const collectionId = String(route.params.id)
const collection = ref<Collection | null>(null)
const lastCardDate = ref<Date | null>(null)

const error = computed(() => collectionError.value || cardsError.value)

async function init() {
  // Charger les collections si nécessaire
  if (!collections.value.length && !isLoadingCollection.value) {
    await loadCollections()
  }

  // Récupérer la collection
  collection.value = getCollection(collectionId)

  if (collection.value) {
    // Charger les cartes
    await loadCards(collectionId)
    lastCardDate.value = await getLastCardDate(collectionId)
  }
}

function editCard(cardId: string) {
  router.push(`/collections/${collectionId}/cards/${cardId}/edit`)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

onMounted(init)
</script>
