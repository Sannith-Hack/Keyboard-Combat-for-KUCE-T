-- Create participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  email TEXT NOT NULL,
  college TEXT DEFAULT 'Kakatiya University of Engineering and Technology',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attempts table
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  wpm NUMERIC NOT NULL,
  accuracy NUMERIC NOT NULL,
  time_taken NUMERIC NOT NULL,
  combat_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  level1_wpm NUMERIC NOT NULL,
  level2_wpm NUMERIC NOT NULL,
  level3_wpm NUMERIC NOT NULL,
  avg_wpm NUMERIC NOT NULL,
  avg_accuracy NUMERIC DEFAULT 0,
  total_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for results
ALTER PUBLICATION supabase_realtime ADD TABLE results;

-- New unified students table (migration for real-time registration + results)
-- Run this migration to add the `students` table used by the API and admin dashboard.
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  email TEXT,
  college TEXT DEFAULT 'Kakatiya University of Engineering and Technology',
  competition_id UUID,
  status TEXT DEFAULT 'started', -- started | completed
  start_time TIMESTAMP WITH TIME ZONE,
  level1_time NUMERIC,
  level2_time NUMERIC,
  level1_wpm NUMERIC,
  level2_wpm NUMERIC,
  level3_wpm NUMERIC,
  avg_wpm NUMERIC,
  avg_accuracy NUMERIC,
  typing_speed NUMERIC,
  total_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for the students table so admins can subscribe to join/completion events.
ALTER PUBLICATION supabase_realtime ADD TABLE students;

-- Note: Consider migrating existing rows from `participants` + `results` into `students`.
