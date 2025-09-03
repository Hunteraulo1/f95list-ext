<script lang="ts">
interface Props {
  children: any;
  target: string;
  classes?: string;
}

let { target, classes = '', children }: Props = $props();

const handleClick = () => {
  if (typeof target === 'string') {
    try {
      browser.runtime.sendMessage({ type: 'open-tab', url: target });
    } catch {
      window.open(target, '_blank');
    }
    return;
  }
};
</script>

<button class={classes} onclick={handleClick}>
  {@render children?.()}
</button>
