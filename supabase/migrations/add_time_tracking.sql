ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_tick_at timestamptz DEFAULT now();
ALTER TABLE pets ADD COLUMN IF NOT EXISTS ultimate_at timestamptz;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS elder_at timestamptz;
