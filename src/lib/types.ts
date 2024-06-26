import type { GameType, UpdateType } from './schemas'

export interface Update {
  date: Date
  type: UpdateType['type']
  games: GameType[]
}

export interface ComboBox {
  title: keyof GameType
  open: boolean
  values: {
    value: GameType['domain' | 'status' | 'type'] | string
    checked: boolean
  }[]
}

export interface Settings {
  theme?: undefined
  tagsHide: boolean
  intergrateFeature: boolean
}
