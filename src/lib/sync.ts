import { get, type Writable } from 'svelte/store';
import { accountLinked, initAccount, token, unlink } from './account.js';
import { getSavedFilters, putSavedFilters, type SavedFilterKind, UnauthorizedError } from './api/f95france.js';
import { initBaseUrl } from './config.js';
import type { Preset } from './savedFilters.js';
import { gamesSavedFilters, updatesSavedFilters } from './stores.js';

const PUT_DEBOUNCE_MS = 2000;

let started = false;
// Vrai pendant l'application de presets venant du serveur, pour ne pas les renvoyer en boucle.
let applyingRemote = false;

const handleSyncError = async (error: unknown): Promise<void> => {
  if (error instanceof UnauthorizedError) {
    console.warn('Token révoqué : déliaison automatique du compte.');
    await unlink();
    return;
  }
  console.error('Sync error:', error);
};

/** Récupère les presets du compte et les applique localement (dernier-écrivain-gagne). */
const pull = async (currentToken: string): Promise<void> => {
  try {
    const [gamesPresets, updatesPresets] = await Promise.all([
      getSavedFilters(currentToken, 'games'),
      getSavedFilters(currentToken, 'updates'),
    ]);

    applyingRemote = true;
    gamesSavedFilters.set(gamesPresets);
    updatesSavedFilters.set(updatesPresets);
    applyingRemote = false;
  } catch (error) {
    applyingRemote = false;
    await handleSyncError(error);
  }
};

/** Pousse (PUT débouncé) les presets vers le compte à chaque modification locale. */
const watchPush = (kind: SavedFilterKind, store: Writable<Preset[]>): void => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let first = true;

  store.subscribe((presets) => {
    if (first) {
      first = false; // ignore la valeur initiale hydratée depuis le storage local
      return;
    }
    if (applyingRemote || !get(accountLinked)) return;

    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      const currentToken = get(token);
      if (!currentToken) return;

      try {
        await putSavedFilters(currentToken, kind, presets);
      } catch (error) {
        await handleSyncError(error);
      }
    }, PUT_DEBOUNCE_MS);
  });
};

/**
 * Initialise la synchronisation des filtres sauvegardés :
 * - hydrate le token, GET au démarrage / à chaque (re)liaison ;
 * - PUT débouncé ~2 s à chaque modification locale.
 */
export const initSync = async (): Promise<void> => {
  if (started) return;
  started = true;

  await Promise.all([initBaseUrl(), initAccount()]);

  watchPush('games', gamesSavedFilters);
  watchPush('updates', updatesSavedFilters);

  let previousLinked = false;
  token.subscribe((value) => {
    const linked = Boolean(value);
    if (linked && !previousLinked && value) pull(value);
    previousLinked = linked;
  });
};
