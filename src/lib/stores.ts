import { writable } from 'svelte/store'

import type { GameType } from './schemas'
import type { Update } from './types'

export const games = writable<GameType[]>([])

export const updates = writable<Update[]>([])
