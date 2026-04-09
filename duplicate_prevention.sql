-- 1. Delete duplicate results (keep only the earliest one for each participant)
DELETE FROM results 
WHERE id NOT IN (
  SELECT DISTINCT ON (participant_id, competition_id) id
  FROM results
  ORDER BY participant_id, competition_id, created_at ASC
);

-- 2. Add unique constraint to prevent future duplicates
ALTER TABLE results
ADD CONSTRAINT unique_participant_competition UNIQUE (participant_id, competition_id);
