import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSupabaseAuth from '@/composables/useSupabaseAuth';

// Mock db module
const mockSetMeta = vi.fn();
const mockGetMeta = vi.fn();

vi.mock('@/lib/db', () => ({
  default: () => ({
    getMeta: mockGetMeta,
    setMeta: mockSetMeta,
  }),
}));

// Mock environment variables
vi.mock('@/lib/supabase', async () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
      signInAnonymously: vi.fn(),
      getUser: vi.fn(),
    },
  };
  return {
    supabase: mockSupabase,
    getUserId: () => mockSupabase.auth.getUser()?.data?.user?.id ?? null,
  };
});

// Import after mocks are set up
const { supabase } = await import('@/lib/supabase');
const useDb = (await import('@/lib/db')).default;

describe('useSupabaseAuth', () => {
  const mockUserId = 'test-user-123';
  let mockDb: ReturnType<typeof useDb>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = useDb();
  });

  it('initializes with anonymous auth if no session exists', async () => {
    // Mock database operations
    mockGetMeta.mockResolvedValueOnce(null);
    mockSetMeta.mockResolvedValueOnce(undefined);

    // Mock no existing session
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

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
        }
      },
      error: null,
    });

    vi.mocked(mockDb.setMeta).mockResolvedValueOnce(undefined);

    const { initAuth, userId, error } = useSupabaseAuth();
    await initAuth();

    // Test the sequence of operations
    expect(supabase.auth.getSession).toHaveBeenCalled();
    expect(supabase.auth.signInAnonymously).toHaveBeenCalled();
    
    // Mock setup check
    expect(userId.value).toBe(mockUserId);
    expect(error.value).toBeNull();

    // Database operation check
    expect(mockSetMeta).toHaveBeenCalledWith('user_id', mockUserId);
  });

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
          }
        }
      },
      error: null,
    });

    const { initAuth, userId, error } = useSupabaseAuth();
    await initAuth();

    expect(supabase.auth.getSession).toHaveBeenCalled();
    expect(supabase.auth.signInAnonymously).not.toHaveBeenCalled();
    expect(userId.value).toBe(mockUserId);
    expect(error.value).toBeNull();
  });

  it('falls back to local ID generation on auth error', async () => {
    // Mock auth error
    vi.mocked(supabase.auth.getSession).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { initAuth, userId, error } = useSupabaseAuth();
    await initAuth();

    expect(error.value).toBeDefined();
    expect(userId.value).toBeDefined(); // Should have a fallback UUID
    expect(userId.value?.length).toBeGreaterThan(0);
  });
});