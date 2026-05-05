import { array, boolean, date, nullable, number, object, picklist, string, union, type InferOutput } from 'valibot';

const Game = object({
  id: nullable(string()),
  gameId: nullable(string()),
  threadId: nullable(number()),
  domain: picklist(['F95z', 'LewdCorner', 'Autre', 'Unknown']),
  hostname: nullable(picklist(['f95zone.to', 'lewdcorner.com'])),
  name: string(),
  version: string(),
  tversion: string(),
  description: nullable(string()),
  tname: picklist(['Traduction', 'Traduction (mod inclus)', 'Intégrée', 'Pas de traduction']),
  status: picklist(['EN COURS', 'TERMINÉ', 'ABANDONNÉ']),
  tags: array(string()),
  type: picklist(['RenPy', 'RPGM', 'Unity', 'Unreal', 'Flash', 'HTML', 'QSP', 'Autre']),
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
  gameId: Game.entries.gameId,
});

const Traductor = object({
  id: nullable(union([number(), string()])),
  name: Game.entries.traductor,
  pages: array(
    object({
      title: string(),
      link: string(),
    }),
  ),
  discordId: nullable(union([number(), string()])),
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
