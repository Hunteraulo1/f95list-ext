import { derived, get, type Writable, writable } from 'svelte/store';
import type { FlatErrors } from 'valibot';
import tags from '@/lib/assets/tags.json';
import type { Page } from '@/lib/components/Nav.svelte';
import { normalizeStoredPresets, type Preset } from './savedFilters.js';
import type { GameType, TraductorType, UpdateType } from './schemas.js';
import type { ComboBox, Settings } from './types.js';

export const games = writable<GameType[]>([]);
export const errors = writable<FlatErrors<any>[]>([]); // TODO: improve type

export const traductors = writable<TraductorType[]>([]);

export const updates = writable<UpdateType[]>([]);

export type FilterType = ComboBox[];

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
    values: ['RenPy', 'RPGM', 'Unreal', 'HTML', 'Flash', 'QSP', 'Autre'],
  },
  ttype: {
    title: 'Qualité de la traduction',
    values: [
      'Traduction Humaine',
      'Traduction Automatique',
      'Traduction Semi-Automatique',
      'VO Française',
      'À tester',
      'Lien Trad HS',
    ],
  },
  status: {
    title: 'Status',
    values: ['EN COURS', 'ABANDONNÉ', 'TERMINÉ'],
  },
};

const makeGroup = (title: string, name: ComboBox['name'], values: string[]): ComboBox => ({
  title,
  name,
  open: false,
  values: values.map((value) => ({ value, checked: false, inverse: false })),
});

// Groupes de filtres partagés par les jeux et les updates (attributs du jeu).
const gameFilterGroups = (): FilterType => [
  makeGroup(filterConfig.domain.title, 'domain', filterConfig.domain.values),
  makeGroup(filterConfig.version.title, 'version', filterConfig.version.values),
  makeGroup(filterConfig.type.title, 'type', filterConfig.type.values),
  makeGroup(filterConfig.status.title, 'status', filterConfig.status.values),
  makeGroup(filterConfig.ttype.title, 'ttype', filterConfig.ttype.values),
  makeGroup(
    'Traducteur',
    'traductor',
    get(traductors).map((traductor) => traductor.name || 'NoName'),
  ),
  makeGroup('Tags', 'tags', tags),
];

// Les updates ajoutent le type de mise à jour aux attributs du jeu.
const updateFilterGroups = (): FilterType =>
  [makeGroup('Type de MàJ', 'utype', ['AJOUT DE JEU', 'MISE À JOUR'])].concat(gameFilterGroups());

const filterFn = (build: () => FilterType) => {
  const { subscribe, set, update } = writable<FilterType>(build());

  return {
    subscribe,
    set,
    update,
    reset: () => set(build()),
  };
};

export const filter = filterFn(gameFilterGroups);
export const updatesFilter = filterFn(updateFilterGroups);

export const search = writable('');
export const updatesSearch = writable('');

/** Rebuild les filtres par défaut (utile après chargement des traducteurs). */
export const resetFilters = () => {
  filter.reset();
  updatesFilter.reset();
};

// --- Logique de correspondance partagée ---------------------------------------

const checkVersion = (game: GameType, value: string): boolean => {
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

// some/every avec gestion de l'inversion, identique pour version/traductor/select.
const matchSelectGroup = (values: ComboBox['values'], equals: (value: string) => boolean): boolean => {
  if (!values.some((v) => v.checked)) return true;

  if (!values.some((v) => v.inverse)) {
    return values.some((v) => v.checked && equals(v.value));
  }

  return values.every((v) => {
    if (!v.checked) return true;
    if (v.inverse) return !equals(v.value);
    return equals(v.value);
  });
};

const matchGroup = (game: GameType, group: ComboBox): boolean => {
  const { name, values } = group;
  if (!values.some((v) => v.checked)) return true;

  switch (name) {
    case 'tags':
      return values.every((v) => {
        if (!v.checked) return true;
        if (v.inverse) return !game.tags.includes(v.value);
        return game.tags.includes(v.value);
      });
    case 'traductor':
      return matchSelectGroup(values, (value) => Boolean(game.traductor?.includes(value)));
    case 'version':
      return matchSelectGroup(values, (value) => checkVersion(game, value));
    case 'utype':
      return true; // évalué séparément contre update.type
    default:
      return matchSelectGroup(values, (value) => game[name as keyof GameType] === value);
  }
};

const gameMatchesFilter = (game: GameType, groups: FilterType, searchText: string): boolean => {
  if (searchText && !game.name.toLowerCase().includes(searchText.toLowerCase())) return false;
  return groups.every((group) => matchGroup(game, group));
};

export const filteredGames = derived([games, filter, search], ([$games, $filter, $search]) =>
  $games.filter((game) => gameMatchesFilter(game, $filter, $search)),
);

export const filteredUpdates = derived(
  [updates, games, updatesFilter, updatesSearch],
  ([$updates, $games, $filter, $search]) =>
    $updates.filter((update) => {
      const game =
        $games.find((entry) => entry.gameId === update.gameId) ?? $games.find((entry) => entry.id === update.gameId);
      if (!game) return false;

      const utypeGroup = $filter.find((group) => group.name === 'utype');
      if (utypeGroup && !matchSelectGroup(utypeGroup.values, (value) => update.type === value)) return false;

      return gameMatchesFilter(game, $filter, $search);
    }),
);

// --- Filtres sauvegardés (presets, synchronisés avec le compte) ---------------

const parseJSON = (raw: string | null): unknown => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const createSavedFiltersStore = (storageKey: string): Writable<Preset[]> => {
  const store = writable<Preset[]>(normalizeStoredPresets(parseJSON(localStorage.getItem(storageKey))));

  store.subscribe((value) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error('savedFilters persist error:', error);
    }
  });

  return store;
};

export const gamesSavedFilters = createSavedFiltersStore('filters');
export const updatesSavedFilters = createSavedFiltersStore('updates_filters');

// Contexte passé aux composants de filtre pour servir jeux et updates indifféremment.
export interface FilterContext {
  filter: typeof filter;
  search: Writable<string>;
  savedFilters: Writable<Preset[]>;
  defaults: () => FilterType;
}

export const gamesContext: FilterContext = {
  filter,
  search,
  savedFilters: gamesSavedFilters,
  defaults: gameFilterGroups,
};

export const updatesContext: FilterContext = {
  filter: updatesFilter,
  search: updatesSearch,
  savedFilters: updatesSavedFilters,
  defaults: updateFilterGroups,
};

const settingsData: string | null = localStorage.getItem('settings');

export const settings = writable<Settings>(
  settingsData ? JSON.parse(settingsData) : { tagsHide: true, intergrateFeature: true, autoFocusGame: true },
);

export const autoFocusBlock = writable<boolean>(false);

export const page = writable<Page['link']>('list');

export const outdated = writable<boolean>();

// Webapp

export const selectedGame = writable<GameType | undefined>();
