<script lang="ts">
import GameBox from '$lib/components/GameBox.svelte'
import { Button } from '$lib/components/ui/button'
import { updates } from '$lib/stores'
import { Reload } from 'svelte-radix'
</script>

{#if $updates}
  <div class="flex flex-col gap-4 max-h-full p-2 relative" id="0">
    {#each $updates as update, index}
      <div class="flex flex-col gap-2">
        {#if index === 0 || $updates[index - 1].date.getTime() !== update.date.getTime()}
          <h2 class="text-center font-bold leading-none">
            {new Date(update.date).toLocaleDateString("fr-FR", {
              timeZone: "Europe/Paris",
            })}
          </h2>
        {/if}
        <h3
          class="text-[.7rem] text-center text-secondary-foreground/50 leading-none"
        >
          {update.type}
        </h3>
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
