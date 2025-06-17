<script lang="ts">
import { ModeWatcher } from 'mode-watcher';
import { Bell, RefreshCcw, ScanText, SettingsIcon } from '@/lib/assets/icon';
import Details from '@/lib/components/Details.svelte';
import Filter from '@/lib/components/Filter.svelte';
import ListWebapp from '@/lib/components/ListWebapp.svelte';
import Nav, { type Page } from '@/lib/components/Nav.svelte';
import Router from '@/lib/components/Router.svelte';
import Settings from '@/lib/components/Settings.svelte';
import Traductors from '@/lib/components/Traductors.svelte';
import Updates from '@/lib/components/Updates.svelte';
import { Button } from '@/lib/components/ui/button';
import { selectedGame } from '@/lib/stores';
import getData from '@/lib/utils/getData';

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

<main class="flex w-screen min-h-screen h-screen max-h-screen bg-background font-sans z-10">
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
    <div class="flex flex-col h-full w-full p-2 gap-4 relative">
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
