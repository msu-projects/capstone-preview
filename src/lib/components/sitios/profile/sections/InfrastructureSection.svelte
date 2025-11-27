<script lang="ts">
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import type { SitioYearlySnapshot } from '$lib/types/sitio-yearly';
	import { Bath, Building, CheckCircle, Droplets, Home, Recycle, Zap } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
		previousSnapshot?: SitioYearlySnapshot | null;
	}

	const { sitio, previousSnapshot = null }: Props = $props();

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	// Housing quality chart data
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

	// Housing ownership chart data
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
			? ((sitio.households - sitio.water_sanitation.households_without_toilet) / sitio.households) *
					100
			: 0
	);

	// Water sources status
	const functionalWaterSources = $derived(
		sitio.water_sanitation?.water_sources?.filter((s) => ['Functional', 'Good'].includes(s.status))
			.length || 0
	);
	const totalWaterSources = $derived(sitio.water_sanitation?.water_sources?.length || 0);
</script>

<div class="space-y-6">
	<!-- Key Infrastructure Indicators -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
			title="{formatNumber(sitio.utilities?.households_with_electricity || 0)} out of {formatNumber(
				sitio.households
			)} households"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-amber-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-amber-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Zap class="size-5 text-amber-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Electricity Access</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{electricityCoverage.toFixed(0)}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-cyan-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-cyan-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-cyan-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Droplets class="size-5 text-cyan-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Water Systems</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{sitio.water_sanitation?.water_systems_count || 0}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
			title="{formatNumber(
				sitio.households - (sitio.water_sanitation?.households_without_toilet || 0)
			)} out of {formatNumber(sitio.households)} households"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-purple-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-purple-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Bath class="size-5 text-purple-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Toilet Coverage</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{toiletCoverage.toFixed(0)}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-emerald-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Home class="size-5 text-emerald-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Households</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{formatNumber(sitio.households)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Housing Charts -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Housing Quality -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-blue-100 p-1.5">
						<Building class="size-4 text-blue-600" />
					</div>
					<Card.Title class="text-lg">Housing Quality Types</Card.Title>
				</div>
				<Card.Description>Distribution of housing materials</Card.Description>
			</Card.Header>
			<Card.Content class="py-6">
				{#if housingQualityData.length > 0}
					<div style="height: 280px;">
						<DonutChart
							data={housingQualityData}
							centerValue={formatNumber(sitio.households)}
							centerLabel="Households"
							height={280}
						/>
					</div>
					<!-- Legend -->
					<div class="mt-4 grid grid-cols-2 gap-2">
						{#each housingQualityData as item}
							<div class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
								<div class="h-3 w-3 rounded-full" style="background-color: {item.color}"></div>
								<span class="truncate text-slate-600">{item.label}</span>
								<span class="ml-auto font-semibold text-slate-900">{item.value}</span>
							</div>
						{/each}
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Building class="size-16 text-slate-200" />
						<p class="mt-4 text-sm text-slate-500">No housing quality data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Housing Ownership -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-emerald-100 p-1.5">
						<Home class="size-4 text-emerald-600" />
					</div>
					<Card.Title class="text-lg">Housing Ownership Types</Card.Title>
				</div>
				<Card.Description>Land and housing tenure status</Card.Description>
			</Card.Header>
			<Card.Content class="py-6">
				{#if housingOwnershipData.length > 0}
					<div style="height: 280px;">
						<DonutChart
							data={housingOwnershipData}
							centerValue={formatNumber(sitio.households)}
							centerLabel="Households"
							height={280}
						/>
					</div>
					<!-- Legend -->
					<div class="mt-4 grid grid-cols-2 gap-2">
						{#each housingOwnershipData as item}
							<div class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
								<div class="h-3 w-3 rounded-full" style="background-color: {item.color}"></div>
								<span class="truncate text-slate-600">{item.label}</span>
								<span class="ml-auto font-semibold text-slate-900">{item.value}</span>
							</div>
						{/each}
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Home class="size-16 text-slate-200" />
						<p class="mt-4 text-sm text-slate-500">No housing ownership data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Utilities Section -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Electricity -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-amber-50/50 py-6">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-amber-100 p-1.5">
						<Zap class="size-4 text-amber-600" />
					</div>
					<Card.Title class="text-lg">Electricity Access</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				{#if sitio.utilities}
					<div class="space-y-4">
						<!-- Coverage Bar -->
						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="text-slate-600">Households with Electricity</span>
								<span class="font-semibold text-slate-900">{electricityCoverage.toFixed(1)}%</span>
							</div>
							<Progress value={electricityCoverage} class="h-3" />
							<div class="mt-2 text-xs text-slate-500">
								{formatNumber(sitio.utilities.households_with_electricity)} of {formatNumber(
									sitio.households
								)} households
							</div>
						</div>

						<!-- Alternative Sources -->
						{#if sitio.utilities.alternative_electricity_sources && sitio.utilities.alternative_electricity_sources.length > 0}
							<div class="mt-4">
								<div class="mb-2 text-xs font-medium tracking-wider text-slate-400 uppercase">
									Alternative Sources
								</div>
								<div class="flex flex-wrap gap-2">
									{#each sitio.utilities.alternative_electricity_sources as source}
										<Badge variant="secondary" class="bg-amber-50 text-amber-700">
											{source}
										</Badge>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Status Indicator -->
						<div class="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
							<div class="flex items-center gap-2">
								{#if electricityCoverage >= 80}
									<CheckCircle class="size-5 text-emerald-600" />
									<span class="text-sm font-medium text-emerald-700">Good Coverage</span>
								{:else if electricityCoverage >= 50}
									<Zap class="size-5 text-amber-600" />
									<span class="text-sm font-medium text-amber-700">Moderate Coverage</span>
								{:else}
									<Zap class="size-5 text-red-600" />
									<span class="text-sm font-medium text-red-700">Low Coverage - Priority Area</span>
								{/if}
							</div>
						</div>
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Zap class="size-16 text-slate-200" />
						<p class="mt-4 text-sm text-slate-500">No electricity data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Water & Sanitation -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-cyan-50/50 py-6">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-cyan-100 p-1.5">
						<Droplets class="size-4 text-cyan-600" />
					</div>
					<Card.Title class="text-lg">Water & Sanitation</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				{#if sitio.water_sanitation}
					<div class="space-y-4">
						<!-- Water Systems -->
						<div class="rounded-lg bg-cyan-50 p-4 ring-1 ring-cyan-100">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-cyan-700">Water Systems</span>
								<span class="text-2xl font-bold text-cyan-800">
									{sitio.water_sanitation.water_systems_count}
								</span>
							</div>
						</div>

						<!-- Water Sources -->
						{#if sitio.water_sanitation.water_sources && sitio.water_sanitation.water_sources.length > 0}
							<div>
								<div class="mb-2 text-xs font-medium tracking-wider text-slate-400 uppercase">
									Water Sources ({functionalWaterSources}/{totalWaterSources} Functional)
								</div>
								<div class="space-y-2">
									{#each sitio.water_sanitation.water_sources as source}
										<div
											class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
										>
											<span class="text-sm text-slate-700">{source.source}</span>
											<Badge
												variant="secondary"
												class={source.status === 'Functional'
													? 'bg-emerald-100 text-emerald-700'
													: 'bg-amber-100 text-amber-700'}
											>
												{source.status}
											</Badge>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Sanitation Stats -->
						<div class="grid grid-cols-2 gap-3">
							<div class="rounded-lg bg-purple-50 p-3 text-center ring-1 ring-purple-100">
								<div class="text-xl font-bold text-purple-700">
									{sitio.water_sanitation.households_without_toilet}
								</div>
								<div class="text-xs text-purple-600">HHs Without Toilet</div>
							</div>
							<div class="rounded-lg bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
								<div class="text-xl font-bold text-emerald-700">{toiletCoverage.toFixed(0)}%</div>
								<div class="text-xs text-emerald-600">Toilet Coverage</div>
							</div>
						</div>

						<!-- Waste Segregation -->
						{#if sitio.water_sanitation.waste_segregation_practice !== null}
							<div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
								<div class="flex items-center gap-2">
									<Recycle class="size-4 text-slate-500" />
									<span class="text-sm text-slate-600">Waste Segregation</span>
								</div>
								<Badge
									variant="secondary"
									class={sitio.water_sanitation.waste_segregation_practice
										? 'bg-emerald-100 text-emerald-700'
										: 'bg-slate-100 text-slate-700'}
								>
									{sitio.water_sanitation.waste_segregation_practice
										? 'Practiced'
										: 'Not Practiced'}
								</Badge>
							</div>
						{/if}
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Droplets class="size-16 text-slate-200" />
						<p class="mt-4 text-sm text-slate-500">No water & sanitation data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
