<script lang="ts">
import Filter from '$lib/components/Filter.svelte';
import DetailsWebApp from '$lib/components/webapp/DetailsWebApp.svelte';
import NavWebApp from '$lib/components/webapp/NavWebApp.svelte';
import { detailGame } from '$lib/stores';
interface Props {
  children?: import('svelte').Snippet;
}

let { children }: Props = $props();
</script>

<section class="flex w-screen min-h-screen h-screen max-h-screen bg-primary-foreground z-10">
  <div class="max-w-md w-full">
    {@render children?.()}
  </div>
  <div class="flex flex-col h-full w-full p-2">
    {#if $detailGame}
      <DetailsWebApp game={$detailGame} />
    {:else}
      <div class="flex items-center justify-center h-2/3 bg-primary-foreground w-full rounded-lg p-2">
        Aucun jeu n'a été sélectionné
      </div>
    {/if}
    <Filter variant="webapp" />
    <NavWebApp />
  </div>
</section>
