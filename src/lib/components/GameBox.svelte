<script lang="ts">
import { dev } from '$app/environment';
import { page } from '$app/stores';
import noImage from '$lib/assets/no-image.png';
import type { GameType } from '$lib/schemas';
import { games, selectedGame } from '$lib/stores';
import type { IdGameBox } from '$lib/types';
import { isFirefox } from '$lib/utils/polyfill';
import { Badge } from '$ui/badge';
import * as Card from '$ui/card';
import * as Tooltip from '$ui/tooltip';
import Lazy from 'svelte-lazy';
import { Link1 } from 'svelte-radix';
import Details from './Details.svelte';

interface Props {
  game: GameType;
  idGameBox?: IdGameBox;
  webapp?: boolean;
}

let { game, idGameBox = { domain: 'Unknown', id: 0 }, webapp = false }: Props = $props();

let open = $state(false);

if (game.domain === idGameBox.domain && game.id === idGameBox.id) {
  open = $games.filter((game) => game.domain === idGameBox.domain && game.id === idGameBox.id).length === 1;
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
  <div class="relative">
    <Lazy height={88}>
      <Card.Root class="cursor-pointer" onclick={handleClick}>
        <img
        alt={game.name}
        class="absolute top-0 left-0 object-cover w-full h-full rounded-xl"
        src={game.image?.replace(
          'attachments.f95zone.to',
          'preview.f95zone.to'
        ) ?? noImage}
        style="image-rendering: smooth; image-resolution: snap;"
      />
      
      <Card.CardContent
        class="relative p-6 rounded-xl overflow-hidden transition backdrop-brightness-90 text-white {webapp ? 'text-xl' : 'hover:backdrop-brightness-100'}">
        <Card.Title>{game.name}</Card.Title>
        <Card.Description>
          <Tooltip.Provider>
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
          </Tooltip.Provider>
        </Card.Description>
      </Card.CardContent>
      </Card.Root>
    </Lazy>

    {#if isFirefox() || $page.url.pathname.startsWith('/webapp') || dev}
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
