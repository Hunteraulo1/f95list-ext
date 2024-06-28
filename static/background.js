const init = async () => {
  console.log('🚀 ~ init')
  const date = new Date().getTime()
  let expiredTime

  if (typeof localStorage !== 'undefined') {
    expiredTime = localStorage.getItem('f95list_ext_time') ?? 0
    console.log('🚀 ~ init ~ expiredTime:', expiredTime)
  } else {
    expiredTime = await chrome.storage.local.get(['f95list_ext_time']).then(result => result.f95list_ext_time ?? 0)
  }

  if (date < expiredTime) return

  const queryData = await query()
  console.log('🚀 ~ init ~ queryData:', queryData)
  const timing = date + 1000 * 60 * 60 * 6 // 6 hours

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('f95list_ext_data', JSON.stringify(queryData))
    localStorage.setItem('f95list_ext_time', timing)
  } else {
    await chrome.storage.local.set({ f95list_ext_data: queryData })
    await chrome.storage.local.set({ f95list_ext_time: timing })
  }
}

const response = async message => {
  console.log('🚀 ~ response')
  let data

  if (typeof localStorage !== 'undefined') {
    data = JSON.parse(localStorage.getItem('f95list_ext_data')) ?? []
  } else {
    data = await chrome.storage.local.get(['f95list_ext_data']).then(result => result.f95list_ext_data ?? [])
  }
  console.log('🚀 ~ response ~ data:', data)

  switch (message) {
    case 'f95list-script':
      return data.games
    case 'f95list-ext':
      return data
    default:
      return true
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  ;(async () => {
    init()

    if (typeof localStorage !== 'undefined') {
      return await response(message)
    }

    const responseData = await response(message)

    if (!responseData) return true

    sendResponse(responseData)
  })()

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
