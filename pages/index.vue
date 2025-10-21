<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <PageHeader :title="$t('collections.collections')" test-id="heading-collections" links-visible />

    <!-- Loading state -->
    <Loading v-if="isLoading" :message="$t('common.loadingCollections')" />

    <!-- Error state -->
    <ErrorMessage v-if="error" :error="error" :on-retry="loadCollections" />

    <!-- Daily review button -->
    <div class="mb-6">
      <button
        class="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-blue-500 disabled:hover:to-blue-600"
        data-testid="daily-review-btn"
        :disabled="dailyCardsCount === 0"
        @click="$router.push('/daily-review')"
      >
        {{ $t('dailyReview.reviewToday', { count: dailyCardsCount }) }}
      </button>
    </div>

    <!-- Collections grid -->
    <div v-if="!isLoading && !error" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      <!-- Carte +Créer une collection -->
      <div
        data-testid="create-card"
        class="order-last flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-white p-6 transition hover:bg-blue-50"
        @click="$router.push('/collections/create')"
      >
        <span class="mb-2 text-4xl text-blue-400">+</span>
        <span class="text-center font-medium text-blue-700">{{ $t('common.createCollection') }}</span>
      </div>

      <!-- Collections existantes -->
      <CollectionCard
        v-for="collection in collections"
        :key="collection.id"
        :collection="collection"
        :on-edit="editCollection"
        :on-delete="confirmDelete"
        :on-click="goToCards"
      />
    </div>

    <!-- Modal de confirmation de suppression -->
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
const { getCardsDueToday } = useCards()

const collectionToDelete = ref<Collection | null>(null)
const isDeleting = ref(false)
const dailyCardsCount = ref(0)

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

onMounted(async () => {
  await loadCollections()

  await loadDailyCardsCount()
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
