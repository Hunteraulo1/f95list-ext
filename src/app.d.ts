// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

// declare namespace App {
//  interface Locals {}
//  interface PageData {}
//  interface Error {}
//  interface Platform {}
// }

// biome-ignore lint/style/noNamespace: <explanation>
declare namespace browser {
  const runtime: chrome.runtime
  const storage: chrome.storage
  const tabs: chrome.tabs
}
