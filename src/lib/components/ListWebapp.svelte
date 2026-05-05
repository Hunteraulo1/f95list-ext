<script lang="ts">
import { RefreshCcw } from '@/lib/assets/icon';
import GameBox from '@/lib/components/GameBox.svelte';
import { Button } from '@/lib/components/ui/button';
import type { GameType } from '@/lib/schemas';
import { filteredGames } from '@/lib/stores';

const getGameKey = (game: GameType): string =>
  game.id ??
  game.gameId ??
  (game.threadId ? `${game.domain}-${game.threadId}` : null) ??
  game.link ??
  `${game.domain}-${game.name}-${game.version}`;
</script>

<div class="flex flex-col gap-2 p-2 relative h-full">
  {#each $filteredGames as game (getGameKey(game))}
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
