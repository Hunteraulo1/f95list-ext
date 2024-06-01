<script lang="ts">
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui/button/index.js'
  import { toggleMode } from 'mode-watcher'
  import DiscordLogo from 'svelte-radix/DiscordLogo.svelte'
  import Moon from 'svelte-radix/Moon.svelte'
  import Sun from 'svelte-radix/Sun.svelte'
  import Label from './../../lib/components/ui/label/label.svelte'
  import Switch from './../../lib/components/ui/switch/switch.svelte'

  interface Setting {
    title: string
    id: string
  }

  const settings: Setting[] = [
    {
      title: "Thème de l'extension:",
      id: 'theme',
    },
    {
      title: 'Cacher les tags par défault:',
      id: 'tagsHide',
    },
    {
      title: "Activer l'intégration F95:",
      id: 'intergrateFeature',
    },
  ]
  interface Link {
    title: string
    href: string
  }

  const links: Link[] = [
    {
      title: 'Accèder à notre page F95',
      href: 'https://f95zone.to/threads/26002',
    },
    {
      title: 'Accèder au tableur',
      href: 'https://docs.google.com/spreadsheets/d/1ELRF0kpF8SoUlslX5ZXZoG4WXeWST6lN9bLws32EPfs',
    },
    {
      title: 'Accèder au Discord',
      href: 'https://discord.gg/QXd9kr3ewW',
    },
  ]
</script>

<div class="p-2 flex flex-col gap-8">
  <div class="flex flex-col gap-2">
    <h1 class="text-center mb-2 font-bold">Paramètres</h1>

    {#each settings as { title, id }}
      <div class="flex justify-center items-center gap-2">
        <Label for={id}>{title}</Label>

        {#if id !== 'theme'}
          <Switch {id} />
        {:else}
          <Button {id} on:click={toggleMode} variant="outline" size="icon">
            <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon
              class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span class="sr-only">Changer le thème</span>
          </Button>
        {/if}
      </div>
    {/each}

    <div class="flex justify-center items-center gap-2">
      <Button variant="outline">Actualiser la liste</Button>
    </div>
  </div>

  <div>
    <h2 class="text-center mb-2 font-bold">En savoir plus</h2>
    <div class="flex justify-center items-center flex-col">
      <Button variant="outline" on:click={() => goto('/traductors')}>Voir les traducteurs/relecteurs</Button>

      {#each links as { title, href }}
        <a {href} target="_blank">
          {#if title !== 'Accèder au Discord'}
            <Button variant="link" class="flex gap-1">{title}</Button>
          {:else}
            <Button variant="link" class="flex gap-1">
              <DiscordLogo class="h-6 w-6" />
              Accèder au Discord
            </Button>
          {/if}
        </a>
      {/each}
    </div>
  </div>
</div>
