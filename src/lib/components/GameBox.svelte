<script lang="ts">
import { dev } from '$app/environment';
import Badge from '$lib/components/ui/badge/badge.svelte';
import * as Card from '$lib/components/ui/card';
import * as Tooltip from '$lib/components/ui/tooltip';
import type { GameType } from '$lib/schemas';
import { games } from '$lib/stores';
import type { IdGameBox } from '$lib/types';
import { lazyLoad } from '$lib/utils/lazyload';
import { isFirefox } from '$lib/utils/polyfill';
import { Link1 } from 'svelte-radix';
import Details from './Details.svelte';

export let game: GameType;
export let idGameBox: IdGameBox = { domain: 'Unknown', id: 0 };
export let webapp = false;

let open = false;

if (game.domain === idGameBox.domain && game.id === idGameBox.id) {
  open = $games.filter((game) => game.domain === idGameBox.domain && game.id === idGameBox.id).length === 1;
}
</script>

{#if open && !webapp && game.domain !== 'Unknown'}
  <Details {game} bind:open />
{/if}

{#if game.domain !== 'Unknown'}
<div class="relative">
  <Card.Root class="cursor-pointer" on:click={() => {if (!webapp) {
    console.log({webapp})
    open = true
    }}}>
    {#if game.image}
      <img
        alt={game.name}
          class="absolute top-0 left-0 object-cover w-full h-full rounded-xl"
          use:lazyLoad={game.image.replace(
            'attachments.f95zone.to',
            'preview.f95zone.to'
          )}
          style="image-rendering: smooth; image-resolution: snap;"
      />
    {/if}
    <Card.CardContent
    class="relative p-6 rounded-xl overflow-hidden hover:scale-[1.03] transition backdrop-brightness-90 text-white {webapp ? 'text-xl' : 'hover:translate-x-1'}">
      <Card.Title>{game.name}</Card.Title>
      <Card.Description>
        <Tooltip.Root>
          <Tooltip.Trigger
            class="text-xs cursor-help font-bold {game.tversion ===
              'Intégrée' || game.tversion === game.version
              ? 'text-green-700'
              : 'text-red-700'} {webapp ? 'text-lg' : ''}"
          >
            {game.tversion}
          </Tooltip.Trigger>
          <Tooltip.Content class="bg-transparent">
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
      </Card.Description>
    </Card.CardContent>
  </Card.Root>
  
  <!-- svelte-ignore missing-declaration -->
  {#if isFirefox() || dev}
    <a class="absolute right-1 top-1 opacity-30 hover:opacity-100 hover:bg-primary-foreground/30 rounded-full p-1" href={game.link} target="_blank">
      <Link1 />
    </a>
  {/if}
</div>
{:else}
  <Card.Root class="relative">
    <Card.CardContent
      class="relative h-20 p-6 rounded-xl backdrop-blur-xs hover:backdrop-blur-none bg-secondary/20"
    >
      <Card.Title>{game.name}</Card.Title>
      <Card.Description>Jeu introuvable</Card.Description>
    </Card.CardContent>
  </Card.Root>
{/if}
