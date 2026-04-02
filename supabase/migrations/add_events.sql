CREATE TABLE IF NOT EXISTS pet_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  other_pet_id uuid REFERENCES pets(id) ON DELETE SET NULL,
  event_type text NOT NULL, -- "relationship_formed", "fight", "love", "friendship", "level_up", "death"
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pet_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pet events" ON pet_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM pets WHERE id = pet_id AND user_id = auth.uid()::text)
);

CREATE POLICY "Service role manages events" ON pet_events FOR ALL USING (true);
