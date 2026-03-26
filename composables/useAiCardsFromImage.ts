import { ref } from 'vue'
import { Camera, CameraResultType, CameraSource, GalleryPhotos } from '@capacitor/camera'
import imageCompression from 'browser-image-compression'
import type { AiCardProposal } from './useAiCards'

export interface SelectedImage {
  id: string
  webPath: string // pour l'affichage du thumbnail
  base64: string // pour l'envoi à l'API (sans le préfixe data:...)
}

let supabaseInstance: any = null

async function getSupabase() {
  if (!supabaseInstance) {
    const { supabase } = await import('../lib/supabase')
    supabaseInstance = supabase
  }
  return supabaseInstance
}

async function compressAndConvertToBase64(webPath: string): Promise<string> {
  const response = await fetch(webPath)
  const blob = await response.blob()

  const compressed = await imageCompression(blob as File, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1600,
    useWebWorker: false,
    fileType: 'image/jpeg',
  })

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // Retirer le préfixe "data:image/jpeg;base64,"
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(compressed)
  })
}

export const useAiCardsFromImage = () => {
  const selectedImages = ref<SelectedImage[]>([])
  const isPickingImages = ref(false)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)
  const proposals = ref<AiCardProposal[]>([])

  let idCounter = 0
  function nextId() {
    idCounter += 1
    return `img-${Date.now()}-${idCounter}`
  }

  async function pickFromCamera(): Promise<void> {
    try {
      isPickingImages.value = true
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
        correctOrientation: true,
      })

      if (photo.webPath) {
        const base64 = await compressAndConvertToBase64(photo.webPath)
        selectedImages.value.push({ id: nextId(), webPath: photo.webPath, base64 })
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.log('[useAiCardsFromImage] pickFromCamera error:', msg)
      if (
        !msg.includes('cancelled') &&
        !msg.includes('canceled') &&
        !msg.includes('No image picked') &&
        !msg.includes('User cancelled')
      ) {
        error.value = msg
      }
    } finally {
      isPickingImages.value = false
    }
  }

  async function pickFromGallery(): Promise<void> {
    try {
      isPickingImages.value = true
      const result: GalleryPhotos = await Camera.pickImages({
        quality: 90,
        limit: 10,
        correctOrientation: true,
      })

      const newImages = await Promise.all(
        result.photos.map(async (photo) => {
          const base64 = await compressAndConvertToBase64(photo.webPath)
          return { id: nextId(), webPath: photo.webPath, base64 }
        })
      )

      selectedImages.value.push(...newImages)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.log('[useAiCardsFromImage] pickFromGallery error:', msg)
      if (
        !msg.includes('cancelled') &&
        !msg.includes('canceled') &&
        !msg.includes('No image picked') &&
        !msg.includes('User cancelled')
      ) {
        error.value = msg
      }
    } finally {
      isPickingImages.value = false
    }
  }

  function removeImage(id: string): void {
    selectedImages.value = selectedImages.value.filter((img) => img.id !== id)
  }

  function reset(): void {
    selectedImages.value = []
    isGenerating.value = false
    error.value = null
    proposals.value = []
  }

  async function generateFromImages(
    locale: string,
    categoryName: string,
    existingCards: { question: string; answer: string }[] = []
  ): Promise<AiCardProposal[]> {
    if (selectedImages.value.length === 0) {
      error.value = 'No images selected'
      return []
    }

    isGenerating.value = true
    error.value = null
    proposals.value = []

    try {
      const supabase = await getSupabase()

      const { data, error: fnError } = await supabase.functions.invoke('generate-cards-from-image', {
        body: {
          images: selectedImages.value.map((img) => img.base64),
          locale,
          categoryName,
          existingCards,
        },
      })

      if (fnError) {
        throw new Error(fnError.message || 'Error calling AI service')
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      if (!data?.proposals || !Array.isArray(data.proposals)) {
        throw new Error('Invalid response from AI service')
      }

      proposals.value = data.proposals as AiCardProposal[]
      return proposals.value
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Unexpected error'
      return []
    } finally {
      isGenerating.value = false
    }
  }

  return {
    selectedImages,
    isPickingImages,
    isGenerating,
    error,
    proposals,
    pickFromCamera,
    pickFromGallery,
    removeImage,
    reset,
    generateFromImages,
  }
}
