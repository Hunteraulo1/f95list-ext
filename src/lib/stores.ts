import { writable } from 'svelte/store'

import type { GameType } from './schemas'
import type { ComboBox, Update } from './types'

export const games = writable<GameType[]>([])
export const filteredGames = writable<GameType[]>([])

export const filter = writable<ComboBox[]>([
  {
    title: 'domain',
    open: false,
    values: ['F95z', 'LewdCorner', 'Autre'],
    selectedValues: [],
  },
  {
    title: 'status',
    open: false,
    values: ['EN COURS', 'ABANDONNÉ', 'TERMINÉ'],
    selectedValues: [],
  },
  {
    title: 'type',
    open: false,
    values: ['RenPy', 'RPGM', 'Unreal', 'HTLM', 'Flash', 'QSP', 'RenPy/RPGM', 'RenPy/Unity', 'Autre'],
    selectedValues: [],
  },
])

export const updates = writable<Update[]>([])
