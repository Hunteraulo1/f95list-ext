<script lang="ts">
import Nav from '$lib/components/Nav.svelte'
import { ScrollArea } from '$lib/components/ui/scroll-area/index'
import getData from '$lib/utils/getData'
import { ModeWatcher } from 'mode-watcher'
import '../app.postcss'

getData()
</script>

<ModeWatcher />

<main class="flex flex-col">
  <ScrollArea class="relative h-[448px] max-h-[448px]">
    <slot />
  </ScrollArea>
  <Nav />
</main>
