import type { GameType } from '@/lib/schemas';

// biome-ignore lint/correctness/noUndeclaredVariables: define function
export default defineContentScript({
  matches: [
    '*://f95zone.to/sam/latest_alpha/*',
    '*://f95zone.to/threads/*',
    '*://lewdcorner.com/latest-contents/*',
    '*://lewdcorner.com/threads/*',
  ],
  main() {
    console.info('[F95ListFR] Injecting script starting !');

    init();
  },
});

const insert = (games: GameType[]) => {
  if (!(games && games.length > 0)) return;

  const { pathname } = window.location;

  if (pathname === '/sam/latest_alpha/') {
    latest('.resource-tile_link', games);
  } else if (pathname.startsWith('/latest-contents/')) {
    latest('.structItem-title > a', games);
  } else if (pathname.startsWith('/threads/')) {
    const tileId = Number(window.location.pathname.split('/')[2].split('.')[1]);

    for (const game of games) {
      if (game.id !== tileId || game.hostname !== hostname) continue;

      const parent = document.querySelector('.p-title-value');

      if (!parent || parent?.classList.contains('flag-inserted')) return;

      createFlag(parent, game.tlink);
      parent?.classList.add('flag-inserted');
    }
  }
};

const init = async () => {
  try {
    const data = await browser.runtime.sendMessage('f95list-script');

    insert(data);

    const { pathname } = window.location;

    const f95 = pathname === '/sam/latest_alpha/';
    const lc = pathname.startsWith('/latest-contents/');

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

const { hostname } = window.location;

const latest = (query: string, games: GameType[]) => {
  const tiles = document.querySelectorAll(query);

  for (const tile of Array.from(tiles)) {
    const tileId =
      hostname === 'f95zone.to'
        ? Number((tile as HTMLAnchorElement).pathname.split('/')[2])
        : Number((tile as HTMLAnchorElement).pathname.split('/')[2].split('.')[1]);

    if (tile.classList.contains('flag-inserted')) return;

    if (games.find((game) => game.id === tileId && game.hostname === hostname)) {
      const element =
        hostname === 'f95zone.to'
          ? tile.children[1].children[0]
          : tile.parentElement?.parentElement?.children[1].children[0];

      if (!element) return;

      createFlag(element);
      tile.classList.add('flag-inserted');
    }
  }
};

const createFlag = (parent: Element, tlink: GameType['tlink'] = null) => {
  const anchor: HTMLAnchorElement = document.createElement('a');
  const img: HTMLImageElement = document.createElement('img');

  anchor.target = '_BLANK';
  if (tlink) anchor.href = tlink;

  img.style.width = '32px';
  img.style.marginRight = '4px';
  img.style.borderRadius = '4px';
  img.style.float = 'inherit';
  img.style.verticalAlign = 'middle';
  img.src =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAELBAMAAAAFMM1/AAAAGFBMVEX///8AI5XtKTmerNf6yMwAGJDtKDjsITLN9eOpAAAA9ElEQVR42u3P0QAAQAgFsBRO4WQCyCB/iCDe72awerGpWO9PiYiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIJA7ZdJrTjvyKSgAAAABJRU5ErkJggg==';

  anchor.append(img);
  parent.prepend(anchor);
};
