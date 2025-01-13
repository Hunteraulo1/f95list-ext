<script lang="ts">
import { page } from '$lib/stores';
import { cn } from '$lib/utils';
import type { ClassValue } from 'clsx';
import type { Component } from 'svelte';

export interface Page {
  name: string;
  link: string;
  icon: Component | null;
  className?: ClassValue[];
  target: Component | string;
}

interface Props {
  pages?: Page[];
  variant?: 'webapp' | 'popup';
}

let { pages = [], variant = 'popup' }: Props = $props();

let mouseEnter = $state<boolean[]>(Array(pages.length).fill(false));

const handleClick = (link: Page['link'], target: Page['target']) => {
  if (typeof target === 'string') return window.open(target, '_blank');

  $page = link;
};
</script>

<nav class={cn("flex w-full gap-2 justify-around bg-secondary p-1 border-t-4 border-primary-foreground/60", variant === 'webapp' && 'rounded-md')}>
  {#each pages as {icon, name, link, className, target}, index}
    {#if icon}
      {@const Icon = icon}
      <button
        class="flex p-1 flex-1 flex-col justify-center items-center hover:bg-primary-foreground/50 rounded-md transition-all duration-300"
        onmouseenter={() => mouseEnter[index] = true}
        onmouseleave={() => mouseEnter[index] = false}
        onclick={() => handleClick(link, target)}
      >
      <Icon class={cn("mr-2 h-4 w-4", className)} isHovered={mouseEnter[index]} />
      
      <span class={cn("text-xs opacity-20", mouseEnter[index] ? 'animate-pulse' : '')}>
        {name}
      </span>
    </button>
    {/if}
  {/each}
</nav>
