import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { supabase } from '~/lib/supabase'
import { useRuntimeConfig } from 'nuxt/app'

const PREF_KEY = 'update_dismissed_for_version'

// État partagé entre toutes les instances du composable
const showUpdateModal = ref(false)
const availableVersion = ref('')
const storeUrl = ref('')

function isNewerVersion(current: string, remote: string): boolean {
  const currentParts = current.split('.').map(Number)
  const remoteParts = remote.split('.').map(Number)
  for (let i = 0; i < 3; i += 1) {
    const r = remoteParts[i] ?? 0
    const c = currentParts[i] ?? 0
    if (r > c) return true
    if (r < c) return false
  }
  return false
}

export const useAppUpdate = () => {
  const config = useRuntimeConfig()

  const checkForUpdate = async () => {
    const currentVersion = config.public.appVersion as string

    try {
      const { data, error } = await supabase
        .from('remote_config')
        .select('key, value')
        .in('key', ['latest_version', 'store_url_ios', 'store_url_android'])

      if (error || !data) return

      const remoteVersion = data.find((r) => r.key === 'latest_version')?.value
      if (!remoteVersion) return

      if (!isNewerVersion(currentVersion, remoteVersion)) return

      const { value: dismissedVersion } = await Preferences.get({ key: PREF_KEY })
      if (dismissedVersion === remoteVersion) return

      const platform = Capacitor.getPlatform()
      const urlIos = data.find((r) => r.key === 'store_url_ios')?.value ?? ''
      const urlAndroid = data.find((r) => r.key === 'store_url_android')?.value ?? ''
      storeUrl.value = platform === 'android' ? urlAndroid : urlIos

      availableVersion.value = remoteVersion
      showUpdateModal.value = true
    } catch {
      // Silencieux : ne pas bloquer l'app si la vérification échoue
    }
  }

  const dismissUpdate = async () => {
    await Preferences.set({ key: PREF_KEY, value: availableVersion.value })
    showUpdateModal.value = false
  }

  const openStore = async () => {
    showUpdateModal.value = false
    if (storeUrl.value) {
      window.open(storeUrl.value, '_system')
    }
  }

  return { showUpdateModal, availableVersion, storeUrl, checkForUpdate, dismissUpdate, openStore }
}
