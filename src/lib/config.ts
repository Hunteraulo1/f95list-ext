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

  // URLs autorisées selon le build : en prod on n'honore JAMAIS une URL de dev
  // (localhost / 127.0.0.1) éventuellement persistée — un ancien réglage de dev ne
  // doit pas suivre l'utilisateur après publication. En dev, tout est autorisé.
  const allowed = new Set(
    Object.values(environments).filter((url) => import.meta.env.DEV || !/localhost|127\.0\.0\.1/.test(url)),
  );

  // Normalise une valeur stockée vers une URL valide pour ce build, sinon le défaut.
  const sanitize = (url: string | null | undefined): string => {
    const trimmed = url?.replace(/\/$/, '');
    return trimmed && allowed.has(trimmed) ? trimmed : defaultUrl;
  };

  const init = async (): Promise<void> => {
    if (initialized) return;
    initialized = true;
    store.set(sanitize(await storage.getItem<string>(storageKey)));
    storage.watch<string>(storageKey, (value) => store.set(sanitize(value)));
  };

  // Lecture synchrone du storage (utilisable hors contexte Svelte, ex. background).
  const get = async (): Promise<string> => sanitize(await storage.getItem<string>(storageKey));

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

  // Noms d'environnements proposables dans l'UI pour ce build (dev masqué en prod).
  const envNames = (Object.keys(environments) as (keyof T)[]).filter((name) => allowed.has(environments[name]));

  return { environments, defaultUrl, store, init, get, set, setEnv, nameOf, envNames };
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
  // 127.0.0.1 et non localhost : en build Firefox dev, WXT injecte `http://localhost/*`
  // (reload du dev server) qui rendrait le fetch privilégié et masquerait l'en-tête Origin
  // requis par l'auth par origine. 127.0.0.1 échappe à ce pattern → requête CORS avec Origin.
  dev: 'http://127.0.0.1:3001',
} as const;
export type ApiEnvName = keyof typeof API_ENVIRONMENTS;
export const api = createEnvConfig(API_ENVIRONMENTS, 'local:f95france_api_base_url');
