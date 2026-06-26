<script lang="ts">
import { mode, toggleMode } from 'mode-watcher';
import { accountLinked, linkWithCode, unlink } from '@/lib/account';
import { Check, Moon, Sun } from '@/lib/assets/icon';
import { Button, buttonVariants } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Switch } from '@/lib/components/ui/switch';
import { baseUrl, ENVIRONMENTS, type EnvName, envNameOf, setEnvironment } from '@/lib/config';
import { errors, page, settings } from '@/lib/stores';
import type { Settings } from '@/lib/types';
import { cn } from '@/lib/utils';
import ExternalLink from './ExternalLink.svelte';

const isDev = import.meta.env.DEV;
const envNames = Object.keys(ENVIRONMENTS) as EnvName[];

const extensionSettingsUrl = $derived(`${$baseUrl}/dashboard/settings/extension`);
const currentEnv = $derived(envNameOf($baseUrl));

let linkCode = $state('');
let linking = $state(false);
let linkError = $state<string | null>(null);

const handleConnect = async () => {
  const code = linkCode.trim().toUpperCase();
  if (code.length !== 8) {
    linkError = 'Le code doit comporter 8 caractères.';
    return;
  }

  linking = true;
  linkError = null;

  try {
    await linkWithCode(code);
    linkCode = '';
  } catch (error) {
    linkError = error instanceof Error ? error.message : 'Échec de la liaison.';
  } finally {
    linking = false;
  }
};

const handleUnlink = async () => {
  await unlink();
  linkError = null;
};

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
          <Button id={settingsItem.id} onclick={toggleMode} variant="outline" size="icon" class="cursor-pointer">
            {#if mode.current === "light"}
              <Sun size={16} isHovered />
            {:else}
              <Moon classes="h-4 w-4" />
            {/if}
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
  <div class="flex flex-col gap-2">
    <h2 class="text-center font-bold">Compte F95 France</h2>
    {#if isDev}
      <div class="flex flex-col gap-1 items-center">
        <span class="text-xs text-secondary-foreground/75">Environnement (dev)</span>
        <div class="inline-flex rounded-md border border-primary-foreground/60 overflow-hidden">
          {#each envNames as env}
            <button
              class={cn(
                "px-3 py-1 text-xs font-medium cursor-pointer transition-colors",
                currentEnv === env ? "bg-secondary text-secondary-foreground" : "bg-transparent hover:bg-secondary/50",
              )}
              onclick={() => setEnvironment(env)}
            >{env}</button>
          {/each}
        </div>
        <span class="text-[.65rem] text-secondary-foreground/50 break-all">{$baseUrl}</span>
      </div>
    {/if}
    {#if $accountLinked}
      <div class="flex justify-center items-center gap-2 text-green-600 font-medium">
        <Check size={16} isHovered />
        <span>Compte lié</span>
      </div>
      <p class="text-center text-xs text-secondary-foreground/75">
        Vos filtrages sauvegardés sont synchronisés avec votre compte.
      </p>
      <Button class="cursor-pointer mx-auto" variant="outline" onclick={handleUnlink}>Délier</Button>
    {:else}
      <p class="text-center text-xs text-secondary-foreground/75">
        Générez un code de liaison sur le site, puis collez-le ci-dessous.
      </p>
      <div class="flex gap-2 justify-center items-center">
        <Input
          type="text"
          placeholder="Code de liaison"
          maxlength={8}
          class="w-40 text-center tracking-widest uppercase"
          disabled={linking}
          value={linkCode}
          oninput={({ currentTarget }: { currentTarget: HTMLInputElement }) => {
            linkCode = currentTarget.value.toUpperCase();
          }}
          onkeydown={(event: KeyboardEvent) => {
            if (event.key === "Enter") handleConnect();
          }}
        />
        <Button class="cursor-pointer" onclick={handleConnect} disabled={linking}>
          {linking ? "Connexion…" : "Connecter"}
        </Button>
      </div>
      {#if linkError}
        <p class="text-center text-xs text-red-500 font-medium">{linkError}</p>
      {/if}
      <ExternalLink target={extensionSettingsUrl} classes={buttonVariants({ variant: "link", class: "mx-auto" })}>
        Obtenir un code de liaison
      </ExternalLink>
    {/if}
  </div>
  <div>
    <h2 class="text-center mb-2 font-bold">En savoir plus</h2>
    <div class="flex justify-center items-center flex-col">
      <Button  class="cursor-pointer mb-2" variant="outline" onclick={() => $page = "traductors"}
        >Voir les traducteurs/relecteurs</Button
      >
      {#each links as { title, href }}
        <ExternalLink  target={href} classes={buttonVariants({ variant: "link" })}>
          {title}
        </ExternalLink>
      {/each}
    </div>
  </div>
  {#if $errors.length > 0}
    <div class="flex justify-center gap-1">
      <h2 class="text-center mb-2 font-bold">Debug:</h2>
      <span class="text-red-500 font-bold">{$errors.length} erreurs</span>
    </div>
  {/if}
</div>
