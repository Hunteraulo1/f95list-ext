<script lang="ts">
import { cn } from '$lib/utils/cn.js';
import type { Component } from 'svelte';
import type { ClassNameValue } from 'tailwind-merge';

export interface Nav {
  name: string;
  href: string;
  icon: Component;
  className?: ClassNameValue;
}

interface Props {
  nav?: Nav[];
  variant?: 'webapp' | 'popup';
}

let { nav = [], variant = 'popup' }: Props = $props();

let mouseEnter = $state<boolean[]>(Array(nav.length).fill(false));
</script>

<nav class={cn("flex w-full gap-2 justify-around bg-secondary p-1 sticky bottom-0 border-t-4 border-primary-foreground/60", variant === 'webapp' && 'rounded-md')}>
  {#each nav as {icon, name, href, className}, index}
	  {@const Icon = icon}
    <button
      class="flex p-1 flex-1 flex-col justify-center items-center hover:bg-primary-foreground/50 rounded-md transition-all duration-300"
      onmouseenter={() => mouseEnter[index] = true}
      onmouseleave={() => mouseEnter[index] = false}
    >
      <Icon class={cn("mr-2 h-4 w-4", className)} isHovered={mouseEnter[index]} />
      
      <a {href} class={cn("text-xs opacity-20", mouseEnter[index] ? 'animate-pulse' : '')}>
        {name}
      </a>
    </button>
  {/each}
</nav>
