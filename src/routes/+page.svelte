<script lang="ts">
import Filter from '$lib/components/Filter.svelte'
import GameBox from '$lib/components/GameBox.svelte'
import { ScrollArea } from '$lib/components/ui/scroll-area'
import { filteredGames, games } from '$lib/stores'
import Reload from 'svelte-radix/Reload.svelte'
import Button from './../lib/components/ui/button/button.svelte'

let maxLength = 25
</script>

{#if $games.length > 0}
  <ScrollArea class="relative min-h-[448px]">
    <div class="flex flex-col gap-2 p-2 relative" id="0">
      {#each $filteredGames as game, index (game.name + game.version)}
        {#if index < maxLength}
          <GameBox {game} />
        {/if}
        {#if index !== $filteredGames.length - 1 && index === maxLength - 1}
          <Button variant="link" on:click={() => (maxLength += 25)}>Voir plus</Button>
        {/if}
      {:else}
        <div class="flex justify-center items-center h-screen w-full">
          <Button>
            <Reload class="h-4 w-full animate-spin" />
            Aucun jeu ne correspond à vos critères
          </Button>
        </div>
      {/each}
      <Filter />
    </div>
  </ScrollArea>
{:else}
  <div class="flex justify-center items-center h-full">
    <Button>
      <Reload class="mr-2 h-4 w-4 animate-spin" />
      Veuillez patienter
    </Button>
  </div>
{/if}
