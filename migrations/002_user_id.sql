BEGIN TRANSACTION;

-- Add user_id to main entities for multi-user isolation
ALTER TABLE Collection ADD COLUMN user_id TEXT;
ALTER TABLE Card ADD COLUMN user_id TEXT;
ALTER TABLE ReviewSession ADD COLUMN user_id TEXT;
ALTER TABLE ReviewLog ADD COLUMN user_id TEXT;

-- Optional: basic indexes to speed up user-scoped queries
CREATE INDEX IF NOT EXISTS idx_collection_user ON Collection(user_id);
CREATE INDEX IF NOT EXISTS idx_card_user ON Card(user_id);
CREATE INDEX IF NOT EXISTS idx_session_user ON ReviewSession(user_id);
CREATE INDEX IF NOT EXISTS idx_log_user ON ReviewLog(user_id);

COMMIT;
