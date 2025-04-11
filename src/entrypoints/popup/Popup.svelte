<script lang="ts">
import { Bell, Expand, RefreshCcw, ScanText, Settings as SettingsIcon } from '@/lib/assets/icon';
import List from '@/lib/components/List.svelte';
import Nav, { type Page } from '@/lib/components/Nav.svelte';
import Router from '@/lib/components/Router.svelte';
import Settings from '@/lib/components/Settings.svelte';
import Traductors from '@/lib/components/Traductors.svelte';
import Updates from '@/lib/components/Updates.svelte';
import { Button } from '@/lib/components/ui/button';
import getData from '@/lib/utils/getData';
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
    target: '/webapp.html',
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

<main class="flex justify-between flex-col font-sans w-main h-app max-h-app min-h-app bg-background text-foreground">
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
