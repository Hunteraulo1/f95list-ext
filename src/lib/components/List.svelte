<script lang="ts">
import { ChevronDown, RefreshCcw } from '$lib/assets/icon';
import GameBox from '$lib/components/GameBox.svelte';
import type { GameType } from '$lib/schemas';
import { autoFocusBlock, filteredGames, outdated, settings } from '$lib/stores';
import type { IdGameBox } from '$lib/types';
import { cn } from '$lib/utils';
import { Alert } from '$ui/alert';
import Button from '$ui/button/button.svelte';
import { isChrome } from '$utils/polyfill';
import { onMount } from 'svelte';
import Filter from './Filter.svelte';

let browserAPI = undefined;

if (typeof chrome !== 'undefined') {
  browserAPI = chrome;
} else if (typeof browser !== 'undefined') {
  browserAPI = browser;
}

const extractId = (inputString: string): number => {
  if (!inputString) return 0;

  const regex = /\.(\d+)/;
  const match = inputString.match(regex);

  return match ? Number.parseInt(match[1]) : 0;
};

let autoFocus: GameType[] = $state([]);

onMount(async () => {
  const extract: IdGameBox = await new Promise((resolve) =>
    browserAPI?.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
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
    <div class="p-2 border rounded-b-xl bg-primary-foreground top-0 mx-2 sticky z-10">
      <p class="text-xs text-center mb-2">
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
          class="rounded-full mx-auto heading-none"
          onmouseenter={() => mouseEnter = true}
          onmouseleave={() => mouseEnter = false}
          onclick={() => clickFocus = !clickFocus}
        >
        <ChevronDown isHovered={mouseEnter} classes={cn(clickFocus && 'rotate-180')} />
      </Button>
      </div>
    </div>
  {/if}
  <div class="flex flex-col gap-2 p-2 relative h-full">
    {#if outdated && isChrome()}
      <Alert variant="destructive">Votre extension n'est plus à jour</Alert>
    {/if}
    {#each $filteredGames as game (game.name + game.version)}
      <GameBox {game} autoFocus={handleAutoFocus(game)} />
    {:else}
      <div class="flex justify-center items-center h-full">
        <RefreshCcw />
        <span>Aucun jeu ne correspond à vos critères</span>
      </div>
    {/each}

    <Filter variant="popup" />
  </div>
{/if}
