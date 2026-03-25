<template>
  <div
    class="flex cursor-pointer flex-col rounded-[15px] p-4 shadow-[0px_4px_32px_#0000000a] transition hover:shadow-md"
    :style="{
      background: collection.color && collection.color !== '#ffffff' ? collection.color : 'var(--color-white)',
    }"
    @click="handleClick"
  >
    <div class="mb-2 text-lg font-semibold" :class="isColored ? 'text-white' : 'text-[var(--color-black)]'">
      {{ collection.name }}
    </div>
    <div class="mb-4 text-sm" :class="isColored ? 'text-white/75' : 'text-[var(--color-secondary)]'">
      {{ $t('cards.cardCount', { count: cardCount }) }}
    </div>
    <div class="mt-auto flex gap-2">
      <button
        v-if="onEdit"
        class="text-xs hover:underline"
        :class="isColored ? 'text-white/80' : 'text-[var(--color-accent-blue)]'"
        @click.stop="onEdit(collection.id)"
      >
        {{ $t('collections.edit') }}
      </button>
      <button
        v-if="onDelete"
        class="text-xs hover:underline"
        :class="isColored ? 'text-white/80' : 'text-[var(--color-accent-red)]'"
        @click.stop="onDelete(collection)"
      >
        {{ $t('common.delete') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCards } from '~/composables/useCards'
import type { Collection } from '~/lib/types'

const props = defineProps<{
  collection: Collection
  onEdit?: (id: string) => void
  onDelete?: (collection: Collection) => void
  onClick?: (id: string) => void
}>()

const { getCardsCount } = useCards()
const cardCount = ref(0)
const isColored = computed(() => !!props.collection.color && props.collection.color !== '#ffffff')

onMounted(async () => {
  try {
    cardCount.value = await getCardsCount(props.collection.id)
  } catch (e) {
    console.error('Erreur lors du chargement du compteur de cartes:', e)
    cardCount.value = 0
  }
})

function handleClick() {
  if (props.onClick) props.onClick(props.collection.id)
}
</script>
