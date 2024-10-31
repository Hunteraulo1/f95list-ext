import { derived, get, writable } from 'svelte/store';

import type { GameType, TraductorType } from './schemas';
import type { ComboBox, Settings, Update } from './types';

import tags from '$lib/assets/tags.json';

export const games = writable<GameType[]>([]);

export const traductors = writable<TraductorType[]>([]);

const defaultFilters = (): ComboBox[] => [
  {
    title: 'Site',
    name: 'domain',
    open: false,
    values: [
      { value: 'F95z', checked: false },
      { value: 'LewdCorner', checked: false },
      { value: 'Autre', checked: false },
    ],
  },
  {
    title: 'Statut de la traduction',
    name: 'version',
    open: false,
    values: [
      { value: 'À jour', checked: false },
      { value: 'Intégrée', checked: false },
      { value: 'Pas à jour', checked: false },
    ],
  },
  {
    title: 'Type',
    name: 'type',
    open: false,
    values: [
      { value: 'RenPy', checked: false },
      { value: 'RPGM', checked: false },
      { value: 'Unreal', checked: false },
      { value: 'HTLM', checked: false },
      { value: 'Flash', checked: false },
      { value: 'QSP', checked: false },
      { value: 'RenPy/RPGM', checked: false },
      { value: 'RenPy/Unity', checked: false },
      { value: 'Autre', checked: false },
    ],
  },
  {
    title: 'Status',
    name: 'status',
    open: false,
    values: [
      { value: 'EN COURS', checked: false },
      { value: 'ABANDONNÉ', checked: false },
      { value: 'TERMINÉ', checked: false },
    ],
  },
  {
    title: 'Traducteur',
    name: 'traductor',
    open: false,
    values: get(traductors).map((traductor) => ({ value: traductor.name ?? 'NoName', checked: false })),
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
    const matchesSearch = game.name.toLowerCase().includes($search);
    const matchesFilters = $filter.every(({ name, values }) => {
      const activeValues = values.filter((v) => v.checked).map((v) => v.value);
      return (
        activeValues.length === 0 ||
        (game[name as keyof GameType] != null && activeValues.includes(String(game[name as keyof GameType])))
      );
    });
    return matchesSearch && matchesFilters;
  }),
);

export const updates = writable<Update[]>([]);

const settingsData: string | null = localStorage.getItem('settings');

export const settings = writable<Settings>(
  settingsData ? JSON.parse(settingsData) : { tagsHide: true, intergrateFeature: false, autoFocusGame: true },
);

// Webapp

export const detailGame = writable<GameType | undefined>();

export const pathname = writable<string>('/webapp');
