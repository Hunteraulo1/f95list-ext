<script lang="ts">
import { Check, ChevronDown, XIcon } from '$lib/assets/icon';
import { filter } from '$lib/stores';
import { cn } from '$lib/utils';
import { buttonVariants } from '$ui/button';
import * as Command from '$ui/command/index';
import * as Popover from '$ui/popover/index';
import { ScrollArea } from '$ui/scroll-area';

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

          if (v.inverse !== undefined) {
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
  >{title}:</label>
  <Popover.Root>
    <Popover.Trigger class={buttonVariants({ variant: "outline", class: "w-full flex justify-between" })} disabled={!active}>
      <p class="truncate">
        {#if values.some(({ checked }) => checked)}
          {values.reduce((acc, { checked, inverse, value }) =>
            checked ? acc ? `${acc}, ${inverse ? '!' : ''}${value}` : `${inverse ? '!' : ''}${value}` : acc
          , "")}
        {:else}
          Filtrer par {title}
        {/if}
      </p>
      <ChevronDown classes="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                    <XIcon class={cn("mr-2 h-4 w-4", "text-red-500")} />
                  {:else}
                    <Check classes={cn("mr-2 h-4 w-4")} />
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
