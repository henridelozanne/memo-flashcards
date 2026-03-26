<template>
  <div class="min-h-full p-6 pb-16">
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
        <div
          class="mb-6 rounded-[15px] p-6 shadow-[0px_4px_32px_#0000000a]"
          :style="{
            background: collection.color && collection.color !== '#ffffff' ? collection.color : 'var(--color-white)',
          }"
        >
          <div class="flex flex-col gap-4">
            <div>
              <p class="text-lg font-medium" :class="isColored ? 'text-white' : 'text-[var(--color-black)]'">
                {{ $t('cards.cardCount', { count: cards.length }) }}
              </p>
              <p
                v-if="lastCardDate"
                class="text-sm"
                :class="isColored ? 'text-white/75' : 'text-[var(--color-secondary)]'"
              >
                {{ $t('cards.lastAdded') }} {{ formatDate(lastCardDate) }}
              </p>
            </div>

            <!-- Bouton Practice Mode -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="practice-button"
                  :class="{ 'practice-button--colored': isColored }"
                  @click="startPracticeMode"
                >
                  <IconDumbbell />
                  {{ $t('practiceMode.button') }}
                </button>
                <button
                  type="button"
                  class="options-toggle-button"
                  :class="isColored ? 'text-white' : 'text-[var(--color-gray-500)]'"
                  @click="showPracticeOptions = !showPracticeOptions"
                >
                  <IconSettings />
                </button>
              </div>
              <p class="text-center text-xs" :class="isColored ? 'text-white/75' : 'text-[var(--color-secondary)]'">
                {{ $t('practiceMode.subtitle') }}
              </p>
            </div>

            <!-- Options Practice Mode -->
            <Transition name="practice-options">
              <div v-if="showPracticeOptions" class="mt-2">
                <div class="mb-3 flex items-center justify-between">
                  <p class="text-sm font-medium" :class="isColored ? 'text-white' : 'text-[var(--color-black)]'">
                    {{ $t('practiceMode.options') }}
                  </p>
                  <IconStar v-if="isFree" class="h-4 w-4 text-yellow-500" />
                </div>
                <PracticeModeOptions
                  v-model="practiceOptions"
                  :is-free="isFree"
                  :is-colored="isColored"
                  @premium-required="handlePremiumRequired"
                />
              </div>
            </Transition>
          </div>
        </div>

        <!-- Section IA -->
        <div class="mb-6">
          <p class="ai-section-title mb-3 text-xs font-semibold uppercase tracking-widest">
            {{ $t('aiCards.generate') }}
          </p>
          <div class="flex gap-3">
            <!-- Depuis une photo -->
            <button
              type="button"
              class="ai-button flex-1"
              :disabled="isGeneratingFromImage || isGeneratingAiCards"
              @click="handleOpenImageSelection"
            >
              <template v-if="isGeneratingFromImage">
                <IconSpinner class="h-4 w-4" />
              </template>
              <template v-else>
                <IconCamera class="h-4 w-4" />
                {{ $t('aiCardsFromImage.buttonShort') }}
                <IconLock v-if="isFree" class="ai-button__lock" />
              </template>
            </button>

            <!-- Depuis mes cartes -->
            <button
              type="button"
              class="ai-button flex-1"
              :disabled="cards.length < 4 || isGeneratingAiCards || isGeneratingFromImage"
              @click="handleGenerateAiCards"
            >
              <template v-if="isGeneratingAiCards">
                <IconSpinner class="h-4 w-4" />
              </template>
              <template v-else>
                <IconCardsStack class="h-4 w-4" />
                {{ $t('aiCards.generateShort') }}
                <IconLock v-if="isFree" class="ai-button__lock" />
              </template>
            </button>
          </div>
          <StatusMessage
            v-if="aiGenerationError || imageGenerationError"
            :message="{ type: 'error', text: (aiGenerationError || imageGenerationError)! }"
          />
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

      <!-- Modal de limitation gratuite -->
      <UpgradeModal
        :is-open="showUpgradeModal"
        :description="$t(upgradeModalMessage)"
        @close="showUpgradeModal = false"
      />

      <!-- Modal suggestions IA -->
      <AiCardSuggestions
        :is-open="showAiSuggestions"
        :is-loading="isGeneratingAiCards"
        :proposals="aiProposals"
        @close="showAiSuggestions = false"
        @accept="handleAiCardAccepted"
        @reject="handleAiCardRejected"
        @finished="showAiSuggestions = false"
      />

      <!-- Sélection de photos pour génération IA -->
      <ImageSelectionPreview
        :is-open="showImageSelection"
        :images="selectedImages"
        :is-picking-images="isPickingImages"
        :is-generating="isGeneratingFromImage"
        @close="handleCloseImageSelection"
        @remove="removeImage"
        @pick-camera="pickFromCamera"
        @pick-gallery="pickFromGallery"
        @generate="handleGenerateFromImages"
      />

      <!-- Modal suggestions IA depuis photo -->
      <AiCardSuggestions
        :is-open="showImageAiSuggestions"
        :is-loading="isGeneratingFromImage"
        :proposals="imageAiProposals"
        @close="showImageAiSuggestions = false"
        @accept="handleAiCardAccepted"
        @reject="handleAiCardRejected"
        @finished="showImageAiSuggestions = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCollections } from '~/composables/useCollections'
import { useCards } from '~/composables/useCards'
import { useSubscription } from '~/composables/useSubscription'
import { useAiCards, type AiCardProposal } from '~/composables/useAiCards'
import { useAiCardsFromImage } from '~/composables/useAiCardsFromImage'
import CardItem from '~/components/CardItem.vue'
import CreateCardItem from '~/components/CreateCardItem.vue'
import Select, { type SelectOption } from '~/components/Select.vue'
import PracticeModeOptions from '~/components/PracticeModeOptions.vue'
import IconSettings from '~/components/icons/IconSettings.vue'
import IconDumbbell from '~/components/icons/IconDumbbell.vue'
import IconStar from '~/components/icons/IconStar.vue'
import IconCardsStack from '~/components/icons/IconCardsStack.vue'
import IconCamera from '~/components/icons/IconCamera.vue'
import IconSpinner from '~/components/icons/IconSpinner.vue'
import IconLock from '~/components/icons/IconLock.vue'
import AiCardSuggestions from '~/components/AiCardSuggestions.vue'
import ImageSelectionPreview from '~/components/ImageSelectionPreview.vue'
import type { Collection } from '~/lib/types'

defineOptions({ name: 'CollectionCardsPage' })

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const {
  collections,
  isLoading: isLoadingCollection,
  error: collectionError,
  loadCollections,
  getCollection,
  addRejectedAiCard,
} = useCollections()
const {
  cards,
  isLoading: isLoadingCards,
  error: cardsError,
  loadCards,
  getLastCardDate,
  getTotalCardsCount,
  createCard: createCardInCollection,
} = useCards()
const { isFree, FREE_LIMITS } = useSubscription()
const { generateCards, isGenerating: isGeneratingAiCards } = useAiCards()
const {
  selectedImages,
  isPickingImages,
  isGenerating: isGeneratingFromImage,
  error: imageFromError,
  pickFromCamera,
  pickFromGallery,
  removeImage,
  reset: resetImageSelection,
  generateFromImages,
} = useAiCardsFromImage()

const collectionId = String(route.params.id)
const collection = ref<Collection | null>(null)
const isColored = computed(() => !!collection.value?.color && collection.value.color !== '#ffffff')
const lastCardDate = ref<Date | null>(null)
const sortBy = ref('newestFirst')
const showPracticeOptions = ref(false)
const showUpgradeModal = ref(false)
const upgradeModalMessage = ref('upgrade.cardLimit')
const showAiSuggestions = ref(false)
const aiProposals = ref<AiCardProposal[]>([])
const aiGenerationError = ref<string | null>(null)
const showImageSelection = ref(false)
const showImageAiSuggestions = ref(false)
const imageAiProposals = ref<AiCardProposal[]>([])
const imageGenerationError = ref<string | null>(null)
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
  // Vérifier la limite pour les utilisateurs gratuits
  if (isFree.value) {
    getTotalCardsCount().then((totalCards) => {
      if (totalCards >= FREE_LIMITS.MAX_CARDS) {
        upgradeModalMessage.value = 'upgrade.cardLimit'
        showUpgradeModal.value = true
        return
      }
      router.push(`/collections/${collectionId}/cards/create`)
    })
  } else {
    router.push(`/collections/${collectionId}/cards/create`)
  }
}

function handlePremiumRequired() {
  upgradeModalMessage.value = 'upgrade.practiceOptionsLimit'
  showUpgradeModal.value = true
}

async function handleGenerateAiCards() {
  if (isGeneratingAiCards.value) return

  if (isFree.value) {
    upgradeModalMessage.value = 'upgrade.aiCardsFeature'
    showUpgradeModal.value = true
    return
  }

  aiGenerationError.value = null
  aiProposals.value = []
  showAiSuggestions.value = true

  const currentCollection = getCollection(collectionId)
  const rejectedQuestions: string[] = currentCollection?.rejected_ai_cards
    ? JSON.parse(currentCollection.rejected_ai_cards)
    : []

  const result = await generateCards([...cards.value], locale.value, currentCollection?.name ?? '', rejectedQuestions)

  if (result.length === 0) {
    showAiSuggestions.value = false
    aiGenerationError.value = t('aiCards.error')
    return
  }

  aiProposals.value = result
}

async function handleAiCardAccepted(proposal: AiCardProposal) {
  try {
    await createCardInCollection(proposal.question, proposal.answer, collectionId)
  } catch {
    // Silently ignore duplicate question errors from AI suggestions
  }
}

function handleAiCardRejected(question: string) {
  addRejectedAiCard(collectionId, question)
}

function handleOpenImageSelection() {
  if (isGeneratingFromImage.value) return

  if (isFree.value) {
    upgradeModalMessage.value = 'upgrade.aiCardsFeature'
    showUpgradeModal.value = true
    return
  }

  imageGenerationError.value = null
  showImageSelection.value = true
}

function handleCloseImageSelection() {
  showImageSelection.value = false
  resetImageSelection()
}

async function handleGenerateFromImages() {
  if (isGeneratingFromImage.value) return

  const currentCollection = getCollection(collectionId)

  const result = await generateFromImages(
    locale.value,
    currentCollection?.name ?? '',
    cards.value.map((c) => ({ question: c.question, answer: c.answer }))
  )

  if (result.length === 0) {
    imageGenerationError.value = imageFromError.value ?? t('aiCards.error')
    showImageSelection.value = false
    resetImageSelection()
    return
  }

  imageAiProposals.value = result
  showImageSelection.value = false
  showImageAiSuggestions.value = true
  resetImageSelection()
}

function editCard(cardId: string) {
  router.push(`/collections/${collectionId}/cards/${cardId}/edit`)
}

function startPracticeMode() {
  const params = new URLSearchParams()
  if (practiceOptions.value.mostFailed) params.set('mostFailed', '1')
  if (practiceOptions.value.onlyDue) params.set('onlyDue', '1')
  if (practiceOptions.value.onlyNew) params.set('onlyNew', '1')
  if (practiceOptions.value.excludeNew) params.set('excludeNew', '1')
  if (practiceOptions.value.swapQuestionAnswer) params.set('swapQuestionAnswer', '1')

  const queryString = params.toString()
  const url = queryString
    ? `/collections/${collectionId}/practice?${queryString}`
    : `/collections/${collectionId}/practice`

  router.push(url)
}

function formatDate(date: Date): string {
  // Map i18n locale to Intl locale format
  const localeMap: Record<string, string> = {
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
    it: 'it-IT',
    pt: 'pt-PT',
    ru: 'ru-RU',
    zh: 'zh-CN',
    ja: 'ja-JP',
  }

  const intlLocale = localeMap[locale.value] || locale.value || 'en-US'

  return new Intl.DateTimeFormat(intlLocale, {
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

.practice-button--colored {
  color: var(--color-black);
  border-color: white;
}

.options-toggle-button {
  background: transparent;
  border: none;
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

/* Section IA */
.ai-section-title {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* Bouton AI */
.ai-button {
  padding: 12px 20px;
  background: var(--color-white);
  color: var(--color-secondary);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0px 4px 32px #0000000a;
}

.ai-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-button:not(:disabled):active {
  opacity: 0.85;
  transform: scale(0.98);
}

.ai-button {
  position: relative;
}

.ai-button--colored {
  border: 1.5px solid white;
}

.ai-button__lock {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 11px;
  height: 11px;
  color: var(--color-secondary);
  opacity: 0.9;
}
</style>
