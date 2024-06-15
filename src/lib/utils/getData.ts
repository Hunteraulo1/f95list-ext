import { parse } from 'valibot'
import { Games, Updates, type GameType } from '../schemas'
import { filteredGames, games, updates } from '../stores'

interface UpdatesData {
  date: string
  type: 'AJOUT DE JEU' | 'MISE À JOUR'
  names: string[]
}

interface GetData {
  games: GameType[]
  updates: UpdatesData[]
}

const getData = async () => {
  try {
    const data: GetData = await chrome.runtime.sendMessage('f95list-ext')

    const validGames = parse(Games, data.games)

    games.set(validGames)
    filteredGames.set(validGames)

    const defaultGame: GameType = {
      id: null,
      name: '',
      ac: false,
      version: '',
      link: '',
      type: 'Autre',
      domain: 'Unknown',
      hostname: null,
      status: 'TERMINÉ',
      image: '',
      proofreader: '',
      tags: [],
      tlink: '',
      tname: 'Pas de traduction',
      traductor: '',
      trlink: '',
      ttype: 'À tester',
      tversion: '',
    }

    const updatesData = data.updates.map((update: UpdatesData) => {
      return {
        date: new Date(update.date),
        type: update.type,
        games: update.names.map((name: string) => {
          return validGames.findLast(game => game.name === name) ?? { ...defaultGame, name }
        }),
      }
    })
    console.log('🚀 ~ updatesData ~ updatesData:', updatesData)

    const validUpdates = parse(Updates, updatesData)

    updates.set(validUpdates)
  } catch (error) {
    console.error(error)
  }
}

export default getData
