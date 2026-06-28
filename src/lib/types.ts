import type { GameType } from './schemas.js';

export interface ComboBox {
  title: string;
  // 'utype' n'est pas une clé de GameType : c'est le groupe "Type de MàJ" propre aux updates.
  name: keyof GameType | 'utype';
  open: boolean;
  values: {
    value: GameType['domain' | 'status' | 'type'] | string;
    checked: boolean;
    inverse?: boolean;
  }[];
}

export interface Settings {
  theme?: undefined;
  tagsHide: boolean;
  intergrateFeature: boolean;
  autoFocusGame: boolean;
}

export interface IdGameBox {
  domain: GameType['domain'];
  threadId: GameType['threadId'];
}
