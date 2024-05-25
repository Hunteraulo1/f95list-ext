<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { games } from '$lib/stores'
  import { lazyLoad } from '$lib/utils/lazyload'
</script>

<div class="flex flex-col gap-2 overflow-scroll max-h-full px-2">
  {#if $games.length > 0}
    {#each $games as { image, name, version }, index}
      <a href="/details/{index}">
        <Card.Root class="relative">
          {#if image}
            <img alt={name} class="w-full h-full absolute object-cover rounded-xl" use:lazyLoad={image} />
          {/if}
          <Card.CardContent
            class="h-20 relative p-6 rounded-xl backdrop-blur-xs hover:backdrop-blur-none bg-secondary/30"
          >
            <Card.Title>{name}</Card.Title>
            <Card.Description>{version}</Card.Description>
          </Card.CardContent>
        </Card.Root>
      </a>
    {/each}
  {/if}
</div>
