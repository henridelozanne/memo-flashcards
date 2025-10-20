<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-md mx-auto">
      <PageHeader 
        :title="$t('collections.editTitle')"
        test-id="heading-edit"
        back-button-visible
        @back="$router.back()"
      />

      <div v-if="!collection && isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">{{ $t('common.loading') }}</span>
      </div>

      <div v-else-if="!collection && error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
        <button class="ml-2 underline" @click="init">{{ $t('common.retry') }}</button>
      </div>

      <div v-else-if="!collection" class="text-center text-gray-600">
        {{ $t('collections.notFound') }}
      </div>

      <div v-else class="bg-white rounded-lg shadow p-6">
        <CollectionForm
          :name="collection.name"
          :is-submitting="isSubmitting"
          :submit-label="$t('common.save')"
          @submit="onSubmit"
          @cancel="router.back()"
        />
      </div>

      <div v-if="message" class="mt-4 p-4 rounded-md" :class="message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
        {{ message.text }}
      </div>
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
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

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
    message.value = { type: 'success', text: t('collections.updatedSuccess') as string }
    setTimeout(() => router.push('/'), 1500)
  } catch (err) {
    message.value = { type: 'error', text: err instanceof Error ? err.message : (t('collections.updatedError') as string) }
  } finally {
    isSubmitting.value = false
  }
}
</script>
