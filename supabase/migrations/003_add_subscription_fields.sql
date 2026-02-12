-- Add subscription fields to user_profiles

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_product_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ;

UPDATE user_profiles
SET subscription_status = 'free'
WHERE subscription_status IS NULL;
