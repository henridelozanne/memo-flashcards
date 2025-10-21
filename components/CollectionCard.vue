<template>
  <div
    class="flex cursor-pointer flex-col rounded-lg border bg-white p-4 shadow transition hover:shadow-md"
    @click="handleClick"
  >
    <div class="mb-2 text-lg font-semibold">{{ collection.name }}</div>
    <div class="mb-4 text-sm text-gray-500">
      <!-- Slot pour infos supplémentaires (ex: nombre de cartes) -->
      <slot name="info">0 cartes</slot>
    </div>
    <div class="mt-auto flex gap-2">
      <button v-if="onEdit" class="text-xs text-blue-600 hover:underline" @click.stop="onEdit(collection.id)">
        {{ $t('collections.edit') }}
      </button>
      <button v-if="onDelete" class="text-xs text-red-500 hover:underline" @click.stop="onDelete(collection)">
        {{ $t('common.delete') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Collection } from '~/lib/types'

const props = defineProps<{
  collection: Collection
  onEdit?: (id: string) => void
  onDelete?: (collection: Collection) => void
  onClick?: (id: string) => void
}>()

function handleClick() {
  if (props.onClick) props.onClick(props.collection.id)
}
</script>
