<script lang="ts">
import { filter, search } from '$lib/stores';
import { cn } from '$lib/utils';
import { Button, buttonVariants } from '$ui/button';
import * as Command from '$ui/command';
import { Input } from '$ui/input';
import * as Popover from '$ui/popover';
import { ScrollArea } from '$ui/scroll-area';
import { Check, ChevronDown, Cross2 } from 'svelte-radix';

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
          <label
            for={title}
            class="font-bold text-xs capitalize leading-none mt-2"
            >{title}:
          </label>
          <Popover.Root>
            <Popover.Trigger class={buttonVariants({ variant: "outline", class: "w-full flex justify-between truncate text-xs" })}>
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
                          filter.update(($filter) => {
                            const currentFilter = $filter.find(
                              (f) => f.title === title,
                            );
                            if (currentFilter) {
                              const valueToUpdate = currentFilter.values.find(
                                (v) => v.value === value,
                              );
                              if (valueToUpdate) {
                                valueToUpdate.checked = !valueToUpdate.checked;
                              }
                            }
                            return $filter;
                          });
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
        {/each}
        <Button class="self-center mt-2" onclick={handleReset}>
          Réinitialiser les filtres
        </Button>
      </section>
    </ScrollArea>
  </Popover.Content>
</Popover.Root>
