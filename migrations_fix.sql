-- Migration: Recreate tables with correct data types

-- 1. Drop existing tables and constraints
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS attempts CASCADE;

-- 2. Recreate attempts table with NUMERIC types
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  wpm NUMERIC NOT NULL,
  accuracy NUMERIC NOT NULL,
  time_taken NUMERIC NOT NULL,
  combat_score NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Recreate results table with NUMERIC types and all columns
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  level1_wpm NUMERIC NOT NULL DEFAULT 0,
  level2_wpm NUMERIC NOT NULL DEFAULT 0,
  level3_wpm NUMERIC NOT NULL DEFAULT 0,
  avg_wpm NUMERIC NOT NULL DEFAULT 0,
  avg_accuracy NUMERIC NOT NULL DEFAULT 0,
  total_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Realtime for results
ALTER PUBLICATION supabase_realtime ADD TABLE results;
ALTER PUBLICATION supabase_realtime ADD TABLE attempts;
