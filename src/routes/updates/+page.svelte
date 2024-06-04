<script lang="ts">
  import gamesJson from '$lib/assets/games.json'
  import GameBox from '$lib/components/GameBox.svelte'
  import { Updates } from '$lib/schemas'
  import { updates } from '$lib/stores'
  import { useQuery } from '@sveltestack/svelte-query'
  import { parse } from 'valibot'

  interface UpdatesData {
    date: string
    type: 'AJOUT DE JEU' | 'MISE À JOUR'
    names: string[]
  }

  const queryResult = useQuery<{ data: UpdatesData[] }>({
    queryFn: async () => {
      console.log('🚀 ~ queryFn: ~ fetch')
      try {
        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbwnX4ViF-q-1fzm7MjUezZ08fXqnOfsu1w_5bu3lZKUEP7BUBJswtAn9bg27IwPaew/exec'
        )
        const data = await response.json()

        return data
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error)
      }
    },
    queryKey: 'updates',
    onSuccess(data) {
      const defaultGame = {
        name: '',
        ac: false,
        version: '',
        date: '',
        link: '',
        type: 'Autre',
        domain: 'Unknow',
        status: 'TERMINÉ',
        image: '',
        proofreader: '',
        tags: [],
        tlink: '',
        tname: 'Pas de traduction',
        traductor: '',
        trlink: '',
        ttype: 'À tester',
        tversion: '',
      }

      const updatesData = data.data.map((update: UpdatesData) => {
        return {
          date: new Date(update.date),
          type: update.type,
          games: update.names.map((name: string) => {
            return gamesJson.data.findLast(game => game.name === name) ?? { ...defaultGame, name } // gamesJson.data => $query
          }),
        }
      })

      $updates = parse(Updates, updatesData)
    },
    cacheTime: 1000 * 60, // 1 minute
  })
</script>

{#if $queryResult.isSuccess}
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
{/if}
