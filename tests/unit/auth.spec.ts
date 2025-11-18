import { describe, it, expect, vi, beforeEach } from 'vitest'
import useSupabaseAuth from '@/composables/useSupabaseAuth'

// Mock environment variables
vi.mock('@/lib/supabase', async () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
      signInAnonymously: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  }
  return {
    supabase: mockSupabase,
    getUserId: () => mockSupabase.auth.getUser()?.data?.user?.id ?? null,
  }
})

// Import after mocks are set up
const { supabase } = await import('@/lib/supabase')

describe('useSupabaseAuth', () => {
  const mockUserId = 'test-user-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with anonymous auth if no session exists', async () => {
    // Mock no existing session
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    // Mock successful anonymous sign in
    vi.mocked(supabase.auth.signInAnonymously).mockResolvedValueOnce({
      data: {
        user: {
          id: mockUserId,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: undefined,
          phone: undefined,
          confirmed_at: undefined,
          email_confirmed_at: undefined,
          phone_confirmed_at: undefined,
          last_sign_in_at: undefined,
          role: undefined,
          updated_at: undefined,
        },
        session: {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: mockUserId,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email: undefined,
            phone: undefined,
            confirmed_at: undefined,
            email_confirmed_at: undefined,
            phone_confirmed_at: undefined,
            last_sign_in_at: undefined,
            role: undefined,
            updated_at: undefined,
          },
        },
      },
      error: null,
    })

    const { initAuth, userId, error } = useSupabaseAuth()
    await initAuth()

    // Test the sequence of operations
    expect(supabase.auth.getSession).toHaveBeenCalled()
    expect(supabase.auth.signInAnonymously).toHaveBeenCalled()

    // Verify userId is set correctly
    expect(userId.value).toBe(mockUserId)
    expect(error.value).toBeNull()
  })

  it('uses existing session if available', async () => {
    // Mock existing session
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: mockUserId,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email: undefined,
            phone: undefined,
            confirmed_at: undefined,
            email_confirmed_at: undefined,
            phone_confirmed_at: undefined,
            last_sign_in_at: undefined,
            role: undefined,
            updated_at: undefined,
          },
        },
      },
      error: null,
    })

    const { initAuth, userId, error } = useSupabaseAuth()
    await initAuth()

    expect(supabase.auth.getSession).toHaveBeenCalled()
    expect(supabase.auth.signInAnonymously).not.toHaveBeenCalled()
    expect(userId.value).toBe(mockUserId)
    expect(error.value).toBeNull()
  })

  it('falls back to local ID generation on auth error', async () => {
    // Mock auth error
    vi.mocked(supabase.auth.getSession).mockRejectedValueOnce(new Error('Network error'))

    const { initAuth, userId, error } = useSupabaseAuth()
    await initAuth()

    expect(error.value).toBeDefined()
    expect(userId.value).toBeDefined() // Should have a fallback UUID
    expect(userId.value?.length).toBeGreaterThan(0)
  })

  it('checkOnboardingStatus returns true if onboarding completed', async () => {
    // Mock session
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: mockUserId },
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: 3600,
          token_type: 'bearer',
        } as any,
      },
      error: null,
    })

    // Mock user_profiles query
    const mockSingle = vi.fn().mockResolvedValue({
      data: { onboarding_completed_at: new Date().toISOString() },
      error: null,
    })
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

    const { checkOnboardingStatus } = useSupabaseAuth()
    const result = await checkOnboardingStatus()

    expect(result).toBe(true)
  })

  it('checkOnboardingStatus returns false if onboarding not completed', async () => {
    // Mock session
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: mockUserId },
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: 3600,
          token_type: 'bearer',
        } as any,
      },
      error: null,
    })

    // Mock user_profiles query
    const mockSingle = vi.fn().mockResolvedValue({
      data: { onboarding_completed_at: null },
      error: null,
    })
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

    const { checkOnboardingStatus } = useSupabaseAuth()
    const result = await checkOnboardingStatus()

    expect(result).toBe(false)
  })

  it('checkOnboardingStatus returns false on error', async () => {
    // Mock session
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: mockUserId },
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: 3600,
          token_type: 'bearer',
        } as any,
      },
      error: null,
    })

    // Mock user_profiles query error
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    })
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

    const { checkOnboardingStatus } = useSupabaseAuth()
    const result = await checkOnboardingStatus()

    expect(result).toBe(false)
  })
})
