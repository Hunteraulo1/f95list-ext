declare module 'svelte-lazy' {
  import { SvelteComponent } from 'svelte';
  import type { FadeParams } from 'svelte/transition';

  export default class SvelteLazy extends SvelteComponent {
    $$prop_def: {
      height?: number | string;
      keep?: boolean;
      offset?: number;
      placeholder?: string | SvelteComponent;
      class?: string;
      fadeOption?: FadeParams | undefined;
      onload?: (node: HTMLElement) => void;
      resetHeightDelay?: number;
    };
  }
}
