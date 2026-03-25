<template>
  <div
    class="relative flex aspect-[3/4] h-72 w-full max-w-56 cursor-pointer flex-col items-center justify-center rounded-[15px] border-2 border-dashed p-4 transition hover:bg-[var(--color-light-purple)]"
    style="border-color: var(--color-accent-purple); background-color: var(--color-white)"
    @click="$emit('click')"
  >
    <div class="flex flex-col items-center justify-center text-center">
      <span class="mb-2 text-4xl text-[var(--color-accent-purple)]">+</span>
      <span class="text-sm font-medium" style="color: var(--color-cta-text)">{{ $t('cards.createCard') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>
