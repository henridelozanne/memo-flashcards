-- Migration 004: Subscription status fields for user_profiles

ALTER TABLE user_profiles ADD COLUMN subscription_status TEXT DEFAULT 'free';
ALTER TABLE user_profiles ADD COLUMN subscription_product_id TEXT;
ALTER TABLE user_profiles ADD COLUMN subscription_expires_at INTEGER;
ALTER TABLE user_profiles ADD COLUMN subscription_updated_at INTEGER;

UPDATE user_profiles
SET subscription_status = 'free'
WHERE subscription_status IS NULL;
