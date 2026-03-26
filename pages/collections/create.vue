<template>
  <div class="h-full p-6 pb-10">
    <div class="mx-auto max-w-md">
      <!-- Header avec retour -->
      <PageHeader
        :title="$t('collections.createTitle')"
        test-id="heading-create"
        back-button-visible
        @back="$router.push('/')"
      />

      <!-- Formulaire -->
      <div
        class="mb-8 rounded-[15px] border p-6 shadow-[0px_4px_32px_#0000000a]"
        style="background-color: var(--color-white); border-color: var(--color-gray-200)"
        data-testid="create-form"
      >
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

async function onSubmit({ name, color, cardBackground }: { name: string; color: string; cardBackground: string }) {
  isSubmitting.value = true
  message.value = null
  try {
    const collection = await createCollection(name, color, cardBackground)
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
