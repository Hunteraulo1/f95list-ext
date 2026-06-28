<script lang="ts">
interface Props {
  children: any;
  target: string | null;
  classes?: string;
}

let { target, classes = '', children }: Props = $props();

const handleClick = () => {
  if (target && typeof target === 'string') {
    window.open(target);
  }
  return;
};
</script>

<button class={classes} onclick={handleClick}>
  {@render children?.()}
</button>
