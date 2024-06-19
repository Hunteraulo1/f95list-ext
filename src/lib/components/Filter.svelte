<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Command from '$lib/components/ui/command/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { ScrollArea } from '$lib/components/ui/scroll-area/index'
  import { defaultFilters, filter, filteredGames, games, search } from '$lib/stores'
  import { cn } from '$lib/utils'
  import { tick } from 'svelte'
  import { Check, ChevronDown } from 'svelte-radix'

  const closeAndFocusTrigger = (triggerId?: string) => {
    for (let item of $filter) {
      item.open = false
    }

    $filteredGames = $games
      .filter(game => game.name.toLowerCase().includes($search))
      .filter(game => {
        return $filter.every(({ title, values }) => {
          if (title === 'tags') {
            return values.every(value => {
              return value.checked ? game[title].includes(value.value) : true
            })
          }

          return values.every(value => {
            return value.checked ? game[title] === value.value : true
          })
        })
      })

    triggerId &&
      tick().then(() => {
        document.getElementById(triggerId)?.focus()
      })
  }

  const handleReset = () => {
    $search = ''
    $filter = defaultFilters

    closeAndFocusTrigger()
  }
</script>

<div class="sticky bottom-2 mx-auto">
  <Popover.Root>
    <Popover.Trigger>
      <Button variant="secondary">Filtrer</Button>
    </Popover.Trigger>
    <Popover.Content side="top">
      <div class="flex flex-col gap-2 items-center">
        <h1 class="font-bold">Filtrer la liste</h1>
        <Input
          type="text"
          placeholder="Rechercher un nom"
          class="w-full"
          value={$search}
          on:input={({ currentTarget }) => {
            $search = currentTarget.value.toLowerCase()
            closeAndFocusTrigger()
          }}
        />

        {#each $filter as { title, open, values }}
          <Popover.Root let:ids>
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
            <Popover.Content class="w-full p-0">
              <Command.Root>
                <Command.Input placeholder="Rechercher..." />
                <Command.Empty>Aucun {title} trouvé</Command.Empty>
                <Command.Group class="max-h-60 relative">
                  <ScrollArea class="{values.length > 7 ? 'h-screen' : ''} max-h-60">
                    {#each values as { value, checked }}
                      <Command.Item
                        {value}
                        onSelect={() => {
                          checked = !checked

                          closeAndFocusTrigger(ids.trigger)
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
        <Button on:click={handleReset}>Réinitialiser les filtres</Button>
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
