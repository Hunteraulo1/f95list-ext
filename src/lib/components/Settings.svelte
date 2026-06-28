<script lang="ts">
import { mode, toggleMode } from 'mode-watcher';
import { storage } from '#imports';
import { accountLinked, isSuperadmin, linkWithCode, unlink } from '@/lib/account';
import { Check, Moon, Sun } from '@/lib/assets/icon';
import { Button, buttonVariants } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Switch } from '@/lib/components/ui/switch';
import { type ApiEnvName, api, type SiteEnvName, site } from '@/lib/config';
import { errors, page, settings } from '@/lib/stores';
import { resync } from '@/lib/sync';
import type { Settings } from '@/lib/types';
import { cn } from '@/lib/utils';
import getData from '@/lib/utils/getData';

const isDev = import.meta.env.DEV;
const siteUrl = site.store;
const apiUrl = api.store;
const siteEnvNames = site.envNames;
const apiEnvNames = api.envNames;

const extensionSettingsUrl = $derived(`${$siteUrl}/dashboard/settings/extension`);
const currentSiteEnv = $derived(site.nameOf($siteUrl));
const currentApiEnv = $derived(api.nameOf($apiUrl));

// Vide le cache des données reçues de l'API (cache background de 2 h).
const clearApiDataCache = () =>
  Promise.all([
    storage.removeItem('local:f95list_ext_data'),
    storage.removeItem('local:f95list_ext_time'),
    storage.removeItem('local:f95list_ext_badge'),
  ]);

const handleSiteEnv = async (env: SiteEnvName) => {
  await site.setEnv(env);
  // Re-sync compte/presets contre le nouveau site (sans recharger la page).
  await resync();
};

const handleApiEnv = async (env: ApiEnvName) => {
  await api.setEnv(env);
  // Purge le cache puis refetch immédiatement les données depuis la nouvelle API.
  await clearApiDataCache();
  await getData();
};

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

let apiDataCleared = $state(false);

// Superadmin : vide le cache des données reçues de l'API (browser.storage.local).
const handleClearApiData = async () => {
  await clearApiDataCache();

  apiDataCleared = true;
  setTimeout(() => {
    apiDataCleared = false;
  }, 2000);
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
          <Button
            id={settingsItem.id}
            onclick={toggleMode}
            variant="outline"
            size="icon"
            class="cursor-pointer"
          >
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
  <div class="flex flex-col gap-2 px-4">
    <h2 class="text-center font-bold">Compte F95 France</h2>
    {#snippet envSelector(
      label: string,
      names: string[],
      current: string,
      url: string,
      onSelect: (env: string) => void,
    )}
      <div class="flex flex-col gap-1 items-center">
        <span class="text-xs text-secondary-foreground/75">{label}</span>
        <div
          class="inline-flex rounded-md border border-primary-foreground/60 overflow-hidden"
        >
          {#each names as env}
            <button
              class={cn(
                "px-3 py-1 text-xs font-medium cursor-pointer transition-colors",
                current === env
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-transparent hover:bg-secondary/50",
              )}
              onclick={() => onSelect(env)}>{env}</button
            >
          {/each}
        </div>
        <span class="text-[.65rem] text-secondary-foreground/50 break-all"
          >{url}</span
        >
      </div>
    {/snippet}
    {#if isDev || $isSuperadmin}
      {@render envSelector(
        "Site",
        siteEnvNames,
        currentSiteEnv,
        $siteUrl,
        (env) => handleSiteEnv(env as SiteEnvName),
      )}
      {@render envSelector(
        "API données",
        apiEnvNames,
        currentApiEnv,
        $apiUrl,
        (env) => handleApiEnv(env as ApiEnvName),
      )}
    {/if}
    {#if $accountLinked}
      <div
        class="flex justify-center items-center gap-2 text-green-600 font-medium"
      >
        <Check size={16} isHovered />
        <span>Compte lié</span>
      </div>
      <p class="text-center text-xs text-secondary-foreground/75">
        Vos filtrages sauvegardés sont synchronisés avec votre compte.
      </p>
      <Button
        class="cursor-pointer mx-auto"
        variant="outline"
        onclick={handleUnlink}>Délier</Button
      >
      {#if $isSuperadmin}
        <div
          class="flex flex-col gap-1 items-center mt-2 pt-2 border-t border-primary-foreground/40"
        >
          <span class="text-xs font-bold text-secondary-foreground/75"
            >Superadmin</span
          >
          <Button
            class="cursor-pointer"
            variant="destructive"
            onclick={handleClearApiData}
          >
            {apiDataCleared
              ? "Données supprimées"
              : "Supprimer les données API"}
          </Button>
          <span class="text-[.65rem] text-secondary-foreground/50 text-center">
            Vide le cache des jeux/MàJ reçus de l'API (rechargé au prochain
            ouverture).
          </span>
        </div>
      {/if}
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
        <Button
          class="cursor-pointer"
          onclick={handleConnect}
          disabled={linking}
        >
          {linking ? "Connexion…" : "Connecter"}
        </Button>
      </div>
      {#if linkError}
        <p class="text-center text-xs text-red-500 font-medium">{linkError}</p>
      {/if}
      <a
        href={extensionSettingsUrl}
        class={buttonVariants({ variant: "link", class: "mx-auto" })}
      >
        Obtenir un code de liaison
      </a>
    {/if}
  </div>
  <div>
    <h2 class="text-center mb-2 font-bold">En savoir plus</h2>
    <div class="flex justify-center items-center flex-col">
      <Button
        class="cursor-pointer mb-2"
        variant="outline"
        onclick={() => ($page = "traductors")}
        >Voir les traducteurs/relecteurs</Button
      >
      {#each links as { title, href }}
        <a {href} target="_blank" class={buttonVariants({ variant: "link" })}>
          {title}
        </a>
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
