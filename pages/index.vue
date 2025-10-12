<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold" data-testid="heading-collections">Collections</h1>
      <div class="flex gap-2">
        <button class="bg-blue-100 text-blue-700 rounded px-3 py-1 text-sm">Stats</button>
        <button class="bg-yellow-100 text-yellow-700 rounded px-3 py-1 text-sm">Premium</button>
        <button class="bg-gray-200 text-gray-700 rounded px-3 py-1 text-sm">Aide</button>
      </div>
    </div>

    <!-- Loading state -->
  <div v-if="isLoading" class="flex justify-center items-center py-12" data-testid="loading">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Chargement des collections...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
      <button class="ml-2 underline" @click="loadCollections">Réessayer</button>
    </div>

    <!-- Collections grid -->
  <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <!-- Carte +Créer une collection -->
  <div data-testid="create-card" class="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-6 bg-white cursor-pointer hover:bg-blue-50 transition" @click="$router.push('/collections/create')">
        <span class="text-4xl text-blue-400 mb-2">+</span>
        <span class="font-medium text-blue-700">Créer une collection</span>
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
          0 cartes
        </template>
      </CollectionCard>

      <!-- Empty state -->
      <div v-if="collections.length === 0" class="col-span-full text-center py-12" data-testid="empty-state">
        <div class="text-gray-400 text-lg mb-2">Aucune collection</div>
        <div class="text-gray-500 text-sm">Créez votre première collection pour commencer</div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression (factorisé) -->
    <ConfirmModal
      v-if="collectionToDelete"
      :open="!!collectionToDelete"
      title="Supprimer la collection"
      confirm-label="Supprimer"
      :loading="isDeleting"
      @cancel="collectionToDelete = null"
      @confirm="handleDelete"
    >
      Êtes-vous sûr de vouloir supprimer la collection "{{ collectionToDelete?.name }}" ?
      <br />
      <span class="text-sm text-gray-500">Cette action est irréversible.</span>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCollections } from '~/composables/useCollections'
import type { Collection } from '~/lib/types'

const router = useRouter()
const { collections, isLoading, error, loadCollections, deleteCollection } = useCollections()

const collectionToDelete = ref<Collection | null>(null)
const isDeleting = ref(false)

// Charger les collections au montage
onMounted(() => {
  loadCollections()
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
