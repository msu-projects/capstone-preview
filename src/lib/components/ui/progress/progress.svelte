<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	type ProgressProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value?: number;
		max?: number;
	};

	let {
		class: className,
		value = 0,
		max = 100,
		ref = $bindable(null),
		...restProps
	}: ProgressProps = $props();

	const percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div
	bind:this={ref}
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={max}
	aria-valuenow={value}
	data-slot="progress"
	class={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)}
	{...restProps}
>
	<div
		class="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
		style="transform: translateX(-{100 - percentage}%)"
	></div>
</div>
