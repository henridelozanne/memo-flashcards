-- Table de configuration distante (remote config)
-- Utilisée pour diffuser des paramètres à l'app sans redéploiement

CREATE TABLE IF NOT EXISTS remote_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lecture publique (anon), aucune écriture côté client
ALTER TABLE remote_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "remote_config_read" ON remote_config
  FOR SELECT USING (true);

-- Seed initial
INSERT INTO remote_config (key, value) VALUES
  ('latest_version', '1.0.0'),
  ('store_url_ios', 'https://apps.apple.com/app/id'),
  ('store_url_android', 'https://play.google.com/store/apps/details?id=com.memoflashcards.app')
ON CONFLICT (key) DO NOTHING;
