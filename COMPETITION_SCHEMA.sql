-- 1. Create competitions table
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'ended')),
  scheduled_start TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add competition_id to participants
ALTER TABLE participants ADD COLUMN competition_id UUID REFERENCES competitions(id);

-- 3. Add competition_id to results
ALTER TABLE results ADD COLUMN competition_id UUID REFERENCES competitions(id);

-- 4. Add competition_id to attempts
ALTER TABLE attempts ADD COLUMN competition_id UUID REFERENCES competitions(id);

-- 5. Enable Realtime for competitions
ALTER PUBLICATION supabase_realtime ADD TABLE competitions;
