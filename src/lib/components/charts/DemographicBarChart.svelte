<script lang="ts">
	interface ChartDataItem {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		data: ChartDataItem[];
		orientation?: 'horizontal' | 'vertical';
		height?: number;
	}

	const { data, orientation = 'horizontal', height = 300 }: Props = $props();

	const maxValue = $derived(Math.max(...data.map((d) => d.value), 1));

	let hoveredIndex = $state<number | null>(null);

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}
</script>

<div class="h-full w-full">
	{#if orientation === 'horizontal'}
		<!-- Horizontal Bar Chart -->
		<div class="flex h-full flex-col justify-center gap-4 py-2">
			{#each data as item, i}
				<div class="space-y-1.5">
					<div class="flex items-center justify-between">
						<span class="min-w-0 truncate text-sm font-medium text-slate-600" title={item.label}>
							{item.label}
						</span>
						<span class="ml-3 shrink-0 text-sm font-bold text-slate-900">
							{formatNumber(item.value)}
						</span>
					</div>
					<div class="relative h-8 overflow-hidden rounded-lg bg-slate-100">
						<div
							class="h-full rounded-lg transition-all duration-300 ease-in-out"
							style="width: {(item.value / maxValue) * 100}%; background-color: {item.color ||
								'hsl(217, 91%, 60%)'}"
							role="button"
							tabindex="0"
							onmouseenter={() => (hoveredIndex = i)}
							onmouseleave={() => (hoveredIndex = null)}
							onfocus={() => (hoveredIndex = i)}
							onblur={() => (hoveredIndex = null)}
						>
							<!-- Tooltip -->
							{#if hoveredIndex === i}
								<div
									class="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg"
								>
									{item.label}: {formatNumber(item.value)}
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Vertical Bar Chart -->
		<div class="flex h-full items-end justify-center gap-6 px-4 pb-2">
			{#each data as item, i}
				<div class="flex flex-col items-center gap-2">
					<div class="text-center">
						<div class="text-xl font-bold text-slate-900">{formatNumber(item.value)}</div>
					</div>
					<div
						class="relative flex flex-col items-center justify-end"
						style="height: {height - 80}px;"
					>
						<div
							class="relative w-16 rounded-t-lg transition-all duration-300 ease-in-out hover:opacity-90"
							style="height: {(item.value / maxValue) *
								(height - 100)}px; background-color: {item.color || 'hsl(217, 91%, 60%)'}"
							role="button"
							tabindex="0"
							onmouseenter={() => (hoveredIndex = i)}
							onmouseleave={() => (hoveredIndex = null)}
							onfocus={() => (hoveredIndex = i)}
							onblur={() => (hoveredIndex = null)}
						>
							<!-- Tooltip -->
							{#if hoveredIndex === i}
								<div
									class="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg"
								>
									{item.label}: {formatNumber(item.value)}
								</div>
							{/if}
						</div>
					</div>
					<div class="text-center">
						<div class="text-xs font-medium text-slate-600">{item.label}</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
