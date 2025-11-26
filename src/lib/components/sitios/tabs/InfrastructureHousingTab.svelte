<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import DemographicDonutChart from '$lib/components/charts/DemographicDonutChart.svelte';
	import { Home, Droplets, Zap, Bath } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
	}

	const { sitio }: Props = $props();

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	// Housing quality data
	const housingQualityData = $derived(
		sitio.housing?.quality_types
			? sitio.housing.quality_types.map((qt, i) => ({
					label: qt.type,
					value: qt.count,
					color: [
						'hsl(217, 91%, 60%)',
						'hsl(142, 71%, 45%)',
						'hsl(24, 95%, 53%)',
						'hsl(262, 83%, 58%)',
						'hsl(189, 85%, 45%)'
					][i % 5]
				}))
			: []
	);

	// Housing ownership data
	const housingOwnershipData = $derived(
		sitio.housing?.ownership_types
			? sitio.housing.ownership_types.map((ot, i) => ({
					label: ot.type,
					value: ot.count,
					color: [
						'hsl(217, 91%, 60%)',
						'hsl(142, 71%, 45%)',
						'hsl(24, 95%, 53%)',
						'hsl(262, 83%, 58%)',
						'hsl(189, 85%, 45%)'
					][i % 5]
				}))
			: []
	);

	// Calculate coverage percentages
	const electricityCoverage = $derived(
		sitio.utilities && sitio.households > 0
			? (sitio.utilities.households_with_electricity / sitio.households) * 100
			: 0
	);

	const toiletCoverage = $derived(
		sitio.water_sanitation && sitio.households > 0
			? ((sitio.households - sitio.water_sanitation.households_without_toilet) /
					sitio.households) *
				100
			: 0
	);
</script>

<!-- Infrastructure & Housing Tab -->
<div class="space-y-6">
	<!-- Housing Charts Row -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Housing Quality Chart -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-blue-50 p-1.5">
						<Home class="size-4 text-blue-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Housing Quality Types</h3>
				</div>
			</Card.Header>
			<Card.Content class="pt-0">
				{#if housingQualityData.length > 0}
					<div style="height: 300px;">
						<DemographicDonutChart
							data={housingQualityData}
							centerText={formatNumber(sitio.households)}
							centerSubtext="Households"
						/>
					</div>
				{:else}
					<div class="flex h-[300px] items-center justify-center">
						<div class="text-center">
							<Home class="mx-auto size-12 text-slate-300" />
							<p class="mt-2 text-sm text-slate-500">No housing quality data recorded</p>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Housing Ownership Chart -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-emerald-50 p-1.5">
						<Home class="size-4 text-emerald-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Housing Ownership Types</h3>
				</div>
			</Card.Header>
			<Card.Content class="pt-0">
				{#if housingOwnershipData.length > 0}
					<div style="height: 300px;">
						<DemographicDonutChart data={housingOwnershipData} />
					</div>
				{:else}
					<div class="flex h-[300px] items-center justify-center">
						<div class="text-center">
							<Home class="mx-auto size-12 text-slate-300" />
							<p class="mt-2 text-sm text-slate-500">No housing ownership data recorded</p>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Water & Sanitation Row -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Water Sources Card -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-cyan-50 p-1.5">
						<Droplets class="size-4 text-cyan-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Water Sources</h3>
				</div>
			</Card.Header>
			<Card.Content class="space-y-3 pt-0">
				{#if sitio.water_sanitation}
					<div class="flex items-center justify-between rounded bg-slate-50 p-3">
						<span class="text-sm font-medium text-slate-700">Water Systems Count</span>
						<span class="text-xl font-bold text-slate-900">
							{sitio.water_sanitation.water_systems_count}
						</span>
					</div>

					{#if sitio.water_sanitation.water_sources && sitio.water_sanitation.water_sources.length > 0}
						<div class="space-y-2">
							<div class="text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Sources
							</div>
							{#each sitio.water_sanitation.water_sources as source}
								<div class="flex items-center justify-between rounded border border-slate-200 p-2">
									<span class="text-sm text-slate-700">{source.source}</span>
									<Badge
										variant={source.status === 'Functional' ? 'default' : 'secondary'}
										class={source.status === 'Functional'
											? 'bg-emerald-100 text-emerald-700'
											: 'bg-amber-100 text-amber-700'}
									>
										{source.status}
									</Badge>
								</div>
							{/each}
						</div>
					{/if}

					{#if sitio.water_sanitation.waste_segregation_practice !== null}
						<div class="mt-4 rounded bg-slate-50 p-3">
							<div class="text-sm font-medium text-slate-700">Waste Segregation</div>
							<div class="mt-1 text-lg font-semibold">
								{sitio.water_sanitation.waste_segregation_practice ? 'Yes' : 'No'}
							</div>
						</div>
					{/if}
				{:else}
					<div class="py-8 text-center">
						<Droplets class="mx-auto size-12 text-slate-300" />
						<p class="mt-2 text-sm text-slate-500">No water & sanitation data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Sanitation Card -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-purple-50 p-1.5">
						<Bath class="size-4 text-purple-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Sanitation Facilities</h3>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4 pt-0">
				{#if sitio.water_sanitation}
					<div>
						<div class="mb-2 flex justify-between text-sm">
							<span class="text-slate-600">Households with Toilet</span>
							<span class="font-semibold text-slate-900">{toiletCoverage.toFixed(1)}%</span>
						</div>
						<Progress value={toiletCoverage} class="h-2" />
						<div class="mt-1 text-xs text-slate-500">
							{formatNumber(sitio.households - sitio.water_sanitation.households_without_toilet)} of {formatNumber(
								sitio.households
							)} households
						</div>
					</div>

					{#if sitio.water_sanitation.toilet_facility_types && sitio.water_sanitation.toilet_facility_types.length > 0}
						<div>
							<div class="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Facility Types
							</div>
							<div class="flex flex-wrap gap-2">
								{#each sitio.water_sanitation.toilet_facility_types as type}
									<Badge variant="outline" class="bg-purple-50 text-purple-700">
										{type}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}
				{:else}
					<div class="py-8 text-center">
						<Bath class="mx-auto size-12 text-slate-300" />
						<p class="mt-2 text-sm text-slate-500">No sanitation data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Utilities Row -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Electricity Card -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-amber-50 p-1.5">
						<Zap class="size-4 text-amber-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Electricity Access</h3>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4 pt-0">
				{#if sitio.utilities}
					<div>
						<div class="mb-2 flex justify-between text-sm">
							<span class="text-slate-600">Households with Electricity</span>
							<span class="font-semibold text-slate-900">{electricityCoverage.toFixed(1)}%</span>
						</div>
						<Progress value={electricityCoverage} class="h-2" />
						<div class="mt-1 text-xs text-slate-500">
							{formatNumber(sitio.utilities.households_with_electricity)} of {formatNumber(
								sitio.households
							)} households
						</div>
					</div>

					{#if sitio.utilities.alternative_electricity_sources && sitio.utilities.alternative_electricity_sources.length > 0}
						<div>
							<div class="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Alternative Sources
							</div>
							<div class="flex flex-wrap gap-2">
								{#each sitio.utilities.alternative_electricity_sources as source}
									<Badge variant="outline" class="bg-amber-50 text-amber-700">
										{source}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}
				{:else}
					<div class="py-8 text-center">
						<Zap class="mx-auto size-12 text-slate-300" />
						<p class="mt-2 text-sm text-slate-500">No utilities data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Additional Info Card -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-slate-50 p-1.5">
						<Home class="size-4 text-slate-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Infrastructure Summary</h3>
				</div>
			</Card.Header>
			<Card.Content class="space-y-3 pt-0">
				<div class="grid grid-cols-2 gap-3">
					<div class="rounded bg-blue-50 p-3 text-center">
						<div class="text-2xl font-bold text-blue-600">{formatNumber(sitio.households)}</div>
						<div class="text-xs text-blue-700">Total Households</div>
					</div>
					<div class="rounded bg-green-50 p-3 text-center">
						<div class="text-2xl font-bold text-green-600">
							{sitio.water_sanitation?.water_systems_count || 0}
						</div>
						<div class="text-xs text-green-700">Water Systems</div>
					</div>
				</div>
				<div class="rounded bg-slate-50 p-3">
					<div class="text-sm font-medium text-slate-700">Overall Infrastructure Score</div>
					<div class="mt-2 flex items-center gap-2">
						<Progress value={(electricityCoverage + toiletCoverage) / 2} class="h-2 flex-1" />
						<span class="text-sm font-semibold text-slate-900">
							{((electricityCoverage + toiletCoverage) / 2).toFixed(0)}%
						</span>
					</div>
					<div class="mt-1 text-xs text-slate-500">Based on electricity and sanitation coverage</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
