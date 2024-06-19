chrome.runtime.onMessage.addListener(async () => {
  const date = new Date()
  const expiredTime = await chrome.storage.local.get(['f95list_ext_time']).then(result => result.f95list_ext_time ?? 0)

  if (date < expiredTime) return

  const queryData = await query()

  await chrome.storage.local.set({ f95list_ext_data: queryData })
  await chrome.storage.local.set({ f95list_ext_time: date + 1000 * 60 * 60 * 6 }) // 6 hours
})

const responseCall = async (message, sendResponse) => {
  const data = await chrome.storage.local.get(['f95list_ext_data']).then(result => result.f95list_ext_data ?? [])

  switch (message) {
    case 'f95list-script':
      sendResponse(data.games)
      break
    case 'f95list-ext':
      sendResponse(data)
      break
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  responseCall(message, sendResponse)

  return true
})

const query = async () => {
  try {
    console.info('🚀 ~ queryFn: ~ fetch')

    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbwb8C1478tnW30d77HtECYTxjJ2EpB1OrtQUueFeZ0tZPz3Uuze5s2FAQAnQOKShEzD/exec'
    )
    const data = await response.json()

    return data?.data
  } catch (error) {
    console.error(error)
  }
}
