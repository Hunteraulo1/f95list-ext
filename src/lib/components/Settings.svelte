<script lang="ts">
import { dev } from '$app/environment';
import { goto } from '$app/navigation';
import { settings } from '$lib/stores';
import type { Settings } from '$lib/types';
import { Button } from '$ui/button';
import { Label } from '$ui/label';
import { ScrollArea } from '$ui/scroll-area';
import { Switch } from '$ui/switch';
import { toggleMode } from 'mode-watcher';
import DiscordLogo from 'svelte-radix/DiscordLogo.svelte';
import Moon from 'svelte-radix/Moon.svelte';
import Sun from 'svelte-radix/Sun.svelte';

interface SettingItem {
  title: string;
  id: keyof Settings;
}

const settingsItems: SettingItem[] = [
  {
    title: "Thème de l'extension:",
    id: 'theme',
  },
  {
    title: 'Cacher les tags (par défault):',
    id: 'tagsHide',
  },
  {
    title: "Activer l'intégration F95/LC:",
    id: 'intergrateFeature',
  },
  {
    title: 'Ouverture automatique des jeux:',
    id: 'autoFocusGame',
  },
];
interface Link {
  title: string;
  href: string;
}

const links: Link[] = [
  {
    title: 'Accéder à notre page F95',
    href: 'https://f95zone.to/threads/26002',
  },
  {
    title: 'Accéder au tableur',
    href: 'https://docs.google.com/spreadsheets/d/1ELRF0kpF8SoUlslX5ZXZoG4WXeWST6lN9bLws32EPfs',
  },
  {
    title: 'Accéder au Discord',
    href: 'https://discord.gg/QXd9kr3ewW',
  },
  {
    title: 'Dépot Github',
    href: 'https://github.com/Hunteraulo1/f95list-ext',
  },
];

const defaultSettings = JSON.stringify({
  tagsHide: true,
  intergrateFeature: true,
  autoFocusGame: true,
} as Settings);

$settings = JSON.parse(localStorage.getItem('settings') || defaultSettings);

const handleSettings = (id: keyof Settings) => {
  const result = { ...$settings, [id]: !$settings[id] };
  $settings = result;
  localStorage.setItem('settings', JSON.stringify(result));

  if (id === 'intergrateFeature' && !dev) {
    const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

    browserAPI.runtime.sendMessage(`f95list-integrate_${result.intergrateFeature.toString()}`);
  }
};
</script>

<ScrollArea class="p-2 pb- h-full">
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <h1 class="text-center mb-2 font-bold">Paramètres</h1>
      {#each settingsItems as { title, id }}
        <div class="flex justify-center items-center gap-2">
          <Label for={id}>{title}</Label>
          {#if id === "theme"}
            <Button {id} onclick={toggleMode} variant="outline" size="icon">
              <Sun
                class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              />
              <Moon
                class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              />
              <span class="sr-only">Changer le thème</span>
            </Button>
          {:else}
            <Switch
              {id}
              onclick={() => handleSettings(id)}
              checked={$settings[id]}
            />
          {/if}
        </div>
      {/each}
    </div>
    <div>
      <h2 class="text-center mb-2 font-bold">En savoir plus</h2>
      <div class="flex justify-center items-center flex-col">
        <Button class="mb-2" variant="outline" onclick={() => goto("traductors")}
          >Voir les traducteurs/relecteurs</Button
        >
        {#each links as { title, href }}
          <a {href} target="_blank">
            {#if title !== "Accéder au Discord"}
              <Button variant="link" class="flex gap-1">{title}</Button>
            {:else}
              <Button variant="link" class="flex gap-1">
                <DiscordLogo class="h-6 w-6" />
                Accéder au Discord
              </Button>
            {/if}
          </a>
        {/each}
      </div>
    </div>
  </div>
</ScrollArea>
