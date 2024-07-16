<script lang="ts">
import Filter from '$lib/components/Filter.svelte'
import GameBox from '$lib/components/GameBox.svelte'
import { ScrollArea } from '$lib/components/ui/scroll-area'
import { filteredGames, settings } from '$lib/stores'
import type { IdGameBox } from '$lib/types'
import Reload from 'svelte-radix/Reload.svelte'
import type { Tabs } from 'webextension-polyfill'
import Button from './../lib/components/ui/button/button.svelte'

let idGameBox: IdGameBox
let browserAPI = undefined

if (typeof chrome !== 'undefined') {
  browserAPI = chrome
} else if (typeof browser !== 'undefined') {
  browserAPI = browser
}

function extractId(inputString: string): number {
  const regex = /\.(\d+)/
  const match = inputString.match(regex)

  return match ? parseInt(match[1]) : 0
}

browserAPI?.tabs?.query({ active: true, currentWindow: true }, (tabs: Tabs.Tab[]) => {
  const { url } = tabs[0]

  if (!$settings.autoFocusGame) return

  if (url?.startsWith('https://f95zone.to/threads/')) {
    idGameBox = { domain: 'F95z', id: extractId(url) }
  } else if (url?.startsWith('https://lewdcorner.com/threads/')) {
    idGameBox = { domain: 'LewdCorner', id: extractId(url) }
  }
})
</script>

<ScrollArea class="relative min-h-[448px]">
  <div class="flex flex-col gap-2 p-2 relative">
    {#each $filteredGames as game}
      <GameBox {game} {idGameBox} />
    {:else}
      <div class="flex justify-center items-center h-screen w-full">
        <Button>
          <Reload class="h-4 w-full animate-spin" />
          Aucun jeu ne correspond à vos critères
        </Button>
      </div>
    {/each}
    <Filter />
  </div>
</ScrollArea>
