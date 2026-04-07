ALTER TABLE pets ADD COLUMN IF NOT EXISTS evolution_ready_at timestamptz DEFAULT NULL;
