<script lang="ts">
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import { formatNumber } from '$lib/utils/formatters';
	import { aggregateInfrastructure, mapToChartData } from '$lib/utils/sitio-aggregation';
	import { Bath, Building, Droplets, Home, Recycle, Zap } from '@lucide/svelte';

	interface Props {
		sitios: Sitio[];
	}

	const { sitios }: Props = $props();

	// Compute aggregated infrastructure
	const infrastructure = $derived(aggregateInfrastructure(sitios));

	// Chart data
	const housingQualityData = $derived(mapToChartData(infrastructure.housingQualityDistribution));
	const housingOwnershipData = $derived(
		mapToChartData(infrastructure.housingOwnershipDistribution)
	);

	// Coverage status helpers with proper badge classes
	type CoverageStatus = {
		status: string;
		badgeClass: string;
		progressClass: string;
		textClass: string;
		bgClass: string;
	};

	function getCoverageStatus(percent: number): CoverageStatus {
		if (percent >= 80)
			return {
				status: 'High',
				badgeClass: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
				progressClass: '[&>div]:bg-emerald-500',
				textClass: 'text-emerald-600',
				bgClass: 'bg-emerald-500'
			};
		if (percent >= 50)
			return {
				status: 'Moderate',
				badgeClass: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
				progressClass: '[&>div]:bg-amber-500',
				textClass: 'text-amber-600',
				bgClass: 'bg-amber-500'
			};
		return {
			status: 'Low',
			badgeClass: 'bg-red-100 text-red-700 hover:bg-red-100',
			progressClass: '[&>div]:bg-red-500',
			textClass: 'text-red-600',
			bgClass: 'bg-red-500'
		};
	}

	const electricityStatus = $derived(getCoverageStatus(infrastructure.electricityCoveragePercent));
	const toiletStatus = $derived(getCoverageStatus(infrastructure.toiletCoveragePercent));

	// Estimate water access based on water systems
	const waterAccessPercent = $derived(
		Math.min(100, infrastructure.totalWaterSystems > 0 ? infrastructure.totalWaterSystems * 10 : 0)
	);
	const waterStatus = $derived(getCoverageStatus(waterAccessPercent));
</script>

<div class="space-y-6">
	<!-- Key Infrastructure Indicators -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Electricity Access -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
			title="{formatNumber(infrastructure.householdsWithElectricity)} out of {formatNumber(
				infrastructure.totalHouseholds
			)} households"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-50 opacity-50 dark:bg-amber-900/30"
			></div>
			<div
				class="absolute inset-0 bg-amber-50 opacity-0 transition-opacity group-hover:opacity-30 dark:bg-amber-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-amber-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-amber-900/30">
						<Zap class="size-5 text-amber-700 sm:size-6 dark:text-amber-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Electricity Access
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{infrastructure.electricityCoveragePercent.toFixed(0)}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Water Systems -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-cyan-50 opacity-50 dark:bg-cyan-900/30"
			></div>
			<div
				class="absolute inset-0 bg-cyan-50 opacity-0 transition-opacity group-hover:opacity-30 dark:bg-cyan-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-cyan-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-cyan-900/30">
						<Droplets class="size-5 text-cyan-700 sm:size-6 dark:text-cyan-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Water Systems
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{infrastructure.totalWaterSystems}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Sanitary Toilet -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
			title="{formatNumber(
				infrastructure.totalHouseholds - infrastructure.householdsWithoutToilet
			)} out of {formatNumber(infrastructure.totalHouseholds)} households"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50 dark:bg-emerald-900/30"
			></div>
			<div
				class="absolute inset-0 bg-emerald-50 opacity-0 transition-opacity group-hover:opacity-30 dark:bg-emerald-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div
						class="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-emerald-900/30"
					>
						<Bath class="size-5 text-emerald-700 sm:size-6 dark:text-emerald-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Sanitary Toilet
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{infrastructure.toiletCoveragePercent.toFixed(0)}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Waste Segregation -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-green-50 opacity-50 dark:bg-green-900/30"
			></div>
			<div
				class="absolute inset-0 bg-green-50 opacity-0 transition-opacity group-hover:opacity-30 dark:bg-green-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-green-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-green-900/30">
						<Recycle class="size-5 text-green-700 sm:size-6 dark:text-green-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Waste Segregation
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
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
		<!-- Utilities Access Overview - Improved visualization -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Zap class="size-5 text-slate-500 dark:text-slate-400" />
					Utilities Coverage
				</Card.Title>
				<Card.Description>Access percentage across utility types</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<!-- Electricity -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<div class="rounded-md bg-amber-100 p-1.5 dark:bg-amber-900/30">
								<Zap class="size-3.5 text-amber-600 dark:text-amber-400" />
							</div>
							<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Electricity</span
							>
						</div>
						<span class="text-sm font-semibold {electricityStatus.textClass}">
							{infrastructure.electricityCoveragePercent.toFixed(0)}%
						</span>
					</div>
					<Progress
						value={infrastructure.electricityCoveragePercent}
						class="h-2 {electricityStatus.progressClass}"
					/>
				</div>

				<!-- Water Access -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<div class="rounded-md bg-cyan-100 p-1.5 dark:bg-cyan-900/30">
								<Droplets class="size-3.5 text-cyan-600 dark:text-cyan-400" />
							</div>
							<span class="text-sm font-medium text-slate-700 dark:text-slate-300"
								>Water Access</span
							>
						</div>
						<span class="text-sm font-semibold {waterStatus.textClass}">
							{waterAccessPercent.toFixed(0)}%
						</span>
					</div>
					<Progress value={waterAccessPercent} class="h-2 {waterStatus.progressClass}" />
				</div>

				<!-- Sanitary Toilet -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<div class="rounded-md bg-emerald-100 p-1.5 dark:bg-emerald-900/30">
								<Bath class="size-3.5 text-emerald-600 dark:text-emerald-400" />
							</div>
							<span class="text-sm font-medium text-slate-700 dark:text-slate-300"
								>Sanitary Toilet</span
							>
						</div>
						<span class="text-sm font-semibold {toiletStatus.textClass}">
							{infrastructure.toiletCoveragePercent.toFixed(0)}%
						</span>
					</div>
					<Progress
						value={infrastructure.toiletCoveragePercent}
						class="h-2 {toiletStatus.progressClass}"
					/>
				</div>

				<!-- Summary Stats -->
				<div
					class="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 dark:border-slate-700"
				>
					<div class="text-center">
						<p class="text-lg font-bold text-slate-900 dark:text-slate-100">
							{formatNumber(infrastructure.householdsWithElectricity)}
						</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">w/ Electricity</p>
					</div>
					<div class="text-center">
						<p class="text-lg font-bold text-slate-900 dark:text-slate-100">
							{infrastructure.totalWaterSystems}
						</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">Water Systems</p>
					</div>
					<div class="text-center">
						<p class="text-lg font-bold text-slate-900 dark:text-slate-100">
							{formatNumber(
								infrastructure.totalHouseholds - infrastructure.householdsWithoutToilet
							)}
						</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">w/ Toilet</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Housing Quality -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Building class="size-5 text-slate-500 dark:text-slate-400" />
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
					<div
						class="flex h-[220px] items-center justify-center text-sm text-slate-500 dark:text-slate-400"
					>
						No housing quality data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Housing Ownership -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Home class="size-5 text-slate-500 dark:text-slate-400" />
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
					<div
						class="flex h-[220px] items-center justify-center text-sm text-slate-500 dark:text-slate-400"
					>
						No housing ownership data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
