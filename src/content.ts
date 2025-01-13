const insert = (games) => {
  if (!(games && games.length > 0)) return;

  const { pathname } = window.location;

  if (pathname === '/sam/latest_alpha/') {
    latest('.resource-tile_link', games);
  } else if (pathname.startsWith('/latest-updates/')) {
    latest('.porta-article-header', games);
  } else if (pathname.startsWith('/threads/')) {
    const tileId = Number(window.location.pathname.split('/')[2].split('.')[1]);

    if (games.find((game) => game.id === tileId && game.hostname === hostname)) {
      const parent = document.querySelector('.p-title-value');

      if (parent && !parent?.classList.contains('flag-inserted')) {
        createFlag(parent);

        parent?.classList.add('flag-inserted');
      }
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
      const mutationCallback = async (mutationsList) => {
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

const latest = (query, games) => {
  const tiles = document.querySelectorAll(query);

  for (const tile of tiles) {
    const tileId =
      hostname === 'f95zone.to'
        ? Number(tile.pathname.split('/')[2])
        : Number(tile.pathname.split('/')[2].split('.')[1]);

    if (
      games.find((game) => game.id === tileId && game.hostname === hostname) &&
      !tile.classList.contains('flag-inserted')
    ) {
      createFlag(hostname === 'f95zone.to' ? tile.children[1].children[0] : tile.children[1].children[1]);
      tile.classList.add('flag-inserted');
    }
  }
};

const createFlag = (parent) => {
  const img = document.createElement('img');

  img.style.width = '32px';
  img.style.marginRight = '4px';
  img.style.borderRadius = '4px';
  img.style.float = 'inherit';
  img.style.verticalAlign = 'middle';
  img.src =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAELBAMAAAAFMM1/AAAAGFBMVEX///8AI5XtKTmerNf6yMwAGJDtKDjsITLN9eOpAAAA9ElEQVR42u3P0QAAQAgFsBRO4WQCyCB/iCDe72awerGpWO9PiYiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIJA7ZdJrTjvyKSgAAAABJRU5ErkJggg==';

  parent.prepend(img);
};
