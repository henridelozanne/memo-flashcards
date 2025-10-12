<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-2xl mx-auto">
      <!-- Header avec retour et titre -->
      <div class="flex items-center mb-6">
        <button class="mr-4 text-gray-600 hover:text-gray-800" aria-label="Retour" @click="$router.back()">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-2xl font-bold" data-testid="heading-cards">{{ collection?.name || 'Collection' }}</h1>
      </div>

      <!-- Loading state -->
      <div v-if="isLoadingCollection || isLoadingCards" class="flex justify-center items-center py-12" data-testid="loading">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">{{ $t('common.loading') }}</span>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
        <button class="ml-2 underline" @click="init">{{ $t('common.retry') }}</button>
      </div>

      <!-- Collection not found -->
      <div v-else-if="!collection" class="text-center text-gray-600">
        {{ $t('collections.notFound') }}
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Résumé -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg font-medium">{{ cards.length }} {{ cards.length <= 1 ? $t('cards.card') : $t('cards.cards') }}</p>
              <p v-if="lastCardDate" class="text-sm text-gray-500">
                {{ $t('cards.lastAdded') }} {{ formatDate(lastCardDate) }}
              </p>
              <p v-else class="text-sm text-gray-500">{{ $t('cards.noCards') }}</p>
            </div>
            <button 
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
              data-testid="add-card-btn"
              @click="$router.push(`/collections/${collectionId}/cards/create`)"
            >
              <span class="text-xl">+</span>
              {{ $t('cards.addCard') }}
            </button>
          </div>
        </div>

        <!-- Liste des cartes -->
        <div v-if="cards.length === 0" class="text-center py-12" data-testid="empty-state">
          <div class="text-gray-400 text-lg mb-2">{{ $t('cards.noCards') }}</div>
          <div class="text-gray-500 text-sm">{{ $t('cards.addFirstCard') }}</div>
        </div>

        <div v-else class="flex flex-wrap gap-6 justify-center">
          <div 
            v-for="card in cards" 
            :key="card.id"
            class="bg-white rounded-2xl shadow-lg transition cursor-pointer flex flex-col items-center justify-center aspect-[3/4] w-56 h-72 p-6 border border-gray-200 relative"
            data-testid="card-item"
            @click="editCard(card.id)"
          >
            <div class="w-full flex-1 flex flex-col items-center justify-center text-center">
              <!-- Front (question) -->
              <div class="font-semibold text-lg text-gray-900 mb-3 break-words line-clamp-4">
                {{ card.question }}
              </div>
              <!-- Back (answer) -->
              <div class="text-base text-gray-500 mt-2 break-words line-clamp-5">
                {{ card.answer }}
              </div>
            </div>
            <button 
              class="absolute top-2 right-2 p-2 text-gray-400 transition opacity-100"
              data-testid="edit-card-btn"
              @click.stop="editCard(card.id)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCollections } from '~/composables/useCollections'
import { useCards } from '~/composables/useCards'
import type { Collection } from '~/lib/types'

defineOptions({ name: 'CollectionCardsPage' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { collections, isLoading: isLoadingCollection, error: collectionError, loadCollections, getCollection } = useCollections()
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
    lastCardDate.value = getLastCardDate(collectionId)
  }
}

function editCard(cardId: string) {
  router.push(`/collections/${collectionId}/cards/${cardId}/edit`)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

onMounted(init)
</script>