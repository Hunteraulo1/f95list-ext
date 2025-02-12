<script lang="ts">
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { ScrollArea } from '@/lib/components/ui/scroll-area';
import { filter, search } from '@/lib/stores';
import { cn } from '@/lib/utils';
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
</script>

<ScrollArea class={cn("flex flex-col gap-1 w-full relative p-3 m-0", variant !== 'webapp' && 'h-[26.5rem]')}>
  <label for="name" class="font-bold text-xs leading-none">Nom: </label>
  <div class="flex gap-2 mb-2">
    <Input
      id="name"
      type="text"
      placeholder="Rechercher un nom"
      class="w-full text-xs"
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
