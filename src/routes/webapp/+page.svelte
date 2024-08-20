<script lang="ts">
import GameBox from '$lib/components/GameBox.svelte'
import Button from '$lib/components/ui/button/button.svelte'
import { ScrollArea } from '$lib/components/ui/scroll-area'
import DetailsWebApp from '$lib/components/webapp/DetailsWebApp.svelte'
import FilterWebApp from '$lib/components/webapp/FilterWebApp.svelte'
import type { GameType } from '$lib/schemas'
import { filteredGames } from '$lib/stores'
import type { IdGameBox } from '$lib/types'
import Reload from 'svelte-radix/Reload.svelte'

const idGameBox: IdGameBox = { domain: 'Unknown', id: 0 }
let details: GameType | undefined
</script>

<section class="w-screen min-h-screen flex">
  <ScrollArea class="relative h-full w-1/3">
    <div class="flex flex-col gap-2 p-2 relative h-full">
      {#each $filteredGames as game (game.name + game.version)}
        <button on:click={() => details = game}>
          <GameBox {game} {idGameBox} webapp />
        </button>
      {:else}
        <div class="flex justify-center items-center h-full">
          <Button>
            <Reload class="h-4 w-full animate-spin" />
            Aucun jeu ne correspond à vos critères
          </Button>
        </div>
      {/each}
    </div>
  </ScrollArea>
  <div class="flex flex-col w-2/3">
    {#if details}
      <DetailsWebApp game={details} />
    {:else}
      <div class="flex items-center justify-center h-2/3">
        No content
      </div>
    {/if}
    <FilterWebApp />
  </div>

</section>
