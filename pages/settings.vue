<template>
  <div class="h-full p-6">
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

      <!-- Abonnement - Temporairement masqué pour v1.0 -->
      <!-- <SettingsItem
        :label="$t('settings.subscription')"
        :value="subscriptionStatus"
        :show-arrow="false"
        @click="() => {}"
      >
        <template #icon>
          <IconStar />
        </template>
      </SettingsItem> -->

      <!-- Restaurer les achats - Temporairement masqué pour v1.0 -->
      <!-- <SettingsItem
        v-if="!subscriptionStore.isSubscribed"
        :label="$t('settings.restorePurchases')"
        @click="handleRestorePurchases"
      >
        <template #icon>
          <IconRefresh />
        </template>
      </SettingsItem> -->

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
      <SettingsItem :label="$t('settings.deleteData')" @click="openDeleteConfirm">
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

    <!-- Delete confirmation modal -->
    <ConfirmModal
      :open="showDeleteConfirm"
      :title="$t('settings.deleteDataConfirmTitle')"
      :confirm-label="$t('settings.deleteDataConfirm')"
      :cancel-label="$t('common.cancel')"
      :loading="isDeleting"
      @cancel="closeDeleteConfirm"
      @confirm="handleDeleteData"
    >
      {{ $t('settings.deleteDataConfirmMessage') }}
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserProfileStore } from '~/store/userProfile'
import { useSubscriptionStore } from '~/store/subscription'
import { useNotificationTime } from '~/composables/useNotificationTime'
import { useLanguageSelector } from '~/composables/useLanguageSelector'
import { useDeleteData } from '~/composables/useDeleteData'
import { useSubscription } from '~/composables/useSubscription'
import { LANGUAGE_NAMES } from '~/constants/languages'
import PageHeader from '~/components/PageHeader.vue'
import StatusMessage from '~/components/StatusMessage.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import IconClock from '~/components/icons/IconClock.vue'
// import IconStar from '~/components/icons/IconStar.vue' // v1.0: Temporairement masqué
import IconGlobe from '~/components/icons/IconGlobe.vue'
import IconFeatureRequest from '~/components/icons/IconFeatureRequest.vue'
import IconBug from '~/components/icons/IconBug.vue'
import IconTrash from '~/components/icons/IconTrash.vue'
import IconDocument from '~/components/icons/IconDocument.vue'
// import IconRefresh from '~/components/icons/IconRefresh.vue' // v1.0: Temporairement masqué

const { t } = useI18n()
const userProfileStore = useUserProfileStore()
// const subscriptionStore = useSubscriptionStore() // v1.0: Temporairement masqué
// const { restorePurchases } = useSubscription() // v1.0: Temporairement masqué
const { selectedTime, statusMessage, openTimePicker, handleTimeChange } = useNotificationTime()
const {
  selectedLanguage,
  statusMessage: languageStatusMessage,
  openLanguageSelector,
  handleLanguageChange,
} = useLanguageSelector()
const { showDeleteConfirm, isDeleting, openDeleteConfirm, closeDeleteConfirm, handleDeleteData } = useDeleteData()

// const restoreStatusMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null) // v1.0: Temporairement masqué

// Heure de rappel actuelle
const currentReminderTime = computed(() => userProfileStore.notificationHour || '20:00')

// Statut d'abonnement - v1.0: Temporairement masqué
// const subscriptionStatus = computed(() => {
//   if (subscriptionStore.isSubscribed) {
//     const plan = subscriptionStore.currentPlan
//     if (subscriptionStore.isInFreeTrial) {
//       return t('settings.subscriptionTrialActive')
//     }
//     return plan ? t('settings.subscriptionActive', { plan }) : t('settings.subscriptionActive')
//   }
//   return t('settings.subscriptionFree')
// })

// Langue actuelle
const currentLanguage = computed(() => LANGUAGE_NAMES[userProfileStore.language] || userProfileStore.language)

// Restaurer les achats - v1.0: Temporairement masqué
// async function handleRestorePurchases() {
//   try {
//     restoreStatusMessage.value = { type: 'success', text: t('settings.restoringPurchases') }
//     const customerInfo = await restorePurchases()

//     if (customerInfo && subscriptionStore.isSubscribed) {
//       restoreStatusMessage.value = { type: 'success', text: t('settings.restorePurchasesSuccess') }
//     } else {
//       restoreStatusMessage.value = { type: 'success', text: t('settings.restorePurchasesNone') }
//     }

//     // Clear message after 3 seconds
//     setTimeout(() => {
//       restoreStatusMessage.value = null
//     }, 3000)
//   } catch (error) {
//     console.error('Failed to restore purchases:', error)
//     restoreStatusMessage.value = { type: 'error', text: t('settings.restorePurchasesError') }

//     setTimeout(() => {
//       restoreStatusMessage.value = null
//     }, 3000)
//   }
// }

defineOptions({ name: 'SettingsPage' })
</script>
