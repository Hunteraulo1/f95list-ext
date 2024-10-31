<script lang="ts">
import { dev } from '$app/environment';
import Filter from '$lib/components/Filter.svelte';
import GameBox from '$lib/components/GameBox.svelte';
import LoadingState from '$lib/components/LoadingState.svelte';
import { filteredGames, settings } from '$lib/stores';
import type { IdGameBox } from '$lib/types';
import { Button } from '$ui/button';
import { ScrollArea } from '$ui/scroll-area';
import { ExternalLink } from 'svelte-radix';

let browserAPI = undefined;

if (typeof chrome !== 'undefined') {
  browserAPI = chrome;
} else if (typeof browser !== 'undefined') {
  browserAPI = browser;
}

const extractId = (inputString: string): number => {
  const regex = /\.(\d+)/;
  const match = inputString.match(regex);
  console.log('🚀 ~ extractId ~ match:', match);

  return match ? Number.parseInt(match[1]) : 0;
};

const idGameBoxPromise: Promise<IdGameBox> = new Promise((resolve) =>
  dev
    ? resolve({ domain: 'Unknown', id: 0 })
    : browserAPI?.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
        const { url } = tabs[0];
        console.log('🚀 ~ browserAPI?.tabs?.query ~ url:', url);

        if ($settings.autoFocusGame && url?.startsWith('https://f95zone.to/threads/')) {
          resolve({ domain: 'F95z', id: extractId(url) });
        }

        if ($settings.autoFocusGame && url?.startsWith('https://lewdcorner.com/threads/')) {
          resolve({ domain: 'LewdCorner', id: extractId(url) });
        }

        resolve({ domain: 'Unknown', id: 0 });
      }),
);

let idGameBox = $state<IdGameBox>({ domain: 'Unknown', id: 0 });
</script>

<ScrollArea class="relative h-full">
  <div class="flex flex-col gap-2 p-2 relative h-full">
    {#each $filteredGames as game (game.name + game.version)}
      {#key game.id}
        <GameBox {game} {idGameBox} />
      {/key}
    {:else}
      <LoadingState />
    {/each}
  </div>
</ScrollArea>

<div class="h-0 flex justify-center w-full gap-2">
  <Filter />
  <a href="/index.html?webapp" target="_blank">
    <Button variant="secondary" class="-translate-y-12 border-2 border-primary-foreground">
      <ExternalLink class="h-4 w-full" />
    </Button>
  </a>
</div>
