<script lang="ts">
  import GameBox from '$lib/components/GameBox.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Updates, type UpdateType } from '$lib/schemas'
  import { games } from '$lib/stores'
  import { useQuery } from '@sveltestack/svelte-query'
  import { Reload } from 'svelte-radix'
  import { parse } from 'valibot'

  interface UpdatesData {
    date: string
    type: 'AJOUT DE JEU' | 'MISE À JOUR'
    names: string[]
  }

  const queryResult = useQuery<UpdateType[]>({
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
    select(data: any) {
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
            return $games.findLast(game => game.name === name) ?? { ...defaultGame, name }
          }),
        }
      })

      return parse(Updates, updatesData)
    },
    cacheTime: 1000 * 60 * 60 * 6, // 6 hours
  })
</script>

{#if $queryResult.isSuccess}
  <div class="flex flex-col gap-4 max-h-full p-2 relative">
    {#each $queryResult.data as update, index}
      <div class="flex flex-col gap-2">
        {#if index === 0 || $queryResult.data[index - 1].date.getTime() !== update.date.getTime()}
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
{:else}
  <div class="flex justify-center items-center h-full">
    <Button>
      <Reload class="mr-2 h-4 w-4 animate-spin" />
      Veuillez patienter
    </Button>
  </div>
{/if}
