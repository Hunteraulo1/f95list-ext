<script lang="ts">
  import noImage from '$lib/assets/no-image.png'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button/index.js'
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js'
  import type { GameType } from '$lib/schemas'
  import { settings } from '$lib/stores'
  import { statusColor, typeColor } from '$lib/utils/badgeColor'
  import { Tooltip } from 'bits-ui'
  import { ArrowLeft } from 'svelte-radix'

  let tagsHide = $settings.tagsHide

  export let game: GameType, open: boolean
</script>

<ScrollArea class="fixed top-0 left-0 w-full h-full max-w-[300px] max-h-[500px] z-20 bg-black">
  {#if game}
    <img src={game.image ?? noImage} alt={game.name} class="h-32 w-full object-cover" />

    <div class="p-2 flex flex-col gap-2">
      <h2>
        <span class="font-bold text-sm">Site:</span>
        <a href={game.link} target="_blank">
          <Badge variant="secondary">{game.domain}</Badge>
        </a>
      </h2>
      <h1>
        <Badge style={typeColor(game.type)} class="text-white font-bold">{game.type}</Badge>
        <Badge style={statusColor(game.status)} class="text-white font-bold">{game.status}</Badge>
        {game.name}
        <span class="text-xs font-bold {game.tversion === game.version ? 'text-green-700' : 'text-red-700'}">
          <Tooltip.Root>
            <Tooltip.Trigger>{game.tversion}</Tooltip.Trigger>
            <Tooltip.Content>
              <Badge variant="secondary">
                {#if game.tversion === game.version}
                  À jour
                {:else if game.tversion === 'n/a'}
                  Pas de traduction
                {:else}
                  N'est pas à jour ({game.version})
                {/if}
              </Badge>
            </Tooltip.Content>
          </Tooltip.Root>
        </span>
      </h1>
      <div class="flex gap-1 flex-wrap">
        <span class="font-bold text-sm">Tags:</span>
        {#each game.tags as tag, index}
          {#if index < 5 || !tagsHide}
            <Badge variant="outline">{tag}</Badge>
          {/if}
        {/each}
        {#if game.tags.length > 5}
          <button class="text-xs font-bold text-secondary-foreground/50" on:click={() => (tagsHide = !tagsHide)}>
            {tagsHide ? 'afficher plus...' : 'cacher'}
          </button>
        {/if}
      </div>
      <p class="text-sm">
        <span class="font-bold">Traducteur:</span>
        <a href={game.trlink} class:traductor={game.trlink}>
          {game.traductor ?? 'Aucun'}
        </a>
        <span class="text-secondary-foreground/50 text-xs">({game.ttype})</span>
      </p>
      {#if game.proofreader}
        <p class="text-sm">
          <span class="font-bold">Relecteur:</span>
          {game.proofreader}
        </p>
      {/if}
      <div class="flex justify-center mt-2">
        {#if game.tname === 'Pas de traduction'}
          <Button variant="ghost" class="flex gap-1">Aucune traduction</Button>
        {:else if game.tname === 'Intégrée'}
          <Button variant="outline" class="flex gap-1">Traduction intégrée</Button>
        {:else}
          <a href={game.tlink} target="_blank">
            <Button class="flex gap-1">Accèder à la traduction</Button>
          </a>
        {/if}
      </div>
    </div>
  {:else}
    <h1>Game not found</h1>
  {/if}
  <Button class="flex gap-1 opacity-50 absolute top-2 left-2" variant="secondary" on:click={() => (open = false)}>
    <ArrowLeft />
  </Button>
</ScrollArea>

<style lang="postcss">
  .traductor {
    @apply underline text-blue-500 hover:text-blue-700;
  }
</style>
