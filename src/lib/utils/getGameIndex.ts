import { get } from 'svelte/store';

import type { GameType } from '$lib/schemas';
import { games } from '$lib/stores';

export const getGameIndex = (query: GameType) => {
  return get(games).findIndex((game) => game.name === query.name && game.version === query.version);
};
