<script lang="ts">
import { filter, search } from '$lib/stores';
import { Button } from '$ui/button';
import { Input } from '$ui/input';
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

<section class="flex flex-col gap-1 w-full">
  <label for="name" class="font-bold text-xs leading-none">Nom: </label>
  <div class="flex gap-1">
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

  <div class={variant === 'webapp' ? 'grid grid-cols-3 gap-1' : 'flex flex-col gap-1'}>
    {#each $filter as { title, values }}
      <FilterPopover {active} {title} {values} />
    {/each}
  </div>
</section> 
