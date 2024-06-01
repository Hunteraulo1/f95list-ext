<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js'
  import { toggleMode } from 'mode-watcher'
  import DiscordLogo from 'svelte-radix/DiscordLogo.svelte'
  import Moon from 'svelte-radix/Moon.svelte'
  import Sun from 'svelte-radix/Sun.svelte'
  import Label from './../../lib/components/ui/label/label.svelte'
  import Switch from './../../lib/components/ui/switch/switch.svelte'
</script>

<div class="p-2 flex flex-col gap-8">
  <div class="flex flex-col gap-2">
    <h1 class="text-center mb-2 font-bold">Paramètres</h1>

    <div class="flex justify-center items-center gap-2">
      <Label for="theme">Thème de l'extension:</Label>
      <Button id="theme" on:click={toggleMode} variant="outline" size="icon">
        <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Changer le thème</span>
      </Button>
    </div>

    <div class="flex justify-center items-center gap-2">
      <Label for="tagsHide">Cacher les tags par défault:</Label>
      <Switch id="tagsHide" />
    </div>

    <div class="flex justify-center items-center gap-2">
      <Label for="intergrateFeature">Activer l'intégration F95:</Label>
      <Switch id="intergrateFeature" />
    </div>

    <div class="flex justify-center items-center gap-2">
      <Button variant="outline">Actualiser la liste</Button>
    </div>
  </div>

  <div>
    <h2 class="text-center mb-2 font-bold">En savoir plus</h2>
    <div class="flex justify-center items-center flex-col">
      <a href="/traductors">
        <Button variant="outline">Voir les traducteurs</Button>
      </a>
      <a href="https://f95zone.to/threads/26002" target="_blank">
        <Button variant="link" class="flex gap-1">Accèder à notre page F95</Button>
      </a>
      <a href="https://docs.google.com/spreadsheets/d/1ELRF0kpF8SoUlslX5ZXZoG4WXeWST6lN9bLws32EPfs" target="_blank">
        <Button variant="link" class="flex gap-1">Accèder au tableur</Button>
      </a>
      <a href="https://discord.gg/QXd9kr3ewW" target="_blank">
        <Button variant="link" class="flex gap-1">
          <DiscordLogo class="h-6 w-6" />
          Accèder au Discord
        </Button>
      </a>
    </div>
  </div>
</div>
