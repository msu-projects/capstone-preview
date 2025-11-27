<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';

	interface ChartData {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		municipalityChartData: ChartData[];
	}

	let { municipalityChartData }: Props = $props();
</script>

<div class="rounded-lg border bg-card p-4">
	<h3 class="mb-4 text-lg font-semibold">Projects by Municipality</h3>
	<BarChart data={municipalityChartData} orientation="vertical" height={350} title="Projects" />
</div>
