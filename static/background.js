chrome.runtime.onMessage.addListener(async () => {
  const date = new Date()
  const expriredTime = await chrome.storage.local.get(['f95list_ext_time']).then(result => result.f95list_ext_time ?? 0)

  if (date >= expriredTime) {
    const queryData = await query()

    await chrome.storage.local.set({ f95list_ext_data: queryData })
    await chrome.storage.local.set({ f95list_ext_time: date + 1000 * 60 * 60 * 6 }) // 6 hours
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  ;(async () => {
    const data = await chrome.storage.local.get(['f95list_ext_data']).then(result => result.f95list_ext_data ?? [])

    switch (message) {
      case 'f95list-script':
        return sendResponse(data.games)
      case 'f95list-ext':
        return sendResponse(data)
    }
  })()

  return true
})

const query = async () => {
  try {
    console.log('🚀 ~ queryFn: ~ fetch')
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbwb8C1478tnW30d77HtECYTxjJ2EpB1OrtQUueFeZ0tZPz3Uuze5s2FAQAnQOKShEzD/exec'
    )
    const data = await response.json()

    return data?.data
  } catch (error) {
    console.error(error)
  }
}
