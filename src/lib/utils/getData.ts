import { filter, games, traductors, updates } from '$lib/stores.js';
import { parse } from 'valibot';
import { type GameType, Games, TraductorsData, Updates } from '../schemas.js';
import { browserAPI } from './polyfill.js';

interface UpdateData {
  date: string;
  type: string;
  names: string[];
}

const callWorker = async () => await browserAPI().runtime.sendMessage('f95list-ext');

const getData = async () => {
  try {
    const data = await callWorker();

    // Games
    const validGames = parse(Games, data.games);

    games.set(validGames);

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
      prlink: '',
      tags: [],
      tlink: '',
      tname: 'Pas de traduction',
      traductor: '',
      trlink: '',
      ttype: 'À tester',
      tversion: '',
    };

    const updatesData = data.updates.map((update: UpdateData) => ({
      date: new Date(update.date),
      type: update.type,
      games: update.names.map(
        (name: string) =>
          validGames.findLast((game: GameType) => game.name === name) ?? {
            ...defaultGame,
            name,
          },
      ),
    }));

    const validUpdates = parse(Updates, updatesData);

    updates.set(validUpdates);

    // Traductors
    const validTraductors = parse(TraductorsData, data.traductors);

    traductors.set(validTraductors);

    filter.reset();
  } catch (error) {
    console.error(error);
  }
};

export default getData;
