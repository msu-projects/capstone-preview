<script lang="ts">
	import DonutChart from '$lib/components/charts/DonutChart.svelte';

	interface ChartData {
		label: string;
		value: number;
		color?: string;
	}

	interface EmploymentByCategory {
		category: string;
		male: number;
		female: number;
	}

	interface Props {
		employmentChartData: ChartData[];
		employmentByCategory: EmploymentByCategory[];
		totalEmployment: number;
	}

	let { employmentChartData, employmentByCategory, totalEmployment }: Props = $props();

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<!-- Employment Distribution Donut -->
	<div class="rounded-lg border bg-card p-4">
		<h3 class="mb-4 text-lg font-semibold">Employment Distribution</h3>
		<DonutChart
			data={employmentChartData}
			centerLabel="Total Employed"
			centerValue={formatNumber(totalEmployment)}
			height={280}
		/>
	</div>

	<!-- Employment by Category -->
	<div class="rounded-lg border bg-card p-4">
		<h3 class="mb-4 text-lg font-semibold">Employment by Category</h3>
		<div class="space-y-4">
			{#each employmentByCategory as cat}
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="font-medium">{cat.category}</span>
						<span class="text-muted-foreground">{cat.male + cat.female} total</span>
					</div>
					<div class="flex h-3 overflow-hidden rounded-full bg-muted">
						<div
							class="bg-blue-500"
							style="width: {(cat.male / (cat.male + cat.female)) * 100}%"
							title="Male: {cat.male}"
						></div>
						<div
							class="bg-pink-500"
							style="width: {(cat.female / (cat.male + cat.female)) * 100}%"
							title="Female: {cat.female}"
						></div>
					</div>
					<div class="flex justify-between text-xs text-muted-foreground">
						<span>Male: {cat.male}</span>
						<span>Female: {cat.female}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
