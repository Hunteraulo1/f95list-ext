<script lang="ts">
  import { goto } from '$app/navigation'
  import traductorsJson from '$lib/assets/traductors.json'
  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import { TraductorsData } from '$lib/schemas'
  import { traductors } from '$lib/stores'
  import { parse } from 'valibot'

  // const query = useQuery<{ data: TraductorType[] }>({
  //   queryFn: () => {
  //     console.log('🚀 ~ queryFn: ~ fetch')
  //     return fetch(
  //       'https://script.googleusercontent.com/macros/echo?user_content_key=5pAKFgglxczwDOzJ2zZCVlPQjutDAXPyfUive_-R-XNP8ezaeh7Op5x9ARLDUJbjOcz_jvj8ZynfVsEX_O5NPCbTrZFe8Bgtm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnJM9jBFQUlZ_t5s76EL8g8qV10dLI44QncUmA7Aqlq8mKcE2N7zfV9riGrNMXnV3PfjVIKTBHkgH0uIuzKwYAP_B5xwoKEctuQ&lib=MmJ3_wIeYZIsSQ7lBCVS01d4QdpKO_nee'
  //     ).then(res => res.json())
  //   },
  //   queryKey: 'traductors',
  //   cacheTime: 1000 * 60 * 60 * 6,
  // })

  if (/*$query.data*/ traductorsJson) {
    const validTraductors = parse(TraductorsData, traductorsJson.data /*$query.data.data*/)

    $traductors = validTraductors
  }
</script>

<div class="flex flex-col gap-4 overflow-scroll max-h-full p-2 relative">
  {#each $traductors as { name, pages }}
    <Card.Root class="relative">
      <Card.CardContent class="p-2 min-h-20">
        <p class="font-bold">{name}</p>

        <div class="flex text-sm items-center">
          <p class="font-bold text-secondary-foreground/50">Liens:</p>
          {#each pages as { title, link }}
            <Button variant="link" on:click={() => goto(link)} class="px-1">
              {title}
            </Button>
          {:else}
            <p class="px-1 py-2">Aucun lien</p>
          {/each}
        </div>
      </Card.CardContent>
    </Card.Root>
  {/each}
</div>
