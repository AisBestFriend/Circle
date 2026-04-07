ALTER TABLE pets ADD COLUMN IF NOT EXISTS starvation_since timestamptz DEFAULT NULL;
