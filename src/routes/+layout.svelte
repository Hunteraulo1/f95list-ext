<script lang="ts">
import Nav from '$lib/components/Nav.svelte';
import { Button } from '$lib/components/ui/button';
import getData from '$lib/utils/getData';
import { ModeWatcher } from 'mode-watcher';
import { Reload } from 'svelte-radix';
import '../app.pcss';

console.log(window.location.pathname);
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
    <slot />
    <Nav />
  {/await}
</main>
