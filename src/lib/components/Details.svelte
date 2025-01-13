<script lang="ts">
import noImage from '$lib/assets/no-image.png';
import { selectedGame, settings } from '$lib/stores';
import { lazyLoad } from '$lib/utils/lazyload';

import { ArrowLeft, TriangleAlert } from '$lib/assets/icon';
import type { GameType } from '$lib/schemas';
import { cn } from '$lib/utils';
import * as Alert from '$ui/alert/index';
import { Badge } from '$ui/badge';
import { Button, buttonVariants } from '$ui/button';
import { ScrollArea } from '$ui/scroll-area';
import * as Tooltip from '$ui/tooltip/index';
import { statusColor, typeColor } from '$utils/badgeColor';

let tagsHide = $state($settings.tagsHide);

interface Props {
  game: GameType;
  open?: boolean;
  variant?: 'popup' | 'webapp';
}

let { game = $bindable(), open = $bindable(), variant = 'popup' }: Props = $props();
let closed = $state<boolean>(variant === 'popup' && false);
</script>

<div class={variant === 'webapp' ? 'w-full h-full' : 'fixed w-main h-main top-0 left-0 z-20'}>
  <ScrollArea class="bg-primary-foreground h-full w-full {closed ? 'animate-toUp' : 'animate-toDown'}">
    <Button
      class="flex gap-1 opacity-50 absolute top-2 left-2"
      variant="secondary"
      onclick={() => {
        $selectedGame = undefined;
        closed = true;
        setTimeout(() => {open = false}, 600);
      }}
    >
      <ArrowLeft />
    </Button>

    {#if game}
      <img
        alt={game.name}
        class="h-full w-full object-cover max-h-[33vh]"
        class:rounded-lg={variant === 'webapp'}
        use:lazyLoad={game.image ?? noImage}
      />
      <div class="p-2 flex flex-col gap-2">
        <h2>
          <span class="font-bold text-sm select-none">Site:</span>
          <a href={game.link} target="_blank">
            <Badge variant="secondary">{game.domain}</Badge>
          </a>
          <a
            href={game.link}
            target="_blank"
            class={cn(buttonVariants({ variant: 'link', class: 'px-1' }), 'select-none')}
          >
            (Accèder au jeu)
          </a>
        </h2>
        <h1>
          <Badge style={typeColor(game.type)} class="text-white font-bold">
            {game.type}
          </Badge>
          <Badge style={statusColor(game.status)} class="text-white font-bold">
            {game.status}
          </Badge>
          {game.name}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger
              class="text-xs cursor-help font-bold {game.tversion ===
                'Intégrée' || game.tversion === game.version
                ? 'text-green-700'
                : 'text-red-700'}"
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
        </h1>
        <div class="flex gap-1 flex-wrap">
          <span class="font-bold text-sm select-none">Tags:</span>
          {#each game.tags as tag, index}
            {#if index < 5 || !tagsHide}
              <Badge variant="outline">{tag}</Badge>
            {/if}
          {/each}
          {#if game.tags.length > 5}
            <button
              class="text-xs font-bold text-secondary-foreground/50"
              onclick={() => (tagsHide = !tagsHide)}
            >
              {tagsHide ? 'afficher plus...' : 'cacher'}
            </button>
          {/if}
        </div>
        <p class="text-sm">
          <span class="font-bold select-none">Traducteur:</span>
          <a href={game.trlink} class:traductor={game.trlink} target="_blank">
            {game.traductor ?? 'Aucun'}
          </a>
          <span class="text-secondary-foreground/50 text-xs">
            ({game.ttype})
          </span>
        </p>
        {#if game.proofreader}
          <p class="text-sm">
            <span class="font-bold select-none">Relecteur:</span>
            <a href={game.trlink} class:traductor={game.trlink} target="_blank">
              {game.proofreader}
            </a>
          </p>
        {/if}
        {#if game.tname === 'Traduction (mod inclus)'}
          <Alert.Root class="text-red-600">
            <TriangleAlert class="h-4 w-4" />
            <Alert.Title>Attention !</Alert.Title>
            <Alert.Description>
              Un mod peut-être nécessaire au bon fonctionnement de cette
              traduction. Veuillez lire les instructions du traducteur.
            </Alert.Description>
          </Alert.Root>
        {:else if game.tname === 'Pas de traduction'}
          <Alert.Root class="text-red-600">
            <TriangleAlert class="h-4 w-4" />
            <Alert.Title>Attention !</Alert.Title>
            <Alert.Description>
              Cette traduction à disparue. Veuillez nous contacter si vous en
              possédez une version.
            </Alert.Description>
          </Alert.Root>
        {/if}
        <div class="flex justify-center mt-2">
          {#if game.tname === 'Intégrée'}
            <Button variant="outline" class="flex gap-1">
              Traduction intégrée
            </Button>
          {:else if game.tname === 'Pas de traduction' || !game.tlink}
            <Button variant="ghost" class="flex gap-1">
              Aucune traduction
            </Button>
          {:else}
            <a href={game.tlink} target="_blank" class={buttonVariants({ variant: "secondary", class: "flex gap-1" })}>
              Accéder à la traduction
            </a>
          {/if}
        </div>
      </div>
    {:else}
      <h1>Game not found</h1>
    {/if}
  </ScrollArea>
</div>

<style lang="postcss">
  .traductor {
    @apply underline text-blue-500 hover:text-blue-700;
  }
</style>
