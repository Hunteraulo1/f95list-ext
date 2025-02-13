<script lang="ts">
import { Search } from '@/lib/assets/icon';
import { cn } from "@/lib/utils.js";
import { Command as CommandPrimitive } from "bits-ui";

let {
  ref = $bindable(null),
  class: className,
  value = $bindable(""),
  ...restProps
}: CommandPrimitive.InputProps = $props();
</script>

<div class="flex items-center border-b px-3 gap-2" data-command-input-wrapper="">
	<Search classes="shrink-0 opacity-50" size={16} isHovered />
	<CommandPrimitive.Input
		class={cn(
			"placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-base outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			className
		)}
		bind:ref
		bind:value
		{...restProps}
	/>
</div>
