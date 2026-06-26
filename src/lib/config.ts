import { writable } from 'svelte/store';
import { storage } from '#imports';

/**
 * Petite fabrique de configuration d'URL de base, miroir de browser.storage.local
 * et synchronisée entre contextes. La 1re valeur des environnements est le défaut.
 */
const createEnvConfig = <T extends Record<string, string>>(environments: T, storageKey: `local:${string}`) => {
  const defaultUrl = Object.values(environments)[0];
  const store = writable<string>(defaultUrl);
  let initialized = false;

  const init = async (): Promise<void> => {
    if (initialized) return;
    initialized = true;
    store.set((await storage.getItem<string>(storageKey)) ?? defaultUrl);
    storage.watch<string>(storageKey, (value) => store.set(value ?? defaultUrl));
  };

  // Lecture synchrone du storage (utilisable hors contexte Svelte, ex. background).
  const get = async (): Promise<string> => {
    const stored = await storage.getItem<string>(storageKey);
    return stored?.replace(/\/$/, '') || defaultUrl;
  };

  const set = async (url: string): Promise<void> => {
    store.set(url);
    if (url === defaultUrl) await storage.removeItem(storageKey);
    else await storage.setItem(storageKey, url);
  };

  const setEnv = (env: keyof T): Promise<void> => set(environments[env]);

  const nameOf = (url: string): keyof T | 'custom' => {
    const match = (Object.entries(environments) as [keyof T, string][]).find(([, value]) => value === url);
    return match ? match[0] : 'custom';
  };

  return { environments, defaultUrl, store, init, get, set, setEnv, nameOf };
};

// Site F95 France — liaison de compte + sync des filtres sauvegardés (/api/extension/*).
export const SITE_ENVIRONMENTS = {
  prod: 'https://f95france.site',
  ptb: 'https://ptb.f95france.site',
  dev: 'http://localhost:5173',
} as const;
export type SiteEnvName = keyof typeof SITE_ENVIRONMENTS;
export const site = createEnvConfig(SITE_ENVIRONMENTS, 'local:f95france_base_url');

// API de données de l'extension (jeux/updates/traducteurs) — /private/extension.
export const API_ENVIRONMENTS = {
  prod: 'https://api.f95france.site',
  dev: 'http://localhost:3001',
} as const;
export type ApiEnvName = keyof typeof API_ENVIRONMENTS;
export const api = createEnvConfig(API_ENVIRONMENTS, 'local:f95france_api_base_url');
