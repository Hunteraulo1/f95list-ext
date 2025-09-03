<script lang="ts">
import { ArrowLeft } from '@/lib/assets/icon';
import noImage from '@/lib/assets/no-image.png';
import { Badge } from '@/lib/components/ui/badge';
import { Button, buttonVariants } from '@/lib/components/ui/button';
import { ScrollArea } from '@/lib/components/ui/scroll-area';
import * as Tooltip from '@/lib/components/ui/tooltip/index';
import type { GameType } from '@/lib/schemas';
import { selectedGame, settings } from '@/lib/stores';
import { cn } from '@/lib/utils';
import { statusColor, typeColor } from '@/lib/utils/badgeColor';
import Lazy from 'svelte-lazy';
import Alert from './Alert.svelte';
import ExternalLink from './ExternalLink.svelte';

let tagsHide = $state($settings.tagsHide);

interface Props {
  game: GameType;
  open?: boolean;
  variant?: 'popup' | 'webapp';
}

let { game = $bindable(), open = $bindable(), variant = 'popup' }: Props = $props();
let closeHovered = $state<boolean>(false);
</script>

<div class={variant === 'webapp' ? 'overflow-hidden' : 'fixed w-wmain h-hmain top-0 left-0 z-20'}>
  <ScrollArea class="bg-background h-full w-full animate-toDown">
    <Button
      class="flex gap-1 opacity-50 absolute top-2 left-2 cursor-pointer z-10"
      variant="secondary"
      onmouseenter={()=>closeHovered = true}
      onmouseleave={()=>closeHovered = false}
      onclick={() => {
        $selectedGame = undefined;
        open = false;
      }}
    >
      <ArrowLeft size={16} isHovered={closeHovered} />
    </Button>

    {#if game}
      <Lazy height="16rem" fadeOption={{ delay: 0, duration: 0 }} keep={true} class="overflow-hidden bg-primary-foreground h-64 max-h-64" placeholder>
        <img
          alt={game.name}
          src={game.image ?? noImage}
          class={cn("h-1/3 w-full object-cover", variant === 'webapp' && 'rounded-lg h-64')}
        />
      </Lazy>
      <div class="p-2 flex flex-col gap-4">
        <div>
          <span class="font-bold text-sm select-none">Site:</span>
          <ExternalLink target={game.link}>
            <Badge variant="secondary">{game.domain}</Badge>
          </ExternalLink>
          <ExternalLink
            target={game.link}
            classes={cn(buttonVariants({ variant: 'link', class: 'px-2' }), 'select-none')}
          >
            Accèder au jeu
          </ExternalLink>
        </div>
        <h1 class="mb-2 flex items-center gap-1 flex-wrap">
          <Badge style={typeColor(game.type)} class="text-primary-foreground font-bold">
            {game.type}
          </Badge>
          <Badge style={statusColor(game.status)} class="text-primary-foreground font-bold">
            {game.status}
          </Badge>
          <span class="text-lg leading-none font-medium">{game.name}</span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger
              class="text-sm cursor-help font-bold {game.tversion ===
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
              <Badge variant="secondary">{tag}</Badge>
            {/if}
          {/each}
          {#if game.tags.length > 5}
            <button
              class="text-xs font-bold text-secondary-foreground/50 cursor-pointer hover:text-secondary-foreground/80"
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
          <Alert description="Un mod peut-être nécessaire au bon fonctionnement de cette
              traduction. Veuillez lire les instructions du traducteur." />
        {:else if game.tname === 'Pas de traduction'}
          <Alert description="Cette traduction à disparue. Veuillez nous contacter si vous en
              possédez une version." />
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
      <h1>Game not foun</h1>
    {/if}
  </ScrollArea>
</div>

<style lang="postcss">
  @reference "@/entrypoints/popup/app.css";

  .traductor {
    @apply underline text-blue-500 hover:text-blue-700;
  }
</style>
