<script lang="ts">
import { filter, pathname, search } from '$lib/stores';
import { Button } from '$ui/button';
import { Input } from '$ui/input';
import { ScrollArea } from '$ui/scroll-area';
import FilterPopover from '../FilterPopover.svelte';

const handleReset = () => {
  $search = '';
  filter.reset();
};
</script>

{#if $pathname === "/webapp"}
  <ScrollArea class="justify-center w-full h-1/3 px-2 pb-4 pt-10">
    <label for="name" class="font-bold text-xs leading-none">Nom: </label>
    <div class="flex gap-1">
      <Input
        id="name"
        type="text"
        placeholder="Rechercher un nom"
        class="w-full"
        value={$search}
        oninput={({ currentTarget }) => {
          $search = currentTarget.value.toLowerCase();
        }}
      />
      <Button onclick={handleReset}>Réinitialiser les filtres</Button>
    </div>
    <section class="grid grid-cols-3 gap-1 w-full">
      {#each $filter as { title, values }}
        <div>
          <FilterPopover {title} {values} />
        </div>
      {/each}
    </section>
  </ScrollArea>
{:else}
  <div class="h-1/3"></div>
{/if}
