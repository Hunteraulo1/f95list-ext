import { writable } from 'svelte/store';
import { storage } from '#imports';

// Environnements du site F95 France (sélectionnables en build de dev).
export const ENVIRONMENTS = {
  prod: 'https://f95france.site',
  ptb: 'https://ptb.f95france.site',
  dev: 'http://localhost:5173',
} as const;

export type EnvName = keyof typeof ENVIRONMENTS;

export const DEFAULT_BASE_URL = ENVIRONMENTS.prod;
export const BASE_URL_KEY = 'local:f95france_base_url';

/** Base URL active, mirroir de browser.storage.local. */
export const baseUrl = writable<string>(DEFAULT_BASE_URL);

/** Nom de l'environnement correspondant à une URL, ou 'custom'. */
export const envNameOf = (url: string): EnvName | 'custom' => {
  const match = (Object.entries(ENVIRONMENTS) as [EnvName, string][]).find(([, value]) => value === url);
  return match ? match[0] : 'custom';
};

let initialized = false;

/** Hydrate la base URL depuis le storage et la garde synchro entre contextes. */
export const initBaseUrl = async (): Promise<void> => {
  if (initialized) return;
  initialized = true;

  baseUrl.set((await storage.getItem<string>(BASE_URL_KEY)) ?? DEFAULT_BASE_URL);
  storage.watch<string>(BASE_URL_KEY, (value) => baseUrl.set(value ?? DEFAULT_BASE_URL));
};

/** Change la base URL (prod = valeur par défaut → on retire la clé). */
export const setBaseUrl = async (url: string): Promise<void> => {
  baseUrl.set(url);
  if (url === DEFAULT_BASE_URL) await storage.removeItem(BASE_URL_KEY);
  else await storage.setItem(BASE_URL_KEY, url);
};

export const setEnvironment = (env: EnvName): Promise<void> => setBaseUrl(ENVIRONMENTS[env]);
