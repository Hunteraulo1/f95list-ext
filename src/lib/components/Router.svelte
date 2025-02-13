<script lang="ts">
import ScrollArea from '@/lib/components/ui/scroll-area/scroll-area.svelte';
import { page } from '@/lib/stores';
import type { Page } from './Nav.svelte';

interface Props {
  pages: Page[];
  webapp?: boolean;
}

const { pages, webapp = false }: Props = $props();
</script>

{#each pages as { link, target }}
  {#if link === $page}
    <ScrollArea class="h-full">
      {#if typeof target !== 'string'}
        {@const Target = target}
        <Target {webapp} />
      {/if}
    </ScrollArea>
  {/if}
{/each}
