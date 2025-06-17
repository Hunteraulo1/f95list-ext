import { array, boolean, date, type InferOutput, nullable, number, object, picklist, string } from 'valibot';

const Game = object({
  id: nullable(number()),
  domain: picklist(['F95z', 'LewdCorner', 'Autre', 'Unknown']),
  hostname: nullable(picklist(['f95zone.to', 'lewdcorner.com'])),
  name: string(),
  version: string(),
  tversion: string(),
  tname: picklist(['Traduction', 'Traduction (mod inclus)', 'Intégrée', 'Pas de traduction']),
  status: picklist(['EN COURS', 'TERMINÉ', 'ABANDONNÉ']),
  tags: array(string()),
  type: picklist(['RenPy', 'RPGM', 'Unity', 'Unreal', 'Flash', 'HTLM', 'QSP', 'Autre', 'RenPy/RPGM', 'RenPy/Unity']),
  traductor: nullable(string()),
  proofreader: nullable(string()),
  ttype: picklist([
    'Traduction Humaine',
    'Traduction Automatique',
    'Traduction Semi-Automatique',
    'VO Française',
    'À tester',
    'Lien Trad HS',
  ]),
  ac: boolean(),
  link: string(),
  tlink: nullable(string()),
  trlink: nullable(string()),
  prlink: nullable(string()),
  image: nullable(string()),
});

const Update = object({
  date: date(),
  type: picklist(['AJOUT DE JEU', 'MISE À JOUR']),
  games: array(Game),
});

const Traductor = object({
  name: Game.entries.traductor,
  pages: array(
    object({
      title: string(),
      link: string(),
    }),
  ),
  discordId: nullable(number()),
  tradCount: number(),
  readCount: number(),
  score: number(),
});

const Games = array(Game);
const Updates = array(Update);

const TraductorsData = array(Traductor);

export { Game, Games, TraductorsData, Update, Updates };

type GameType = InferOutput<typeof Game>;
type TraductorType = InferOutput<typeof Traductor>;
type UpdateType = InferOutput<typeof Update>;

export type { GameType, TraductorType, UpdateType };
