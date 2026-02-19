import { supabase } from '$lib/supabase.js';
import type { GameData } from '$lib/types.js';

/**
 * Signs in using Supabase Auth and stores the session in localStorage
 */
export async function signIn(password: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: 'admin@poker.local',
    password
  });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Fetches all games from Supabase and transforms them into GameData format
 */
export async function fetchAllGames(): Promise<GameData[]> {
  // Query games with their results using a join
  const { data, error } = await supabase
    .from('games')
    .select(`
      id,
      date,
      game_number,
      game_results (
        playerName,
        difference
      )
    `)
    .order('date', { ascending: true })
    .order('game_number', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching games:', error);
    throw new Error(`Failed to fetch games: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  // Transform DB rows to GameData format
  const games: GameData[] = data.map((game: any) => {
    const differences: Record<string, number> = {};

    // Convert game_results array to differences object
    if (game.game_results && Array.isArray(game.game_results)) {
      game.game_results.forEach((result: any) => {
        differences[result.playerName] = result.difference;
      });
    }

    const gameData: GameData = {
      date: game.date,
      differences
    };

    // Only include gameNumber if it exists
    if (game.game_number !== null) {
      gameData.gameNumber = game.game_number;
    }

    return gameData;
  });

  return games;
}

/**
 * Writes a new game to the database (caller must already be authenticated)
 */
export async function writeToDb(
  gameData: GameData
): Promise<{ success: boolean; error?: string }> {
  // Call the Postgres RPC function for atomic transaction
  const { data, error } = await supabase.rpc('insert_game', {
    p_date: gameData.date,
    p_game_number: gameData.gameNumber || null,
    p_results: gameData.differences
  });

  if (error) {
    console.error('Error writing game to DB:', error);
    return { success: false, error: 'Failed to save game' };
  }

  return { success: true };
}
