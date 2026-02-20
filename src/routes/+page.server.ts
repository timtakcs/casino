import type { PageServerLoad } from './$types';
import { fetchAllGames, fetchPlayerColors } from '$lib/db/operations';

export const load: PageServerLoad = async () => {
  const [games, playerColors] = await Promise.all([fetchAllGames(), fetchPlayerColors()]);
  return { games, playerColors };
};
