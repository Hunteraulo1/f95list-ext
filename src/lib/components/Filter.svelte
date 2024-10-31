<script lang="ts">
import { filter, search } from '$lib/stores';
import { Button, buttonVariants } from '$ui/button';
import { Input } from '$ui/input';
import * as Popover from '$ui/popover';
import { Cross2 } from 'svelte-radix';
import FilterPopover from './FilterPopover.svelte';

const handleReset = () => {
  $search = '';
  filter.reset();
};
</script>

<Popover.Root>
  <Popover.Trigger class={buttonVariants({ variant: "secondary", class: "-translate-y-12 border-2 border-primary-foreground" })}>
    Filtrer
  </Popover.Trigger>
  <Popover.Content
    side="top"
    preventScroll={true}
    onInteractOutside={()=>null}
    class="p-2 mx-2 max-h-[calc(100vh-7rem)] overflow-y-auto"
  >
    <Popover.Close
      class="rounded-full p-2 hover:bg-primary-foreground float-end"
    >
      <Cross2 />
    </Popover.Close>
    <section class="flex flex-col gap-1 w-full">
      <label for="name" class="font-bold text-xs leading-none">Nom: </label>
      <Input
        id="name"
        type="text"
        placeholder="Rechercher un nom"
        class="w-full"
        value={$search}
        oninput={({ currentTarget }: { currentTarget: HTMLInputElement }) => {
          $search = currentTarget.value.toLowerCase();
        }}
      />
      {#each $filter as { title, values }}
        <FilterPopover {title} {values} />
      {/each}
      <Button class="self-center mt-2" onclick={handleReset}>
        Réinitialiser les filtres
      </Button>
    </section>
  </Popover.Content>
</Popover.Root>
