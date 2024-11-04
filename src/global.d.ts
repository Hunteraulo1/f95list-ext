declare module 'svelte-lazy' {
  import { SvelteComponentTyped as SvelteComponent } from 'svelte';
  export default class Lazy extends SvelteComponent<{
    height?: number;
  }> {}
}
