-- Migration 005: Add card_background column to collections
-- Safe migration: nullable column with NULL default, no impact on existing data

ALTER TABLE Collection ADD COLUMN card_background TEXT DEFAULT NULL;
