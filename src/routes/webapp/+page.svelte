<script lang="ts">
import GameBox from '$lib/components/GameBox.svelte';
import { filteredGames } from '$lib/stores';
import { Button } from '$ui/button';
import { ScrollArea } from '$ui/scroll-area';
import Reload from 'svelte-radix/Reload.svelte';
</script>

<ScrollArea class="relative h-full">
  <div class="flex flex-col gap-2 p-2 relative h-full">
    {#each $filteredGames as game (game.name + game.version)}
      <GameBox {game} webapp />
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
