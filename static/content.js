import { browser } from '$app/environment'

const browserAPI = typeof browser === 'undefined' ? chrome : browser
//
;(async () => {
  try {
    const data = await browserAPI.runtime.sendMessage('f95list-script')

    insert(data)

    const mutationCallback = async mutationsList => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          insert(data)
        }
      }
    }

    const observer = new MutationObserver(mutationCallback)
    const config = { childList: true, subtree: true }

    observer.observe(document.body, config)

    console.info('[F95ListFR] Injecting script successful !')
  } catch (error) {
    console.error(error)
  }
})()

const hostname = window.location.hostname

const insert = games => {
  if (games && games.length > 0) {
    const pathname = window.location.pathname

    if (pathname === '/sam/latest_alpha/') {
      latest('.resource-tile_link', games)
    } else if (pathname.startsWith('/latest-updates/')) {
      latest('.porta-article-header', games)
    } else if (pathname.startsWith('/threads/')) {
      const tileId = parseInt(window.location.pathname.split('/')[2].split('.')[1])

      if (games.find(game => game.id == tileId && game.hostname === hostname)) {
        const parent = document.querySelector('.p-title-value')

        if (parent && !parent?.classList.contains('flag-inserted')) {
          createFlag(parent)

          parent?.classList.add('flag-inserted')
        }
      }
    }
  }
}

const latest = (query, games) => {
  const tiles = document.querySelectorAll(query)

  for (let tile of tiles) {
    const tileId =
      hostname === 'f95zone.to'
        ? parseInt(tile.pathname.split('/')[2])
        : parseInt(tile.pathname.split('/')[2].split('.')[1])

    if (games.find(game => game.id === tileId && game.hostname === hostname)) {
      if (!tile.classList.contains('flag-inserted')) {
        createFlag(hostname === 'f95zone.to' ? tile.children[1].children[0] : tile.children[1].children[1])
        tile.classList.add('flag-inserted')
      }
    }
  }
}

const createFlag = parent => {
  const img = document.createElement('img')

  img.style.width = '32px'
  img.style.marginRight = '4px'
  img.style.borderRadius = '4px'
  img.style.float = 'inherit'
  img.style.verticalAlign = 'middle'
  img.src =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAELBAMAAAAFMM1/AAAAGFBMVEX///8AI5XtKTmerNf6yMwAGJDtKDjsITLN9eOpAAAA9ElEQVR42u3P0QAAQAgFsBRO4WQCyCB/iCDe72awerGpWO9PiYiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIJA7ZdJrTjvyKSgAAAABJRU5ErkJggg=='

  parent.prepend(img)
}
