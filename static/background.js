const init = async () => {
  const date = new Date().getTime()
  let expiredTime

  if (localStorage) {
    expiredTime = localStorage.getItem('f95list_ext_time') ?? 0
  } else {
    expiredTime = await chrome.storage.local.get(['f95list_ext_time']).then(result => result.f95list_ext_time ?? 0)
  }

  if (date < expiredTime) return

  const queryData = await query()
  const timing = date + 1000 * 60 * 60 * 6 // 6 hours

  if (localStorage) {
    localStorage.setItem('f95list_ext_data', JSON.stringify(queryData))
    localStorage.setItem('f95list_ext_time', timing) // 6 hours
  } else {
    await chrome.storage.local.set({ f95list_ext_data: queryData })
    await chrome.storage.local.set({ f95list_ext_time: timing }) // 6 hours
  }
}

const response = async message => {
  let data

  if (localStorage) {
    data = JSON.parse(localStorage.getItem('f95list_ext_data')) ?? []
  } else {
    data = await chrome.storage.local.get(['f95list_ext_data']).then(result => result.f95list_ext_data ?? [])
  }

  switch (message) {
    case 'f95list-script':
      return data.games
    case 'f95list-ext':
      return data
    default:
      return true
  }
}

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
  await init()

  if (localStorage) {
    return await response(message)
  } else {
    const response = await response(message)

    if (!response) return true

    sendResponse(response)
    return true
  }
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
