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

    const { initAuth, userId } = useSupabaseAuth()
    await initAuth()

    // Test the sequence of operations
    expect(supabase.auth.getSession).toHaveBeenCalled()
    expect(supabase.auth.signInAnonymously).toHaveBeenCalled()

    // Verify userId is set correctly
    expect(userId.value).toBe(mockUserId)
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

    const { initAuth, userId } = useSupabaseAuth()
    await initAuth()

    expect(supabase.auth.getSession).toHaveBeenCalled()
    expect(supabase.auth.signInAnonymously).not.toHaveBeenCalled()
    expect(userId.value).toBe(mockUserId)
  })

  it('initAuth falls back to local UUID on error', async () => {
    const { initAuth, userId } = useSupabaseAuth()

    // Mock getSession to throw error
    vi.mocked(supabase.auth.getSession).mockRejectedValueOnce(new Error('Auth failed'))

    await initAuth()

    expect(userId.value).not.toBeNull()
    expect(userId.value?.length).toBeGreaterThan(0)
  })

  it('loadUserProfile returns full user data when profile exists', async () => {
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
      data: {
        first_name: 'John',
        goal: 'learn',
        situation: 'student',
        notification_hour: '09:00',
        onboarding_completed_at: new Date().toISOString(),
      },
      error: null,
    })
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

    const { loadUserProfile } = useSupabaseAuth()
    const result = await loadUserProfile()

    expect(result).toEqual({
      firstName: 'John',
      goal: 'learn',
      situation: 'student',
      notificationHour: '09:00',
      hasCompletedOnboarding: true,
    })
  })

  it('loadUserProfile returns null if no profile found', async () => {
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

    const { loadUserProfile } = useSupabaseAuth()
    const result = await loadUserProfile()

    expect(result).toBeNull()
  })

  it('loadUserProfile returns null if no session', async () => {
    // Mock no session
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    const { loadUserProfile } = useSupabaseAuth()
    const result = await loadUserProfile()

    expect(result).toBeNull()
  })
})
