<template>
  <div class="flex h-full flex-col p-6">
    <PageHeader :title="$t('settings.featureRequest')" :back-button-visible="true" @back="$router.back()" />

    <div class="mx-auto w-full max-w-2xl">
      <form v-if="!submitted" class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div>
          <label for="name" class="mb-2 block text-sm font-medium text-[var(--color-black)]">{{
            $t('contact.name')
          }}</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="w-full rounded-[15px] border bg-[var(--color-white)] px-4 py-2 text-[var(--color-black)]"
            :class="errors.name ? 'border-[var(--color-accent-red)]' : 'border-[var(--color-gray-200)]'"
            :placeholder="$t('contact.namePlaceholder')"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-[var(--color-accent-red)]">{{ errors.name }}</p>
        </div>

        <div>
          <label for="email" class="mb-2 block text-sm font-medium text-[var(--color-black)]">{{
            $t('contact.email')
          }}</label>
          <input
            id="email"
            v-model="formData.email"
            type="text"
            autocapitalize="none"
            class="w-full rounded-[15px] border bg-[var(--color-white)] px-4 py-2 text-[var(--color-black)]"
            :class="errors.email ? 'border-[var(--color-accent-red)]' : 'border-[var(--color-gray-200)]'"
            :placeholder="$t('contact.emailPlaceholder')"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-[var(--color-accent-red)]">{{ errors.email }}</p>
        </div>

        <div>
          <label for="message" class="mb-2 block text-sm font-medium text-[var(--color-black)]">{{
            $t('contact.message')
          }}</label>
          <textarea
            id="message"
            v-model="formData.message"
            class="w-full resize-none rounded-[15px] border bg-[var(--color-white)] px-4 py-2 text-[var(--color-black)]"
            style="height: 200px"
            :class="errors.message ? 'border-[var(--color-accent-red)]' : 'border-[var(--color-gray-200)]'"
            :placeholder="$t('contact.featureRequestPlaceholder')"
          />
          <p v-if="errors.message" class="mt-1 text-sm text-[var(--color-accent-red)]">{{ errors.message }}</p>
        </div>

        <p v-if="globalError" class="text-sm text-[var(--color-accent-red)]">{{ globalError }}</p>

        <button
          type="submit"
          class="w-full rounded-[15px] bg-[var(--color-primary)] px-6 py-3 font-semibold text-[var(--color-white)]"
        >
          {{ $t('contact.send') }}
        </button>
      </form>

      <div v-else class="mt-8 rounded-[15px] bg-[var(--color-white)] px-6 py-8 text-center shadow-lg">
        <h3 class="mb-2 text-xl font-semibold text-[var(--color-black)]">{{ $t('contact.success') }}</h3>
        <p class="mb-6 text-[var(--color-secondary)]">{{ $t('contact.successMessage') }}</p>
        <button
          class="rounded-[15px] bg-[var(--color-primary)] px-6 py-3 font-semibold text-[var(--color-white)]"
          @click="$router.back()"
        >
          {{ $t('common.back') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRuntimeConfig } from 'nuxt/app'

defineOptions({ name: 'FeatureRequestPage' })

const { t } = useI18n()
const config = useRuntimeConfig()

const formData = ref({
  name: '',
  email: '',
  message: '',
})

const errors = ref({
  name: '',
  email: '',
  message: '',
})

const globalError = ref('')
const submitted = ref(false)
const isSubmitting = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateForm() {
  errors.value = { name: '', email: '', message: '' }
  let isValid = true

  if (!formData.value.name.trim()) {
    errors.value.name = t('form.nameRequired') as string
    isValid = false
  }

  if (!formData.value.email.trim()) {
    errors.value.email = t('form.emailRequired') as string
    isValid = false
  } else if (!emailRegex.test(formData.value.email.trim())) {
    errors.value.email = t('form.emailInvalid') as string
    isValid = false
  }

  if (!formData.value.message.trim()) {
    errors.value.message = t('form.messageRequired') as string
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) return

  isSubmitting.value = true
  globalError.value = ''

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: config.public.web3formsKey,
        subject: 'Nouvelle demande de fonctionnalité - Remember',
        name: formData.value.name,
        email: formData.value.email,
        message: formData.value.message,
      }),
    })

    const result = await response.json()

    if (result.success) {
      submitted.value = true
    } else {
      console.error('Error:', result)
      globalError.value = result.message || t('contact.sendError')
    }
  } catch (error) {
    console.error('Error:', error)
    globalError.value = t('contact.sendError')
  } finally {
    isSubmitting.value = false
  }
}
</script>
