import { derived, get, writable } from 'svelte/store';
import { storage } from '#imports';
import { linkAccount } from './api/f95france.js';

const TOKEN_KEY = 'local:f95france_token';

/** Bearer token permanent du compte lié, ou null si non lié. */
export const token = writable<string | null>(null);

/** Vrai dès qu'un token est présent. */
export const accountLinked = derived(token, ($token) => Boolean($token));

let hydrated = false;

/** Charge le token depuis browser.storage.local et garde le store synchro entre contextes. */
export const initAccount = async (): Promise<void> => {
  if (hydrated) return;
  hydrated = true;

  token.set((await storage.getItem<string>(TOKEN_KEY)) ?? null);

  storage.watch<string>(TOKEN_KEY, (value) => {
    if (value !== get(token)) token.set(value ?? null);
  });
};

const persistToken = async (value: string | null): Promise<void> => {
  token.set(value);
  if (value) await storage.setItem(TOKEN_KEY, value);
  else await storage.removeItem(TOKEN_KEY);
};

/** Lie le compte à partir d'un code à 8 caractères et stocke le token. */
export const linkWithCode = async (code: string): Promise<void> => {
  const newToken = await linkAccount(code.trim().toUpperCase());
  await persistToken(newToken);
};

/** Délie le compte : efface le token local (la révocation serveur se fait depuis le site). */
export const unlink = async (): Promise<void> => {
  await persistToken(null);
};
