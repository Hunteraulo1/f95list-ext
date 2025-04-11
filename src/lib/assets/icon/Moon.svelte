<script lang='ts'>
let { color = 'currentColor', size = 28, strokeWidth = 2, isHovered = false, classes = '' } = $props();

function handleMouseEnter() {
  isHovered = true;
  setTimeout(() => {
    isHovered = false;
  }, 500);
}
</script>

<div class={classes} aria-label="plus" role="img" onmouseenter={handleMouseEnter}>
	<svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
		stroke={color}
		stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-moon-icon lucide-moon"
		class:animate={isHovered}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" class:head={isHovered} />
  </svg>
</div>

<style>
	path {
		transition: all 0.2s ease-in;
	}

	.head {
		transform: scale(1.1);
	}
</style>
