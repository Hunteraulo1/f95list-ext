<script lang="ts">
import type { ClassValue } from 'clsx';
import type { Component } from 'svelte';
import { page } from '@/lib/stores';
import { cn } from '@/lib/utils';

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
let badge = $state<number>(0);

const handleClick = (link: Page['link'], target: Page['target']) => {
  if (typeof target === 'string') return window.open(target, '_blank');

  $page = link;

  badgeCount();
};

const badgeCount = async (): Promise<void> => {
  const definedAction = browser.browserAction ?? browser.action;
  badge = Number.parseInt(await definedAction.getBadgeText({}), 10);
  console.log('🚀 ~ badgeCount ~ badge:', badge);
};

onMount(() => badgeCount());
</script>

<nav class={cn("flex w-full gap-2 justify-around bg-primary-foreground p-1 border-t-4 border-secondary/60 h-14", variant === 'webapp' && 'rounded-md h-18')}>
  {#each pages as {icon, name, link, className, target}, index}
    {#if icon}
      {@const Icon = icon}
      <button
        class={cn("flex flex-1 flex-col justify-center items-center hover:bg-secondary/60 rounded-md transition-all duration-300 hover:text-secondary-foreground text-secondary-foreground/50 relative", $page === link && 'text-secondary-foreground')}
        onmouseenter={() => mouseEnter[index] = true}
        onmouseleave={() => mouseEnter[index] = false}
        onclick={() => handleClick(link, target)}
      >
        {#if link === 'updates' && badge > 0}
          <span class={cn("absolute top-0.5 ml-6 bg-red-700 text-[.6rem] rounded-lg px-1 z-10 transition-all", mouseEnter[index] && "text-[.45rem] ml-5 top-0")}>{badge}</span>
        {/if}
        <Icon class={cn("mr-2 transition-all", className)} isHovered={mouseEnter[index]} size={mouseEnter[index] ? "22" : "26"} />
        
        <span class={cn("text-[.6rem] text-secondary-foreground/0 leading-0 transition-all", mouseEnter[index] && 'text-secondary-foreground animate-pulse leading-3 mt-0.5')}>
          {name}
        </span>
      </button>
    {/if}
  {/each}
</nav>
