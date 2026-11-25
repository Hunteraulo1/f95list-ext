import { FLAG_SRC, insertThreadStrip } from '@/lib/integration/threadStrip';
import type { GameType } from '@/lib/schemas';

// biome-ignore lint/correctness/noUndeclaredVariables: define function
export default defineContentScript({
  matches: [
    '*://f95zone.to/sam/latest_alpha/*',
    '*://f95zone.to/threads/*',
    '*://lewdcorner.com/latest-updates*',
    '*://lewdcorner.com/threads/*',
  ],
  main() {
    console.info('[F95ListFR] Injecting script starting !');

    init();
  },
});

const insert = (games: GameType[]) => {
  if (!(games && games.length > 0)) return;

  const { pathname, hostname } = window.location;

  if (pathname === '/sam/latest_alpha/') {
    latest('.resource-tile_link', games);
  } else if (pathname.startsWith('/latest-updates')) {
    latestLewdCorner(games);
  } else if (pathname.startsWith('/threads/')) {
    const tileId = Number(window.location.pathname.split('/')[2]?.split('.')[1]);
    const matches = games.filter((game) => game.threadId === tileId && game.hostname === hostname);
    const [first] = matches;

    if (!first) return;

    const title = document.querySelector('.p-title-value');

    // Avant le drapeau : la version est lue dans le titre.
    insertThreadStrip(matches, title);

    if (title && !title.classList.contains('flag-inserted')) {
      createFlag(title, first.tlink);
      title.classList.add('flag-inserted');
    }
  }
};

const init = async () => {
  try {
    if (document.readyState === 'loading') {
      await new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Réglage « Activer l'intégration F95/LC » du popup.
    if ((await browser.runtime.sendMessage('f95list-integrate')) === false) return;

    const data = await browser.runtime.sendMessage('f95list-script');

    insert(data);

    const { pathname } = window.location;

    const f95 = pathname === '/sam/latest_alpha/';
    const lc = pathname.startsWith('/latest-updates');

    if (f95 || lc) {
      const mutationCallback: MutationCallback = async (mutationsList) => {
        if ((f95 && mutationsList.length > 35) || lc) {
          insert(data);
        }
      };
      const observer = new MutationObserver(mutationCallback);
      const config = { childList: true, subtree: true };

      observer.observe(document.body, config);
    }

    console.info('[F95ListFR] Injecting script successful !');
  } catch (error) {
    console.error(error);
  }
};

const latest = (query: string, games: GameType[]) => {
  const tiles = document.querySelectorAll(query);

  const { hostname } = window.location;

  for (const tile of Array.from(tiles)) {
    const tileId =
      hostname === 'f95zone.to'
        ? Number((tile as HTMLAnchorElement).pathname.split('/')[2])
        : Number((tile as HTMLAnchorElement).pathname.split('/')[2]?.split('.')[1]);

    if (tile.classList.contains('flag-inserted')) return;

    if (games.find((game) => game.threadId === tileId && game.hostname === hostname)) {
      const element =
        hostname === 'f95zone.to'
          ? tile.children[1]?.children[0]
          : tile.parentElement?.parentElement?.children[1]?.children[0];

      if (!element) return;

      createFlag(element);
      tile.classList.add('flag-inserted');
    }
  }
};

// Page LewdCorner /latest-updates : chaque carte est un
// <article class="lcCard" data-card-id="THREAD_ID">. Les badges (PLUS, Ren'Py…) sont
// présents deux fois : sur la carte et dans l'aperçu au survol.
// Le site reconstruit les cartes (rechargement de la grille, carrousel) : on vérifie donc
// la présence du drapeau dans chaque ligne de badges plutôt qu'une classe sur la carte.
let lcLastLog = '';

const latestLewdCorner = (games: GameType[]) => {
  const { hostname } = window.location;
  const translated = new Set(games.filter((game) => game.hostname === hostname).map((game) => game.threadId));
  const cards = document.querySelectorAll<HTMLElement>('article.lcCard[data-card-id]');
  let matched = 0;

  for (const card of Array.from(cards)) {
    const tileId = Number(card.dataset.cardId);
    if (!tileId || !translated.has(tileId)) continue;

    matched += 1;

    for (const badges of Array.from(card.querySelectorAll('.lcCardMediaBadges:not(.lcCardMediaBadges--right)'))) {
      if (!badges.querySelector('.f95fr-inline-flag')) createFlag(badges, null, 24);
    }
  }

  const log = `${cards.length} cartes, ${matched} traduites`;
  if (log !== lcLastLog) {
    lcLastLog = log;
    console.info(`[F95ListFR] LewdCorner latest-updates : ${log}`);
  }
};

const createFlag = (parent: Element, tlink: GameType['tlink'] = null, size = 32) => {
  const anchor: HTMLAnchorElement = document.createElement('a');
  const img: HTMLImageElement = document.createElement('img');

  anchor.target = '_BLANK';
  if (tlink) anchor.href = tlink;

  img.style.width = `${size}px`;
  img.style.minWidth = `${size}px`;
  img.style.marginRight = '4px';
  img.style.borderRadius = '4px';
  img.style.float = 'inherit';
  img.style.verticalAlign = 'middle';
  anchor.className = 'f95fr-inline-flag';
  img.src = FLAG_SRC;

  anchor.append(img);
  parent.prepend(anchor);
};
