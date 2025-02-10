<script lang="ts">
import { RefreshCcw } from '@/lib/assets/icon';
import GameBox from '@/lib/components/GameBox.svelte';
import { Button } from '@/lib/components/ui/button';
import { ScrollArea } from '@/lib/components/ui/scroll-area';
import { updates } from '@/lib/stores';

const browserAPI = typeof browser === 'undefined' ? chrome : browser;

browserAPI.runtime.sendMessage('f95list-badge');

interface Props {
  webapp?: boolean;
}

const { webapp = false }: Props = $props();
</script>

{#if $updates}
  <ScrollArea class="pb-2 h-full w-full">
    <div class="flex flex-col gap-4 h-full p-2">
      {#each $updates as update, index}
        <div class="flex flex-col gap-2">
          {#if index === 0 || $updates[index - 1].date.getTime() !== update.date.getTime()}
            <h2 class="text-center text-base font-bold leading-none mt-2">
              {new Date(update.date).toLocaleDateString("fr-FR", {
                timeZone: "Europe/Paris",
              })}
            </h2>
          {/if}
          <h3
            class="text-[.7rem] text-center text-secondary-foreground/75 leading-none"
          >
            {update.type}
          </h3>
          {#each update.games as game}
            <GameBox {game} {webapp} />
          {/each}
        </div>
      {/each}
    </div>
  </ScrollArea>
{:else}
  <div class="flex justify-center items-center h-full">
    <Button>
      <RefreshCcw classes="mr-2 h-4 w-4" />
      Veuillez patienter
    </Button>
  </div>
{/if}
