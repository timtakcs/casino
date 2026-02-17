-- Complete Supabase setup script
-- Run this in Supabase SQL Editor before running the migration
-- This script is idempotent (safe to re-run)

-- ============================================
-- 1. Setup Row Level Security Policies
-- ============================================

-- Enable RLS on both tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on games" ON games;
DROP POLICY IF EXISTS "Allow all operations on game_results" ON game_results;

-- Create permissive policies that allow all operations
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

-- ============================================
-- 2. Create Atomic Insert Function
-- ============================================

CREATE OR REPLACE FUNCTION insert_game(
  p_date DATE,
  p_game_number INTEGER,
  p_results JSONB
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  game_id BIGINT;
BEGIN
  -- Insert game record
  INSERT INTO games (date, game_number)
  VALUES (p_date, p_game_number)
  RETURNING id INTO game_id;

  -- Insert all game results
  INSERT INTO game_results (playerName, difference, gameId)
  SELECT key, value::TEXT::NUMERIC, game_id
  FROM jsonb_each_text(p_results);

  RETURN game_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;  -- Auto-rollback on error
END;
$$;
