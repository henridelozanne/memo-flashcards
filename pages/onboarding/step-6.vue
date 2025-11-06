<template>
  <NuxtLayout name="onboarding">
    <div class="flex h-full flex-col items-center justify-center px-6 pt-12">
      <!-- Titre -->
      <h1 class="mb-12 text-center text-2xl font-bold text-[var(--color-black)]">
        {{ $t('onboarding.step6.title') }}
      </h1>

      <!-- Bloc de texte avec mise en avant du chiffre -->
      <div class="mb-16 max-w-md text-center">
        <p class="text-base leading-relaxed text-gray-700">
          {{ $t('onboarding.step6.text1') }}
        </p>
        <p class="my-4 text-3xl font-bold text-[var(--color-black)]">
          {{ $t('onboarding.step6.highlight') }}
        </p>
        <p class="text-base leading-relaxed text-gray-700">
          {{ $t('onboarding.step6.text2') }}
        </p>
      </div>

      <!-- Image Harvard + légende -->
      <div class="flex items-center justify-center gap-4">
        <!-- Logo Harvard -->
        <img 
          src="~/assets/svg/Harvard_University_coat_of_arms.svg" 
          alt="Harvard University" 
          class="h-12 w-auto"
        />
        
        <!-- Légende -->
        <p class="max-w-xs text-sm text-gray-600">
          {{ $t('onboarding.step6.studyCaption') }}
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOnboardingStore } from '~/store/onboarding'

const onboardingStore = useOnboardingStore()

// Initialiser l'étape à 6
onMounted(() => {
  onboardingStore.currentStep = 6
})

defineOptions({ name: 'OnboardingStep6Page' })
</script>
