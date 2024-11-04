<script lang="ts">
import { page } from '$app/stores';
import { buttonVariants } from '$ui/button';
import * as Popover from '$ui/popover';
import { Cross2 } from 'svelte-radix';
import FilterContent from './FilterContent.svelte';

interface Props {
  variant?: 'popup' | 'webapp';
}

let { variant = 'popup' }: Props = $props();
</script>

{#if variant === 'webapp'}
  {@const active = $page.url.pathname === '/webapp'}
  <div class:isNotWebapp={!active}>
    <FilterContent {variant} {active} />
  </div>
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
      <FilterContent />
    </Popover.Content>
  </Popover.Root>
{/if}

<style type="postcss">
  .isNotWebapp {
    opacity: 0.5;
    user-select: none;
    pointer-events: none;
  }
</style>
