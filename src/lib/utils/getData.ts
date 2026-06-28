import { get } from 'svelte/store';
import { flatten, parse, safeParse } from 'valibot';
import { errors, games, outdated, resetFilters, settings, traductors, updates } from '@/lib/stores.js';
import { initSync } from '@/lib/sync.js';
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
  // Synchronisation des filtres sauvegardés avec le compte F95 France (non bloquant).
  initSync();

  try {
    interface Data {
      games: unknown[];
      updates: UpdateData[];
      traductors: unknown[];
    }

    const data: Data = devMode ? (devlist.data as unknown as Data) : await browser.runtime.sendMessage('f95list-ext');

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
    const normalizedUpdates = data.updates.map((update: UpdateData) => ({
      date: new Date(update.date),
      type: update.type,
      gameId: typeof update.gameId === 'string' ? update.gameId : null,
    }));

    const validUpdates = safeParse(Updates, normalizedUpdates);

    if (validUpdates.issues) {
      const flatErrors = flatten(validUpdates.issues);
      console.error('🚀 ~ getData ~ updatesErrors:', flatErrors);
      errors.set([...get(errors), flatErrors]);
      updates.set([]);
    } else {
      updates.set(validUpdates.output);
    }

    // Traductors
    const validTraductors = parse(TraductorsData, data.traductors);

    traductors.set(validTraductors);

    resetFilters();

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
