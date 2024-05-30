<script lang="ts">
  import gamesJson from '$lib/assets/games.json'
  import Nav from '$lib/components/Nav.svelte'
  import { Games } from '$lib/schemas'
  import { filteredGames, games } from '$lib/stores'
  import { ScrollArea } from 'bits-ui'
  import { ModeWatcher } from 'mode-watcher'
  import { parse } from 'valibot'
  import '../app.postcss'

  import {
    QueryClient,
    QueryClientProvider,
    createWebStoragePersistor,
    persistQueryClient,
  } from '@sveltestack/svelte-query'

  try {
    const validGames = parse(Games, gamesJson.data)

    $games = validGames ?? []
    $filteredGames = validGames ?? []

    console.log('🚀 ~ $games:', $games)
  } catch (error) {
    console.error('🚀 ~ error:', error)
  }

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 1000 * 60 * 60 * 6, // 6 hours
      },
    },
  })

  const persistor = createWebStoragePersistor({
    storage: window.localStorage,
  })

  persistQueryClient({
    queryClient: client,
    persistor,
  })
</script>

<ModeWatcher />

<QueryClientProvider {client}>
  <main class="h-full flex flex-col relative">
    <ScrollArea.Root class="relative h-full">
      <ScrollArea.Viewport class="h-full w-full">
        <ScrollArea.Content class="h-full !block">
          <slot />
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        class="flex h-full w-2.5 touch-none select-none rounded-full border-l border-l-transparent p-px transition-all hover:w-3 hover:bg-dark-10"
      >
        <ScrollArea.Thumb
          class="relative flex-1 rounded-full bg-muted-foreground opacity-40 transition-opacity hover:opacity-100"
        />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
    <Nav />
  </main>
</QueryClientProvider>
