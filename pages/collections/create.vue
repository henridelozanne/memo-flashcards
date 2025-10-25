<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mx-auto max-w-md">
      <!-- Header avec retour -->
      <PageHeader
        :title="$t('collections.createTitle')"
        test-id="heading-create"
        back-button-visible
        @back="$router.push('/')"
      />

      <!-- Formulaire -->
      <div class="rounded-lg bg-white p-6 shadow" data-testid="create-form">
        <CollectionForm
          :is-submitting="isSubmitting"
          :submit-label="$t('collections.create')"
          @submit="onSubmit"
          @cancel="router.back()"
        />
      </div>

      <!-- Message de succès/erreur -->
      <StatusMessage :message="message" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCollections } from '~/composables/useCollections'

defineOptions({ name: 'CreateCollectionPage' })

const router = useRouter()
const { t } = useI18n()
const { createCollection } = useCollections()
const isSubmitting = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

async function onSubmit(name: string) {
  isSubmitting.value = true
  message.value = null
  try {
    const collection = await createCollection(name)
    message.value = {
      type: 'success',
      text: t('collections.createdSuccess') as string,
    }
    router.push(`/collections/${collection.id}/cards`)
  } catch (error) {
    message.value = {
      type: 'error',
      text: error instanceof Error ? error.message : (t('collections.createdError') as string),
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
