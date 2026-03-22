-- Migration 004: Add color column to collections
-- Safe migration: nullable column with NULL default, no impact on existing data

ALTER TABLE Collection ADD COLUMN color TEXT DEFAULT NULL;
