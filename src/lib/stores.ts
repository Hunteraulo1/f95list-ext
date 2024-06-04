import { writable } from 'svelte/store'

import tags from '$lib/assets/tags.json'
import type { GameType, TraductorType } from './schemas'
import type { ComboBox, Settings, Update } from './types'

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
  {
    title: 'tags',
    open: false,
    values: tags,
    selectedValues: [],
  },
])
export const search = writable<string>('')

export const updates = writable<Update[]>([])

export const traductors = writable<TraductorType[]>([])

const settingsData: string | null = localStorage.getItem('settings')

export const settings = writable<Settings>(
  settingsData ? JSON.parse(settingsData) : { tagsHide: false, intergrateFeature: false }
)
