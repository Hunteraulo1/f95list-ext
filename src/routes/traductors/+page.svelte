<script lang="ts">
import { Button } from '$lib/components/ui/button'
import * as Card from '$lib/components/ui/card'
import { ScrollArea } from '$lib/components/ui/scroll-area'
import { type TraductorType, TraductorsData } from '$lib/schemas'
import { onMount } from 'svelte'
import { Reload } from 'svelte-radix'
import { parse } from 'valibot'

let queryResult: Promise<TraductorType[]> = Promise.resolve([])

onMount(async () => {
  const date = Date.now()

  const expriredTime = Date.parse(window.localStorage.getItem('f95list_ext_time') ?? '0')

  if (date >= expriredTime) {
    const queryData = await query()

    window.localStorage.setItem('f95list_ext_data', JSON.stringify(queryData))
    window.localStorage.setItem('f95list_ext_time', (date + 1000 * 60 * 60 * 24).toString()) // 24 hours
  }

  queryResult = JSON.parse(window.localStorage.getItem('f95list_ext_data') ?? '[]')
})

const query = async (): Promise<TraductorType[]> => {
  console.info('🚀 ~ queryFn: ~ fetch')

  try {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbze5voXSJMnTqnUIgXFgM1gtQ6e13VyAsJK50Evl5Y2HisCRN-eCbbIHXrBaNPhup1J/exec'
    )
    const data = await response.json()

    return parse(TraductorsData, data?.data)
  } catch (error) {
    console.error(error)

    return []
  }
}
</script>

{#await queryResult then traductors}
  {#if traductors.length > 0}
    <ScrollArea class="relative">
      <div class="flex flex-col gap-4 max-h-full p-2 relative" id="0">
        {#each traductors as { name, pages, tradCount, readCount }}
          <Card.Root class="relative">
            <Card.CardContent class="p-2 min-h-20">
              <p class="font-bold text-center">{name}</p>

              <div class="flex text-sm items-center justify-center">
                <p class="font-bold text-secondary-foreground/50">Liens:</p>
                {#each pages as { title, link }}
                  <a href={link} target="_blank">
                    <Button variant="link" class="px-1">
                      {title}
                    </Button>
                  </a>
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
    </ScrollArea>
  {:else}
    <div class="flex justify-center items-center min-h-full">
      <Button>
        <Reload class="mr-2 h-4 w-4 animate-spin" />
        Veuillez patienter
      </Button>
    </div>
  {/if}
{/await}
