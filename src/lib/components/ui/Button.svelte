<script lang="ts">
import { cn } from '$lib/utils/cn.js';
import type { Component } from 'svelte';
import type { MouseEventHandler } from 'svelte/elements';
import type { ClassNameValue } from 'tailwind-merge';

interface Props {
  icon?: Component
  title?: string
  classIcon?: ClassNameValue
  className?: ClassNameValue
  onclick?: MouseEventHandler<HTMLButtonElement>
}

let { icon, title, className, classIcon, onclick}: Props = $props();
</script>

<button class={className?.toString()} {onclick}>
  {#if icon}
    {@const Icon = icon}
    <Icon class={cn("mr-2 h-4 w-4 animate-spin", classIcon)} />
  {/if}

  {title}
</button>
