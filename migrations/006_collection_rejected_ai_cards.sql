-- Migration 006: Add rejected_ai_cards column to collections
-- Stores a JSON array of rejected AI suggestion questions (strings only, max 70)
-- Safe migration: nullable column with NULL default, no impact on existing data

ALTER TABLE Collection ADD COLUMN rejected_ai_cards TEXT DEFAULT NULL;
