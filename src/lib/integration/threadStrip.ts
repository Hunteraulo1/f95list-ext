import type { GameType } from '@/lib/schemas';
import './threadStrip.css';

/**
 * Bande « Traduction FR » affichée en haut d'un thread F95zone / LewdCorner.
 * Mise en page via nos classes `f95fr-*`, couleurs via les classes de base
 * XenForo (`block-container`, `label--*`, `button`) pour suivre le thème du site.
 */

export const FLAG_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAELBAMAAAAFMM1/AAAAGFBMVEX///8AI5XtKTmerNf6yMwAGJDtKDjsITLN9eOpAAAA9ElEQVR42u3P0QAAQAgFsBRO4WQCyCB/iCDe72awerGpWO9PiYiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIJA7ZdJrTjvyKSgAAAABJRU5ErkJggg==';

const STATUS_LABEL: Record<GameType['status'], string> = {
  'EN COURS': 'label--blue',
  TERMINÉ: 'label--green',
  ABANDONNÉ: 'label--red',
};

type Child = Node | string | null | undefined | false;

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: { class?: string; title?: string; href?: string } = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);

  if (props.class) node.className = props.class;
  if (props.title) node.title = props.title;
  if (props.href && node instanceof HTMLAnchorElement) {
    node.href = props.href;
    node.target = '_blank';
    node.rel = 'noopener noreferrer';
  }

  for (const child of children) if (child) node.append(child);

  return node;
};

const sep = () => el('span', { class: 'f95fr-muted' }, '·');

const normalizeVersion = (version: string) =>
  version
    .toLowerCase()
    .replace(/^v\.?\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Version du jeu lue dans le titre du thread : « Nom [v0.22.1 Beta] [Dev] ». */
export const readThreadVersion = (title: Element | null): string | null => {
  if (!title) return null;

  // Seulement les nœuds texte : on ignore les préfixes (Ren'Py, Completed…) et notre drapeau.
  const text = Array.from(title.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '')
    .join(' ');

  return text.match(/\[([^\]]+)\]/)?.[1]?.trim() || null;
};

const versionState = (game: GameType, threadVersion: string | null) => {
  if (game.tname === 'Intégrée') return el('span', { class: 'label label--green' }, 'Intégrée au jeu');
  if (game.tname === 'Pas de traduction') return el('span', { class: 'label label--gray' }, 'Pas de traduction');

  const reference = threadVersion ?? game.version;

  if (normalizeVersion(game.tversion) === normalizeVersion(reference)) {
    return el('span', { class: 'label label--green' }, 'À jour');
  }

  return el(
    'span',
    { class: 'label label--orange', title: `Version du jeu : ${reference}` },
    `En retard · jeu ${reference}`,
  );
};

const person = (prefix: string, name: string | null, href: string | null) => {
  if (!name) return null;

  return el(
    'span',
    {},
    `${prefix} `,
    href ? el('a', { href, class: 'f95fr-strong' }, name) : el('span', { class: 'f95fr-strong' }, name),
  );
};

const row = (game: GameType, threadVersion: string | null) => {
  const hasTranslation = game.tname !== 'Pas de traduction' && game.tname !== 'Intégrée';
  const brokenLink = game.ttype === 'Lien Trad HS';

  const translator = person('Traduit par', game.traductor, game.trlink);
  const proofreader = person(translator ? ', relu par' : 'Relu par', game.proofreader, game.prlink);

  return el(
    'div',
    { class: 'f95fr-strip' },
    el('img', { class: 'f95fr-flag' }),
    el(
      'span',
      { class: 'f95fr-strip-label' },
      game.tname === 'Traduction (mod inclus)' ? 'Traduction FR (mod inclus)' : 'Traduction FR',
    ),
    hasTranslation && el('span', { class: 'f95fr-strong' }, game.tversion),
    versionState(game, threadVersion),
    sep(),
    brokenLink
      ? el('span', { class: 'label label--red' }, 'Lien HS')
      : el('span', { class: game.ttype === 'À tester' ? 'label label--yellow' : 'f95fr-muted' }, game.ttype),
    el('span', { class: `label ${STATUS_LABEL[game.status]}` }, game.status),
    (translator || proofreader) && sep(),
    (translator || proofreader) && el('span', {}, translator, proofreader),
    hasTranslation &&
      game.tlink &&
      el(
        'a',
        {
          href: game.tlink,
          class: 'button button--icon f95fr-download',
          title: brokenLink ? 'Lien signalé HS' : undefined,
        },
        el('span', { class: 'button-text' }, 'Télécharger la traduction'),
      ),
  );
};

/** Insère la bande sous le bloc « Versions » de F95zone s'il existe, sinon au-dessus des messages. */
export const insertThreadStrip = (games: GameType[], title: Element | null) => {
  if (games.length === 0 || document.querySelector('.f95fr-thread')) return;

  const threadVersion = readThreadVersion(title);

  const block = el(
    'div',
    { class: 'block f95fr-thread' },
    el('div', { class: 'block-container' }, ...games.map((game) => row(game, threadVersion))),
  );

  for (const img of block.querySelectorAll<HTMLImageElement>('.f95fr-flag')) img.src = FLAG_SRC;

  const f95wg = document.querySelector('.f95wg-thread');
  if (f95wg) return f95wg.after(block);

  const messages = document.querySelector('.block--messages');
  if (messages) return messages.before(block);

  document.querySelector('.p-body-pageContent')?.prepend(block);
};
