-- Setup Row Level Security policies for games and game_results tables
-- Run this in Supabase SQL Editor before running the migration

-- Enable RLS on both tables (if not already enabled)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Allow all operations on games" ON games;
DROP POLICY IF EXISTS "Allow all operations on game_results" ON game_results;

-- Create permissive policies that allow all operations
-- Since this app uses embedded credentials (no user auth), allow all operations

CREATE POLICY "Allow all operations on games"
ON games
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on game_results"
ON game_results
FOR ALL
USING (true)
WITH CHECK (true);
