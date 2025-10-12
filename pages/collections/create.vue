<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-md mx-auto">
      <!-- Header avec retour -->
      <div class="flex items-center mb-6">
  <button class="mr-4 text-gray-600 hover:text-gray-800" @click="$router.push('/')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
  <h1 class="text-2xl font-bold" data-testid="heading-create">{{ $t('collections.createTitle') }}</h1>
      </div>

      <!-- Formulaire -->
  <div class="bg-white rounded-lg shadow p-6" data-testid="create-form">
        <CollectionForm
          :is-submitting="isSubmitting"
          submit-label="Créer"
          @submit="onSubmit"
          @cancel="router.back()"
        />
      </div>

      <!-- Message de succès/erreur -->
      <div v-if="message" class="mt-4 p-4 rounded-md" :class="message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCollections } from '~/composables/useCollections'

const router = useRouter()
const { t } = useI18n()
const { createCollection } = useCollections()
const isSubmitting = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

async function onSubmit(name: string) {
  isSubmitting.value = true
  message.value = null
  try {
    await createCollection(name)
    message.value = { type: 'success', text: t('collections.createdSuccess') as string }
    setTimeout(() => router.push('/'), 2000)
  } catch (error) {
    message.value = { 
      type: 'error', 
      text: error instanceof Error ? error.message : (t('collections.createdError') as string)
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
