<script lang="ts">
  import GameBox from '$lib/components/GameBox.svelte'
  import { UpdatesData, type UpdateType } from '$lib/schemas'
  import { games, updates } from '$lib/stores'
  import type { Update } from '$lib/types'
  import { useQuery } from '@sveltestack/svelte-query'
  import { parse } from 'valibot'

  const query = useQuery<{ data: UpdateType[] }>({
    queryFn: () => {
      console.log('🚀 ~ queryFn: ~ fetch')
      return fetch(
        'https://script.google.com/macros/s/AKfycbwnX4ViF-q-1fzm7MjUezZ08fXqnOfsu1w_5bu3lZKUEP7BUBJswtAn9bg27IwPaew/exec'
      ).then(res => res.json())
    },
    queryKey: 'updates',
    cacheTime: 1000 * 60 * 60 * 6,
  })

  if ($query.data) {
    const result: Update[] = []

    const validUpdates = parse(UpdatesData, $query.data.data)
    console.log('🚀 ~ validUpdates:', validUpdates)

    for (const update of validUpdates) {
      result.push({
        date: new Date(update.date),
        type: update.type,
        games: update.names.map(name => {
          const res = $games.findIndex(game => game.name === name)

          return res === -1 ? name : res
        }),
      })
    }

    $updates = result
    console.log('🚀 ~ $updates:', $updates)
  }
</script>

<div class="flex flex-col gap-4 overflow-scroll max-h-full p-2 relative">
  {#each $updates as update, index}
    <div class="flex flex-col gap-2">
      {#if index === 0 || $updates[index - 1].date.getTime() !== update.date.getTime()}
        <h2 class="text-center font-bold leading-none">
          {new Date(update.date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}
        </h2>
      {/if}
      <h3 class="text-[.7rem] text-center text-secondary-foreground/50 leading-none">{update.type}</h3>
      {#each update.games as game}
        <GameBox {game} />
      {/each}
    </div>
  {/each}
</div>
