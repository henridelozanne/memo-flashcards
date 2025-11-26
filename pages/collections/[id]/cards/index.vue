<template>
  <div class="h-full p-6">
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

            <!-- Bouton Practice Mode -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <button type="button" class="practice-button" @click="startPracticeMode">
                  <IconDumbbell />
                  {{ $t('practiceMode.button') }}
                </button>
                <button type="button" class="options-toggle-button" @click="showPracticeOptions = !showPracticeOptions">
                  <IconSettings />
                </button>
              </div>
              <p class="text-center text-xs text-gray-500">
                {{ $t('practiceMode.subtitle') }}
              </p>
            </div>

            <!-- Options Practice Mode -->
            <Transition name="practice-options">
              <div v-if="showPracticeOptions" class="mt-2">
                <p class="mb-3 text-sm font-medium text-gray-700">
                  {{ $t('practiceMode.options') }}
                </p>
                <PracticeModeOptions v-model="practiceOptions" />
              </div>
            </Transition>
          </div>
        </div>

        <!-- Liste des cartes -->
        <div v-if="cards.length === 0" class="py-12" data-testid="empty-state">
          <div class="grid grid-cols-2 justify-items-center gap-3">
            <CreateCardItem @click="createCard" />
          </div>
        </div>

        <div v-else>
          <!-- Barre de tri -->
          <div class="mb-4 flex justify-end">
            <Select v-model="sortBy" :options="sortOptions" />
          </div>

          <!-- Grille de cartes -->
          <div class="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <CreateCardItem @click="createCard" />
            <CardItem
              v-for="card in sortedCards"
              :key="card.id"
              :card="card"
              data-testid="card-item"
              @click="editCard"
            />
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
import CardItem from '~/components/CardItem.vue'
import CreateCardItem from '~/components/CreateCardItem.vue'
import Select, { type SelectOption } from '~/components/Select.vue'
import PracticeModeOptions from '~/components/PracticeModeOptions.vue'
import IconSettings from '~/components/icons/IconSettings.vue'
import IconDumbbell from '~/components/icons/IconDumbbell.vue'
import type { Collection } from '~/lib/types'

defineOptions({ name: 'CollectionCardsPage' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
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
const sortBy = ref('newestFirst')
const showPracticeOptions = ref(false)
const practiceOptions = ref({
  mostFailed: false,
  onlyDue: false,
  onlyNew: false,
  excludeNew: false,
  swapQuestionAnswer: false,
})

const sortOptions = computed<SelectOption[]>(() => [
  { label: t('cards.sort.newestFirst'), value: 'newestFirst' },
  { label: t('cards.sort.oldestFirst'), value: 'oldestFirst' },
  { label: t('cards.sort.alphabeticalAZ'), value: 'alphabeticalAZ' },
  { label: t('cards.sort.alphabeticalZA'), value: 'alphabeticalZA' },
  { label: t('cards.sort.nextReview'), value: 'nextReview' },
  { label: t('cards.sort.compartmentAsc'), value: 'compartmentAsc' },
  { label: t('cards.sort.compartmentDesc'), value: 'compartmentDesc' },
  { label: t('cards.sort.mostFailed'), value: 'mostFailed' },
  { label: t('cards.sort.leastFailed'), value: 'leastFailed' },
])

const sortedCards = computed(() => {
  const cardsCopy = [...cards.value]

  switch (sortBy.value) {
    case 'newestFirst':
      return cardsCopy.sort((a, b) => b.created_at - a.created_at)

    case 'oldestFirst':
      return cardsCopy.sort((a, b) => a.created_at - b.created_at)

    case 'alphabeticalAZ':
      return cardsCopy.sort((a, b) => a.question.toLowerCase().localeCompare(b.question.toLowerCase()))

    case 'alphabeticalZA':
      return cardsCopy.sort((a, b) => b.question.toLowerCase().localeCompare(a.question.toLowerCase()))

    case 'nextReview':
      return cardsCopy.sort((a, b) => a.next_review_at - b.next_review_at)

    case 'compartmentAsc':
      return cardsCopy.sort((a, b) => a.compartment - b.compartment)

    case 'compartmentDesc':
      return cardsCopy.sort((a, b) => b.compartment - a.compartment)

    case 'mostFailed': {
      // Tri par taux d'échec décroissant (plus souvent ratées en premier)
      return cardsCopy.sort((a, b) => {
        const failRateA = a.total_reviews > 0 ? (a.total_reviews - a.correct_answers) / a.total_reviews : 0
        const failRateB = b.total_reviews > 0 ? (b.total_reviews - b.correct_answers) / b.total_reviews : 0
        return failRateB - failRateA
      })
    }

    case 'leastFailed': {
      // Tri par taux d'échec croissant (moins souvent ratées en premier)
      return cardsCopy.sort((a, b) => {
        const failRateA = a.total_reviews > 0 ? (a.total_reviews - a.correct_answers) / a.total_reviews : 0
        const failRateB = b.total_reviews > 0 ? (b.total_reviews - b.correct_answers) / b.total_reviews : 0
        return failRateA - failRateB
      })
    }

    default:
      return cardsCopy
  }
})

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

function createCard() {
  router.push(`/collections/${collectionId}/cards/create`)
}

function editCard(cardId: string) {
  router.push(`/collections/${collectionId}/cards/${cardId}/edit`)
}

function startPracticeMode() {
  router.push(`/collections/${collectionId}/practice`)
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

<style scoped>
/* Bouton Practice Mode */
.practice-button {
  width: 100%;
  padding: 12px 24px;
  background: white;
  color: var(--color-primary);
  border: 1.5px solid var(--color-primary);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  user-select: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.practice-button svg {
  width: 20px;
  height: 20px;
}

.practice-button:active {
  transform: translateY(0);
}

.options-toggle-button {
  background: transparent;
  border: none;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent !important;
  padding: 4px;
}

.options-toggle-button:active {
  transform: scale(0.95);
}

/* Transitions pour les options */
.practice-options-enter-active,
.practice-options-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.practice-options-enter-from,
.practice-options-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.practice-options-enter-to,
.practice-options-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}
</style>
