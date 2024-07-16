<script lang="ts">
import Nav from '$lib/components/Nav.svelte'
import { Button } from '$lib/components/ui/button'
import getData from '$lib/utils/getData'
import { ModeWatcher } from 'mode-watcher'
import { Reload } from 'svelte-radix'
import '../app.postcss'
</script>

<ModeWatcher  defaultMode="system" />

{#await getData()}
  <div class="flex justify-center items-center h-full">
    <Button>
      <Reload class="mr-2 h-4 w-4 animate-spin" />
      Veuillez patienter
    </Button>
  </div>
{:then}
  <main class="flex flex-col h-[50vh] min-h-[500px] max-h-full">
    <slot />
    <Nav />
  </main>
{/await}
