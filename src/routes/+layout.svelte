<script lang="ts">
  import { ModeWatcher } from 'mode-watcher'

  import gamesJson from '$lib/assets/games.json'
  import Nav from '$lib/components/nav.svelte'
  import { Games } from '$lib/schemas'
  import { games } from '$lib/stores'
  import { parse } from 'valibot'
  import '../app.postcss'

  try {
    const validGames = parse(Games, gamesJson.data)

    $games = validGames ?? []

    console.log('🚀 ~ $games:', $games)
  } catch (error) {
    console.error('🚀 ~ error:', error)
  }
</script>

<ModeWatcher />

<main class="h-full">
  <div class="h-full">
    <slot />
  </div>
  <Nav />
</main>
