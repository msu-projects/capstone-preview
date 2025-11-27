<script lang="ts">
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import { Progress } from '$lib/components/ui/progress';

	interface ChartData {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		topBudgetCategories: ChartData[];
		totalBudget: number;
	}

	let { topBudgetCategories, totalBudget }: Props = $props();

	function formatCurrency(num: number): string {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			notation: 'compact',
			maximumFractionDigits: 1
		}).format(num);
	}
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<!-- Budget by Category Donut -->
	<div class="rounded-lg border bg-card p-4">
		<h3 class="mb-4 text-lg font-semibold">Budget Allocation by Category</h3>
		<DonutChart
			data={topBudgetCategories}
			centerLabel="Total Budget"
			centerValue={formatCurrency(totalBudget)}
			height={300}
		/>
	</div>

	<!-- Budget Details Table -->
	<div class="rounded-lg border bg-card p-4">
		<h3 class="mb-4 text-lg font-semibold">Top Categories by Budget</h3>
		<div class="space-y-4">
			{#each topBudgetCategories as cat}
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2">
							<div class="size-3 rounded-full" style="background-color: {cat.color}"></div>
							<span class="font-medium">{cat.label}</span>
						</div>
						<span class="font-semibold">{formatCurrency(cat.value)}</span>
					</div>
					<Progress value={(cat.value / totalBudget) * 100} class="h-2" />
				</div>
			{/each}
		</div>
	</div>
</div>
