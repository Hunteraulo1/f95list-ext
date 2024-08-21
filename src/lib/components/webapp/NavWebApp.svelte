<script lang="ts">
import { goto } from '$app/navigation'
import { webapp } from '$lib/stores'
import Button from '../ui/button/button.svelte'

const nav = [
  { name: 'Liste', href: '/webapp' },
  { name: 'Mises à jour', href: '/webapp/updates' },
  { name: 'Paramètres', href: '/webapp/settings' },
]

const handleClick = (href: string) => {
  goto(href)

  $webapp = href === '/webapp'
}
</script>

<ul class="flex w-full justify-around bg-secondary/75 p-2 rounded-lg">
  {#each nav as { name, href }}
    <li>
      <Button variant="outline" on:click={() => handleClick(href)}>
        {name}
      </Button>
    </li>
  {/each}
</ul>
