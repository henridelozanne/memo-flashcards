import { ref } from 'vue'
import { registerPlugin } from '@capacitor/core'

interface InstagramSharePlugin {
  isInstagramAvailable(): Promise<{ available: boolean }>
  shareToStories(options: { imageBase64: string }): Promise<void>
}

const InstagramShare = registerPlugin<InstagramSharePlugin>('InstagramShare')

export function useInstagramShare() {
  const isInstagramAvailable = ref(false)

  InstagramShare.isInstagramAvailable()
    .then(({ available }) => {
      isInstagramAvailable.value = available
    })
    .catch(() => {
      isInstagramAvailable.value = false
    })

  async function shareImageToStories(imageFile: File): Promise<void> {
    const base64 = await fileToBase64(imageFile)
    await InstagramShare.shareToStories({ imageBase64: base64 })
  }

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Retire le préfixe data:image/png;base64,
        resolve(result.split(',')[1] ?? result)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return { isInstagramAvailable, shareImageToStories }
}
