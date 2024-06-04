<script lang="ts">
  import Filter from '$lib/components/Filter.svelte'
  import GameBox from '$lib/components/GameBox.svelte'
  import { Games, type GameType } from '$lib/schemas'
  import { filteredGames, games } from '$lib/stores'
  import { useQuery } from '@sveltestack/svelte-query'
  import Reload from 'svelte-radix/Reload.svelte'
  import { parse } from 'valibot'
  import Button from './../lib/components/ui/button/button.svelte'

  let maxLength = $state(25)

  const queryResult = useQuery<{ data: GameType[] }>({
    queryFn: async () => {
      console.log('🚀 ~ queryFn: ~ fetch')
      try {
        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbwb8C1478tnW30d77HtECYTxjJ2EpB1OrtQUueFeZ0tZPz3Uuze5s2FAQAnQOKShEzD/exec'
        )
        const data = await response.json()

        return data
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error)
      }
    },
    queryKey: 'games',
    onSuccess: data => {
      console.log('🚀 ~ data:', data)
      const validGames = parse(Games, data.data)
      $games = validGames
      $filteredGames = validGames
    },
  })
</script>

{#if $queryResult.isSuccess}
  <div class="flex flex-col gap-2 overflow-scroll max-h-full p-2 relative">
    {#each $filteredGames as game, index (game.name + game.version)}
      {#if index < maxLength}
        <GameBox {game} />
      {/if}
      {#if index !== $filteredGames.length - 1 && index === maxLength - 1}
        <Button variant="link" on:click={() => (maxLength += 25)}>Voir plus</Button>
      {/if}
    {:else}
      <div class="flex justify-center items-center h-screen w-full">
        <Button>
          <Reload class="h-4 w-full animate-spin" />
          Aucun jeu ne correspond à vos critères
        </Button>
      </div>
    {/each}
    <Filter />
  </div>
{:else}
  <Button>
    <Reload class="mr-2 h-4 w-4 animate-spin" />
    Veuillez patienter
  </Button>
{/if}
