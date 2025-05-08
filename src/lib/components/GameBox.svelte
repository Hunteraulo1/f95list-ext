<script lang="ts">
import { CopyCheck } from '@/lib/assets/icon';
import noImage from '@/lib/assets/no-image.png';
import { Badge } from '@/lib/components/ui/badge';
import * as Card from '@/lib/components/ui/card/index';
import * as Tooltip from '@/lib/components/ui/tooltip/index';
import type { GameType } from '@/lib/schemas';
import { games, selectedGame } from '@/lib/stores';
import type { IdGameBox } from '@/lib/types';
import { cn } from '@/lib/utils';
// @ts-ignore types not found
import Lazy from 'svelte-lazy';
import Details from './Details.svelte';

interface Props {
  game: GameType;
  idGameBox?: IdGameBox;
  webapp?: boolean;
  autoFocus?: boolean;
  autoFocusMultiple?: boolean;
}

let {
  game,
  idGameBox = { domain: 'Unknown', id: 0 },
  webapp = false,
  autoFocus = false,
  autoFocusMultiple = false,
}: Props = $props();

$effect(() => {
  autoFocus && handleClick();
});

let open = $state(false);

if (game.domain === idGameBox.domain && game.id === idGameBox.id) {
  open = $games.filter((game: GameType) => game.domain === idGameBox.domain && game.id === idGameBox.id).length === 1;
}

const handleClick = () => {
  $selectedGame = game;
  open = true;
};
</script>

{#if open && !webapp && game.domain !== 'Unknown'}
  <Details {game} bind:open />
{/if}

{#if game.domain !== 'Unknown'}
  <Lazy height={autoFocusMultiple ? 38 : 88} fadeOption={{ delay: 0, duration: 0 }} keep={true} class="relative overflow-hidden rounded-md bg-primary-foreground">
    <Card.Root class="cursor-pointer" onclick={handleClick}>
      {#if !autoFocusMultiple}
        <img
          alt={game.name}
          class="absolute top-0 left-0 object-cover w-full h-full"
          src={game.image?.replace(
            'attachments.f95zone.to',
            'preview.f95zone.to'
          ) ?? noImage}
          style="image-rendering: smooth; image-resolution: snap;"
        />
      {/if}
    
      <Card.CardContent
        class={cn(
          "relative transition",
          webapp && 'text-xl',
          autoFocusMultiple ?
            'flex gap-2 items-center py-2 px-6' :
            'p-6 backdrop-brightness-90 hover:backdrop-brightness-100 text-secondary-foreground'
        )}
      >
        <Card.Title class="select-none">{game.name}</Card.Title>
        <Card.Description>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger
                class="text-xs cursor-help font-bold z-20 {game.tversion ===
                'Intégrée' || game.tversion === game.version
                ? 'text-green-700'
                : 'text-red-700'} {webapp ? 'text-lg' : ''}"
              >
              {game.tversion}
              </Tooltip.Trigger>
              <Tooltip.Content class="bg-transparent" side={autoFocusMultiple ? 'right' : 'top'} collisionBoundary={[]}>
                <Badge variant="secondary">
                  {#if game.tversion === 'Intégrée'}
                    À jour ({game.version})
                  {:else if game.tversion === game.version}
                    À jour
                  {:else if game.tversion === 'n/a'}
                  Pas de traduction
                  {:else}
                    N'est pas à jour ({game.version})
                  {/if}
                </Badge>
              </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
        </Card.Description>
      </Card.CardContent>
    </Card.Root>
    {#if import.meta.env.FIREFOX && !autoFocusMultiple}
      <a class="absolute p-2 rounded-full right-1 top-1 opacity-30 hover:opacity-100 hover:bg-primary-foreground/30" href={game.link} target="_blank">
        <CopyCheck size={24} />
      </a>
    {/if}
  </Lazy>
{:else}
  <div
    class={cn(
      "relative overflow-hidden transition text-secondary-foreground rounded-md cursor-pointer bg-primary-foreground", 
      (webapp && !autoFocusMultiple) ? 'text-xl' : 'hover:backdrop-brightness-100',
      autoFocusMultiple ? 'flex gap-2 items-center py-2 px-6' : 'p-6'
    )}
  >
    <h2>{game.name}</h2>
    <h3
      class={cn(
        "text-xs cursor-help font-bold z-20"
      )}
      class:text-lg={webapp}
    >
      Jeu introuvable
    </h3>
  </div>
{/if}
