import { writable } from 'svelte/store'

import type { GamesType } from './schemas'

export const games = writable<GamesType>([])
