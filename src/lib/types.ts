import type { GameType } from './schemas.js';

export interface ComboBox {
  title: string;
  name: keyof GameType;
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
  id: GameType['id'];
}
