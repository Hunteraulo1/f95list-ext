<script lang="ts">
import { RefreshCcw } from '@/lib/assets/icon';
import GameBox from '@/lib/components/GameBox.svelte';
import { Button } from '@/lib/components/ui/button';
import { ScrollArea } from '@/lib/components/ui/scroll-area';
import type { GameType, UpdateType } from '@/lib/schemas';
import { games, updates } from '@/lib/stores';
import { cn } from '../utils';

browser.runtime.sendMessage('f95list-badge');

interface Props {
  webapp?: boolean;
}

let filterType = $state<UpdateType['type'] | null>(null);
let visibleUpdates = $derived(filterType ? $updates.filter((update) => update.type === filterType) : $updates);
const parisDayFormatter = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
let groupedUpdates = $derived.by(() => {
  const grouped = new Map<
    string,
    {
      dayKey: string;
      date: UpdateType['date'];
      type: UpdateType['type'];
      games: GameType[];
    }
  >();

  for (const update of visibleUpdates) {
    const game =
      $games.find((entry) => entry.gameId === update.gameId) ?? $games.find((entry) => entry.id === update.gameId);
    if (!game) continue;

    const dayKey = parisDayFormatter.format(update.date);
    const key = `${dayKey}-${update.type}`;
    const current = grouped.get(key);

    if (current) {
      current.games.push(game);
    } else {
      grouped.set(key, {
        dayKey,
        date: update.date,
        type: update.type,
        games: [game],
      });
    }
  }

  return [...grouped.values()].sort((a, b) => {
    if (a.dayKey !== b.dayKey) return b.dayKey.localeCompare(a.dayKey);
    if (a.type === b.type) return 0;
    return a.type === 'AJOUT DE JEU' ? -1 : 1;
  });
});

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
      {#each groupedUpdates as update}
        <div class="flex flex-col gap-2">
          <h2 class="mt-2 text-base font-bold leading-none text-center">
            {new Date(update.date).toLocaleDateString("fr-FR", {
              timeZone: "Europe/Paris",
            })}
          </h2>
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
  
  <div class="sticky z-10 inline-flex items-center justify-center -translate-x-1/2 ml-[50%] border-2 rounded-md shadow-sm h-9 border-primary-foreground/60 bg-secondary/60 bottom-2">
    <Button variant="ghost" class={cn("text-xs", filterType === 'AJOUT DE JEU' && 'bg-secondary')} onclick={()=>handleClickFilter('AJOUT DE JEU')}>Ajouts</Button>
    <hr class="w-px h-full bg-secondary-foreground" />
    <Button variant="ghost" class={cn("text-xs", filterType === 'MISE À JOUR' && 'bg-secondary')} onclick={()=>handleClickFilter('MISE À JOUR')}>MàJ</Button>
  </div>
{:else}
  <div class="flex items-center justify-center h-full">
    <Button>
      <RefreshCcw classes="mr-2 h-4 w-4" />
      Veuillez patienter
    </Button>
  </div>
{/if}
