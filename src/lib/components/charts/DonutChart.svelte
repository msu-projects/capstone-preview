<script lang="ts">
	import { sum } from 'd3-array';
	import { PieChart } from 'layerchart';

	export interface DonutChartData {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		data: DonutChartData[];
		centerLabel?: string;
		centerValue?: string;
		height?: number;
		showLegend?: boolean;
	}

	let { data, centerLabel, centerValue, height = 300, showLegend = true }: Props = $props();

	// Calculate total
	const total = $derived(sum(data, (d) => d.value));

	// Transform data with colors
	const chartData = $derived(
		data.map((d, i) => ({
			...d,
			color: d.color || `hsl(var(--chart-${(i % 5) + 1}))`
		}))
	);
</script>

<div class="w-full">
	<div class="relative flex justify-center" style="height: {height}px;">
		<PieChart
			data={chartData}
			key="label"
			value="value"
			c="label"
			cRange={chartData.map((d) => d.color)}
			innerRadius={-25}
			cornerRadius={6}
			padAngle={0.02}
			props={{
				arc: {
					strokeWidth: 0,
					class: 'transition-all hover:opacity-90'
				}
			}}
		/>
		{#if centerLabel && centerValue}
			<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
				<div class="text-sm text-slate-500">{centerLabel}</div>
				<div class="text-3xl font-bold text-slate-900">{centerValue}</div>
			</div>
		{/if}
	</div>

	{#if showLegend}
		<div class="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
			{#each chartData as item (item.label)}
				<div class="flex items-center gap-2">
					<div class="size-3 rounded-sm" style="background-color: {item.color}"></div>
					<span class="text-xs text-slate-600">{item.label}: {item.value.toLocaleString()}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
