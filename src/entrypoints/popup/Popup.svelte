<script lang="ts">
import { ModeWatcher } from 'mode-watcher';
import { Bell, Expand, RefreshCcw, ScanText, SettingsIcon } from '@/lib/assets/icon';
import List from '@/lib/components/List.svelte';
import Nav, { type Page } from '@/lib/components/Nav.svelte';
import Router from '@/lib/components/Router.svelte';
import Settings from '@/lib/components/Settings.svelte';
import Traductors from '@/lib/components/Traductors.svelte';
import Updates from '@/lib/components/Updates.svelte';
import { Button } from '@/lib/components/ui/button';
import { site } from '@/lib/config';
import getData from '@/lib/utils/getData';

const siteUrl = site.store;

// La webapp est remplacée par une redirection vers la liste des jeux sur le site
// (env-aware : prod par défaut → https://f95france.site/games).
const pages: Page[] = $derived([
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
    name: 'Site',
    target: `${$siteUrl}/games`,
  },
  {
    link: 'traductors',
    icon: null,
    name: 'Traductors',
    target: Traductors,
  },
]);
</script>

<ModeWatcher defaultMode="system" />

<main class="flex justify-between flex-col font-sans w-wmain h-app max-h-app min-h-app bg-background text-foreground">
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
