<template>
  <div class="min-h-screen p-6">
    <div class="mx-auto max-w-2xl">
      <!-- Header avec retour et titre -->
      <PageHeader
        :title="collection?.name || 'Collection'"
        test-id="heading-cards"
        back-button-visible
        @back="$router.push('/')"
      />

      <!-- Loading state -->
      <Loading v-if="isLoadingCollection || isLoadingCards" />

      <!-- Error state -->
      <ErrorMessage v-else-if="error" :error="error" :on-retry="init" />

      <!-- Collection not found -->
      <div v-else-if="!collection" class="text-center text-gray-600">
        {{ $t('collections.notFound') }}
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Résumé -->
        <div class="mb-6 rounded-[15px] border border-gray-100 bg-white p-6 shadow-[0px_4px_32px_#0000000a]">
          <div class="flex flex-col gap-4">
            <div>
              <p class="text-lg font-medium">
                {{ $t('cards.cardCount', { count: cards.length }) }}
              </p>
              <p v-if="lastCardDate" class="text-sm text-gray-500">
                {{ $t('cards.lastAdded') }} {{ formatDate(lastCardDate) }}
              </p>
            </div>
            <div class="flex justify-center">
              <button
                class="flex min-h-[48px] items-center gap-2 rounded-[15px] bg-[var(--color-accent-blue)] px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="review-collection-btn"
                :disabled="cards.length === 0"
                @click="$router.push(`/collections/${collectionId}/review`)"
              >
                <IconPlay class="h-5 w-5" />
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
          <CardItem v-for="card in cards" :key="card.id" :card="card" data-testid="card-item" @click="editCard" />
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
import IconPlay from '~/components/icons/IconPlay.vue'
import CardItem from '~/components/CardItem.vue'
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
