<script lang="ts">
import { onMount } from 'svelte';
import { ChevronDown, RefreshCcw } from '@/lib/assets/icon';
import GameBox from '@/lib/components/GameBox.svelte';
import Button from '@/lib/components/ui/button/button.svelte';
import type { GameType } from '@/lib/schemas';
import { autoFocusBlock, filteredGames, games, outdated, settings } from '@/lib/stores';
import type { IdGameBox } from '@/lib/types';
import { cn } from '@/lib/utils';
import Alert from './Alert.svelte';
import Filter from './Filter.svelte';

const extractId = (inputString: string): number => {
  if (!inputString) return 0;

  const regex = /\.(\d+)/;
  const match = inputString.match(regex);

  return match ? Number.parseInt(match[1], 10) : 0;
};

let autoFocus: GameType[] = $state([]);

onMount(async () => {
  if (!browser.tabs) return;

  const extract: IdGameBox = await new Promise((resolve) =>
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || '';

      if (!url) {
        resolve({ domain: 'Unknown', id: 0 });
        return;
      }

      if (url.startsWith('https://f95zone.to/threads/')) {
        resolve({ domain: 'F95z', id: extractId(url) });
        return;
      }

      if (url.startsWith('https://lewdcorner.com/threads/')) {
        resolve({ domain: 'LewdCorner', id: extractId(url) });
        return;
      }

      resolve({ domain: 'Unknown', id: 0 });
    }),
  );

  autoFocus =
    extract.domain === 'Unknown'
      ? []
      : [...$filteredGames].filter((game) => game.domain === extract.domain && game.id === extract.id);
});

let shouldAutoFocus = Boolean($autoFocusBlock);
$autoFocusBlock = true;

const handleAutoFocus = (game: GameType): boolean => {
  if (!game.id || autoFocus.length !== 1 || shouldAutoFocus || !$settings.autoFocusGame) return false;

  if (autoFocus[0]?.domain !== game.domain || autoFocus[0]?.id !== game.id) return false;

  shouldAutoFocus = true;

  return true;
};

let mouseEnter = $state<boolean>(false);

let clickFocus = $state<boolean>(false);
</script>

{#if autoFocus}
  {#if autoFocus.length > 0}
    <div class="sticky top-0 z-10 p-2 mx-2 border rounded-b-xl bg-primary-foreground">
      <p class="mb-2 text-xs text-center">
        {#if autoFocus.length === 1}
        Traduction détectée sur cette page
        {:else}
        Traductions détectées sur cette page
        {/if}
      </p>
      <div class="flex flex-col gap-2 -mb-6">
        {#if clickFocus}
          {#each autoFocus as game (game.name + game.version)}
            <GameBox {game} autoFocusMultiple />
          {/each}
        {/if}
        <Button
          variant="outline"
          class="mx-auto rounded-full heading-none"
          onmouseenter={() => mouseEnter = true}
          onmouseleave={() => mouseEnter = false}
          onclick={() => clickFocus = !clickFocus}
        >
        <ChevronDown isHovered={mouseEnter} classes={cn(clickFocus && 'rotate-180')} />
      </Button>
      </div>
    </div>
  {/if}
  <div class="relative flex flex-col h-full gap-2 p-2">
    {#if $outdated && import.meta.env.CHROME && import.meta.env.PROD}
      <Alert description="Votre extension n'est plus à jour !" />
    {/if}
    {#each $filteredGames as game (game.name + game.version)}
      <GameBox {game} autoFocus={handleAutoFocus(game)} />
    {:else}
      {#if $games.length > 0}
        <div class="flex items-center justify-center h-full">
          <RefreshCcw />
          <span>Aucun jeu ne correspond à vos critères</span>
        </div>
      {:else}
        <div class="flex items-center justify-center h-full text-center text-red-600">
          <span>Un problème est survenu lors de la récupération des données, veuillez nous contacter sur discord.</span>
        </div>
      {/if}
      
    {/each}

    <Filter variant="popup" />
  </div>
{/if}
