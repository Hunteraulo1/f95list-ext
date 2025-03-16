<script lang="ts">
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { ScrollArea } from '@/lib/components/ui/scroll-area';
import { type FilterType, filter, search } from '@/lib/stores';
import { cn } from '@/lib/utils';
import { get } from 'svelte/store';
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

<ScrollArea class={cn("flex flex-col gap-1 w-full relative p-3 m-0", variant !== "webapp" && "h-[26.5rem]")}>
  <div class={cn("flex gap-2 mb-2 items-center", variant !== "webapp" && "flex-col")}>
    <label for="filters" class="self-start">Filtrages sauvegardés: </label>
    <div class="flex gap-2 self-start">
      {#each filters as fil, index}
        <button class={cn("size-8 rounded-full flex justify-center items-center text-secondary-foreground font-bold text-lg cursor-pointer", filterRemove === index ? "bg-red-700/75  hover:bg-red-700" : "bg-secondary/75 hover:bg-secondary")} onclick={()=>handleClick(fil, index)} ondblclick={()=>handleClickRemove(index)}>
          {filterRemove === index ? 'X' : index + 1}
        </button>
      {/each}
      {#if filters.length < 5}
        <button class="bg-primary/75 hover:bg-primary size-8 rounded-full flex justify-center items-center text-primary-foreground font-bold text-xl cursor-pointer" onclick={handleClickAdd}>+</button>
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
  
  <div class={variant === 'webapp' ? 'grid grid-cols-3 gap-2' : 'flex flex-col gap-1 relative'}>
    {#each $filter as { title, values }}
      <FilterPopover {active} {title} {values} />
    {/each}
  </div>
</ScrollArea>
