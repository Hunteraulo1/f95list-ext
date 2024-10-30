<script lang="ts">
import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
import * as Command from '$lib/components/ui/command/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import * as Popover from '$lib/components/ui/popover/index.js';
import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
import { filter, pathname, search } from '$lib/stores';
import { cn } from '$lib/utils';
import { Check, ChevronDown } from 'svelte-radix';

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
      {#each $filter as { title, open, values }}
        <div>
          <label
            for={title}
            class="font-bold text-xs capitalize leading-none mt-2"
            >{title}:
          </label>
          <Popover.Root>
            <Popover.Trigger class={buttonVariants({ variant: "outline", className: "w-full flex justify-between" })}>
              {values.some(({ checked }) => checked)
                ? values
                    .filter((value) => value.checked)
                    .map(({ value }) => value)
                    .join(", ")
                : `Filtrer par ${title}...`}
              <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Popover.Trigger>
            <Popover.Content class="w-fit p-0">
              <Command.Root>
                <Command.Input placeholder="Rechercher..." />
                <Command.Empty>Aucun {title} trouvé</Command.Empty>
                <Command.Group class="max-h-full relative">
                  <ScrollArea class="h-[16rem]">
                    {#each values as { value, checked }}
                      <Command.Item
                        {value}
                        onSelect={() => {
                          checked = !checked;
                        }}
                      >
                        <Check
                          class={cn(
                            "mr-2 h-4 w-4",
                            !checked && "text-transparent",
                          )}
                        />
                        {value}
                      </Command.Item>
                    {/each}
                  </ScrollArea>
                </Command.Group>
              </Command.Root>
            </Popover.Content>
          </Popover.Root>
        </div>
      {/each}
    </section>
  </ScrollArea>
{:else}
  <div class="h-1/3"></div>
{/if}
