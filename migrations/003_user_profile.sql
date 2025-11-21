-- Migration 003: User Profile table
-- Stores user profile data locally for offline access and sync with Supabase

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  first_name TEXT,
  goal TEXT,
  situation TEXT,
  notification_hour TEXT DEFAULT '20:00',
  language TEXT DEFAULT 'en',
  onboarding_completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Index for faster user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
