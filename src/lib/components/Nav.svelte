<script lang="ts">
import type { Component } from 'svelte';

export interface Page {
  link: string;
  target: Component;
  icon: Component | null;
}

interface Props {
  pages: Page[];
}

const { pages }: Props = $props();
</script>

{#each pages as {link, target, icon}}
  <h1>Nav</h1>
{/each}
