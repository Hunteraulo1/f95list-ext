import { derived, get, writable } from 'svelte/store';

import type { GameType, TraductorType } from './schemas';
import type { ComboBox, Settings, Update } from './types';

import tags from '$lib/assets/tags.json';

export const games = writable<GameType[]>([]);

export const traductors = writable<TraductorType[]>([]);

const filterConfig = {
  domain: {
    title: 'Site',
    values: ['F95z', 'LewdCorner', 'Autre'],
  },
  version: {
    title: 'Statut de la traduction',
    values: ['À jour', 'Intégrée', 'Pas à jour'],
  },
  type: {
    title: 'Type',
    values: ['RenPy', 'RPGM', 'Unreal', 'HTLM', 'Flash', 'QSP', 'RenPy/RPGM', 'RenPy/Unity', 'Autre'],
  },
  status: {
    title: 'Status',
    values: ['EN COURS', 'ABANDONNÉ', 'TERMINÉ'],
  },
};

const defaultFilters = (): ComboBox[] => [
  {
    title: filterConfig.domain.title,
    name: 'domain',
    open: false,
    values: filterConfig.domain.values.map((value) => ({ value, checked: false })),
  },
  {
    title: filterConfig.version.title,
    name: 'version',
    open: false,
    values: filterConfig.version.values.map((value) => ({ value, checked: false })),
  },
  {
    title: filterConfig.type.title,
    name: 'type',
    open: false,
    values: filterConfig.type.values.map((value) => ({ value, checked: false })),
  },
  {
    title: filterConfig.status.title,
    name: 'status',
    open: false,
    values: filterConfig.status.values.map((value) => ({ value, checked: false })),
  },
  {
    title: 'Traducteur',
    name: 'traductor',
    open: false,
    values: get(traductors).map((traductor) => ({
      value: traductor.name || 'NoName',
      checked: false,
    })),
  },
  {
    title: 'Tags',
    name: 'tags',
    open: false,
    values: tags.map((tag) => ({ value: tag, checked: false })),
  },
];

const filterFn = () => {
  const { subscribe, set, update } = writable(defaultFilters());

  return {
    subscribe,
    set,
    update,
    reset: () => set(defaultFilters()),
  };
};

export const filter = filterFn();
export type FilterType = typeof filter;

export const search = writable('');

export const filteredGames = derived([games, filter, search], ([$games, $filter, $search]) =>
  $games.filter((game) => {
    if (!game.name.toLowerCase().includes($search.toLowerCase())) return false;

    const checkVersion = (value: string): boolean => {
      switch (value) {
        case 'À jour':
          return game.version === game.tversion || game.tversion === 'Intégrée';
        case 'Intégrée':
          return game.tversion === 'Intégrée';
        case 'Pas à jour':
          return game.version !== game.tversion && game.tversion !== 'Intégrée';
        default:
          return false;
      }
    };

    return $filter.every(({ name, values }) => {
      const hasCheckedValues = values.some((value) => value.checked);
      if (!hasCheckedValues) return true;

      switch (name) {
        case 'tags':
          return values.every((value) => !value.checked || game.tags.includes(value.value));
        case 'traductor':
          return values.some((value) => value.checked && game.traductor?.includes(value.value));
        case 'version':
          return values.some((value) => value.checked && checkVersion(value.value));
        default:
          return values.some((value) => value.checked && game[name] === value.value);
      }
    });
  }),
);

export const updates = writable<Update[]>([]);

const settingsData: string | null = localStorage.getItem('settings');

export const settings = writable<Settings>(
  settingsData ? JSON.parse(settingsData) : { tagsHide: true, intergrateFeature: false, autoFocusGame: true },
);

// Webapp

export const selectedGame = writable<GameType | undefined>();
