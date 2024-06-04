<script lang="ts">
  import Badge from '$lib/components/ui/badge/badge.svelte'
  import * as Card from '$lib/components/ui/card'
  import { type GameType } from '$lib/schemas'
  import { lazyLoad } from '$lib/utils/lazyload'
  import { Tooltip } from 'bits-ui'
  import Details from './Details.svelte'

  interface Props {
    game: GameType
  }

  const { game }: Props = $props()

  let open: boolean = $state(false)
</script>

{#if open && game.domain !== 'Unknow'}
  <Details {game} bind:open />
{/if}

{#if game.domain !== 'Unknow'}
  <Card.Root class="relative" on:click={() => (open = true)}>
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
              {game.tversion === game.version ? 'À jours' : `N'est pas à jours (${game.version})`}
            </Badge>
          </Tooltip.Content>
        </Tooltip.Root>
      </Card.Description>
    </Card.CardContent>
  </Card.Root>
{:else}
  <Card.Root class="relative">
    <Card.CardContent class="h-20 relative p-6 rounded-xl backdrop-blur-xs hover:backdrop-blur-none bg-secondary/20">
      <Card.Title>{game.name}</Card.Title>
      <Card.Description>Jeu introuvable</Card.Description>
    </Card.CardContent>
  </Card.Root>
{/if}
