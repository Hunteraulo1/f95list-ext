<script lang="ts">
import { goto } from '$app/navigation';
import { pathname } from '$lib/stores';
import { Button } from '$ui/button';

const nav = [
  { name: 'Liste', href: '/webapp' },
  { name: 'Mises à jour', href: '/webapp/updates' },
  { name: 'Paramètres', href: '/webapp/settings' },
];

const handleClick = (href: string) => {
  goto(href);

  $pathname = href;
};
</script>

<ul class="flex w-full justify-around bg-secondary/75 p-2 rounded-lg">
  {#each nav as { name, href }}
    <li>
      <Button variant="outline" onclick={() => handleClick(href)}>
        {name}
      </Button>
    </li>
  {/each}
</ul>
