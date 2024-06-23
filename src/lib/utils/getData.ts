import { parse } from 'valibot'

import { type GameType, Games, Updates } from '../schemas'
import { filteredGames, games, updates } from '../stores'

import { building } from '$app/environment'
import gamesJson from '$lib/assets/games.json' // DEV Data

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
    let data: GetData

    if (building) {
      data = await chrome.runtime.sendMessage('f95list-ext')
    } else {
      // @ts-expect-errors are here because of the fake data
      data = gamesJson.data // DEV Data
    }

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
          return (
            validGames.findLast(game => game.name === name) ?? {
              ...defaultGame,
              name,
            }
          )
        }),
      }
    })

    const validUpdates = parse(Updates, updatesData)

    updates.set(validUpdates)
  } catch (error) {
    console.error(error)
  }
}

export default getData
