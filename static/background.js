const browserAPI = typeof browser === 'undefined' ? chrome : browser

browserAPI.runtime.onInstalled.addListener(async () => {
  const { f95list_ext_integrate } = await browserAPI.storage.local.get(['f95list_ext_integrate'])

  if (f95list_ext_integrate === undefined) await browserAPI.storage.local.set({ f95list_ext_integrate: true })
  await dataInit()

  await badgeState()
})

browserAPI.runtime.onStartup.addListener(async () => {
  await dataInit()

  await badgeState()
})

const badgeData = async () => {
  const { f95list_ext_data } = await browserAPI.storage.local.get(['f95list_ext_data'])

  if (!f95list_ext_data || f95list_ext_data.updates.length === 0) throw new Error('no data')

  const updates = f95list_ext_data.updates

  if (updates[0].date === updates[1].date) return updates.slice(0, 2)

  return [updates[0]]
}

const badgeState = async () => {
  const browserAction = typeof browser === 'undefined' ? chrome.action : browser.browserAction

  const updatesData = await badgeData()
  const { f95list_ext_badge } = await browserAPI.storage.local.get(['f95list_ext_badge'])
  const text = updatesData?.toString() === f95list_ext_badge?.toString() ? '' : '+'

  await browserAction.setBadgeBackgroundColor({ color: '#CC0000' })
  await browserAction.setBadgeTextColor({ color: '#FFFFFF' })
  await browserAction.setBadgeText({ text })
}

const badgeReset = async () => {
  try {
    const updatesData = await badgeData()

    await browserAPI.storage.local.set({ f95list_ext_badge: updatesData })
    await badgeState()
  } catch (error) {
    console.error(error)
  }
}

let wait = false
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const dataInit = async () => {
  while (wait) {
    await sleep(1000) // 1 second
  }

  let { f95list_ext_data } = await browserAPI.storage.local.get(['f95list_ext_data'])

  wait = true

  const date = new Date().getTime()
  const { f95list_ext_time } = await browserAPI.storage.local.get(['f95list_ext_time'])

  if (f95list_ext_data && f95list_ext_time && date < f95list_ext_time) return (wait = false)

  await browserAPI.storage.local.set({ f95list_ext_time: date + 1000 * 60 * 60 * 6 }) // 6 hours
  await browserAPI.storage.local.set({ f95list_ext_data: await query() })

  await badgeState()

  wait = false
}

browserAPI.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  ;(async () => {
    await dataInit()

    const { f95list_ext_data } = await browserAPI.storage.local.get(['f95list_ext_data'])

    switch (message) {
      case 'f95list-script':
        const { f95list_ext_integrate } = await browserAPI.storage.local.get(['f95list_ext_integrate'])

        if (!f95list_ext_integrate) throw new Error('no integrate')

        await sendResponse(f95list_ext_data.games)
        break
      case 'f95list-ext':
        await sendResponse(f95list_ext_data)
        break
      case 'f95list-badge':
        await badgeReset()
        break
      case 'f95list-integrate_true':
        await browserAPI.storage.local.set({ f95list_ext_integrate: true })
        break
      case 'f95list-integrate_false':
        await browserAPI.storage.local.set({ f95list_ext_integrate: false })
        break
    }
  })()

  return true
})

const query = async () => {
  try {
    console.info('🚀 ~ query: ~ fetch')

    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbybvrFy6B2L7rkLWJnrwRHhP0F6Sv0uk6V9zUTZibwEzUjKXf-abOK_N6jUhqFPs9US/exec'
    )
    const data = await response.json()

    if (!data?.data) throw new Error('fetch not data')

    return data.data
  } catch (error) {
    console.error(error)

    await browserAPI.storage.local.set({ f95list_ext_time: 0 })
  }
}
