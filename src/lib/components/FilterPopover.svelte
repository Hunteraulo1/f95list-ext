<script lang="ts">
import { filter } from '$lib/stores';
import { buttonVariants } from '$ui/button';
import * as Command from '$ui/command';
import * as Popover from '$ui/popover';
import { ScrollArea } from '$ui/scroll-area';
import { cn } from '$utils';
import { Check, ChevronDown, Cross1 } from 'svelte-radix';

type Props = {
  title: string;
  values: Array<{ value: string; checked: boolean; inverse?: boolean }>;
  active?: boolean;
};

let { title, values, active = true }: Props = $props();

const handleSelect = (value: string) => {
  filter.update((items) => {
    return items.map((item) => {
      if (item.title.toLowerCase() !== title.toLowerCase()) return item;

      return {
        ...item,
        values: item.values.map((v) => {
          if (v.value !== value) return v;

          if (item.name === 'tags') {
            if (!v.checked) return { ...v, checked: true, inverse: false };
            if (!v.inverse) return { ...v, checked: true, inverse: true };
            return { ...v, checked: false, inverse: false };
          }

          return { ...v, checked: !v.checked };
        }),
      };
    });
  });
};
</script>

<div class="w-full">
  <label
    for={title}
    class="font-bold text-xs capitalize leading-none mt-2"
  >
    {title}:
  </label>
  <Popover.Root>
    <Popover.Trigger class={buttonVariants({ variant: "outline", class: "w-full flex justify-between" })} disabled={!active}>
      {#if values.some(({ checked }) => checked)}
        {values.reduce((acc, { checked, value }) =>
          checked ? acc ? `${acc}, ${value}` : value : acc
        , "")}
      {:else}
        Filtrer par {title.length > 17 ? title.slice(0, 17) : title}...
      {/if}
      <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Popover.Trigger>
    <Popover.Content class="w-fit p-0">
      <Command.Root>
        <Command.Input placeholder="Rechercher..." />
        <Command.Empty>Aucun {title} trouvé</Command.Empty>
        <Command.Group class="max-h-full relative">
          <ScrollArea class="h-[16rem]">
            {#each values as { value, checked, inverse }}
              <Command.Item
                {value}
                onclick={() => handleSelect(value)}
              >
                {#if checked}
                  {#if inverse}
                    <Cross1 class={cn("mr-2 h-4 w-4", "text-red-500")} />
                  {:else}
                    <Check class={cn("mr-2 h-4 w-4")} />
                  {/if}
                {:else}
                  <div class="mr-2 h-4 w-4"></div>
                {/if}
                {value}
              </Command.Item>
            {/each}
          </ScrollArea>
        </Command.Group>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
</div>
