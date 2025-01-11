<script lang="ts">
import noImage from '$lib/assets/no-image.png';
import { games, selectedGame } from '$lib/stores';
import { isFirefox } from '$lib/utils/polyfill';
import Lazy from 'svelte-lazy';

import { CopyCheck } from '$lib/assets/icon';
import type { GameType } from '$lib/schemas';
import type { IdGameBox } from '$lib/types';
import { cn } from '$lib/utils/cn';
import type { KeyboardEventHandler } from 'svelte/elements';
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
  open = $games.filter((game) => game.domain === idGameBox.domain && game.id === idGameBox.id).length === 1;
}

const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (e) => {
  if (e.currentTarget) $selectedGame = game;
  open = true;
};

const handleClick = () => {
  $selectedGame = game;
  open = true;
};
</script>

{#if open && !webapp && game.domain !== 'Unknown'}
  <Details {game} bind:open />
{/if}

{#if game.domain !== 'Unknown'}
  <div class="relative">
    <Lazy height={88} fadeOption={{ delay: 0, duration: 0 }} keep={true}>
      <button class="rounded-md cursor-pointer h-full w-full" onclick={handleClick} onkeydown={handleKeyDown}>
        {#if !autoFocusMultiple}
          <img
            alt={game.name}
            class="absolute top-0 left-0 object-cover w-full h-full rounded-xl"
            src={game.image?.replace(
              'attachments.f95zone.to',
              'preview.f95zone.to'
            ) ?? noImage}
            style="image-rendering: smooth; image-resolution: snap;"
          />
        {/if}
        <div class={cn(
            "relative rounded-xl overflow-hidden transition backdrop-brightness-90 text-white", 
            (webapp && !autoFocusMultiple) ? 'text-xl' : 'hover:backdrop-brightness-100',
            autoFocusMultiple ? 'flex gap-2 items-center py-2 px-6' : 'p-6'
          )}>
          <h2>{game.name}</h2>
          <h3 class={cn(
              "text-xs cursor-help font-bold z-20",
              game.tversion === 'Intégrée' || game.tversion === game.version ? 'text-green-700' : 'text-red-700'
            )}
            class:text-lg={webapp}
          >
            {game.tversion}
            <!-- tooltip -->
            <!-- <Badge variant="secondary">
              {#if game.tversion === 'Intégrée'}
                À jour ({game.version})
              {:else if game.tversion === game.version}
                À jour
              {:else if game.tversion === 'n/a'}
              Pas de traduction
              {:else}
                N'est pas à jour ({game.version})
              {/if}
            </Badge> -->
          </h3>
        </div>
      </button>
    </Lazy>
    
    {#if isFirefox()}
      <a class="absolute right-1 top-1 opacity-30 hover:opacity-100 hover:bg-primary-foreground/30 rounded-full p-1" href={game.link} target="_blank">
        <CopyCheck />
      </a>
    {/if}
  </div>
{:else}
  <div class="relative">
    <div class="rounded-md cursor-pointer">
      <div class={cn(
          "relative rounded-xl overflow-hidden transition backdrop-brightness-90 text-white", 
          (webapp && !autoFocusMultiple) ? 'text-xl' : 'hover:backdrop-brightness-100',
          autoFocusMultiple ? 'flex gap-2 items-center py-2 px-6' : 'p-6'
        )}>
        <h2>{game.name}</h2>
        <h3 class={cn(
            "text-xs cursor-help font-bold z-20"
          )}
          class:text-lg={webapp}
        >
          Jeu introuvable
        </h3>
      </div>
    </div>
  </div>
{/if}
