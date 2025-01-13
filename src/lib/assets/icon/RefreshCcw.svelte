<script lang="ts">
let { color = 'currentColor', size = 28, strokeWidth = 2, classes = '' } = $props();
</script>

<div
	class={classes}
	aria-label="refresh-ccw"
	role="img"
>
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
		class="refresh-icon animate-spin"
	>
		<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
		<path d="M3 3v5h5" />
		<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
		<path d="M16 16h5v5" />
	</svg>
</div>

<style>
	.refresh-icon {
		transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		transform-origin: center;
	}

	svg {
		overflow: visible;
	}
</style>
