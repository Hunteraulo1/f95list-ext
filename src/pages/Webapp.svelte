<script lang="ts">
import Details from '$components/Details.svelte';
import Filter from '$components/Filter.svelte';
import ListWebapp from '$components/ListWebapp.svelte';
import Nav, { type Page } from '$components/Nav.svelte';
import Router from '$components/Router.svelte';
import Settings from '$components/Settings.svelte';
import Traductors from '$components/Traductors.svelte';
import Updates from '$components/Updates.svelte';
import { Bell, RefreshCcw, ScanText, Settings as SettingsIcon } from '$lib/assets/icon';
import { selectedGame } from '$lib/stores';
import { Button } from '$ui/button';
import getData from '$utils/getData';
import { ModeWatcher } from 'mode-watcher';

const pages: Page[] = [
  {
    link: 'list',
    icon: ScanText,
    name: 'Liste',
    target: ListWebapp,
  },
  {
    link: 'updates',
    icon: Bell,
    name: 'MàJ',
    target: Updates,
  },
  {
    link: 'settings',
    icon: SettingsIcon,
    name: 'Paramètres',
    target: Settings,
  },
  {
    link: 'traductors',
    icon: null,
    name: 'Traductors',
    target: Traductors,
  },
];
const variant = 'webapp';
</script>

<ModeWatcher defaultMode="system" />

<main class="flex w-screen min-h-screen h-screen max-h-screen bg-primary-foreground z-10">
  {#await getData()}
    <div class="flex justify-center items-center h-full w-full">
      <Button>
        <RefreshCcw />
        Veuillez patienter
      </Button>
    </div>
  {:then}
    <div class="max-w-md w-full h-full">
      <Router {pages} webapp />
    </div>
    <div class="flex flex-col h-full w-full p-2 gap-4">
      {#key $selectedGame}
        {#if $selectedGame}
          <Details game={$selectedGame} {variant} open />
        {:else}
          <p class="flex items-center justify-center bg-primary-foreground w-full h-full rounded-lg p-2">
            Aucun jeu n'a été sélectionné
          </p>
        {/if}
      {/key}
      <Filter {variant} />
      
      <Nav {pages} {variant} />
    </div>
  {/await}
</main>
