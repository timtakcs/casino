import type { PageServerLoad } from './$types';
import { fetchAllGames } from '$lib/db/operations';

export const load: PageServerLoad = async () => {
  const games = await fetchAllGames();
  return { games };
};
