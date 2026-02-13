<template>
  <div class="h-full p-6">
    <div class="mx-auto max-w-md">
      <!-- Header avec retour -->
      <PageHeader
        :title="$t('cards.createTitle')"
        test-id="heading-create-card"
        back-button-visible
        @back="$router.back()"
      />

      <!-- Collection info -->
      <CollectionInfo :collection="collection" />

      <!-- Formulaire -->
      <div
        class="rounded-[15px] border border-gray-100 bg-white p-6 shadow-[0px_4px_32px_#0000000a]"
        data-testid="create-card-form"
      >
        <CardForm
          ref="cardFormRef"
          :is-submitting="isSubmitting"
          :submit-label="$t('common.add')"
          @submit="onSubmit"
          @cancel="router.back()"
        />
      </div>

      <!-- Message de succès/erreur -->
      <StatusMessage :message="message" />

      <!-- Modal de limitation gratuite -->
      <UpgradeModal
        :is-open="showUpgradeModal"
        :description="$t('upgrade.cardLimit')"
        @close="showUpgradeModal = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCollections } from '~/composables/useCollections'
import { useCards } from '~/composables/useCards'
import { useSubscription } from '~/composables/useSubscription'
import { useDailyReview } from '~/composables/useDailyReview'
import type { Collection } from '~/lib/types'

defineOptions({ name: 'CreateCardPage' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { collections, loadCollections, getCollection } = useCollections()
const { createCard, getTotalCardsCount } = useCards()
const { isFree, FREE_LIMITS } = useSubscription()
const { invalidateCache, setCardsDueTotalCount } = useDailyReview()

const collectionId = String(route.params.id)
const collection = ref<Collection | null>(null)
const isSubmitting = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const cardFormRef = ref()
const showUpgradeModal = ref(false)

async function init() {
  // Charger les collections si nécessaire
  if (!collections.value.length) {
    await loadCollections()
  }

  // Récupérer la collection
  collection.value = getCollection(collectionId)
}

async function onSubmit(front: string, back: string) {
  isSubmitting.value = true
  message.value = null

  try {
    // Vérifier la limite pour les utilisateurs gratuits
    if (isFree.value) {
      const totalCards = await getTotalCardsCount()
      if (totalCards >= FREE_LIMITS.MAX_CARDS) {
        showUpgradeModal.value = true
        isSubmitting.value = false
        return
      }
    }

    await createCard(front, back, collectionId)

    // Invalider le cache et recalculer le nombre de cartes dues
    await invalidateCache()
    await setCardsDueTotalCount()

    message.value = {
      type: 'success',
      text: t('cards.createdSuccess') as string,
    }

    // Clear the message after 2 seconds and stay on the form
    setTimeout(() => {
      message.value = null
    }, 2000)
    // Reset form fields using exposed method
    cardFormRef.value?.reset()
  } catch (error) {
    message.value = {
      type: 'error',
      text: error instanceof Error ? error.message : (t('cards.createdError') as string),
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(init)
</script>
