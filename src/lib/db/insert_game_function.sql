-- SQL function to insert a game and its results atomically
-- Run this in Supabase SQL Editor before running the migration

CREATE OR REPLACE FUNCTION insert_game(
  p_date DATE,
  p_game_number INTEGER,
  p_results JSONB
) RETURNS BIGINT AS $$
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
$$ LANGUAGE plpgsql;
