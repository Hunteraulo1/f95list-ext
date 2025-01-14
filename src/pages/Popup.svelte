<script lang="ts">
import List from '$components/List.svelte';
import Nav, { type Page } from '$components/Nav.svelte';
import Router from '$components/Router.svelte';
import Settings from '$components/Settings.svelte';
import Traductors from '$components/Traductors.svelte';
import Updates from '$components/Updates.svelte';
import { Bell, Expand, RefreshCcw, ScanText, Settings as SettingsIcon } from '$lib/assets/icon';
import { Button } from '$ui/button';
import getData from '$utils/getData';
import { ModeWatcher } from 'mode-watcher';

const pages: Page[] = [
  {
    link: 'list',
    icon: ScanText,
    name: 'Liste',
    target: List,
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
    link: 'webapp',
    icon: Expand,
    name: 'Webapp',
    target: '/src/popup.html#webapp',
  },
  {
    link: 'traductors',
    icon: null,
    name: 'Traductors',
    target: Traductors,
  },
];
</script>

<ModeWatcher defaultMode="system" />

<main class="flex justify-between flex-col w-main h-app max-h-app min-h-app bg-background text-foreground">
  {#await getData()}
    <div class="flex justify-center items-center h-full">
      <Button>
        <RefreshCcw />
        Veuillez patienter
      </Button>
    </div>
  {:then}
    <Router {pages} />
    
    <Nav {pages} />
  {/await}
</main>
