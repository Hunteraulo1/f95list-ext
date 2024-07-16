import { derived, get, writable } from 'svelte/store'

import type { GameType, TraductorType } from './schemas'
import type { ComboBox, Settings, Update } from './types'

import tags from '$lib/assets/tags.json'

export const games = writable<GameType[]>([])

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
    title: 'Statut de la traduction',
    name: 'version',
    open: false,
    values: [
      { value: 'À jour', checked: false },
      { value: 'Intégrée', checked: false },
      { value: 'Pas à jour', checked: false },
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
  const { subscribe, set, update } = writable(defaultFilters())

  return {
    subscribe,
    set,
    update,
    reset: () => set(defaultFilters()),
  }
}

export const filter = filterFn()

export const search = writable('')

export const filteredGames = derived([games, filter, search], ([$games, $filter, $search]) => {
  console.log('derived')

  return $games.filter(game => {
    if (!game.name.toLowerCase().includes($search)) return false
    // if (checked && game.version !== game.tversion && game.tversion !== 'Intégrée') return false

    return $filter.every(({ name, values }) => {
      if (!values.some(value => value.checked)) return true

      if (name === 'tags') {
        return values.every(value => !value.checked || game.tags.includes(value.value))
      }

      if (name === 'traductor') {
        return values.some(value => value.checked && game.traductor?.includes(value.value))
      }

      if (name === 'version') {
        return values.some(value => {
          if (!value.checked) return false

          switch (value.value) {
            case 'À jour':
              if (game.version !== game.tversion && game.tversion !== 'Intégrée') return false
              break
            case 'Intégrée':
              if (game.tversion !== 'Intégrée') return false
              break
            case 'Pas à jour':
              if (game.version === game.tversion || game.tversion === 'Intégrée') return false
              break
            default:
              return false
          }

          return true
        })
      }

      return values.some(value => value.checked && game[name] === value.value)
    })
  })
})

export const updates = writable<Update[]>([])

const settingsData: string | null = localStorage.getItem('settings')

export const settings = writable<Settings>(
  settingsData ? JSON.parse(settingsData) : { tagsHide: true, intergrateFeature: false, autoFocusGame: true }
)
