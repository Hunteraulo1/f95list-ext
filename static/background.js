const storage = typeof browser === 'undefined' ? chrome.storage : browser.storage
const runtime = typeof browser === 'undefined' ? chrome.runtime : browser.runtime

runtime.onInstalled.addListener(async () => {
  await dataInit()

  badgeState()
})

runtime.onStartup.addListener(async () => {
  await dataInit()

  badgeState()
})

const badgeData = async () => {
  const { f95list_ext_data } = await storage.local.get(['f95list_ext_data'])

  if (!f95list_ext_data) return
  if (f95list_ext_data.updates.length === 0) throw new Error('no data')

  const updates = f95list_ext_data.updates
  let updatesData = [updates[0]]

  if (updates[0].date === updates[1].date) return (updatesData = updates.slice(0, 2))

  if (!updatesData || updatesData.length === 0) throw new Error('no updatesData')

  return updatesData
}

const badgeState = async () => {
  const browserAction = typeof browser === 'undefined' ? chrome.action : browser.browserAction

  const updatesData = await badgeData()
  const { f95list_ext_badge } = await storage.local.get(['f95list_ext_badge'])
  const text = updatesData?.toString() === f95list_ext_badge?.toString() ? '' : '+'

  await browserAction.setBadgeBackgroundColor({ color: '#CC0000' })
  await browserAction.setBadgeTextColor({ color: '#FFFFFF' })
  await browserAction.setBadgeText({ text })
}

const badgeReset = async () => {
  try {
    const updatesData = await badgeData()

    await storage.local.set({ f95list_ext_badge: updatesData })
    badgeState()
  } catch (error) {
    console.error(error)
  }
}

const dataInit = async () => {
  const date = new Date().getTime()
  const { f95list_ext_time } = await storage.local.get(['f95list_ext_time'])

  if (f95list_ext_time && date < f95list_ext_time) return

  storage.local.set({ f95list_ext_time: date + 1000 * 60 * 60 * 6 })
  await storage.local.set({ f95list_ext_data: await query() })
}

runtime.onMessage.addListener((message, _sender, sendResponse) => {
  ;(async () => {
    await dataInit()

    const { f95list_ext_data } = await storage.local.get(['f95list_ext_data'])

    switch (message) {
      case 'f95list-script':
        const { f95list_ext_integrate } = await storage.local.get(['f95list_ext_integrate'])

        if (!f95list_ext_integrate) return

        console.log('integrate data')

        sendResponse(f95list_ext_data.games)
        break
      case 'f95list-ext':
        sendResponse(f95list_ext_data)
        break
      case 'f95list-badge':
        badgeReset()
        break
      case 'f95list-integrate_true':
        await storage.local.set({ f95list_ext_integrate: true })
        break
      case 'f95list-integrate_false':
        await storage.local.set({ f95list_ext_integrate: false })
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

    badgeState()

    return data.data
  } catch (error) {
    console.error(error)

    storage.local.set({ f95list_ext_time: 0 })
  }
}
