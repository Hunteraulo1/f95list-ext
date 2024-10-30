<script lang="ts">
import { filter, search } from '$lib/stores';
import { Button, buttonVariants } from '$ui/button';
import { Input } from '$ui/input';
import * as Popover from '$ui/popover';
import { ScrollArea } from '$ui/scroll-area';
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
    class="p-0 mx-2 h-[calc(100vh-7rem)]"
  >
    <Popover.Close
      class="absolute z-50 top-2 right-4 rounded-full p-1 hover:bg-primary-foreground"
    >
      <Cross2 />
    </Popover.Close>
    <ScrollArea class="w-full h-full px-2 pb-4 pt-10">
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
    </ScrollArea>
  </Popover.Content>
</Popover.Root>
