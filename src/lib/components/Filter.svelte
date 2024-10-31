<script lang="ts">
import { filter, search } from '$lib/stores';
import { buttonVariants } from '$ui/button';
import * as Popover from '$ui/popover';
import { ScrollArea } from '$ui/scroll-area';
import { Cross2 } from 'svelte-radix';
import FilterContent from './FilterContent.svelte';

const handleReset = () => {
  $search = '';
  filter.reset();
};

interface Props {
  variant?: 'popup' | 'webapp';
}

let { variant = 'popup' }: Props = $props();
</script>

{#if variant === 'webapp'}
  <ScrollArea class="justify-center w-full h-1/3">
    <FilterContent {handleReset} layout="grid" />
  </ScrollArea>
{:else}
  <Popover.Root>
    <Popover.Trigger class={buttonVariants({ variant: "secondary", class: "-translate-y-12 border-2 border-primary-foreground" })}>
      Filtrer
    </Popover.Trigger>
    <Popover.Content
      side="top"
      preventScroll={true}
      onInteractOutside={()=>null}
      class="p-2 mx-2 max-h-[calc(100vh-7rem)] overflow-y-auto"
    >
      <Popover.Close class="rounded-full p-2 hover:bg-primary-foreground float-end">
        <Cross2 />
      </Popover.Close>
      <FilterContent {handleReset} layout="column" />
    </Popover.Content>
  </Popover.Root>
{/if}
