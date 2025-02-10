<script lang="ts">
import { Moon, Sun } from '@/lib/assets/icon';
import { Button, buttonVariants } from '@/lib/components/ui/button';
import { Label } from '@/lib/components/ui/label';
import { Switch } from '@/lib/components/ui/switch';
import { page, settings } from '@/lib/stores';
import type { Settings } from '@/lib/types';
import { toggleMode } from 'mode-watcher';

interface SettingItem {
  title: string;
  id: keyof Settings;
  checked?: boolean;
}

const settingsItems: SettingItem[] = [
  {
    title: "Thème de l'extension:",
    id: 'theme',
  },
  {
    title: 'Cacher les tags (par défault):',
    id: 'tagsHide',
    checked: $settings.tagsHide,
  },
  {
    title: "Activer l'intégration F95/LC:",
    id: 'intergrateFeature',
    checked: $settings.intergrateFeature,
  },
  {
    title: 'Ouverture automatique des jeux:',
    id: 'autoFocusGame',
    checked: $settings.autoFocusGame,
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

let storedSettings = localStorage.getItem('settings');
if (storedSettings) {
  $settings = JSON.parse(storedSettings);
} else {
  $settings = JSON.parse(defaultSettings);
}

const handleSettings = async (settingsItem: SettingItem) => {
  const { id } = settingsItem;

  try {
    // Mise à jour du store et localStorage
    const newValue = !$settings[id];
    const updatedSettings = { ...$settings, [id]: newValue };

    $settings = updatedSettings;
    localStorage.setItem('settings', JSON.stringify(updatedSettings));

    if (id === 'intergrateFeature') {
      const message = `f95list-integrate_${newValue.toString()}`;

      try {
        await browser.runtime.sendMessage(message);
      } catch (browserError) {
        $settings = { ...$settings, [id]: !newValue };
      }
    }
  } catch (error) {
    console.error('Settings try error:', error);
  }
};
</script>

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-2">
    <h1 class="text-center my-4 font-bold text-xl">Paramètres</h1>
    {#each settingsItems as settingsItem}
      <div class="flex justify-center items-center gap-2">
        <Label for={settingsItem.id}>{settingsItem.title}</Label>
        {#if settingsItem.id === "theme"}
          <Button id={settingsItem.id} onclick={toggleMode} variant="outline" size="icon">
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
            id={settingsItem.id}
            checked={settingsItem.checked}
            onclick={() => handleSettings(settingsItem)}
          />
        {/if}
      </div>
    {/each}
  </div>
  <div>
    <h2 class="text-center mb-2 font-bold">En savoir plus</h2>
    <div class="flex justify-center items-center flex-col">
      <Button class="mb-2" variant="outline" onclick={() => $page = "traductors"}
        >Voir les traducteurs/relecteurs</Button
      >
      {#each links as { title, href }}
        <a {href} target="_blank" class={buttonVariants({ variant: "link", class: "flex gap-1" })}>
          {title}
        </a>
      {/each}
    </div>
  </div>
</div>
