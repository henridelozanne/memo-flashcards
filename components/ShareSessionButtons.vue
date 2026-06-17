<template>
  <button
    class="flex w-full items-center justify-center gap-2 rounded-[15px] border border-[var(--color-primary)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary)] shadow-sm transition active:bg-[var(--color-light-purple)] disabled:opacity-60"
    :disabled="!imageFile"
    @click="showSheet = true"
  >
    <IconShare class="h-4 w-4" />
    {{ $t('review.shareButton') }}
  </button>

  <ShareSheet v-model="showSheet" :image-file="imageFile" :share-text="shareText" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useShareImage } from '~/composables/useShareImage'
import IconShare from '~/components/icons/IconShare.vue'
import ShareSheet from '~/components/ShareSheet.vue'

const props = defineProps({
  cardsReviewedCount: { type: Number, required: true },
  goodCount: { type: Number, required: true },
  successRate: { type: Number, required: true },
  xpScore: { type: Number, default: 0 },
})

const { t } = useI18n()
const { generateSessionShareImage } = useShareImage()

const showSheet = ref(false)
const imageFile = ref<File | null>(null)

const shareText = computed(() => t('review.shareText', { percent: props.successRate }))

onMounted(async () => {
  imageFile.value = await generateSessionShareImage({
    goodCount: props.goodCount,
    cardsReviewedCount: props.cardsReviewedCount,
    successRate: props.successRate,
    xpScore: props.xpScore,
  })
})
</script>
