<script lang="ts">
import Details from '$lib/components/Details.svelte';
import Filter from '$lib/components/Filter.svelte';
import Nav from '$lib/components/Nav.svelte';
import { detailGame } from '$lib/stores';
interface Props {
  children?: import('svelte').Snippet;
}

let { children }: Props = $props();
const variant = 'webapp';

const nav = [
  { name: 'Liste', href: '/webapp' },
  { name: 'Mises à jour', href: '/webapp/updates' },
  { name: 'Paramètres', href: '/webapp/settings' },
];
</script>

<section class="flex w-screen min-h-screen h-screen max-h-screen bg-primary-foreground z-10">
  <div class="max-w-md w-full h-full">
    {@render children?.()}
  </div>
  <div class="flex flex-col h-full w-full p-2">
    {#if $detailGame}
      <Details game={$detailGame} {variant} />
    {:else}
      <div class="flex items-center justify-center h-2/3 bg-primary-foreground w-full rounded-lg p-2">
        Aucun jeu n'a été sélectionné
      </div>
    {/if}
    <Filter {variant} />
    <Nav {nav} />
  </div>
</section>
