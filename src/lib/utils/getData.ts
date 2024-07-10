import { parse } from 'valibot'

import { type GameType, Games, TraductorsData, Updates } from '../schemas'
import { filter, filteredGames, games, traductors, updates } from '../stores'

import { dev } from '$app/environment'
import apiJson from '$lib/assets/api.json'

const callWorker = async () => {
  if (dev) return apiJson.data

  const runtime = typeof browser === 'undefined' ? chrome.runtime : browser.runtime

  const data = await runtime.sendMessage('f95list-ext')

  if (!data) {
    setTimeout(() => getData(), 10 * 1000) // Wait 10 seconds

    throw new Error('worker not data')
  }

  if (data) return data
}

const getData = async () => {
  try {
    const data = await callWorker()

    // Games
    const validGames = parse(Games, data.games)

    games.set(validGames)
    filteredGames.set(validGames)

    // Updates
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

    interface UpdateData {
      date: string
      type: string
      names: string[]
    }

    const updatesData = data.updates.map((update: UpdateData) => {
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

    // Traductors
    const validTraductors = parse(TraductorsData, data.traductors)

    traductors.set(validTraductors)

    filter.reset()
  } catch (error) {
    console.error(error)
  }
}

export default getData
