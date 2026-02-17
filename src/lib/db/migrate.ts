import { gamesData } from '../data.js';
import { supabase } from '../supabase.js';

/**
 * Migration script to populate Supabase with existing game data
 * Safe to re-run (idempotent) - skips games that already exist
 */
async function migrate() {
  console.log(`Starting migration of ${gamesData.length} games...`);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const game of gamesData) {
    try {
      // Check if game already exists
      let query = supabase
        .from('games')
        .select('id')
        .eq('date', game.date);

      // Handle NULL game_number correctly
      if (game.gameNumber !== undefined) {
        query = query.eq('game_number', game.gameNumber);
      } else {
        query = query.is('game_number', null);
      }

      const { data: existing, error: checkError } = await query.maybeSingle();

      if (checkError) {
        console.error(`Error checking game ${game.date}:`, checkError.message);
        failed++;
        continue;
      }

      if (existing) {
        console.log(`Skipping ${game.date}${game.gameNumber ? `-${game.gameNumber}` : ''} (already exists)`);
        skipped++;
        continue;
      }

      // Insert game using RPC function
      const { data: gameId, error: insertError } = await supabase.rpc('insert_game', {
        p_date: game.date,
        p_game_number: game.gameNumber || null,
        p_results: game.differences
      });

      if (insertError) {
        console.error(`Failed to insert game ${game.date}:`, insertError.message);
        failed++;
        continue;
      }

      console.log(`✓ Inserted ${game.date}${game.gameNumber ? `-${game.gameNumber}` : ''} (ID: ${gameId})`);
      inserted++;

    } catch (error) {
      console.error(`Unexpected error for game ${game.date}:`, error);
      failed++;
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

migrate();
