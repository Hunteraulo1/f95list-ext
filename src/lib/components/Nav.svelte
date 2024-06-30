<script lang="ts">
import { goto } from '$app/navigation'
import Button from './ui/button/button.svelte'

const nav = [
  { name: 'Liste', href: '/#0' },
  { name: 'MàJ', href: '/updates#0' },
  { name: 'Paramètres', href: '/settings' },
]
</script>

<ul class="flex w-full justify-around bg-secondary/75 p-2">
  {#each nav as { name, href }}
    <li>
      <Button variant="outline" on:click={() => goto(href)}>
        {name}
      </Button>
    </li>
  {/each}
</ul>
