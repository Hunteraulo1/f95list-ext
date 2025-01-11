<script lang="ts">
import type { Component } from 'svelte';
import { page } from '../stores';

interface Props {
  pages: {
    link: string;
    target: Component;
  }[];
}

const { pages }: Props = $props();
</script>

{#each pages as { link, target }}
  {#if link === $page}
    {target}
  {/if}
{/each}
