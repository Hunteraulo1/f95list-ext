import { site } from '../config.js';
import type { Preset } from '../savedFilters.js';

export type SavedFilterKind = 'games' | 'updates';

/** Thrown when the server answers 401 → the token has been revoked. */
export class UnauthorizedError extends Error {
  constructor(message = 'Token révoqué') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

const extensionUrl = async (path: string): Promise<string> => `${await site.get()}/api/extension${path}`;

/**
 * Lier le compte : échange un code à 8 caractères contre un token bearer permanent.
 * @throws Error avec le message renvoyé par le serveur sur 400.
 */
export const linkAccount = async (code: string): Promise<string> => {
  const response = await fetch(await extensionUrl('/link'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body?.error ?? `Erreur ${response.status}`);
  }

  if (!body?.token || typeof body.token !== 'string') {
    throw new Error('Réponse invalide du serveur');
  }

  return body.token;
};

const authedFetch = async (token: string, path: string, init?: RequestInit): Promise<Response> => {
  const response = await fetch(await extensionUrl(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...init?.headers,
    },
  });

  if (response.status === 401) throw new UnauthorizedError();

  return response;
};

export interface ExtensionUser {
  role: string | null;
}

/** Récupère le profil du compte lié (notamment son rôle). */
export const getMe = async (token: string): Promise<ExtensionUser> => {
  const response = await authedFetch(token, '/me');

  if (!response.ok) throw new Error(`GET me → ${response.status}`);

  const body = await response.json().catch(() => ({}));
  return { role: typeof body?.role === 'string' ? body.role : null };
};

/** Récupère les presets sauvegardés du compte pour `kind`. */
export const getSavedFilters = async (token: string, kind: SavedFilterKind): Promise<Preset[]> => {
  const response = await authedFetch(token, `/saved-filters/${kind}`);

  if (!response.ok) throw new Error(`GET saved-filters/${kind} → ${response.status}`);

  const body = await response.json().catch(() => ({}));
  return Array.isArray(body?.filters) ? (body.filters as Preset[]) : [];
};

/** Remplace entièrement la liste de presets du compte pour `kind` (dernier-écrivain-gagne). */
export const putSavedFilters = async (token: string, kind: SavedFilterKind, filters: Preset[]): Promise<void> => {
  const response = await authedFetch(token, `/saved-filters/${kind}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters }),
  });

  if (!response.ok) throw new Error(`PUT saved-filters/${kind} → ${response.status}`);
};
