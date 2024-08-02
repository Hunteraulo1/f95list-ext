<script lang="ts">
import Nav from '$lib/components/Nav.svelte';
import { Button } from '$lib/components/ui/button';
import getData from '$lib/utils/getData';
import { ModeWatcher } from 'mode-watcher';
import { Reload } from 'svelte-radix';
import '../app.postcss';

import { onNavigate } from '$app/navigation';

onNavigate(navigation => {
  // @ts-ignore
  if (!document.startViewTransition) return

  return new Promise(resolve => {
    // @ts-ignore
    document.startViewTransition(async () => {
      resolve()
      await navigation.complete
    })
  })
})
</script>

<ModeWatcher  defaultMode="system" />

<main class="flex flex-col h-[50vh] min-h-[30rem] max-h-96">
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
