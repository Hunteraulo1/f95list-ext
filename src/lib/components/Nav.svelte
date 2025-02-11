<script lang="ts">
import { page } from '@/lib/stores';
import { cn } from '@/lib/utils';
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

<nav class={cn("flex w-full gap-2 justify-around bg-primary-foreground p-1 border-t-4 border-secondary/60 h-14", variant === 'webapp' && 'rounded-md h-18')}>
  {#each pages as {icon, name, link, className, target}, index}
    {#if icon}
      {@const Icon = icon}
      <button
        class={cn("flex flex-1 flex-col justify-center items-center hover:bg-secondary/60 rounded-md transition-all duration-300 hover:text-white text-white/50", $page === link && 'text-white')}
        onmouseenter={() => mouseEnter[index] = true}
        onmouseleave={() => mouseEnter[index] = false}
        onclick={() => handleClick(link, target)}
      >
        <Icon class={cn("mr-2 transition-all", className)} isHovered={mouseEnter[index]} size={mouseEnter[index] ? "1.5rem" : "1.7rem"} />
        
        <span class={cn("text-[.6rem] text-white/0 leading-0 transition-all", mouseEnter[index] && 'text-white animate-pulse leading-3')}>
          {name}
        </span>
      </button>
    {/if}
  {/each}
</nav>
