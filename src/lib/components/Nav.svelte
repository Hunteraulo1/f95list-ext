<script lang="ts">
import { buttonVariants } from '$ui/button';
import { cn } from '$utils';

interface Props {
  nav: { name: string; href: string }[];
}

let { nav }: Props = $props();
</script>

<ul class="flex w-full justify-around bg-secondary/75 p-2 sticky bottom-0">
  {#each nav as { name, href }}
    <li>
      <a {href} class={cn(buttonVariants({ variant: 'outline' }))}>
        {name}
      </a>
    </li>
  {/each}
</ul>
