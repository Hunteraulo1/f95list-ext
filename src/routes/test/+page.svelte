<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Command from '$lib/components/ui/command/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import type { GameType } from '$lib/schemas'
  import { cn } from '$lib/utils'
  import { tick } from 'svelte'
  import { Check, ChevronDown } from 'svelte-radix'

  interface ComboBox {
    title: string
    open: boolean
    values: GameType['domain' | 'status' | 'type'][]
    selectedValues: string[]
  }

  let comboBox: ComboBox[] = [
    {
      title: 'domain',
      open: false,
      values: ['F95z', 'LewdCorner', 'Autre'],
      selectedValues: [],
    },
    {
      title: 'status',
      open: false,
      values: ['EN COURS', 'ABANDONNÉ', 'TERMINÉ'],
      selectedValues: [],
    },
    {
      title: 'type',
      open: false,
      values: ['RenPy', 'RPGM', 'Unreal', 'HTLM', 'Flash', 'QSP', 'RenPy/RPGM', 'RenPy/Unity', 'Autre'],
      selectedValues: [],
    },
  ]

  const closeAndFocusTrigger = (triggerId: string) => {
    for (let item of comboBox) {
      item.open = false
    }

    tick().then(() => {
      document.getElementById(triggerId)?.focus()
    })
  }
</script>

{#each comboBox as { title, open, selectedValues, values }}
  <Popover.Root bind:open let:ids>
    <Popover.Trigger asChild let:builder>
      <Button
        builders={[builder]}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        class="w-[200px] justify-between truncate"
      >
        {selectedValues.toString() || `Filtrer par ${title}...`}
        <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </Popover.Trigger>
    <Popover.Content class="w-[200px] p-0">
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
