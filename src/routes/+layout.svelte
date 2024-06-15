<script lang="ts">
  import Nav from '$lib/components/Nav.svelte'
  import getData from '$lib/utils/getData'
  import {
    QueryClient,
    QueryClientProvider,
    createWebStoragePersistor,
    persistQueryClient,
  } from '@sveltestack/svelte-query'
  import { ScrollArea } from 'bits-ui'
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
