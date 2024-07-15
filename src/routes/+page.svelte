<script lang="ts">
import Filter from '$lib/components/Filter.svelte'
import GameBox from '$lib/components/GameBox.svelte'
import { ScrollArea } from '$lib/components/ui/scroll-area'
import type { GameType } from '$lib/schemas'
import { filteredGames, games, settings } from '$lib/stores'
import Reload from 'svelte-radix/Reload.svelte'
import type { Tabs } from 'webextension-polyfill'
import Button from './../lib/components/ui/button/button.svelte'

let id = 0
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

interface IdGameBox {
  domain: GameType['domain']
  id: GameType['id']
}

browserAPI?.tabs?.query({ active: true, currentWindow: true }, (tabs: Tabs.Tab[]): IdGameBox => {
  const { url } = tabs[0]

  const unknown: IdGameBox = { domain: 'Unknown', id: 0 }

  if (!$settings.autoFocusGame) return unknown

  if (url?.startsWith('https://f95zone.to/threads/')) {
    return { domain: 'F95z', id: extractId(url) }
  }
  if (url?.startsWith('https://lewdcorner.com/threads/')) {
    return { domain: 'LewdCorner', id: extractId(url) }
  }

  return unknown
})
</script>

{#if $games.length > 0}
  <ScrollArea class="relative min-h-[448px]">
    <div class="flex flex-col gap-2 p-2 relative">
      {#each $filteredGames as game, index (game.name + game.version)}
        <GameBox {game} {id} />
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
{:else}
  <div class="flex justify-center items-center h-full">
    <Button>
      <Reload class="mr-2 h-4 w-4 animate-spin" />
      Veuillez patienter
    </Button>
  </div>
{/if}
