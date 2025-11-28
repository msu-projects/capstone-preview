<script lang="ts">
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import RadarChart from '$lib/components/charts/RadarChart.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import { formatNumber } from '$lib/utils/formatters';
	import {
		aggregateInfrastructure,
		mapToChartData,
		toUtilitiesRadarData
	} from '$lib/utils/sitio-aggregation';
	import { Bath, Building, Droplets, Home, Recycle, Zap } from '@lucide/svelte';

	interface Props {
		sitios: Sitio[];
	}

	const { sitios }: Props = $props();

	// Compute aggregated infrastructure
	const infrastructure = $derived(aggregateInfrastructure(sitios));

	// Chart data
	const utilitiesRadarData = $derived(toUtilitiesRadarData(infrastructure));
	const housingQualityData = $derived(mapToChartData(infrastructure.housingQualityDistribution));
	const housingOwnershipData = $derived(
		mapToChartData(infrastructure.housingOwnershipDistribution)
	);

	// Coverage status helpers
	function getCoverageStatus(percent: number) {
		if (percent >= 80) return { status: 'High', color: 'emerald' };
		if (percent >= 50) return { status: 'Moderate', color: 'amber' };
		return { status: 'Low', color: 'red' };
	}

	const electricityStatus = $derived(getCoverageStatus(infrastructure.electricityCoveragePercent));
	const toiletStatus = $derived(getCoverageStatus(infrastructure.toiletCoveragePercent));
</script>

<div class="space-y-6">
	<!-- Key Infrastructure Indicators -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Electricity Access -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
			title="{formatNumber(infrastructure.householdsWithElectricity)} out of {formatNumber(
				infrastructure.totalHouseholds
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
							{infrastructure.electricityCoveragePercent.toFixed(0)}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Water Systems -->
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
							{infrastructure.totalWaterSystems}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Sanitary Toilet -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
			title="{formatNumber(
				infrastructure.totalHouseholds - infrastructure.householdsWithoutToilet
			)} out of {formatNumber(infrastructure.totalHouseholds)} households"
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
						<Bath class="size-5 text-emerald-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Sanitary Toilet</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{infrastructure.toiletCoveragePercent.toFixed(0)}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Waste Segregation -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-green-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-green-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-green-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Recycle class="size-5 text-green-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Waste Segregation</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{infrastructure.wasteSegregationCount} sitios
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Charts Row -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Utilities Access Matrix -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Zap class="size-5 text-slate-500" />
					Utilities Access Matrix
				</Card.Title>
				<Card.Description>Coverage percentage across utility types</Card.Description>
			</Card.Header>
			<Card.Content>
				<RadarChart data={utilitiesRadarData} height={250} />
			</Card.Content>
		</Card.Root>

		<!-- Housing Quality -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Building class="size-5 text-slate-500" />
					Housing Quality
				</Card.Title>
				<Card.Description>Distribution by construction type</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if housingQualityData.length > 0}
					<DonutChart
						data={housingQualityData}
						centerLabel="Total"
						centerValue={formatNumber(infrastructure.totalHouseholds)}
						height={220}
					/>
				{:else}
					<div class="flex h-[220px] items-center justify-center text-sm text-slate-500">
						No housing quality data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Housing Ownership -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Home class="size-5 text-slate-500" />
					Housing Ownership
				</Card.Title>
				<Card.Description>Distribution by ownership type</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if housingOwnershipData.length > 0}
					<DonutChart
						data={housingOwnershipData}
						centerLabel="Total"
						centerValue={formatNumber(infrastructure.totalHouseholds)}
						height={220}
					/>
				{:else}
					<div class="flex h-[220px] items-center justify-center text-sm text-slate-500">
						No housing ownership data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Coverage Details -->
	<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
		<Card.Header>
			<Card.Title class="text-base">Infrastructure Coverage Details</Card.Title>
			<Card.Description>
				Detailed breakdown of infrastructure coverage across {sitios.length} sitios
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<!-- Electricity Details -->
				<div class="space-y-3 rounded-lg bg-slate-50 p-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<Zap class="size-5 text-amber-600" />
							<span class="font-medium">Electricity</span>
						</div>
						<Badge
							variant="secondary"
							class="bg-{electricityStatus.color}-50 text-{electricityStatus.color}-700"
						>
							{electricityStatus.status}
						</Badge>
					</div>
					<Progress value={infrastructure.electricityCoveragePercent} class="h-3" />
					<div class="flex justify-between text-sm text-slate-600">
						<span>
							{formatNumber(infrastructure.householdsWithElectricity)} with electricity
						</span>
						<span class="font-medium">
							{infrastructure.electricityCoveragePercent.toFixed(1)}%
						</span>
					</div>
				</div>

				<!-- Sanitation Details -->
				<div class="space-y-3 rounded-lg bg-slate-50 p-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<Bath class="size-5 text-emerald-600" />
							<span class="font-medium">Sanitation</span>
						</div>
						<Badge
							variant="secondary"
							class="bg-{toiletStatus.color}-50 text-{toiletStatus.color}-700"
						>
							{toiletStatus.status}
						</Badge>
					</div>
					<Progress value={infrastructure.toiletCoveragePercent} class="h-3" />
					<div class="flex justify-between text-sm text-slate-600">
						<span>
							{formatNumber(infrastructure.householdsWithoutToilet)} without toilet
						</span>
						<span class="font-medium">{infrastructure.toiletCoveragePercent.toFixed(1)}%</span>
					</div>
				</div>

				<!-- Water Systems Details -->
				<div class="space-y-3 rounded-lg bg-slate-50 p-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<Droplets class="size-5 text-cyan-600" />
							<span class="font-medium">Water Systems</span>
						</div>
						<Badge variant="secondary" class="bg-cyan-50 text-cyan-700">
							{infrastructure.totalWaterSystems} total
						</Badge>
					</div>
					<div class="pt-2 text-sm text-slate-600">
						<p>
							Total water systems across all sitios providing clean water access to communities.
						</p>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
