const storage = typeof browser === 'undefined' ? chrome.storage : browser.storage
const runtime = typeof browser === 'undefined' ? chrome.runtime : browser.runtime

const init = async () => {
  const date = new Date().getTime()
  const { f95list_ext_time } = await storage.local.get(['f95list_ext_time'])

  if (f95list_ext_time && date < f95list_ext_time) return

  storage.local.set({ f95list_ext_time: date + 1000 * 60 * 60 * 6 })
  await storage.local.set({ f95list_ext_data: await query() })

  console.log(await storage.local.get(['f95list_ext_time', 'f95list_ext_data']))
}

runtime.onMessage.addListener((message, _sender, sendResponse) => {
  ;(async () => {
    await init()

    const { f95list_ext_data } = await storage.local.get(['f95list_ext_data'])

    switch (message) {
      case 'f95list-script':
        sendResponse(f95list_ext_data.games)
        break
      case 'f95list-ext':
        sendResponse(f95list_ext_data)
        break
    }
  })()

  return true
})

const query = async () => {
  try {
    console.info('🚀 ~ query: ~ fetch')

    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbwb8C1478tnW30d77HtECYTxjJ2EpB1OrtQUueFeZ0tZPz3Uuze5s2FAQAnQOKShEzD/exec'
    )
    const data = await response.json()
    console.log('🚀 ~ query ~ data:', data)

    return data?.data
  } catch (error) {
    console.error(error)
  }
}
