<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mx-auto max-w-md">
      <PageHeader
        :title="$t('collections.editTitle')"
        test-id="heading-edit"
        back-button-visible
        @back="$router.back()"
      />

      <div v-if="!collection && isLoading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">{{ $t('common.loading') }}</span>
      </div>

      <div
        v-else-if="!collection && error"
        class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
      >
        {{ error }}
        <button class="ml-2 underline" @click="init">
          {{ $t('common.retry') }}
        </button>
      </div>

      <div v-else-if="!collection" class="text-center text-gray-600">
        {{ $t('collections.notFound') }}
      </div>

      <div v-else class="rounded-lg bg-white p-6 shadow">
        <CollectionForm
          :name="collection.name"
          :is-submitting="isSubmitting"
          :submit-label="$t('common.save')"
          @submit="onSubmit"
          @cancel="router.back()"
        />
      </div>

      <StatusMessage :message="message" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCollections } from '~/composables/useCollections'
import type { Collection } from '~/lib/types'

defineOptions({ name: 'CollectionsEditPage' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { collections, isLoading, error, loadCollections, getCollection, updateCollection } = useCollections()

const collection = ref<Collection | null>(null)
const isSubmitting = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

async function init() {
  message.value = null
  if (!collections.value.length && !isLoading.value) {
    await loadCollections()
  }
  const id = String(route.params.id)
  collection.value = getCollection(id)
}

init()

async function onSubmit(name: string) {
  if (!collection.value) return
  isSubmitting.value = true
  message.value = null
  try {
    await updateCollection(collection.value.id, name)
    message.value = {
      type: 'success',
      text: t('collections.updatedSuccess') as string,
    }
    setTimeout(() => router.push('/'), 1500)
  } catch (err) {
    message.value = {
      type: 'error',
      text: err instanceof Error ? err.message : (t('collections.updatedError') as string),
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
