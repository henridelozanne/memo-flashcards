<template>
  <div class="flex flex-col border rounded-lg p-4 bg-white shadow hover:shadow-md transition cursor-pointer">
    <div class="font-semibold text-lg mb-2">{{ collection.name }}</div>
    <div class="text-gray-500 text-sm mb-4">
      <!-- Slot pour infos supplémentaires (ex: nombre de cartes) -->
      <slot name="info">0 cartes</slot>
    </div>
    <div class="flex gap-2 mt-auto">
      <button v-if="onEdit" @click.stop="onEdit(collection.id)" class="text-xs text-blue-600 hover:underline">Modifier</button>
      <button v-if="onDelete" @click.stop="onDelete(collection)" class="text-xs text-red-500 hover:underline">Supprimer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Collection } from '~/lib/types'

defineProps<{
  collection: Collection
  onEdit?: (id: string) => void
  onDelete?: (collection: Collection) => void
}>()
</script>
