<script lang="ts">
import { get } from 'svelte/store';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { ScrollArea } from '@/lib/components/ui/scroll-area';
import { filterToPreset, MAX_PRESETS, type Preset, presetToFilter } from '@/lib/savedFilters';
import { type FilterContext, gamesContext } from '@/lib/stores';
import { cn } from '@/lib/utils';
import { Plus, XIcon } from '../assets/icon';
import FilterPopover from './FilterPopover.svelte';

interface Props {
  variant?: 'popup' | 'webapp';
  active?: boolean;
  ctx?: FilterContext;
}

let { variant = 'popup', active = true, ctx = gamesContext }: Props = $props();

const filterStore = $derived(ctx.filter);
const searchStore = $derived(ctx.search);
const savedFilters = $derived(ctx.savedFilters);

let filterRemove: number | null = $state(null);

const handleReset = () => {
  searchStore.set('');
  filterStore.reset();
};

const applyPreset = (preset: Preset) => {
  const { filter: nextFilter, query } = presetToFilter(preset, ctx.defaults());
  filterStore.set(nextFilter);
  searchStore.set(query);
};

const handleClick = (preset: Preset, index: number) => {
  if (filterRemove === index) {
    filterRemove = null;
    filterStore.reset();
    savedFilters.update((presets) => presets.filter((_, i) => i !== index));

    return;
  }

  filterRemove = null;
  applyPreset(preset);
};

const handleClickAdd = () => {
  filterRemove = null;
  const preset = filterToPreset(get(filterStore), get(searchStore));
  savedFilters.update((presets) => [...presets, preset].slice(0, MAX_PRESETS));
};

const handleClickRemove = (index: number) => {
  filterRemove = index;

  setTimeout(() => {
    filterRemove = null;
  }, 2000);
};
</script>

<ScrollArea class={cn("flex flex-col gap-1 w-full h-full relative p-2 pb-4 m-0", variant === "webapp" ? "max-h-80" : "h-106")}>
  <div class={cn("flex gap-2 mb-2 items-center", variant !== "webapp" && "flex-col")}>
    <label for="filters" class="self-start my-auto">Filtrages sauvegardés: </label>
    <div class="flex gap-2 self-start">
      {#each $savedFilters as preset, index}
        <button class={cn("size-8 rounded-full flex justify-center items-center text-secondary-foreground font-bold text-lg cursor-pointer", filterRemove === index ? "bg-red-700/75  hover:bg-red-700" : "bg-secondary/75 hover:bg-secondary")} onclick={()=>handleClick(preset, index)} ondblclick={()=>handleClickRemove(index)}>
          {#if filterRemove === index}
            <XIcon size={20} />
          {:else}
            {index + 1}
          {/if}
        </button>
      {/each}
      {#if $savedFilters.length < MAX_PRESETS}
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
      value={$searchStore}
      oninput={({ currentTarget }: { currentTarget: HTMLInputElement }) => {
        searchStore.set(currentTarget.value.toLowerCase());
      }}
    />
    <Button onclick={handleReset} disabled={!active}>Réinitialiser</Button>
  </div>

  <div class={variant === 'webapp' ? 'grid lg:grid-cols-4 md:grid-cols-2 gap-2' : 'flex flex-col gap-1 relative'}>
    {#each $filterStore as { title, values }}
      <FilterPopover {active} {title} {values} {filterStore} />
    {/each}
  </div>
</ScrollArea>
