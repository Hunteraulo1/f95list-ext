<script lang="ts">
import Nav from '$lib/components/Nav.svelte';
import getData from '$lib/utils/getData';
import { Button } from '$ui/button';
import { ModeWatcher } from 'mode-watcher';
import { Reload } from 'svelte-radix';
import '../app.pcss';
interface Props {
  children?: import('svelte').Snippet;
}

let { children }: Props = $props();

const nav = [
  { name: 'Liste', href: '/' },
  { name: 'MàJ', href: '/updates' },
  { name: 'Paramètres', href: '/settings' },
];
</script>

<ModeWatcher defaultMode="system" />

<main class="flex flex-col h-main">
  {#await getData()}
    <div class="flex justify-center items-center h-full">
      <Button>
        <Reload class="mr-2 h-4 w-4 animate-spin" />
        Veuillez patienter
      </Button>
    </div>
  {:then}
    {@render children?.()}
    <Nav {nav} />
  {/await}
</main>
