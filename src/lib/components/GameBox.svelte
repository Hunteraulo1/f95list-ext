<script lang="ts">
import Badge from '$lib/components/ui/badge/badge.svelte'
import * as Card from '$lib/components/ui/card'
import * as Tooltip from '$lib/components/ui/tooltip'
import { type GameType } from '$lib/schemas'
import { settings } from '$lib/stores'
import { lazyLoad } from '$lib/utils/lazyload'
import { mode } from 'mode-watcher'
import type { Tabs } from 'webextension-polyfill'
import Details from './Details.svelte'

export let game: GameType
export let list: boolean = false

let open: boolean = false

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

  if (!list || !$settings.autoFocusGame) return

  if (!url?.startsWith('https://f95zone.to/threads/') && !url?.startsWith('https://lewdcorner.com/threads/')) return

  const id = extractId(url)
  console.log('🚀 ~ browserAPI?.tabs?.query ~ id:', id)

  if (game.ac && game.domain === 'F95z') {
    if (game.id === id) open = true
  } else if (game.domain === 'LewdCorner') {
    if (game.id === id) open = true
  }
})
</script>

{#if open && game.domain !== 'Unknown'}
  <Details {game} bind:open />
{/if}

{#if game.domain !== 'Unknown'}
  <Card.Root class="relative cursor-pointer" on:click={() => (open = true)}>
    {#if game.image}
      <img alt={game.name} class="absolute object-cover w-full h-full rounded-xl" use:lazyLoad={game.image} style="image-rendering: smooth; image-resolution: snap;" />
    {/if}
    <Card.CardContent class="relative h-20 p-6 rounded-xl backdrop-blur-xs hover:backdrop-blur-none {$mode === 'dark' ? 'bg-secondary/20' : ''}">
      <Card.Title>{game.name}</Card.Title>
      <Card.Description>
        <Tooltip.Root>
          <Tooltip.Trigger
            class="text-xs font-bold {game.tversion === 'Intégrée' || game.tversion === game.version ? 'text-green-700' : 'text-red-700'}"
          >
            {game.tversion}
          </Tooltip.Trigger>
          <Tooltip.Content class="bg-transparent">
            <Badge variant="secondary">
              {#if game.tversion === 'Intégrée'}
                À jours ({game.version})
              {:else if game.tversion === game.version}
                À jours
              {:else}
                N'est pas à jours ({game.version})
              {/if}
            </Badge>
          </Tooltip.Content>
        </Tooltip.Root>
      </Card.Description>
    </Card.CardContent>
  </Card.Root>
{:else}
  <Card.Root class="relative">
    <Card.CardContent class="relative h-20 p-6 rounded-xl backdrop-blur-xs hover:backdrop-blur-none bg-secondary/20">
      <Card.Title>{game.name}</Card.Title>
      <Card.Description>Jeu introuvable</Card.Description>
    </Card.CardContent>
  </Card.Root>
{/if}
