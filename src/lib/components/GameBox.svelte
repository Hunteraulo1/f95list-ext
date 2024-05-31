<script lang="ts">
  import Badge from '$lib/components/ui/badge/badge.svelte'
  import * as Card from '$lib/components/ui/card'
  import type { GameType } from '$lib/schemas'
  import { games } from '$lib/stores'
  import { getGameIndex } from '$lib/utils/getGameIndex'
  import { lazyLoad } from '$lib/utils/lazyload'
  import { Tooltip } from 'bits-ui'

  export let game: GameType | number | string
  let findGame: GameType | undefined
  let index: number | undefined

  if (typeof game === 'number') {
    index = game
    findGame = $games[index]
  } else if (typeof game !== 'string') {
    index = getGameIndex(game)
    findGame = $games[index]
  }
</script>

{#if findGame}
  <a href="/details/{index}" data-sveltekit-noscroll>
    <Card.Root class="relative">
      {#if findGame.image}
        <img alt={findGame.name} class="w-full h-full absolute object-cover rounded-xl" use:lazyLoad={findGame.image} />
      {/if}
      <Card.CardContent class="h-20 relative p-6 rounded-xl backdrop-blur-xs hover:backdrop-blur-none bg-secondary/20">
        <Card.Title>{findGame.name}</Card.Title>
        <Card.Description>
          <Tooltip.Root>
            <Tooltip.Trigger
              class="text-xs font-bold {findGame.tversion === findGame.version ? 'text-green-700' : 'text-red-700'}"
            >
              {findGame.tversion}
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Badge variant="secondary">
                <p>{findGame.tversion === findGame.version ? 'À jours' : `N'est pas à jours (${findGame.version})`}</p>
              </Badge>
            </Tooltip.Content>
          </Tooltip.Root>
        </Card.Description>
      </Card.CardContent>
    </Card.Root>
  </a>
{:else}
  <Card.Root class="relative">
    <Card.CardContent class="h-20 relative p-6 rounded-xl backdrop-blur-xs hover:backdrop-blur-none bg-secondary/20">
      <Card.Title>{game}</Card.Title>
      <Card.Description>Jeu introuvable</Card.Description>
    </Card.CardContent>
  </Card.Root>
{/if}
