import { get, writable } from 'svelte/store'

import type { GameType, TraductorType } from './schemas'
import type { ComboBox, Settings, Update } from './types'

import tags from '$lib/assets/tags.json'

export const games = writable<GameType[]>([])
export const filteredGames = writable<GameType[]>([])

export const traductors = writable<TraductorType[]>([])

const defaultFilters = (): ComboBox[] => [
  {
    title: 'Site',
    name: 'domain',
    open: false,
    values: [
      { value: 'F95z', checked: false },
      { value: 'LewdCorner', checked: false },
      { value: 'Autre', checked: false },
    ],
  },
  {
    title: 'Type',
    name: 'type',
    open: false,
    values: [
      { value: 'RenPy', checked: false },
      { value: 'RPGM', checked: false },
      { value: 'Unreal', checked: false },
      { value: 'HTLM', checked: false },
      { value: 'Flash', checked: false },
      { value: 'QSP', checked: false },
      { value: 'RenPy/RPGM', checked: false },
      { value: 'RenPy/Unity', checked: false },
      { value: 'Autre', checked: false },
    ],
  },
  {
    title: 'Status',
    name: 'status',
    open: false,
    values: [
      { value: 'EN COURS', checked: false },
      { value: 'ABANDONNÉ', checked: false },
      { value: 'TERMINÉ', checked: false },
    ],
  },
  {
    title: 'Traducteur',
    name: 'traductor',
    open: false,
    values: get(traductors).map(traductor => ({ value: traductor.name ?? 'NoName', checked: false })),
  },
  {
    title: 'Tags',
    name: 'tags',
    open: false,
    values: tags.map(tag => ({ value: tag, checked: false })),
  },
]

const filterFn = () => {
  const { subscribe, set, update } = writable<ComboBox[]>(defaultFilters())

  return {
    subscribe,
    set,
    update,
    reset: () => set(defaultFilters()),
  }
}

export const filter = filterFn()

export const search = writable<string>('')

export const updates = writable<Update[]>([])

const settingsData: string | null = localStorage.getItem('settings')

export const settings = writable<Settings>(
  settingsData ? JSON.parse(settingsData) : { tagsHide: true, intergrateFeature: false }
)
