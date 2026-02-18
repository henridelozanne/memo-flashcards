<template>
  <div class="h-full p-6">
    <!-- Header with stats and settings buttons -->
    <PageHeader title="MemoLooper" test-id="heading-collections">
      <template #leftActions>
        <BaseButton variant="icon" aria-label="Statistics" @click="$router.push('/stats')">
          <IconStats />
        </BaseButton>
      </template>
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
        @click="handleCreateCollection"
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

    <!-- Modal de limitation gratuite -->
    <UpgradeModal
      :is-open="showUpgradeModal"
      :description="$t('upgrade.collectionLimit')"
      @close="showUpgradeModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCollections } from '~/composables/useCollections'
import { useDailyReview } from '~/composables/useDailyReview'
import { useSubscription } from '~/composables/useSubscription'
import DailyReviewButton from '~/components/DailyReviewButton.vue'
import PageHeader from '~/components/PageHeader.vue'
import BaseButton from '~/components/Button.vue'
import IconSettings from '~/components/icons/IconSettings.vue'
import IconStats from '~/components/icons/IconStats.vue'
import UpgradeModal from '~/components/UpgradeModal.vue'
import type { Collection } from '~/lib/types'

defineOptions({ name: 'HomePage' })

const router = useRouter()
const { collections, isLoading, error, loadCollections, deleteCollection } = useCollections()
const { initDailyReview } = useDailyReview()
const { isFree, FREE_LIMITS } = useSubscription()

const collectionToDelete = ref<Collection | null>(null)
const isDeleting = ref(false)
const showUpgradeModal = ref(false)

onMounted(async () => {
  await loadCollections()
  await initDailyReview()
})

// Navigation vers l'édition
function editCollection(id: string) {
  router.push(`/collections/${id}/edit`)
}

// Gestion de la création de collection avec limitation
function handleCreateCollection() {
  // Si l'utilisateur est gratuit et a atteint la limite
  if (isFree.value && collections.value.length >= FREE_LIMITS.MAX_COLLECTIONS) {
    showUpgradeModal.value = true
    return
  }

  // Sinon, naviguer vers la page de création
  router.push('/collections/create')
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
