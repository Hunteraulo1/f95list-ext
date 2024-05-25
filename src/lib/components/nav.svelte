<script lang="ts">
  import Button from './ui/button/button.svelte'

  const nav = [
    { name: 'Liste', href: '/' },
    { name: 'MàJ', href: '/updates' },
    { name: 'Paramètres', href: '/settings' },
  ]
</script>

<ul class="flex w-full justify-around bg-primary/75 p-2">
  {#each nav as { name, href }}
    <li>
      <a {href}>
        <Button variant="outline">
          {name}
        </Button>
      </a>
    </li>
  {/each}
</ul>
