<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <PageHeader :title="$t('settings.title')" :back-button-visible="true" @back="$router.back()" />

    <!-- Settings list -->
    <div class="mx-auto max-w-2xl space-y-2">
      <!-- Heure de rappel -->
      <SettingsItem :label="$t('settings.reminderTime')" :value="currentReminderTime" @click="openTimePicker">
        <template #icon>
          <IconClock />
        </template>
      </SettingsItem>

      <!-- Time picker invisible -->
      <input
        ref="timeInput"
        v-model="selectedTime"
        type="time"
        class="pointer-events-none absolute opacity-0"
        style="width: 1px; height: 1px"
        @blur="handleTimeChange"
      />

      <!-- Abonnement -->
      <SettingsItem :label="$t('settings.subscription')" :value="subscriptionStatus" @click="() => {}">
        <template #icon>
          <IconStar />
        </template>
      </SettingsItem>

      <!-- Langue -->
      <SettingsItem :label="$t('settings.language')" :value="currentLanguage" @click="openLanguageSelector">
        <template #icon>
          <IconGlobe />
        </template>
      </SettingsItem>

      <!-- Language selector invisible -->
      <select
        ref="languageSelect"
        v-model="selectedLanguage"
        class="pointer-events-none absolute opacity-0"
        style="width: 1px; height: 1px"
        @change="handleLanguageChange"
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>

      <!-- Demander une fonctionnalité -->
      <SettingsItem :label="$t('settings.featureRequest')" @click="$router.push('/feature-request')">
        <template #icon>
          <IconFeatureRequest />
        </template>
      </SettingsItem>

      <!-- Signaler un bug -->
      <SettingsItem :label="$t('settings.bugReport')" @click="$router.push('/bug-report')">
        <template #icon>
          <IconBug />
        </template>
      </SettingsItem>

      <!-- Supprimer mes données -->
      <SettingsItem :label="$t('settings.deleteData')" @click="() => {}">
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

    <!-- Status Message -->
    <StatusMessage
      v-if="statusMessage || languageStatusMessage"
      :message="statusMessage || languageStatusMessage"
      class="mx-auto mt-4 max-w-2xl"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserProfileStore } from '~/store/userProfile'
import { useNotificationTime } from '~/composables/useNotificationTime'
import { useLanguageSelector } from '~/composables/useLanguageSelector'
import { LANGUAGE_NAMES } from '~/constants/languages'
import PageHeader from '~/components/PageHeader.vue'
import StatusMessage from '~/components/StatusMessage.vue'
import IconClock from '~/components/icons/IconClock.vue'
import IconStar from '~/components/icons/IconStar.vue'
import IconGlobe from '~/components/icons/IconGlobe.vue'
import IconFeatureRequest from '~/components/icons/IconFeatureRequest.vue'
import IconBug from '~/components/icons/IconBug.vue'
import IconTrash from '~/components/icons/IconTrash.vue'
import IconDocument from '~/components/icons/IconDocument.vue'

const { t } = useI18n()
const userProfileStore = useUserProfileStore()
const { timeInput, selectedTime, statusMessage, openTimePicker, handleTimeChange } = useNotificationTime()
const {
  languageSelect,
  selectedLanguage,
  statusMessage: languageStatusMessage,
  openLanguageSelector,
  handleLanguageChange,
} = useLanguageSelector()

// Heure de rappel actuelle
const currentReminderTime = computed(() => userProfileStore.notificationHour || '20:00')

// Statut d'abonnement (à adapter selon votre logique)
const subscriptionStatus = computed(() => t('settings.subscriptionFree'))

// Langue actuelle
const currentLanguage = computed(() => LANGUAGE_NAMES[userProfileStore.language] || userProfileStore.language)

defineOptions({ name: 'SettingsPage' })
</script>
