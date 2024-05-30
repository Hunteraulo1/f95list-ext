<script lang="ts">
  import { ModeWatcher } from 'mode-watcher'

  import gamesJson from '$lib/assets/games.json'
  import Nav from '$lib/components/nav.svelte'
  import { Games } from '$lib/schemas'
  import { games } from '$lib/stores'
  import { parse } from 'valibot'
  import '../app.postcss'

  import { persistQueryClient } from '@tanstack/query-persist-client-core'
  import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query'

  try {
    const validGames = parse(Games, gamesJson.data)

    $games = validGames ?? []

    console.log('🚀 ~ $games:', $games)
  } catch (error) {
    console.error('🚀 ~ error:', error)
  }

  const client = new QueryClient()

  const persister = createSyncStoragePersister({
    storage: window.localStorage,
  })

  persistQueryClient({
    queryClient: client,
    persister: persister,
    maxAge: 3600000 * 6, // 6 hours
  })
</script>

<ModeWatcher />

<QueryClientProvider {client}>
  <main class="h-full">
    <div class="h-full overflow-scroll">
      <slot />
    </div>
    <Nav />
  </main>
</QueryClientProvider>
