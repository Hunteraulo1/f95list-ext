import { get } from 'svelte/store';
import { flatten, parse, safeParse } from 'valibot';
import { errors, filter, games, outdated, settings, traductors, updates } from '@/lib/stores.js';
import packageJson from '../../../package.json';
import { Games, type GameType, TraductorsData, Updates } from '../schemas.js';
import devlist from './devlist.json';

interface UpdateData {
  date: string;
  type: string;
  gameId: string | null;
}

const devMode = false;

export const callIntegrate = async () => await browser.runtime.sendMessage('f95list-integrate');

const getData = async () => {
  try {
    interface Data {
      games: unknown[];
      updates: UpdateData[];
      traductors: unknown[];
    }

    const data: Data = devMode ? (devlist.data as Data) : await browser.runtime.sendMessage('f95list-ext');

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
      gameId: null,
      threadId: null,
      name: '',
      ac: false,
      version: '',
      link: '',
      type: 'Autre',
      domain: 'Unknown',
      hostname: null,
      status: 'TERMINÉ',
      description: null,
      image: '',
      proofreader: null,
      prlink: null,
      tags: [],
      tlink: null,
      tname: 'Pas de traduction',
      traductor: null,
      trlink: null,
      ttype: 'À tester',
      tversion: '',
    };

    const parsedRawUpdates = parse(
      Updates,
      data.updates.map((update: UpdateData) => ({
        date: new Date(update.date),
        type: update.type,
        gameId: update.gameId,
      })),
    );

    const updatesData = parsedRawUpdates.reduce<
      {
        date: Date;
        type: (typeof parsedRawUpdates)[number]['type'];
        games: GameType[];
      }[]
    >((acc, update) => {
      const game = output.find((entry) => entry.gameId === update.gameId) ??
        output.find((entry) => entry.id === update.gameId) ?? { ...defaultGame, gameId: update.gameId };

      const previous = acc[acc.length - 1];
      if (previous && previous.date.getTime() === update.date.getTime() && previous.type === update.type) {
        previous.games.push(game);
      } else {
        acc.push({
          date: update.date,
          type: update.type,
          games: [game],
        });
      }

      return acc;
    }, []);

    updates.set(updatesData);

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
