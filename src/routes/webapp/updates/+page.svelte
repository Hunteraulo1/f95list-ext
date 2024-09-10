<script lang="ts">
import { dev } from '$app/environment';
import GameBox from '$lib/components/GameBox.svelte';
import { Button } from '$lib/components/ui/button';
import { ScrollArea } from '$lib/components/ui/scroll-area';
import { detailGame, updates } from '$lib/stores';
import { Reload } from 'svelte-radix';

if (!dev) {
  const browserAPI = typeof browser === 'undefined' ? chrome : browser;

  browserAPI.runtime.sendMessage('f95list-badge');
}
</script>

{#if $updates}
  <ScrollArea class="pb-2 h-full w-full">
    <div class="flex flex-col gap-4 h-full p-2">
      {#each $updates as update, index}
        <div class="flex flex-col gap-2">
          {#if index === 0 || $updates[index - 1].date.getTime() !== update.date.getTime()}
            <h2 class="text-center font-bold leading-none">
              {new Date(update.date).toLocaleDateString("fr-FR", {
                timeZone: "Europe/Paris",
              })}
            </h2>
          {/if}
          <h3
            class="text-[.7rem] text-center text-secondary-foreground/50 leading-none"
          >
            {update.type}
          </h3>
          {#each update.games as game}
            <button on:click={() => $detailGame = game}>
              <GameBox {game} webapp />
            </button>
          {/each}
        </div>
      {/each}
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
