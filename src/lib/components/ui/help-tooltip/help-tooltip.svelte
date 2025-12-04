<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';
	import { CircleHelp } from '@lucide/svelte';

	interface Props {
		content: string;
		side?: 'top' | 'bottom' | 'left' | 'right';
		class?: string;
	}

	let { content, side = 'top', class: className }: Props = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger
		class={cn(
			'inline-flex size-4 cursor-help items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground',
			className
		)}
	>
		<CircleHelp class="size-3.5" />
	</Tooltip.Trigger>
	<Tooltip.Content {side} class="max-w-[280px] text-pretty">
		{content}
	</Tooltip.Content>
</Tooltip.Root>
