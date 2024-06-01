<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Command from '$lib/components/ui/command/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { filter, filteredGames, games } from '$lib/stores'
  import { cn } from '$lib/utils'
  import { tick } from 'svelte'
  import { Check, ChevronDown } from 'svelte-radix'

  const closeAndFocusTrigger = (triggerId: string) => {
    for (let item of $filter) {
      item.open = false
    }

    $filteredGames = $games.filter(game => {
      return $filter.every(({ title, selectedValues }) => {
        if (title === 'tags') return selectedValues.every(value => game.tags.includes(value))
        return selectedValues.every(value => game[title] === value)
      })
    })

    tick().then(() => {
      document.getElementById(triggerId)?.focus()
    })
  }
</script>

<div class="sticky bottom-0 mx-auto">
  <Popover.Root>
    <Popover.Trigger>
      <Button variant="secondary">Filtrer</Button>
    </Popover.Trigger>
    <Popover.Content side="top">
      <div class="flex flex-col gap-2 items-center">
        <h1 class="font-bold">Filtrer la liste</h1>
        {#each $filter as { title, open, selectedValues, values }}
          <Popover.Root bind:open let:ids>
            <Popover.Trigger asChild let:builder>
              <Button
                builders={[builder]}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                class="w-full flex justify-between"
              >
                <p class="truncate">{selectedValues.length > 0 ? selectedValues : `Filtrer par ${title}...`}</p>
                <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </Popover.Trigger>
            <Popover.Content class="w-full p-0">
              <Command.Root>
                <Command.Input placeholder="Rechercher..." />
                <Command.Empty>Aucun {title} trouvé</Command.Empty>
                <Command.Group>
                  {#each values as value}
                    <Command.Item
                      {value}
                      onSelect={currentValue => {
                        if (!selectedValues.includes(currentValue)) selectedValues.push(currentValue)
                        else selectedValues.splice(selectedValues.indexOf(currentValue), 1)

                        closeAndFocusTrigger(ids.trigger)
                      }}
                    >
                      <Check class={cn('mr-2 h-4 w-4', !selectedValues.includes(value) && 'text-transparent')} />
                      {value}
                    </Command.Item>
                  {/each}
                </Command.Group>
              </Command.Root>
            </Popover.Content>
          </Popover.Root>
        {/each}
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
