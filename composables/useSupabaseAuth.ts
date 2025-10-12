import { ref } from 'vue';
import { supabase } from '../lib/supabase';
import useDb from '../lib/db';

export default function useSupabaseAuth() {
  const userId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const db = useDb();

  async function initAuth() {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Check existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Sign in anonymously if no session exists
        const { data: { user }, error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) throw signInError;
        if (!user?.id) throw new Error('Failed to get user ID after anonymous sign in');
        userId.value = user.id;
      } else {
        userId.value = session.user.id;
      }

      // Store user ID in local SQLite Meta table
      await db.setMeta('user_id', userId.value);
      
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown auth error');
      // Fall back to generating a local ID if auth fails
      userId.value = crypto.randomUUID();
      await db.setMeta('user_id', userId.value);
    } finally {
      isLoading.value = false;
    }
  }

  async function getCurrentUserId(): Promise<string> {
    // Get from local Meta first
    const storedId = await db.getMeta('user_id');
    if (storedId) return storedId as string;
    
    // Initialize auth if no stored ID
    await initAuth();
    if (!userId.value) {
      throw new Error('Unable to resolve user id after initAuth')
    }
    return userId.value;
  }

  return {
    userId,
    isLoading,
    error,
    initAuth,
    getCurrentUserId,
  };
}

// Types for Supabase Auth
declare module '@supabase/supabase-js' {
  interface User {
    id: string;
  }
}