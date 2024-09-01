<script lang="ts">
import GameBox from '$lib/components/GameBox.svelte';
import Button from '$lib/components/ui/button/button.svelte';
import { ScrollArea } from '$lib/components/ui/scroll-area';
import { detailGame, filteredGames } from '$lib/stores';
import type { IdGameBox } from '$lib/types';
import Reload from 'svelte-radix/Reload.svelte';

const idGameBox: IdGameBox = { domain: 'Unknown', id: 0 };
</script>

<ScrollArea class="relative h-full">
  <div class="flex flex-col gap-2 p-2 relative h-full">
    {#each $filteredGames as game (game.name + game.version)}
      <button on:click={() => $detailGame = game}>
        <GameBox {game} {idGameBox} webapp />
      </button>
    {:else}
      <div class="flex justify-center items-center h-full">
        <Button>
          <Reload class="h-4 w-full animate-spin" />
          Aucun jeu ne correspond à vos critères
        </Button>
      </div>
    {/each}
  </div>
</ScrollArea>
