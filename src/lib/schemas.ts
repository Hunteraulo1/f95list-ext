import { array, boolean, type InferOutput, nullable, object, picklist, string } from 'valibot'

const Game = object({
  domain: picklist(['f95zone.to', 'lewdcorner.com', 'Autre']) /* change domain */,
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

const Games = array(Game)

export { Game, Games }

type GameType = InferOutput<typeof Game>
type GamesType = InferOutput<typeof Games>

export type { GamesType, GameType }
