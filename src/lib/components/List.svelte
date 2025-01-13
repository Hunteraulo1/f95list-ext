<script lang="ts">
import { RefreshCcw } from '$lib/assets/icon';
import GameBox from '$lib/components/GameBox.svelte';
import type { GameType } from '$lib/schemas';
import { autoFocusBlock, filteredGames, settings } from '$lib/stores';
import type { IdGameBox } from '$lib/types';
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

let autoFocus: GameType[];

onMount(async () => {
  const extract: IdGameBox = await new Promise((resolve) =>
    browserAPI?.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || '';

      if (!url) {
        resolve({ domain: 'Unknown', id: 0 });
        return;
      }

      if ($settings.autoFocusGame && url.startsWith('https://f95zone.to/threads/')) {
        resolve({ domain: 'F95z', id: extractId(url) });
        return;
      }

      if ($settings.autoFocusGame && url.startsWith('https://lewdcorner.com/threads/')) {
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
  if (!game.id || autoFocus.length !== 1 || shouldAutoFocus) return false;

  if (autoFocus[0]?.domain !== game.domain || autoFocus[0]?.id !== game.id) return false;

  shouldAutoFocus = true;

  return true;
};
</script>

<div class="flex flex-col gap-2 p-2 relative">
  {#if autoFocus}
    {#if autoFocus.length > 0}
      <div class="mb-4 p-2 border rounded-xl">
        <p class="mb-2 text-xs text-center">
          {#if autoFocus.length === 1}
            Un jeu correspond à cette page
          {:else}
            Plusieurs jeux correspondent à cette page
          {/if}
        </p>

        <div class="flex flex-col gap-2">
          {#each autoFocus as game (game.name + game.version)}
            <GameBox {game} autoFocusMultiple />
          {/each}
        </div>
      </div>
    {/if}

    {#each $filteredGames as game (game.name + game.version)}
      <GameBox {game} autoFocus={handleAutoFocus(game)} />
    {:else}
      <div class="flex justify-center items-center h-full">
        <RefreshCcw />
        <span>Aucun jeu ne correspond à vos critères</span>
      </div>
    {/each}
  {/if}
  <Filter variant="popup" />
</div>
