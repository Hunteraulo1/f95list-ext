<script lang="ts">
import { Button } from '$lib/components/ui/button/index.js'
import * as Command from '$lib/components/ui/command/index.js'
import { Input } from '$lib/components/ui/input/index.js'
import * as Popover from '$lib/components/ui/popover/index.js'
import { ScrollArea } from '$lib/components/ui/scroll-area/index.js'
import { filter, search } from '$lib/stores'
import { cn } from '$lib/utils'
import { Check, ChevronDown, Cross2 } from 'svelte-radix'

const handleReset = () => {
  $search = ''
  filter.reset()
}
</script>

<Popover.Root>
  <Popover.Trigger >
    <Button variant="secondary" class="-translate-y-12 border-2 border-primary-foreground">Filtrer</Button>
  </Popover.Trigger>
  <Popover.Content side="top" class="p-0 !top-2 min-h-[26rem]" style="height: calc(50vh - 4rem)">
    <Popover.Close class="absolute z-50 top-2 right-2 rounded-full p-1 hover:bg-primary-foreground">
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
          on:input={({ currentTarget }) => {
            $search = currentTarget.value.toLowerCase()
          }}
        />
        {#each $filter as { title, open, values }}
          <label for={title} class="font-bold text-xs capitalize leading-none mt-2">{title}: </label>
          <Popover.Root>
            <Popover.Trigger asChild let:builder>
              <Button
                builders={[builder]}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                class="w-full flex justify-between"
              >
                <p class="truncate text-xs">
                  {values.some(({ checked }) => checked)
                    ? values
                        .filter(value => value.checked)
                        .map(({ value }) => value)
                        .join(', ')
                    : `Filtrer par ${title}...`}
                </p>
                <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
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
                          checked = !checked
                        }}
                      >
                        <Check class={cn('mr-2 h-4 w-4', !checked && 'text-transparent')} />
                        {value}
                      </Command.Item>
                    {/each}
                  </ScrollArea>
                </Command.Group>
              </Command.Root>
            </Popover.Content>
          </Popover.Root>
        {/each}
        <Button class="self-center mt-2" on:click={handleReset}>Réinitialiser les filtres</Button>
      </section>
    </ScrollArea>
  </Popover.Content>
</Popover.Root>
