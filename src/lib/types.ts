import type { GameType, UpdateType } from './schemas'

export interface Update {
  type: UpdateType['type']
  date: Date
  games: (GameType | number)[]
}

export interface ComboBox {
  title: keyof GameType
  open: boolean
  values: GameType['domain' | 'status' | 'type'][]
  selectedValues: string[]
}
