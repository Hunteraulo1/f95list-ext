import { array, boolean, type InferOutput, nullable, object, picklist, string } from 'valibot'

const Game = object({
  domain: picklist(['F95z', 'LewdCorner', 'Autre']) /* change domain */,
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

const Games = array(Game)

const UpdatesData = array(UpdateData)

export { Game, Games, UpdateData, UpdatesData }

type GameType = InferOutput<typeof Game>
type UpdateType = InferOutput<typeof UpdateData>

export type { GameType, UpdateType }
