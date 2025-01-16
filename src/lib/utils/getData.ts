import { filter, games, outdated, traductors, updates } from '$lib/stores.js';
import { get } from 'svelte/store';
import { parse } from 'valibot';
import manifest from '../../manifest.json';
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

  try {
    if (get(outdated) !== undefined) return;

    const response = await fetch(
      'https://raw.githubusercontent.com/Hunteraulo1/f95list-ext/refs/heads/main/package.json',
    );
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    if (!json.version || !manifest.version) return;

    outdated.set(json.version !== manifest.version);
  } catch (error: any) {
    console.error(error.message);
  }
};

export default getData;
