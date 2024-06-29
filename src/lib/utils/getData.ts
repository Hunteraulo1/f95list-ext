import { parse } from 'valibot'

import { type GameType, Games, Updates } from '../schemas'
import { filteredGames, games, updates } from '../stores'

import { dev } from '$app/environment'
import gamesJson from '$lib/assets/games.json'

const getData = async () => {
  try {
    let data

    if (!dev) {
      const runtime = typeof browser === 'undefined' ? chrome.runtime : browser.runtime
      await runtime.sendMessage('f95list-ext')
    } else data = gamesJson.data

    if (!data) return

    const validGames = parse(Games, data.games)
    console.log('🚀 ~ getData ~ validGames:', validGames)

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

    const updatesData = data.updates.map(update => {
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
