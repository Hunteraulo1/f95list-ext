<script lang="ts">
import { onMount } from 'svelte';
import { get } from 'svelte/store';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { ScrollArea } from '@/lib/components/ui/scroll-area';
import { type FilterType, filter, search } from '@/lib/stores';
import { cn } from '@/lib/utils';
import { Plus, XIcon } from '../assets/icon';
import FilterPopover from './FilterPopover.svelte';

interface Props {
  variant?: 'popup' | 'webapp';
  active?: boolean;
}

let { variant = 'popup', active = true }: Props = $props();

const handleReset = () => {
  $search = '';
  filter.reset();
};

let filters: FilterType[] = $state([]);
let filterRemove: number | null = $state(null);

onMount(async () => {
  const filtersStored = localStorage.getItem('filters');

  if (!filtersStored) return;

  filters = JSON.parse(filtersStored);
});

const handleClick = (fil: FilterType, index: number) => {
  if (filterRemove === index) {
    filterRemove = null;
    filter.reset();

    filters.splice(index, 1);

    localStorage.setItem('filters', JSON.stringify(filters));

    return;
  }
  filterRemove = null;

  filter.set(fil);
};

const handleClickAdd = () => {
  filterRemove = null;
  filters = [...filters, get(filter)];

  localStorage.setItem('filters', JSON.stringify(filters));
};

const handleClickRemove = (index: number) => {
  filterRemove = index;

  setTimeout(() => {
    filterRemove = null;
  }, 2000);
};
</script>

<ScrollArea class={cn("flex flex-col gap-1 w-full relative p-3 m-0", variant !== "webapp" && "h-106")}>
  <div class={cn("flex gap-2 mb-2 items-center", variant !== "webapp" && "flex-col")}>
    <label for="filters" class="self-start my-auto">Filtrages sauvegardés: </label>
    <div class="flex gap-2 self-start">
      {#each filters as fil, index}
        <button class={cn("size-8 rounded-full flex justify-center items-center text-secondary-foreground font-bold text-lg cursor-pointer", filterRemove === index ? "bg-red-700/75  hover:bg-red-700" : "bg-secondary/75 hover:bg-secondary")} onclick={()=>handleClick(fil, index)} ondblclick={()=>handleClickRemove(index)}>
          {#if filterRemove === index}
            <XIcon size={20} />
          {:else}
            {index + 1}
          {/if}
        </button>
      {/each}
      {#if filters.length < 5}
        <button class="bg-primary/75 hover:bg-primary size-8 rounded-full flex justify-center items-center text-primary-foreground font-bold text-xl cursor-pointer" onclick={handleClickAdd}>
          <Plus size={20} />
        </button>
      {/if}
    </div>
  </div>
  <label for="name" class="font-bold text-xs leading-none">Nom: </label>
  <div class="flex gap-2 mb-2">
    <Input
      id="name"
      type="text"
      placeholder="Rechercher un nom"
      class="w-full"
      disabled={!active}
      value={$search}
      oninput={({ currentTarget }: { currentTarget: HTMLInputElement }) => {
        $search = currentTarget.value.toLowerCase();
      }}
    />
    <Button onclick={handleReset} disabled={!active}>Réinitialiser</Button>
  </div>
  
  <div class={variant === 'webapp' ? 'grid grid-cols-4 gap-2' : 'flex flex-col gap-1 relative'}>
    {#each $filter as { title, values }}
      <FilterPopover {active} {title} {values} />
    {/each}
  </div>
</ScrollArea>
