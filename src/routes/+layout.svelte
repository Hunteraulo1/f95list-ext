<script lang="ts">
  import Nav from '$lib/components/Nav.svelte'
  import { ScrollArea } from '$lib/components/ui/scroll-area/index'
  import getData from '$lib/utils/getData'
  import {
    QueryClient,
    QueryClientProvider,
    createWebStoragePersistor,
    persistQueryClient,
  } from '@sveltestack/svelte-query'
  import { ModeWatcher } from 'mode-watcher'
  import '../app.postcss'

  getData()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 1000 * 60 * 60 * 6, // 6 hours
        staleTime: 1000 * 60 * 60 * 6, // 6 hours
      },
    },
  })

  const localStoragePersistor = createWebStoragePersistor({
    storage: window.localStorage,
    key: 'f95list-ext',
    throttleTime: 1000,
    deserialize: data => JSON.parse(data),
    serialize: data => JSON.stringify(data),
  })

  persistQueryClient({
    queryClient,
    persistor: localStoragePersistor,
  })
</script>

<ModeWatcher />

<QueryClientProvider client={queryClient}>
  <main class="h-full max-h-full flex flex-col relative">
    <ScrollArea class="relative h-full min-h-full">
      <slot />
    </ScrollArea>
    <Nav />
  </main>
</QueryClientProvider>
