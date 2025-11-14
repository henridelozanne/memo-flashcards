<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <PageHeader :title="$t('settings.title')" :back-button-visible="true" @back="$router.back()" />

    <!-- Settings list -->
    <div class="mx-auto max-w-2xl space-y-2">
      <!-- Heure de rappel -->
      <SettingsItem
        :label="$t('settings.reminderTime')"
        :value="currentReminderTime"
        icon-color="blue"
        @click="() => {}"
      >
        <template #icon>
          <IconClock />
        </template>
      </SettingsItem>

      <!-- Abonnement -->
      <SettingsItem
        :label="$t('settings.subscription')"
        :value="subscriptionStatus"
        icon-color="purple"
        @click="() => {}"
      >
        <template #icon>
          <IconStar />
        </template>
      </SettingsItem>

      <!-- Langue -->
      <SettingsItem :label="$t('settings.language')" :value="currentLanguage" icon-color="green" @click="() => {}">
        <template #icon>
          <IconGlobe />
        </template>
      </SettingsItem>

      <!-- Demander une fonctionnalité -->
      <SettingsItem :label="$t('settings.featureRequest')" icon-color="green" @click="() => {}">
        <template #icon>
          <IconFeatureRequest />
        </template>
      </SettingsItem>

      <!-- Signaler un bug -->
      <SettingsItem :label="$t('settings.bugReport')" icon-color="orange" @click="() => {}">
        <template #icon>
          <IconBug />
        </template>
      </SettingsItem>

      <!-- Supprimer mes données -->
      <SettingsItem :label="$t('settings.deleteData')" icon-color="red" @click="() => {}">
        <template #icon>
          <IconTrash />
        </template>
      </SettingsItem>

      <!-- Mentions légales -->
      <SettingsItem :label="$t('settings.legalNotice')" @click="$router.push('/legal')">
        <template #icon>
          <IconDocument />
        </template>
      </SettingsItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOnboardingStore } from '~/store/onboarding'
import { LANGUAGE_NAMES } from '~/constants/languages'
import PageHeader from '~/components/PageHeader.vue'
import IconClock from '~/components/icons/IconClock.vue'
import IconStar from '~/components/icons/IconStar.vue'
import IconGlobe from '~/components/icons/IconGlobe.vue'
import IconFeatureRequest from '~/components/icons/IconFeatureRequest.vue'
import IconBug from '~/components/icons/IconBug.vue'
import IconTrash from '~/components/icons/IconTrash.vue'
import IconDocument from '~/components/icons/IconDocument.vue'

const { t, locale } = useI18n()
const onboardingStore = useOnboardingStore()

// Heure de rappel actuelle
const currentReminderTime = computed(() => onboardingStore.notificationHour || '08:00')

// Statut d'abonnement (à adapter selon votre logique)
const subscriptionStatus = computed(() => t('settings.subscriptionFree'))

// Langue actuelle
const currentLanguage = computed(() => LANGUAGE_NAMES[locale.value] || locale.value)

defineOptions({ name: 'SettingsPage' })
</script>
