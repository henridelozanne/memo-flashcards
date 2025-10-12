BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS Meta (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS Collection (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS Card (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'text',
  compartment INTEGER NOT NULL DEFAULT 1,
  next_review_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  FOREIGN KEY (collection_id) REFERENCES Collection(id)
);

CREATE TABLE IF NOT EXISTS ReviewSession (
  id TEXT PRIMARY KEY,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  cards_reviewed INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ReviewLog (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  result TEXT NOT NULL,
  reviewed_at INTEGER NOT NULL,
  FOREIGN KEY (card_id) REFERENCES Card(id),
  FOREIGN KEY (session_id) REFERENCES ReviewSession(id)
);

INSERT OR REPLACE INTO Meta (key, value, updated_at) VALUES ('db_version', '1', strftime('%s','now')*1000);

COMMIT;
