declare module 'svelte-lazy' {
  import { SvelteComponent } from 'svelte';
  import type { FadeParams } from 'svelte/transition';

  export default class Lazy extends SvelteComponent<{
    height?: number | string;
    keep?: boolean;
    offset?: number;
    placeholder?: string | SvelteComponent;
    class?: string;
    fadeOption?: FadeParams;
    onload?: (node: HTMLElement) => void;
    resetHeightDelay?: number;
  }> {}
}
