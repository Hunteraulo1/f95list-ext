import type { GameType, UpdateType } from './schemas'

export interface Update {
  type: UpdateType['type']
  date: Date
  games: (GameType | number | string)[]
}

export interface ComboBox {
  title: keyof GameType
  open: boolean
  values: (GameType['domain' | 'status' | 'type'] | string)[]
  selectedValues: string[]
}
