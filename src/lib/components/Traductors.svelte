<script lang="ts">
import { RefreshCcw } from '@/lib/assets/icon';
import { Button, buttonVariants } from '@/lib/components/ui/button';
import * as Card from '@/lib/components/ui/card';
import { ScrollArea } from '@/lib/components/ui/scroll-area';
import { traductors } from '@/lib/stores';
</script>

{#if $traductors.length > 0}
  <ScrollArea class="relative pb-2 h-full">
    <div class="flex flex-col gap-4 h-full p-2 relative">
      {#each $traductors as { name, pages, tradCount, readCount }}
        <Card.Root class="relative">
          <Card.CardContent class="p-2 min-h-20">
            <p class="font-bold text-center">{name}</p>

            <div class="flex text-sm items-center justify-center">
              <p class="font-bold text-secondary-foreground/50">Liens:</p>
              {#each pages as { title, link }}
                <a href={link} target="_blank" class={buttonVariants({ variant: "link", class: "px-1" })}>
                  {title}
                </a>
              {:else}
                <p class="px-1 py-2">Aucun lien</p>
              {/each}
            </div>
            <div class="flex justify-around w-full">
              <p class="text-sm font-bold text-secondary-foreground/50">
                Traductions: <span class="text-secondary-foreground">{tradCount}</span>
              </p>
              <p class="text-sm font-bold text-secondary-foreground/50">
                Relectures: <span class="text-secondary-foreground">{readCount}</span>
              </p>
            </div>
          </Card.CardContent>
        </Card.Root>
      {/each}
    </div>
  </ScrollArea>
{:else}
  <div class="flex justify-center items-center min-h-full">
    <Button>
      <RefreshCcw />
      Veuillez patienter
    </Button>
  </div>
{/if}
