import { errors, filter, games, outdated, settings, traductors, updates } from '@/lib/stores.js';
import { get } from 'svelte/store';
import { flatten, parse, safeParse } from 'valibot';
import packageJson from '../../../package.json';
import { Games, type GameType, TraductorsData, type TraductorType, Updates } from '../schemas.js';
import devlist from './devlist.json';

interface UpdateData {
  date: string;
  type: string;
  names: string[];
}

const devMode = false;

export const callIntegrate = async () => await browser.runtime.sendMessage('f95list-integrate');

const getData = async () => {
  try {
    interface Data {
      games: GameType[];
      updates: UpdateData[];
      traductors: TraductorType[];
    }

    const data: Data = devMode
      ? (devlist.data as { games: GameType[]; updates: UpdateData[]; traductors: TraductorType[] })
      : await browser.runtime.sendMessage('f95list-ext');

    // Games
    const validGames = safeParse(Games, data.games);

    if (validGames.issues) {
      const flatErrors = flatten(validGames.issues);
      console.error('🚀 ~ getData ~ flatErrors:', flatErrors);
      errors.set([...get(errors), flatErrors]);
    }

    const output: GameType[] = (validGames.output as GameType[]) ?? [];

    games.set(output);

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
          output.findLast((game: GameType) => game.name === name) ?? {
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

    // Settings
    const settingsValue = get(settings);

    settingsValue.intergrateFeature = await browser.runtime.sendMessage('f95list-integrate');

    settings.set(settingsValue);
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

    if (!json.version || !packageJson.version) return;

    outdated.set(json.version !== packageJson.version);
  } catch (error: any) {
    console.error(error.message);
  }
};

export default getData;
