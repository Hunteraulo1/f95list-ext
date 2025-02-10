<script lang="ts">
import { RefreshCcw } from '@/lib/assets/icon';
import GameBox from '@/lib/components/GameBox.svelte';
import { Button } from '@/lib/components/ui/button';
import { filteredGames } from '@/lib/stores';
</script>

<div class="flex flex-col gap-2 p-2 relative h-full">
  {#each $filteredGames as game (game.name + game.version)}
    <GameBox {game} webapp />
  {:else}
    <div class="flex justify-center items-center h-full">
      <Button>
        <RefreshCcw />
        Aucun jeu ne correspond à vos critères
      </Button>
    </div>
  {/each}
</div>
