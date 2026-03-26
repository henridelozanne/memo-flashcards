-- Migration 007: Add AI generation counters to user_profiles
-- Tracks how many times a free user has used each AI generation feature
-- Used to enforce the free tier limit (MAX_AI_GENERATIONS per feature)

ALTER TABLE user_profiles ADD COLUMN ai_generations_from_cards INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN ai_generations_from_image INTEGER DEFAULT 0;
