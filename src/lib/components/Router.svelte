<script lang="ts">
import { page } from '$lib/stores.js';
import type { Page } from './Nav.svelte';

interface Props {
  pages: Page[];
}

const { pages }: Props = $props();
</script>

{#each pages as { link, target }}
  {#if link === $page}
    {target}
  {/if}
{/each}
