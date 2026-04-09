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
  wpm INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  level1_wpm INTEGER NOT NULL,
  level2_wpm INTEGER NOT NULL,
  level3_wpm INTEGER NOT NULL,
  avg_wpm INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for results
ALTER PUBLICATION supabase_realtime ADD TABLE results;
