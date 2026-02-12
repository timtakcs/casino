import { supabase } from '../supabase.js';

/**
 * Setup script to configure RLS policies programmatically
 * This runs the SQL setup directly via the Supabase client
 */
async function setupRLS() {
  console.log('Setting up RLS policies and functions...');

  const setupSQL = `
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

-- Create atomic insert function
CREATE OR REPLACE FUNCTION insert_game(
  p_date DATE,
  p_game_number INTEGER,
  p_results JSONB
) RETURNS BIGINT AS $$
DECLARE
  game_id BIGINT;
BEGIN
  INSERT INTO games (date, game_number)
  VALUES (p_date, p_game_number)
  RETURNING id INTO game_id;

  INSERT INTO game_results (playerName, difference, gameId)
  SELECT key, value::TEXT::NUMERIC, game_id
  FROM jsonb_each_text(p_results);

  RETURN game_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql;
`;

  const { data, error } = await supabase.rpc('exec_sql', { sql: setupSQL });

  if (error) {
    console.error('❌ Failed to setup RLS:', error.message);
    console.log('\nThe anon key does not have permission to execute DDL statements.');
    console.log('Please run the SQL manually in Supabase SQL Editor:');
    console.log('File: src/lib/db/setup.sql\n');
    process.exit(1);
  }

  console.log('✓ RLS policies and functions created successfully!');
  process.exit(0);
}

setupRLS();
