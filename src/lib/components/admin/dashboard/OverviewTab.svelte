<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import LineChart from '$lib/components/charts/LineChart.svelte';

	interface ChartData {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		statusChartData: ChartData[];
		categoryChartData: ChartData[];
		monthlyProgressSeries: { name: string; data: number[] }[];
		monthlyProgressCategories: string[];
		totalProjects: number;
	}

	let {
		statusChartData,
		categoryChartData,
		monthlyProgressSeries,
		monthlyProgressCategories,
		totalProjects
	}: Props = $props();
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<!-- Projects by Status Donut -->
	<div class="rounded-lg border bg-card p-4">
		<h3 class="mb-4 text-lg font-semibold">Projects by Status</h3>
		<DonutChart
			data={statusChartData}
			centerLabel="Total Projects"
			centerValue={totalProjects.toString()}
			height={280}
		/>
	</div>

	<!-- Monthly Progress Line Chart -->
	<div class="rounded-lg border bg-card p-4">
		<h3 class="mb-4 text-lg font-semibold">Monthly Project Completions</h3>
		<LineChart
			series={monthlyProgressSeries}
			categories={monthlyProgressCategories}
			height={280}
			title="Projects Completed"
		/>
	</div>
</div>

<!-- Categories Bar Chart - Full Width -->
<div class="mt-6 rounded-lg border bg-card p-4">
	<h3 class="mb-4 text-lg font-semibold">Projects by Category</h3>
	<BarChart data={categoryChartData} orientation="horizontal" height={320} title="Projects" />
</div>
