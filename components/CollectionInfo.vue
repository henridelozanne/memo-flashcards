<template>
  <div v-if="collection" class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
    <p class="text-sm text-blue-700">
      <span class="font-medium">{{ $t('collections.collection') }}:</span>
      {{ collection.name }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Collection } from '~/lib/types'

defineProps<{
  collection: Collection | null
}>()
</script>
