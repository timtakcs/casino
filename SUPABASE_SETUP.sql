-- SIMPLE SETUP: Disable RLS for this simple app
-- Copy and paste this into Supabase SQL Editor and run it

-- Disable RLS on both tables (simplest approach for embedded credentials)
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_results DISABLE ROW LEVEL SECURITY;

-- Create atomic insert function with SECURITY DEFINER
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
  INSERT INTO games (date, game_number)
  VALUES (p_date, p_game_number)
  RETURNING id INTO game_id;

  INSERT INTO game_results ("playerName", difference, "gameId")
  SELECT key, value::TEXT::NUMERIC, game_id
  FROM jsonb_each_text(p_results);

  RETURN game_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
