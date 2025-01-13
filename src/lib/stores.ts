import { derived, get, writable } from 'svelte/store';

import type { GameType, TraductorType } from './schemas.js';
import type { ComboBox, Settings, Update } from './types.js';

import type { Page } from '$components/Nav.svelte';
import tags from '$lib/assets/tags.json' assert { type: 'json' };

export const games = writable<GameType[]>([]);

export const traductors = writable<TraductorType[]>([]);

const filterConfig = {
  domain: {
    title: 'Site',
    values: ['F95z', 'LewdCorner', 'Autre'],
  },
  version: {
    title: 'Status de la traduction',
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
    values: filterConfig.domain.values.map((value) => ({
      value,
      checked: false,
      inverse: false,
    })),
  },
  {
    title: filterConfig.version.title,
    name: 'version',
    open: false,
    values: filterConfig.version.values.map((value) => ({
      value,
      checked: false,
      inverse: false,
    })),
  },
  {
    title: filterConfig.type.title,
    name: 'type',
    open: false,
    values: filterConfig.type.values.map((value) => ({
      value,
      checked: false,
      inverse: false,
    })),
  },
  {
    title: filterConfig.status.title,
    name: 'status',
    open: false,
    values: filterConfig.status.values.map((value) => ({
      value,
      checked: false,
      inverse: false,
    })),
  },
  {
    title: 'Traducteur',
    name: 'traductor',
    open: false,
    values: get(traductors).map((traductor) => ({
      value: traductor.name || 'NoName',
      checked: false,
      inverse: false,
    })),
  },
  {
    title: 'Tags',
    name: 'tags',
    open: false,
    values: tags.map((tag) => ({ value: tag, checked: false, inverse: false })),
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
          return values.every((value) => {
            if (!value.checked) return true;
            if (value.inverse) return !game.tags.includes(value.value);
            return game.tags.includes(value.value);
          });
        case 'traductor':
          if (!values.some((v) => v.checked)) return true;

          if (!values.some((v) => v.inverse)) {
            return values.some((value) => {
              if (!value.checked) return false;
              return game.traductor?.includes(value.value);
            });
          }

          return values.every((value) => {
            if (!value.checked) return true;
            if (value.inverse) {
              return !game.traductor?.includes(value.value);
            }
            return game.traductor?.includes(value.value);
          });
        case 'version':
          if (!values.some((v) => v.checked)) return true;

          if (!values.some((v) => v.inverse)) {
            return values.some((value) => {
              if (!value.checked) return false;
              return checkVersion(value.value);
            });
          }

          return values.every((value) => {
            if (!value.checked) return true;
            if (value.inverse) {
              return !checkVersion(value.value);
            }
            return checkVersion(value.value);
          });
        default:
          if (!values.some((v) => v.checked)) return true;

          if (!values.some((v) => v.inverse)) {
            return values.some((value) => {
              if (!value.checked) return false;
              return game[name] === value.value;
            });
          }

          return values.every((value) => {
            if (!value.checked) return true;
            if (value.inverse) {
              return game[name] !== value.value;
            }
            return game[name] === value.value;
          });
      }
    });
  }),
);

export const updates = writable<Update[]>([]);

const settingsData: string | null = localStorage.getItem('settings');

export const settings = writable<Settings>(
  settingsData ? JSON.parse(settingsData) : { tagsHide: true, intergrateFeature: true, autoFocusGame: true },
);

export const autoFocusBlock = writable<boolean>(false);

// Webapp

export const selectedGame = writable<GameType | undefined>();

export const page = writable<Page['link']>('list');
