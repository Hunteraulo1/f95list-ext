import type { FilterType } from './stores.js';

// Wire format shared with the F95 France website (/api/extension/saved-filters/*).
// A Preset is the serialized form of a saved filter (games or updates).
export interface PresetValue {
  value: string;
  label: string;
  checked: boolean;
  inverse: boolean;
}

export interface PresetGroup {
  title: string;
  name: string;
  values: PresetValue[];
}

export interface Preset {
  query: string; // texte de recherche, max 200 car.
  sort: string; // ex. "updated_desc"
  groups: PresetGroup[];
}

export const MAX_PRESETS = 5;
export const QUERY_MAX_LENGTH = 200;

// L'extension trie toujours par nom : on conserve une valeur de tri par défaut
// pour respecter le format du site (round-trip) sans l'appliquer localement.
export const DEFAULT_SORT = 'updated_desc';

/** Convert the extension's internal filter (+ search query) into a wire Preset. */
export const filterToPreset = (filter: FilterType, query = '', sort: string = DEFAULT_SORT): Preset => ({
  query: query.slice(0, QUERY_MAX_LENGTH),
  sort: sort || DEFAULT_SORT,
  groups: filter.map((group) => ({
    title: group.title,
    name: group.name as string,
    values: group.values.map((value) => ({
      value: value.value,
      label: value.value,
      checked: value.checked,
      inverse: value.inverse ?? false,
    })),
  })),
});

/**
 * Apply a Preset onto a fresh default filter so the taxonomy stays current:
 * unknown groups/values from the site are ignored, missing ones default to unchecked.
 */
export const presetToFilter = (preset: Preset, base: FilterType): { filter: FilterType; query: string } => {
  const groupsByName = new Map(preset.groups?.map((group) => [group.name, group]) ?? []);

  const filter: FilterType = base.map((group) => {
    const presetGroup = groupsByName.get(group.name as string);
    if (!presetGroup) return { ...group, values: group.values.map((v) => ({ ...v, checked: false, inverse: false })) };

    const valuesByValue = new Map(presetGroup.values.map((v) => [v.value, v]));

    return {
      ...group,
      values: group.values.map((value) => {
        const presetValue = valuesByValue.get(value.value);
        return presetValue
          ? { ...value, checked: presetValue.checked, inverse: presetValue.inverse }
          : { ...value, checked: false, inverse: false };
      }),
    };
  });

  return { filter, query: (preset.query ?? '').slice(0, QUERY_MAX_LENGTH) };
};

/**
 * Old saved filters were stored as raw FilterType[] (no query/sort) under
 * localStorage['filters']. Detect and migrate those to Preset[].
 */
const looksLikePreset = (entry: unknown): entry is Preset =>
  typeof entry === 'object' && entry !== null && 'groups' in entry && Array.isArray((entry as Preset).groups);

export const normalizeStoredPresets = (raw: unknown): Preset[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      if (looksLikePreset(entry)) {
        return {
          query: typeof entry.query === 'string' ? entry.query.slice(0, QUERY_MAX_LENGTH) : '',
          sort: typeof entry.sort === 'string' && entry.sort ? entry.sort : DEFAULT_SORT,
          groups: entry.groups,
        } satisfies Preset;
      }

      // Legacy FilterType[] entry → wrap as a Preset (no query/sort saved back then).
      if (Array.isArray(entry)) return filterToPreset(entry as FilterType);

      return null;
    })
    .filter((entry): entry is Preset => entry !== null)
    .slice(0, MAX_PRESETS);
};
