-- Add 'elder' stage to pets
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_stage_check;
ALTER TABLE pets ADD CONSTRAINT pets_stage_check
  CHECK (stage IN ('egg','baby','teen','adult','ultimate','elder'));

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_1 text REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 text REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id_1, user_id_2)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own friendships" ON friendships
  FOR ALL USING (auth.uid()::text = user_id_1 OR auth.uid()::text = user_id_2);

CREATE POLICY "Service role can manage friendships" ON friendships
  FOR ALL TO service_role USING (true);
