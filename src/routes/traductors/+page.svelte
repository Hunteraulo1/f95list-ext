<script lang="ts">
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import { TraductorsData, type TraductorType } from '$lib/schemas'
  import { useQuery } from '@sveltestack/svelte-query'
  import { Reload } from 'svelte-radix'
  import { parse } from 'valibot'

  const queryResult = useQuery<TraductorType[]>({
    queryFn: async () => {
      console.log('🚀 ~ queryFn: ~ fetch')
      try {
        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbze5voXSJMnTqnUIgXFgM1gtQ6e13VyAsJK50Evl5Y2HisCRN-eCbbIHXrBaNPhup1J/exec'
        )
        const data = await response.json()

        return data
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error)
      }
    },
    queryKey: 'traductors',
    select(data: any) {
      return parse(TraductorsData, data.data)
    },
    cacheTime: 1000 * 60 * 60 * 6, // 6 hours
  })
</script>

{#if $queryResult.isSuccess}
  <div class="flex flex-col gap-4 overflow-scroll max-h-full p-2 relative">
    {#each $queryResult.data as { name, pages, tradCount, readCount }}
      <Card.Root class="relative">
        <Card.CardContent class="p-2 min-h-20">
          <p class="font-bold text-center">{name}</p>

          <div class="flex text-sm items-center justify-center">
            <p class="font-bold text-secondary-foreground/50">Liens:</p>
            {#each pages as { title, link }}
              <Button variant="link" on:click={() => goto(link)} class="px-1">
                {title}
              </Button>
            {:else}
              <p class="px-1 py-2">Aucun lien</p>
            {/each}
          </div>
          <div class="flex justify-around w-full">
            <p class="text-sm font-bold text-secondary-foreground/50">
              Traduction: <span class="text-secondary-foreground">{tradCount}</span>
            </p>
            <p class="text-sm font-bold text-secondary-foreground/50">
              Relecture: <span class="text-secondary-foreground">{readCount}</span>
            </p>
          </div>
        </Card.CardContent>
      </Card.Root>
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
