import type { GameType } from '$lib/schemas'
import { games } from '$lib/stores'
import { get } from 'svelte/store'

export const getGameIndex = (query: GameType) => {
  return get(games).findIndex(game => game.name === query.name && game.version === query.version)
}
