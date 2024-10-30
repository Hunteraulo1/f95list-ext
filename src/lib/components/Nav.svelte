<script lang="ts">
import { goto } from '$app/navigation';
import { Button } from '$ui/button';

const nav = [
  { name: 'Liste', href: '/' },
  { name: 'MàJ', href: '/updates' },
  { name: 'Paramètres', href: '/settings' },
];
</script>

<ul class="flex w-full justify-around bg-secondary/75 p-2 sticky bottom-0">
  {#each nav as { name, href }}
    <li>
      <Button variant="outline" onclick={() => goto(href)}>
        {name}
      </Button>
    </li>
  {/each}
</ul>
