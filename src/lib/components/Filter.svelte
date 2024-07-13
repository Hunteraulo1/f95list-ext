<script lang="ts">
import { Button } from '$lib/components/ui/button/index.js'
import { Checkbox } from '$lib/components/ui/checkbox/index.js'
import * as Command from '$lib/components/ui/command/index.js'
import { Input } from '$lib/components/ui/input/index.js'
import * as Popover from '$lib/components/ui/popover/index.js'
import { ScrollArea } from '$lib/components/ui/scroll-area/index'
import { filter, filteredGames, games, search } from '$lib/stores'
import { cn } from '$lib/utils'
import { Check, ChevronDown, Cross2 } from 'svelte-radix'

let checked = false

const reloadList = () => {
  $filteredGames = $games.filter(game => {
    if (!game.name.toLowerCase().includes($search)) return false
    if (checked && game.version !== game.tversion && game.tversion !== 'Intégrée') return false

    return $filter.every(({ name, values }) => {
      if (!values.some(value => value.checked)) return true

      if (name === 'tags') {
        return values.every(value => !value.checked || game['tags'].includes(value.value))
      }

      if (name === 'traductor') {
        return values.some(value => value.checked && game['traductor']?.includes(value.value))
      }

      return values.some(value => value.checked && game[name] === value.value)
    })
  })
}

const handleReset = () => {
  $search = ''
  checked = false
  filter.reset()

  reloadList()
}
</script>

<div class="sticky bottom-2 mx-auto">
  <Popover.Root>
    <Popover.Trigger >
      <Button variant="secondary" class='border-2 border-primary-foreground'>Filtrer</Button>
    </Popover.Trigger>
    <Popover.Content side="top" class="flex flex-col gap-1 max-h-80 overflow-scroll">
      <Popover.Close class="flex justify-end">
        <Cross2 />
      </Popover.Close>

      <label for="name" class="font-bold text-xs leading-none">Nom: </label>
      <Input
        id="name"
        type="text"
        placeholder="Rechercher un nom"
        class="w-full"
        value={$search}
        on:input={({ currentTarget }) => {
          $search = currentTarget.value.toLowerCase()

          reloadList()
        }}
      />
      
      <div class="flex items-center gap-1 mt-2">
        <Checkbox id="updated" bind:checked on:click={() => {
          checked = !checked
          reloadList()
        }}/>
        <label for="updated" class="font-bold text-xs leading-none">Traduction à jour </label>
      </div>

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
              <p class="truncate">
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
          <Popover.Content class="max-w-full w-auto p-0">
            <Command.Root>
              <Command.Input placeholder="Rechercher..." />
              <Command.Empty>Aucun {title} trouvé</Command.Empty>
              <Command.Group class="max-h-60 relative">
                <ScrollArea class="{values.length > 7 ? 'h-screen' : ''} max-h-60 max-w-full">
                  {#each values as { value, checked }}
                    <Command.Item
                      {value}
                      onSelect={() => {
                        checked = !checked

                        reloadList()
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
    </Popover.Content>
  </Popover.Root>
</div>
