<script lang="ts">
import { Check, ChevronDown, XIcon } from '@/lib/assets/icon';
import { buttonVariants } from '@/lib/components/ui/button';
import * as Command from '@/lib/components/ui/command/index';
import * as Popover from '@/lib/components/ui/popover/index';
import { ScrollArea } from '@/lib/components/ui/scroll-area';
import { filter } from '@/lib/stores';

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

          if (title.toLowerCase() !== 'tags') {
            if (item.values.some((va) => va.inverse)) {
              if (v.inverse) return { ...v, checked: false, inverse: false };

              return { ...v, checked: true, inverse: true };
            }

            if (item.values.some((va) => va.value !== v.value && va.checked)) {
              if (v.checked) return { ...v, checked: false, inverse: false };

              return { ...v, checked: true, inverse: false };
            }
          }

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
    class="font-bold text-xs leading-none mt-2 text-nowrap"
  >{title}:</label>
  <Popover.Root>
    <Popover.Trigger class={buttonVariants({ variant: "outline", class: "w-full flex justify-between gap-2" })} disabled={!active}>
      <p class="truncate">
        {#if values.some(({ checked }) => checked)}
          {values.reduce((acc, { checked, inverse, value }) =>
            checked ? acc ? `${acc}, ${inverse ? '!' : ''}${value}` : `${inverse ? '!' : ''}${value}` : acc
          , "")}
        {:else}
          Filtrer par {title}
        {/if}
      </p>
      <ChevronDown size={16} />
    </Popover.Trigger>
    <Popover.Content class="w-fit p-0">
      <Command.Root>
        <Command.Input placeholder="Rechercher..." />
        <Command.Empty>Aucun {title} trouvé</Command.Empty>
        <Command.Group class="max-h-full relative">
          <ScrollArea class="h-56">
            {#each values as { value, checked, inverse }}
              <Command.Item
                {value}
                onclick={() => handleSelect(value)}
                class="flex gap-2"
              >
                {#if checked}
                  {#if inverse}
                    <XIcon classes="text-red-500" size={16} isHovered />
                  {:else}
                    <Check size={16} isHovered />
                  {/if}
                {:else}
                  <div class="h-4 w-4"></div>
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
