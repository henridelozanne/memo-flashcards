import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('useDeleteData', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with showDeleteConfirm as false', async () => {
    const { useDeleteData } = await import('~/composables/useDeleteData')
    const { showDeleteConfirm } = useDeleteData()
    expect(showDeleteConfirm.value).toBe(false)
  })

  it('should initialize with isDeleting as false', async () => {
    const { useDeleteData } = await import('~/composables/useDeleteData')
    const { isDeleting } = useDeleteData()
    expect(isDeleting.value).toBe(false)
  })

  it('should open delete confirmation dialog', async () => {
    const { useDeleteData } = await import('~/composables/useDeleteData')
    const { showDeleteConfirm, openDeleteConfirm } = useDeleteData()
    expect(showDeleteConfirm.value).toBe(false)

    openDeleteConfirm()

    expect(showDeleteConfirm.value).toBe(true)
  })

  it('should close delete confirmation dialog', async () => {
    const { useDeleteData } = await import('~/composables/useDeleteData')
    const { showDeleteConfirm, openDeleteConfirm, closeDeleteConfirm } = useDeleteData()
    openDeleteConfirm()
    expect(showDeleteConfirm.value).toBe(true)

    closeDeleteConfirm()

    expect(showDeleteConfirm.value).toBe(false)
  })
})
