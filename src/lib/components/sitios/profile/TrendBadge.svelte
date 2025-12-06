<script lang="ts">
	import { ArrowDown, ArrowUp, Minus } from '@lucide/svelte';

	interface Props {
		currentValue: number;
		previousValue: number | null;
		/** Whether an increase is good (default true for population, etc.) */
		increaseIsGood?: boolean;
		/** Show the percentage change */
		showPercent?: boolean;
		/** Show the absolute change */
		showAbsolute?: boolean;
		/** Custom formatter for values */
		formatter?: (val: number) => string;
	}

	let {
		currentValue,
		previousValue,
		increaseIsGood = true,
		showPercent = true,
		showAbsolute = false,
		formatter = (val) => val.toLocaleString()
	}: Props = $props();

	// Calculate the change
	const change = $derived(previousValue !== null ? currentValue - previousValue : null);
	const changePercent = $derived(
		previousValue !== null && previousValue !== 0 ? ((change ?? 0) / previousValue) * 100 : null
	);

	// Determine the trend direction
	const trend = $derived.by((): 'up' | 'down' | 'stable' | null => {
		if (change === null) return null;
		if (Math.abs(changePercent ?? 0) < 1) return 'stable';
		return change > 0 ? 'up' : 'down';
	});

	// Determine if the change is good or bad
	const isGood = $derived.by(() => {
		if (trend === null || trend === 'stable') return null;
		return (trend === 'up') === increaseIsGood;
	});

	// Get colors based on trend and whether it's good
	const colors = $derived.by(() => {
		if (isGood === null)
			return { text: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' };
		if (isGood)
			return {
				text: 'text-emerald-600 dark:text-emerald-400',
				bg: 'bg-emerald-50 dark:bg-emerald-900/30'
			};
		return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' };
	});
</script>

{#if trend !== null}
	<div
		class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 {colors.bg}"
		title={previousValue !== null
			? `Previous: ${formatter(previousValue)} → Current: ${formatter(currentValue)}`
			: ''}
	>
		{#if trend === 'up'}
			<ArrowUp class="size-3 {colors.text}" />
		{:else if trend === 'down'}
			<ArrowDown class="size-3 {colors.text}" />
		{:else}
			<Minus class="size-3 {colors.text}" />
		{/if}

		{#if showPercent && changePercent !== null}
			<span class="text-xs font-medium {colors.text}">
				{changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
			</span>
		{/if}

		{#if showAbsolute && change !== null}
			<span class="text-xs {colors.text}">
				({change >= 0 ? '+' : ''}{formatter(change)})
			</span>
		{/if}
	</div>
{/if}
