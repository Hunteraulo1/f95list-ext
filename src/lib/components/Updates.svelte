<script lang="ts">
import { RefreshCcw } from '@/lib/assets/icon';
import GameBox from '@/lib/components/GameBox.svelte';
import { Button } from '@/lib/components/ui/button';
import { ScrollArea } from '@/lib/components/ui/scroll-area';
import { updates } from '@/lib/stores';
import type { UpdateType } from '../schemas';
import { cn } from '../utils';

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
  <ScrollArea class="w-full h-full pb-2">
    <div class="flex flex-col h-full gap-4 p-2">
      {#each filterType ? $updates.filter((update)=>update.type === filterType) : $updates as update, index}
        <div class="flex flex-col gap-2">
          {#if index === 0 || $updates[index - 1].date.getTime() !== update.date.getTime()}
            <h2 class="mt-2 text-base font-bold leading-none text-center">
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
    <div class="fixed z-10 inline-flex items-center justify-center -translate-x-1/2 ml-[50%] border-2 rounded-md shadow-sm h-9 border-primary-foreground/60 bg-secondary/60 bottom-16">
      <Button variant="ghost" class={cn("text-xs", filterType === 'AJOUT DE JEU' && 'bg-secondary')} onclick={()=>handleClickFilter('AJOUT DE JEU')}>Ajouts</Button>
      <hr class="w-[1px] h-full bg-secondary-foreground" />
      <Button variant="ghost" class={cn("text-xs", filterType === 'MISE À JOUR' && 'bg-secondary')} onclick={()=>handleClickFilter('MISE À JOUR')}>MàJ</Button>
    </div>
  </ScrollArea>
{:else}
  <div class="flex items-center justify-center h-full">
    <Button>
      <RefreshCcw classes="mr-2 h-4 w-4" />
      Veuillez patienter
    </Button>
  </div>
{/if}
