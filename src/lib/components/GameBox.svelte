<script lang="ts">
  import Badge from '$lib/components/ui/badge/badge.svelte'
  import * as Card from '$lib/components/ui/card'
  import { Game, type GameType } from '$lib/schemas'
  import { lazyLoad } from '$lib/utils/lazyload'
  import { Tooltip } from 'bits-ui'
  import { safeParse } from 'valibot'
  import Details from './Details.svelte'

  interface Props {
    game: GameType | { name: GameType['name'] }
  }

  const { game }: Props = $props()

  const parse = safeParse(Game, game)

  const validGame = parse.success ? parse.output : false
  let open: boolean = $state(false)
</script>

{#if open && validGame}
  <Details game={validGame} bind:open />
{/if}

{#if validGame}
  <Card.Root class="relative" on:click={() => (open = true)}>
    {#if validGame.image}
      <img alt={validGame.name} class="w-full h-full absolute object-cover rounded-xl" use:lazyLoad={validGame.image} />
    {/if}
    <Card.CardContent class="h-20 relative p-6 rounded-xl backdrop-blur-xs hover:backdrop-blur-none bg-secondary/20">
      <Card.Title>{validGame.name}</Card.Title>
      <Card.Description>
        <Tooltip.Root>
          <Tooltip.Trigger
            class="text-xs font-bold {validGame.tversion === validGame.version ? 'text-green-700' : 'text-red-700'}"
          >
            {validGame.tversion}
          </Tooltip.Trigger>
          <Tooltip.Content>
            <Badge variant="secondary">
              {validGame.tversion === validGame.version ? 'À jours' : `N'est pas à jours (${validGame.version})`}
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
