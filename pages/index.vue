<template>
  <div class="h-full p-6">
    <!-- Header with settings button -->
    <PageHeader title="Remember" test-id="heading-collections">
      <template #actions>
        <BaseButton variant="icon" aria-label="Settings" @click="$router.push('/settings')">
          <IconSettings />
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Loading state -->
    <Loading v-if="isLoading" :message="$t('common.loadingCollections')" />

    <!-- Error state -->
    <ErrorMessage v-if="error" :error="error" :on-retry="loadCollections" />

    <!-- Daily review button -->
    <DailyReviewButton />

    <!-- Collections title -->
    <h2 class="mb-4 text-xl font-semibold">{{ $t('collections.myCollections') }}</h2>

    <!-- Collections grid -->
    <div v-if="!isLoading && !error" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      <!-- Carte + Créer une collection -->
      <div
        data-testid="create-card"
        class="order-last flex cursor-pointer flex-col items-center justify-center rounded-[15px] border-2 border-dashed bg-[var(--color-white)] p-6 transition hover:bg-[var(--color-light-purple)]"
        style="border-color: var(--color-accent-purple)"
        @click="$router.push('/collections/create')"
      >
        <span class="mb-2 text-4xl text-[var(--color-accent-purple)]">+</span>
        <span class="text-center font-medium text-[var(--color-primary)]">{{ $t('common.createCollection') }}</span>
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
      <span class="text-sm text-[var(--color-gray-500)]">{{ $t('collections.deleteWarning') }}</span>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCollections } from '~/composables/useCollections'
import { useDailyReview } from '~/composables/useDailyReview'
import DailyReviewButton from '~/components/DailyReviewButton.vue'
import PageHeader from '~/components/PageHeader.vue'
import BaseButton from '~/components/Button.vue'
import IconSettings from '~/components/icons/IconSettings.vue'
import type { Collection } from '~/lib/types'

defineOptions({ name: 'HomePage' })

const router = useRouter()
const { collections, isLoading, error, loadCollections, deleteCollection } = useCollections()
const { initDailyReview } = useDailyReview()

const collectionToDelete = ref<Collection | null>(null)
const isDeleting = ref(false)

onMounted(async () => {
  await loadCollections()
  // await createTestData()
  await initDailyReview()
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
