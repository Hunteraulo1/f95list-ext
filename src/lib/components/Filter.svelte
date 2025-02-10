<script lang="ts">
import { XIcon } from '$lib/assets/icon';
import { page } from '$lib/stores';
import { buttonVariants } from '$ui/button';
import * as Popover from '$ui/popover/index';
import FilterContent from './FilterContent.svelte';

interface Props {
  variant?: 'popup' | 'webapp';
}

let { variant = 'popup' }: Props = $props();
</script>

{#if variant === 'webapp'}
  {@const active = $page === 'list'}
  <div class:isNotWebapp={!active}>
    <FilterContent {variant} {active} />
  </div>
{:else}
  <Popover.Root>
    <Popover.Trigger class={buttonVariants({ variant: "secondary", class: "border-2 border-primary-foreground/60 bg-secondary/60 hover:border-primary-foreground hover:bg-secondary sticky z-10 bottom-2 mx-auto mt-auto" })}>
      Filtrer
    </Popover.Trigger>
    <Popover.Content
    side="top"
    preventScroll
    onInteractOutside={()=>null}
    class="p-0 h-full"
    autofocus={false}
    onOpenAutoFocus={(e: Event) => e.preventDefault()}
    >
      <Popover.Close class="rounded-full hover:bg-primary-foreground float-end m-2 p-1">
        <XIcon />
      </Popover.Close>
      
      <FilterContent />
    </Popover.Content>
  </Popover.Root>
{/if}

<style type="postcss">
  @reference "../../app.css";
  .isNotWebapp {
    @apply opacity-50 select-none pointer-events-none;
  }
</style>
