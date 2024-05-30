<script lang="ts">
  import Filter from '$lib/components/filter.svelte'
  import GameBox from '$lib/components/gameBox.svelte'
  import { games } from '$lib/stores'
  import Reload from 'svelte-radix/Reload.svelte'
  import Button from './../lib/components/ui/button/button.svelte'
</script>

<div class="flex flex-col gap-2 overflow-scroll max-h-full p-2 relative">
  {#if $games.length > 0}
    {#each $games as game, index}
      <GameBox {game} {index} />
    {/each}
    <Filter />
  {:else}
    <div class="flex justify-center items-center h-screen w-full">
      <Button>
        <Reload class="mr-2 h-4 w-4 animate-spin" />
        Veuillez patienter
      </Button>
    </div>
  {/if}
</div>
