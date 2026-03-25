<template>
  <div v-if="collection" class="mb-6 rounded-[15px] bg-[var(--color-light-blue)] p-4 shadow-[var(--shadow-light)] dark:bg-[var(--color-gray-200)]">
    <p class="text-sm text-[var(--color-accent-blue)]">
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
