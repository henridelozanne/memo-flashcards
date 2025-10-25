<template>
  <div v-if="collection" class="mb-6 rounded-[15px] bg-[var(--color-light-blue)] p-4 shadow-[0px_4px_32px_#0000000a]">
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
