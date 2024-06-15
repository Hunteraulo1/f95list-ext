function onError(error: string) {
  console.error(`Error: ${error}`)
}

export const sendMessage = data => {
  chrome.runtime.sendMessage(JSON.stringify(data)).catch(onError)
}
