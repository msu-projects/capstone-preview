<script lang="ts">
	import { sum } from 'd3-array';
	import { PieChart } from 'layerchart';

	interface ChartDataItem {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		data: ChartDataItem[];
		centerText?: string;
		centerSubtext?: string;
	}

	const { data, centerText = '', centerSubtext = '' }: Props = $props();

	const total = $derived(sum(data, (d: ChartDataItem) => d.value));
</script>

<div class="relative h-full w-full">
	<PieChart
		{data}
		key="label"
		value="value"
		c="label"
		cRange={data.map((d) => d.color || 'hsl(var(--chart-1))')}
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
	{#if centerText}
		<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
			<div class="text-3xl font-bold text-slate-900">{centerText}</div>
			{#if centerSubtext}
				<div class="text-sm text-slate-500">{centerSubtext}</div>
			{/if}
		</div>
	{/if}
</div>
