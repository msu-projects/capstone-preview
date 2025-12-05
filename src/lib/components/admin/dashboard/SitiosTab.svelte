<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import { Progress } from '$lib/components/ui/progress';
	import { formatNumber } from '$lib/utils/formatters';
	import { Home, MapPin, Users } from '@lucide/svelte';

	interface ChartData {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		totalPopulation: number;
		totalHouseholds: number;
		totalVoters: number;
		totalFarmers: number;
		totalFarmArea: number;
		totalPhilhealth: number;
		total4Ps: number;
		demographicsChartData: ChartData[];
		ageDistribution: ChartData[];
		sitiosByMunicipality: ChartData[];
		populationByMunicipality: ChartData[];
	}

	let {
		totalPopulation,
		totalHouseholds,
		totalVoters,
		totalFarmers,
		totalFarmArea,
		totalPhilhealth,
		total4Ps,
		demographicsChartData,
		ageDistribution,
		sitiosByMunicipality,
		populationByMunicipality
	}: Props = $props();
</script>

<!-- Sitio Quick Stats -->
<div class="mb-6 grid gap-4 md:grid-cols-4">
	<div class="rounded-lg border bg-card p-4">
		<div class="flex items-center gap-2">
			<div class="rounded-full bg-blue-500/10 p-2">
				<Users class="size-4 text-blue-600" />
			</div>
			<span class="text-sm text-muted-foreground">Total Population</span>
		</div>
		<p class="mt-2 text-2xl font-bold">{formatNumber(totalPopulation)}</p>
	</div>
	<div class="rounded-lg border bg-card p-4">
		<div class="flex items-center gap-2">
			<div class="rounded-full bg-green-500/10 p-2">
				<Home class="size-4 text-green-600" />
			</div>
			<span class="text-sm text-muted-foreground">Households</span>
		</div>
		<p class="mt-2 text-2xl font-bold">{formatNumber(totalHouseholds)}</p>
	</div>
	<div class="rounded-lg border bg-card p-4">
		<div class="flex items-center gap-2">
			<div class="rounded-full bg-purple-500/10 p-2">
				<Users class="size-4 text-purple-600" />
			</div>
			<span class="text-sm text-muted-foreground">Registered Voters</span>
		</div>
		<p class="mt-2 text-2xl font-bold">{formatNumber(totalVoters)}</p>
	</div>
	<div class="rounded-lg border bg-card p-4">
		<div class="flex items-center gap-2">
			<div class="rounded-full bg-amber-500/10 p-2">
				<MapPin class="size-4 text-amber-600" />
			</div>
			<span class="text-sm text-muted-foreground">Farmers</span>
		</div>
		<p class="mt-2 text-2xl font-bold">{formatNumber(totalFarmers)}</p>
	</div>
</div>

<div class="grid gap-6 lg:grid-cols-2">
	<!-- Demographics Gender Distribution -->
	<div class="rounded-lg border bg-card p-4">
		<h3 class="mb-4 text-lg font-semibold">Population by Gender</h3>
		<DonutChart
			data={demographicsChartData}
			centerLabel="Total"
			centerValue={formatNumber(demographicsChartData.reduce((s, d) => s + d.value, 0))}
			height={260}
		/>
	</div>

	<!-- Age Distribution -->
	<div class="rounded-lg border bg-card p-4">
		<h3 class="mb-4 text-lg font-semibold">Population by Age Group</h3>
		<DonutChart
			data={ageDistribution}
			centerLabel="Total"
			centerValue={formatNumber(ageDistribution.reduce((s, a) => s + a.value, 0))}
			height={260}
		/>
	</div>
</div>

<!-- Sitios by Municipality -->
<div class="mt-6 rounded-lg border bg-card p-4">
	<h3 class="mb-4 text-lg font-semibold">Sitios by Municipality</h3>
	<BarChart data={sitiosByMunicipality} orientation="horizontal" height={280} title="Sitios" />
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-[70%_30%]">
	<!-- Population by Municipality -->
	<div class="rounded-lg border bg-card p-4">
		<h3 class="mb-4 text-lg font-semibold">Population by Municipality</h3>
		<BarChart
			data={populationByMunicipality}
			orientation="vertical"
			height={280}
			title="Population"
		/>
	</div>

	<!-- Social Services Summary -->
	<div class="rounded-lg border bg-card p-4">
		<h3 class="mb-4 text-lg font-semibold">Social Services Coverage</h3>
		<div class="space-y-4">
			<div class="space-y-2">
				<div class="flex items-center justify-between text-sm">
					<span class="font-medium">PhilHealth Beneficiaries</span>
					<span class="font-semibold">{formatNumber(totalPhilhealth)}</span>
				</div>
				<Progress value={(totalPhilhealth / totalPopulation) * 100} class="h-2" />
				<p class="text-xs text-muted-foreground">
					{((totalPhilhealth / totalPopulation) * 100).toFixed(1)}% coverage
				</p>
			</div>
			<div class="space-y-2">
				<div class="flex items-center justify-between text-sm">
					<span class="font-medium">4Ps Beneficiaries</span>
					<span class="font-semibold">{formatNumber(total4Ps)}</span>
				</div>
				<Progress value={(total4Ps / totalHouseholds) * 100} class="h-2" />
				<p class="text-xs text-muted-foreground">
					{((total4Ps / totalHouseholds) * 100).toFixed(1)}% of households
				</p>
			</div>
			<div class="space-y-2">
				<div class="flex items-center justify-between text-sm">
					<span class="font-medium">Registered Voters</span>
					<span class="font-semibold">{formatNumber(totalVoters)}</span>
				</div>
				<Progress value={(totalVoters / totalPopulation) * 100} class="h-2" />
				<p class="text-xs text-muted-foreground">
					{((totalVoters / totalPopulation) * 100).toFixed(1)}% of population
				</p>
			</div>
			<div class="mt-4 rounded-lg bg-muted/50 p-3">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium">Total Farm Area</span>
					<span class="text-lg font-bold">{formatNumber(totalFarmArea)} ha</span>
				</div>
			</div>
		</div>
	</div>
</div>
