import { array, boolean, type InferOutput, nullable, number, object, picklist, string } from 'valibot'

const Game = object({
  domain: picklist(['F95z', 'LewdCorner', 'Autre']),
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
  image: nullable(string()),
})

const UpdateData = object({
  date: string(),
  type: picklist(['AJOUT DE JEU', 'MISE À JOUR']),
  names: array(Game.entries.name),
})

const Traductor = object({
  name: Game.entries.traductor,
  pages: array(
    object({
      title: string(),
      link: string(),
    })
  ),
  tradCount: number(),
  readCount: number(),
  score: number(),
})

const Games = array(Game)

const UpdatesData = array(UpdateData)
const TraductorsData = array(Traductor)

export { Game, Games, TraductorsData, UpdateData, UpdatesData }

type GameType = InferOutput<typeof Game>
type UpdateType = InferOutput<typeof UpdateData>
type TraductorType = InferOutput<typeof Traductor>

export type { GameType, TraductorType, UpdateType }
