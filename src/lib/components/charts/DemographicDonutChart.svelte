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

	// Calculate percentage for each item
	function getPercentage(value: number): string {
		return ((value / total) * 100).toFixed(1);
	}

	// Tooltip state
	let tooltipData = $state<{
		label: string;
		value: number;
		percentage: string;
		color: string;
		x: number;
		y: number;
	} | null>(null);

	function handleMouseEnter(event: MouseEvent, arcData: ChartDataItem) {
		const rect = (event.target as SVGElement).getBoundingClientRect();
		tooltipData = {
			label: arcData.label,
			value: arcData.value,
			percentage: getPercentage(arcData.value),
			color: arcData.color || 'hsl(var(--chart-1))',
			x: rect.left + rect.width / 2,
			y: rect.top
		};
	}

	function handleMouseLeave() {
		tooltipData = null;
	}
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
				class: 'origin-center transition-all duration-200 hover:scale-105 hover:opacity-95 cursor-pointer',
				onmouseenter: (e: any) => {
					if (e.detail) {
						handleMouseEnter(e.detail.event, e.detail.data);
					}
				},
				onmouseleave: handleMouseLeave
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

<!-- Tooltip Portal -->
{#if tooltipData}
	<div
		class="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full"
		style="left: {tooltipData.x}px; top: {tooltipData.y - 8}px;"
	>
		<div
			class="animate-in fade-in zoom-in-95 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm duration-150"
		>
			<div class="flex items-center gap-2">
				<div class="size-3 rounded-sm" style="background-color: {tooltipData.color}"></div>
				<div class="flex flex-col">
					<span class="text-xs font-semibold text-slate-900">{tooltipData.label}</span>
					<div class="flex items-baseline gap-2">
						<span class="text-sm font-bold text-slate-700">
							{tooltipData.value.toLocaleString()}
						</span>
						<span class="text-xs text-slate-500">({tooltipData.percentage}%)</span>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
