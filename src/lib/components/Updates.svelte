<script lang="ts">
import { RefreshCcw } from '@/lib/assets/icon';
import GameBox from '@/lib/components/GameBox.svelte';
import { Button } from '@/lib/components/ui/button';
import { ScrollArea } from '@/lib/components/ui/scroll-area';
import { updates } from '@/lib/stores';
import type { UpdateType } from '../schemas';

browser.runtime.sendMessage('f95list-badge');

interface Props {
  webapp?: boolean;
}

let filterType = $state<UpdateType['type'] | null>(null);

const { webapp = false }: Props = $props();

const handleClickFilter = (type: UpdateType['type']) => {
  if (type === filterType) {
    filterType = null;

    return;
  }

  filterType = type;
};
</script>

{#if $updates}
  <ScrollArea class="pb-2 h-full w-full">
    <div class="flex flex-col gap-4 h-full p-2">
      {#each filterType ? $updates.filter((update)=>update.type === filterType) : $updates as update, index}
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
    <div class="flex justify-center gap-2 w-full fixed bottom-16">
      <Button variant='outline' onclick={()=>handleClickFilter('AJOUT DE JEU')}>add</Button>
      <Button variant='outline' onclick={()=>handleClickFilter('MISE À JOUR')}>edit</Button>
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
