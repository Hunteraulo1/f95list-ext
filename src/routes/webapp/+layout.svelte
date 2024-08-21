<script lang="ts">
import DetailsWebApp from '$lib/components/webapp/DetailsWebApp.svelte'
import FilterWebApp from '$lib/components/webapp/FilterWebApp.svelte'
import NavWebApp from '$lib/components/webapp/NavWebApp.svelte'
import { detailGame } from '$lib/stores'
</script>

<section class="flex flex-col w-screen h-screen max-h-screen">
  <main class="flex h-screen">
    <div class="max-w-md w-full">
      <slot />
    </div>
    <div class="flex flex-col h-full w-full p-2">
      {#if $detailGame}
      <DetailsWebApp game={$detailGame} />
      {:else}
      <div class="flex items-center justify-center h-2/3 bg-primary-foreground w-full rounded-lg p-2">
        Aucun jeu n'a été sélectionné
      </div>
      {/if}
      <FilterWebApp />
      <NavWebApp />
    </div>
  </main>
</section>
