<template>
  <div class="min-h-screen bg-[var(--color-gray-50)] p-6">
    <!-- Header -->
    <div class="mb-8 flex items-center">
      <BackButton class="mr-4" @click="$router.back()" />
      <h1 class="text-2xl font-bold text-[var(--color-black)]">{{ $t('settings.legalNotice') }}</h1>
    </div>

    <!-- Content -->
    <div class="mx-auto max-w-2xl">
      <div class="rounded-xl bg-[var(--color-white)] p-6 shadow-sm">
        <p class="text-[var(--color-secondary)]">
          {{ $t('legal.content') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'LegalPage' })
</script>
