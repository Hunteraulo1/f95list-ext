import type { GameType, UpdateType } from './schemas'

export interface Update {
  type: UpdateType['type']
  date: Date
  games: (GameType | string)[]
}
