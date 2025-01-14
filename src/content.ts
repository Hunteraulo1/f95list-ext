import type { GameType } from '$lib/schemas';

const insert = (games: GameType[]) => {
  if (!(games && games.length > 0)) return;

  const { pathname } = window.location;

  if (pathname === '/sam/latest_alpha/') {
    latest('.resource-tile_link', games);
  } else if (pathname.startsWith('/latest-updates/')) {
    latest('.porta-article-header', games);
  } else if (pathname.startsWith('/threads/')) {
    const tileId = Number(window.location.pathname.split('/')[2].split('.')[1]);

    for (const game of games) {
      if (game.id !== tileId || game.hostname !== hostname) continue;

      const parent = document.querySelector('.p-title-value');

      if (!parent || parent?.classList.contains('flag-inserted')) return;
      createFlag(parent, game.tlink);
    }
  }
};

(async () => {
  try {
    const data = await chrome.runtime.sendMessage('f95list-script');

    insert(data);

    const { pathname } = window.location;

    const f95 = pathname === '/sam/latest_alpha/';
    const lc = pathname.startsWith('/latest-updates/');

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
})();

const { hostname } = window.location;

const latest = (query: string, games: GameType[]) => {
  const tiles = document.querySelectorAll(query);

  for (const tile of Array.from(tiles)) {
    const tileId =
      hostname === 'f95zone.to'
        ? Number((tile as HTMLAnchorElement).pathname.split('/')[2])
        : Number((tile as HTMLAnchorElement).pathname.split('/')[2].split('.')[1]);

    if (
      games.find((game) => game.id === tileId && game.hostname === hostname) &&
      !tile.classList.contains('flag-inserted')
    ) {
      createFlag(hostname === 'f95zone.to' ? tile.children[1].children[0] : tile.children[1].children[1]);
      tile.classList.add('flag-inserted');
    }
  }
};

const createFlag = (parent: Element, tlink: GameType['tlink'] = null) => {
  const anchor: HTMLAnchorElement = document.createElement('a');
  const img: HTMLImageElement = document.createElement('img');

  anchor.target = '_BLANK';
  anchor.href = tlink ?? '#';

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
