<script lang="ts">
import Nav from '$lib/components/Nav.svelte'
import getData from '$lib/utils/getData'
import { ModeWatcher } from 'mode-watcher'
import '../app.postcss'

getData()
</script>

<ModeWatcher />

<main class="flex flex-col h-[50vh] min-h-[500px] max-h-[100%]">
  <slot />
  <Nav />
</main>
