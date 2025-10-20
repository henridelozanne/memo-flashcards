<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <PageHeader 
      :title="$t('collections.collections')" 
      test-id="heading-collections"
      links-visible
    />

    <!-- Loading state -->
  <div v-if="isLoading" class="flex justify-center items-center py-12" data-testid="loading">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">{{ $t('common.loadingCollections') }}</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
      <button class="ml-2 underline" @click="loadCollections">{{ $t('common.retry') }}</button>
    </div>

    <!-- Daily review button -->
    <div class="mb-6">
      <button 
        class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-blue-600"
        data-testid="daily-review-btn"
        :disabled="dailyCardsCount === 0"
        @click="$router.push('/daily-review')"
      >
        {{ dailyCardsCount > 0 ? $t('dailyReview.reviewToday', { count: dailyCardsCount }) : $t('dailyReview.noCardsToday') }}
      </button>
    </div>

    <!-- Collections grid -->
  <div v-if="!isLoading && !error" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <!-- Carte +Créer une collection -->
  <div data-testid="create-card" class="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-6 bg-white cursor-pointer hover:bg-blue-50 transition order-last" @click="$router.push('/collections/create')">
        <span class="text-4xl text-blue-400 mb-2">+</span>
        <span class="font-medium text-blue-700 text-center">{{ $t('common.createCollection') }}</span>
      </div>

      <!-- Collections existantes -->
      <CollectionCard
        v-for="collection in collections"
        :key="collection.id"
        :collection="collection"
        :on-edit="editCollection"
        :on-delete="confirmDelete"
        :on-click="goToCards"
      >
        <template #info>
          {{ getCollectionCardCount(collection.id) }} {{ getCollectionCardCount(collection.id) <= 1 ? 'carte' : 'cartes' }}
        </template>
      </CollectionCard>
    </div>

    <!-- Modal de confirmation de suppression (factorisé) -->
    <ConfirmModal
      v-if="collectionToDelete"
      :open="!!collectionToDelete"
      :title="$t('collections.deleteTitle')"
      :confirm-label="$t('common.delete')"
      :loading="isDeleting"
      @cancel="collectionToDelete = null"
      @confirm="handleDelete"
    >
      {{ $t('collections.deleteConfirm', { name: collectionToDelete?.name }) }}
      <br />
      <span class="text-sm text-gray-500">{{ $t('collections.deleteWarning') }}</span>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCollections } from '~/composables/useCollections'
import { useCards } from '~/composables/useCards'
import type { Collection } from '~/lib/types'

defineOptions({ name: 'HomePage' })

const router = useRouter()
const { collections, isLoading, error, loadCollections, deleteCollection } = useCollections()
const { getCardsDueToday, getCardsCount } = useCards()

const collectionToDelete = ref<Collection | null>(null)
const isDeleting = ref(false)
const cardsCounts = ref<Record<string, number>>({})
const dailyCardsCount = ref(0)

// Fonction pour charger le nombre de cartes d'une collection
const loadCardCount = async (collectionId: string) => {
  try {
    const count = await getCardsCount(collectionId)
    cardsCounts.value[collectionId] = count
  } catch (e) {
    console.error('Erreur lors du chargement du compteur de cartes:', e)
    cardsCounts.value[collectionId] = 0
  }
}

// Fonction pour recharger le total des cartes dues aujourd'hui
const loadDailyCardsCount = async () => {
  try {
    const dueCards = await getCardsDueToday()
    dailyCardsCount.value = dueCards.length
  } catch (e) {
    console.error('Erreur lors du chargement des cartes dues:', e)
    dailyCardsCount.value = 0
  }
}

// Fonction pour obtenir le compteur de cartes (avec fallback)
const getCollectionCardCount = (collectionId: string) => cardsCounts.value[collectionId] ?? 0

// Charger les cartes dues et le nombre de collections au montage
onMounted(async () => {
  // Attendre que les collections soient chargées
  await loadCollections()
  
  // Charger le nombre total de cartes dues aujourd'hui
  await loadDailyCardsCount()
  
  // Charger les compteurs de cartes pour toutes les collections
  await Promise.all(collections.value.map(collection => loadCardCount(collection.id)))
})

// Navigation vers l'édition
function editCollection(id: string) {
  router.push(`/collections/${id}/edit`)
}

// Confirmation de suppression
function confirmDelete(collection: Collection) {
  collectionToDelete.value = collection
}

// Suppression effective
async function handleDelete() {
  if (!collectionToDelete.value) return
  
  isDeleting.value = true
  try {
    await deleteCollection(collectionToDelete.value.id)
    collectionToDelete.value = null
  } catch (err) {
    console.error('Error deleting collection:', err)
    // L'erreur est déjà gérée dans le composable
  } finally {
    isDeleting.value = false
  }
}

// Navigation vers la liste des cartes
function goToCards(id: string) {
  router.push(`/collections/${id}/cards`)
}
</script>
