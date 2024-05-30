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
    game = $games[index]
  } else if (typeof game !== 'string') {
    index = getGameIndex(game)
  }
  console.log('🚀 ~ game:', game)
</script>

{#if findGame}
  <a href="/details/{index}">
    <Card.Root class="relative">
      {#if game.image}
        <img alt={game.name} class="w-full h-full absolute object-cover rounded-xl" use:lazyLoad={game.image} />
      {/if}
      <Card.CardContent class="h-20 relative p-6 rounded-xl backdrop-blur-xs hover:backdrop-blur-none bg-secondary/20">
        <Card.Title>{game.name}</Card.Title>
        <Card.Description>
          <Tooltip.Root>
            <Tooltip.Trigger
              class="text-xs font-bold {game.tversion === game.version ? 'text-green-700' : 'text-red-700'}"
            >
              {game.tversion}
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Badge variant="secondary">
                <p>{game.tversion === game.version ? 'À jours' : `N'est pas à jours (${game.version})`}</p>
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
