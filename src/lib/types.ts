import type { GameType, UpdateType } from './schemas'

export interface Update {
  date: Date
  type: UpdateType['type']
  games: (GameType | { name: GameType['name'] })[]
}

export interface ComboBox {
  title: keyof GameType
  open: boolean
  values: (GameType['domain' | 'status' | 'type'] | string)[]
  selectedValues: string[]
}
