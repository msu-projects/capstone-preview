<script lang="ts">
	export interface BarChartData {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		data: BarChartData[];
		orientation?: 'horizontal' | 'vertical';
		height?: number;
		showGrid?: boolean;
		title?: string;
	}

	let { data, orientation = 'vertical', height = 300, showGrid = true, title }: Props = $props();

	const maxValue = $derived(Math.max(...data.map((d) => d.value), 1));
</script>

<div class="w-full">
	{#if title}
		<h3 class="mb-2 text-sm font-semibold text-slate-700">{title}</h3>
	{/if}
	<div class="w-full" style="height: {height}px;">
		{#if orientation === 'horizontal'}
			<!-- Horizontal Bar Chart -->
			<div class="flex h-full flex-col justify-center gap-6 py-4">
				{#each data as item, i}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium text-slate-600">{item.label}</span>
							<span class="text-lg font-bold text-slate-900">
								{item.value.toLocaleString()}
							</span>
						</div>
						<div class="relative h-12 overflow-hidden rounded-lg bg-slate-100">
							<div
								class="h-full rounded-lg transition-all duration-500"
								style="width: {(item.value / maxValue) * 100}%; background-color: {item.color ||
									`hsl(var(--chart-${(i % 5) + 1}))`}"
							></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Vertical Bar Chart -->
			<div class="flex h-full items-end justify-center gap-8 px-4 pb-2">
				{#each data as item, i}
					<div class="flex flex-col items-center gap-3">
						<div class="text-center">
							<div class="text-2xl font-bold text-slate-900">{item.value.toLocaleString()}</div>
						</div>
						<div
							class="relative flex flex-col items-center justify-end"
							style="height: {height - 80}px;"
						>
							<div
								class="w-20 rounded-t-lg transition-all duration-500"
								style="height: {(item.value / maxValue) *
									(height - 100)}px; background-color: {item.color ||
									`hsl(var(--chart-${(i % 5) + 1}))`}"
							></div>
						</div>
						<div class="text-center">
							<div class="text-xs font-medium text-slate-600">{item.label}</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
