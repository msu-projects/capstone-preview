<script lang="ts">
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import type { SitioYearlySnapshot } from '$lib/types/sitio-yearly';
	import { formatNumber } from '$lib/utils/formatters';
	import {
		Bath,
		Building,
		CheckCircle,
		Droplets,
		Home,
		Recycle,
		Sun,
		TrendingDown,
		Zap
	} from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
		previousSnapshot?: SitioYearlySnapshot | null;
	}

	const { sitio, previousSnapshot = null }: Props = $props();

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

	// Water access percentage (estimate based on water systems)
	const waterAccessPercentage = $derived(
		sitio.water_sanitation?.water_systems_count
			? Math.min(100, sitio.water_sanitation.water_systems_count * 20)
			: 0
	);

	// Coverage status helper with proper badge/progress classes
	type CoverageStatus = {
		status: string;
		badgeClass: string;
		progressClass: string;
		textClass: string;
		bgClass: string;
		icon: 'good' | 'moderate' | 'critical';
	};

	function getCoverageStatus(percent: number): CoverageStatus {
		if (percent >= 80)
			return {
				status: 'Good Coverage',
				badgeClass: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
				progressClass: '[&>div]:bg-emerald-500',
				textClass: 'text-emerald-600',
				bgClass: 'bg-emerald-500',
				icon: 'good'
			};
		if (percent >= 50)
			return {
				status: 'Moderate',
				badgeClass: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
				progressClass: '[&>div]:bg-amber-500',
				textClass: 'text-amber-600',
				bgClass: 'bg-amber-500',
				icon: 'moderate'
			};
		return {
			status: 'Low Coverage',
			badgeClass: 'bg-red-100 text-red-700 hover:bg-red-100',
			progressClass: '[&>div]:bg-red-500',
			textClass: 'text-red-600',
			bgClass: 'bg-red-500',
			icon: 'critical'
		};
	}

	const electricityStatus = $derived(getCoverageStatus(electricityCoverage));
	const toiletStatus = $derived(getCoverageStatus(toiletCoverage));
	const waterStatus = $derived(getCoverageStatus(waterAccessPercentage));

	// Utilities data for the improved visualization
	const utilitiesData = $derived([
		{
			label: 'Electricity',
			value: electricityCoverage,
			icon: Zap,
			iconBg: 'bg-amber-100',
			iconColor: 'text-amber-600',
			status: electricityStatus
		},
		{
			label: 'Water Access',
			value: waterAccessPercentage,
			icon: Droplets,
			iconBg: 'bg-cyan-100',
			iconColor: 'text-cyan-600',
			status: waterStatus
		},
		{
			label: 'Sanitary Toilet',
			value: toiletCoverage,
			icon: Bath,
			iconBg: 'bg-purple-100',
			iconColor: 'text-purple-600',
			status: toiletStatus
		}
	]);

	// Priority areas for display
	const criticalAreas = $derived(utilitiesData.filter((u) => u.status.icon === 'critical'));
	const moderateAreas = $derived(utilitiesData.filter((u) => u.status.icon === 'moderate'));
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
					<DonutChart
						data={housingQualityData}
						centerValue={formatNumber(sitio.households)}
						centerLabel="Households"
						height={320}
					/>
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
					<DonutChart
						data={housingOwnershipData}
						centerValue={formatNumber(sitio.households)}
						centerLabel="Households"
						height={320}
					/>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Home class="size-16 text-slate-200" />
						<p class="mt-4 text-sm text-slate-500">No housing ownership data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Water & Sanitation Section -->
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
				<div class="grid gap-6 lg:grid-cols-2">
					<!-- Left Column: Water Systems & Sources -->
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
					</div>

					<!-- Right Column: Sanitation Stats -->
					<div class="space-y-4">
						<!-- Sanitation Stats -->
						<div class="grid grid-cols-2 gap-3">
							<div class="rounded-lg bg-purple-50 p-4 text-center ring-1 ring-purple-100">
								<div class="text-2xl font-bold text-purple-700">
									{sitio.water_sanitation.households_without_toilet}
								</div>
								<div class="text-xs text-purple-600">HHs Without Toilet</div>
							</div>
							<div class="rounded-lg bg-emerald-50 p-4 text-center ring-1 ring-emerald-100">
								<div class="text-2xl font-bold text-emerald-700">{toiletCoverage.toFixed(0)}%</div>
								<div class="text-xs text-emerald-600">Toilet Coverage</div>
							</div>
						</div>

						<!-- Toilet Coverage Progress -->
						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="text-slate-600">Toilet Coverage</span>
								<span class="font-semibold text-slate-900">{toiletCoverage.toFixed(1)}%</span>
							</div>
							<Progress value={toiletCoverage} class="h-3 {toiletStatus.progressClass}" />
							<div class="mt-2 text-xs text-slate-500">
								{formatNumber(
									sitio.households - (sitio.water_sanitation?.households_without_toilet || 0)
								)} of {formatNumber(sitio.households)} households
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

						<!-- Toilet Facility Types -->
						{#if sitio.water_sanitation.toilet_facility_types && sitio.water_sanitation.toilet_facility_types.length > 0}
							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<Bath class="size-4 text-purple-500" />
									<span class="text-xs font-medium tracking-wider text-slate-400 uppercase"
										>Toilet Facility Types</span
									>
								</div>
								<div class="flex flex-wrap gap-2">
									{#each sitio.water_sanitation.toilet_facility_types as facilityType}
										<Badge
											variant="secondary"
											class="bg-purple-50 text-purple-700 ring-1 ring-purple-200"
										>
											{facilityType}
										</Badge>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<Droplets class="size-16 text-slate-200" />
					<p class="mt-4 text-sm text-slate-500">No water & sanitation data available</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Utilities Access Overview -->
	<Card.Root class="gap-0 py-0 shadow-sm">
		<Card.Header class="border-b bg-slate-50/50 py-6">
			<div class="flex items-center gap-2">
				<div class="rounded-lg bg-indigo-100 p-1.5">
					<CheckCircle class="size-4 text-indigo-600" />
				</div>
				<div>
					<Card.Title class="text-lg">Utilities Access Overview</Card.Title>
					<Card.Description>
						Coverage assessment across essential utilities for this sitio
					</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="py-6">
			<div class="grid gap-6 lg:grid-cols-2">
				<!-- Utilities Progress Bars -->
				<div class="space-y-5">
					{#each utilitiesData as item}
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<div class="rounded-md p-1.5 {item.iconBg}">
										<item.icon class="size-4 {item.iconColor}" />
									</div>
									<span class="text-sm font-medium text-slate-700">{item.label}</span>
								</div>
								<div class="flex items-center gap-2">
									<Badge variant="secondary" class={item.status.badgeClass}>
										{item.status.status}
									</Badge>
									<span class="text-sm font-semibold {item.status.textClass}">
										{item.value.toFixed(0)}%
									</span>
								</div>
							</div>
							<Progress value={item.value} class="h-2.5 {item.status.progressClass}" />
						</div>
					{/each}
				</div>

				<!-- Summary & Insights -->
				<div class="space-y-4">
					<p class="text-sm text-slate-600">
						This overview shows household access to basic utilities. Lower percentages indicate
						infrastructure gaps that may need prioritization.
					</p>

					<!-- Quick Stats -->
					<div class="grid grid-cols-3 gap-3">
						<div class="rounded-lg bg-amber-50 p-3 text-center ring-1 ring-amber-100">
							<p class="text-lg font-bold text-amber-700">
								{formatNumber(sitio.utilities?.households_with_electricity || 0)}
							</p>
							<p class="text-xs text-amber-600">w/ Electricity</p>
						</div>
						<div class="rounded-lg bg-cyan-50 p-3 text-center ring-1 ring-cyan-100">
							<p class="text-lg font-bold text-cyan-700">
								{sitio.water_sanitation?.water_systems_count || 0}
							</p>
							<p class="text-xs text-cyan-600">Water Systems</p>
						</div>
						<div class="rounded-lg bg-purple-50 p-3 text-center ring-1 ring-purple-100">
							<p class="text-lg font-bold text-purple-700">
								{formatNumber(
									sitio.households - (sitio.water_sanitation?.households_without_toilet || 0)
								)}
							</p>
							<p class="text-xs text-purple-600">w/ Toilet</p>
						</div>
					</div>

					<!-- Alternative Electricity Sources -->
					{#if sitio.utilities?.alternative_electricity_sources && sitio.utilities.alternative_electricity_sources.length > 0}
						<div class="space-y-2 rounded-lg border border-amber-200 bg-amber-50/30 p-3">
							<div class="flex items-center gap-2">
								<Sun class="size-4 text-amber-600" />
								<span class="text-sm font-medium text-amber-700">Alternative Power Sources</span>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each sitio.utilities.alternative_electricity_sources as source}
									<Badge
										variant="secondary"
										class="bg-amber-100 text-amber-700 ring-1 ring-amber-200"
									>
										{source}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Priority Areas -->
					{#if criticalAreas.length > 0}
						<div class="rounded-lg border border-red-200 bg-red-50/50 p-4">
							<div class="flex items-start gap-2">
								<TrendingDown class="mt-0.5 size-4 text-red-600" />
								<div>
									<p class="text-sm font-medium text-red-700">Priority Areas</p>
									<p class="text-xs text-red-600">
										{criticalAreas.map((a) => a.label).join(', ')} need{criticalAreas.length === 1
											? 's'
											: ''} immediate attention
									</p>
								</div>
							</div>
						</div>
					{:else if moderateAreas.length > 0}
						<div class="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
							<div class="flex items-start gap-2">
								<Zap class="mt-0.5 size-4 text-amber-600" />
								<div>
									<p class="text-sm font-medium text-amber-700">Areas for Improvement</p>
									<p class="text-xs text-amber-600">
										{moderateAreas.map((a) => a.label).join(', ')} could benefit from upgrades
									</p>
								</div>
							</div>
						</div>
					{:else}
						<div class="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
							<div class="flex items-start gap-2">
								<CheckCircle class="mt-0.5 size-4 text-emerald-600" />
								<div>
									<p class="text-sm font-medium text-emerald-700">Excellent Coverage</p>
									<p class="text-xs text-emerald-600">
										All utilities have good coverage in this sitio
									</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
