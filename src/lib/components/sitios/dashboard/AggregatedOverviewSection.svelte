<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import { formatNumber } from '$lib/utils/formatters';
	import {
		aggregateDemographics,
		aggregateInfrastructure,
		aggregateSocialServices,
		getGeographicDistribution,
		toMunicipalityBarData
	} from '$lib/utils/sitio-aggregation';
	import {
		Building2,
		Heart,
		Home,
		Landmark,
		MapPin,
		TrendingUp,
		Users,
		Vote,
		Zap
	} from '@lucide/svelte';

	interface Props {
		sitios: Sitio[];
		filterLabel?: string;
	}

	const { sitios, filterLabel = 'All Sitios' }: Props = $props();

	// Compute aggregations
	const demographics = $derived(aggregateDemographics(sitios));
	const infrastructure = $derived(aggregateInfrastructure(sitios));
	const social = $derived(aggregateSocialServices(sitios));
	const geographic = $derived(getGeographicDistribution(sitios));

	// KPI metrics
	const keyMetrics = $derived([
		{
			label: 'Total Sitios',
			value: sitios.length.toString(),
			icon: MapPin,
			color: 'bg-blue-500',
			bgColor: 'bg-blue-50',
			textColor: 'text-blue-700'
		},
		{
			label: 'Population',
			value: formatNumber(demographics.totalPopulation),
			icon: Users,
			color: 'bg-indigo-500',
			bgColor: 'bg-indigo-50',
			textColor: 'text-indigo-700'
		},
		{
			label: 'Households',
			value: formatNumber(demographics.totalHouseholds),
			icon: Home,
			color: 'bg-emerald-500',
			bgColor: 'bg-emerald-50',
			textColor: 'text-emerald-700'
		},
		{
			label: 'Municipalities',
			value: geographic.totalMunicipalities.toString(),
			icon: Landmark,
			color: 'bg-amber-500',
			bgColor: 'bg-amber-50',
			textColor: 'text-amber-700'
		}
	]);

	// Quick coverage stats
	const coverageStats = $derived([
		{
			label: 'PhilHealth Coverage',
			value: social.philhealthCoveragePercent,
			icon: Heart,
			color: 'emerald'
		},
		{
			label: 'Electricity Access',
			value: infrastructure.electricityCoveragePercent,
			icon: Zap,
			color: 'amber'
		},
		{
			label: 'Voter Registration',
			value: social.voterRegistrationPercent,
			icon: Vote,
			color: 'blue'
		}
	]);

	// Municipality distribution chart data
	const municipalityChartData = $derived(toMunicipalityBarData(geographic, 'population'));
</script>

<div class="space-y-6">
	<!-- Key Metrics Grid -->
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		{#each keyMetrics as metric}
			<Card.Root
				class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
			>
				<div
					class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full {metric.bgColor} opacity-50"
				></div>
				<div
					class="absolute inset-0 {metric.bgColor} opacity-0 transition-opacity group-hover:opacity-30"
				></div>
				<Card.Content class="relative p-4 sm:p-5">
					<div class="flex items-center gap-3 sm:gap-4">
						<div class="rounded-xl {metric.bgColor} p-2.5 ring-1 ring-black/5 sm:p-3">
							<metric.icon class="size-5 {metric.textColor} sm:size-6" />
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">{metric.label}</p>
							<p
								class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
							>
								{metric.value}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Community Snapshot -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<TrendingUp class="size-5 text-slate-500" />
					Coverage Snapshot
				</Card.Title>
				<Card.Description>Key service coverage indicators across {filterLabel}</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#each coverageStats as stat}
					<div class="space-y-2">
						<div class="flex items-center justify-between text-sm">
							<div class="flex items-center gap-2">
								<stat.icon class="size-4 text-{stat.color}-500" />
								<span class="font-medium text-slate-700">{stat.label}</span>
							</div>
							<span class="font-semibold text-slate-900">{stat.value.toFixed(1)}%</span>
						</div>
						<Progress value={stat.value} class="h-2" />
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<!-- Geographic Distribution -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Building2 class="size-5 text-slate-500" />
					Population by Municipality
				</Card.Title>
				<Card.Description
					>Distribution across {geographic.totalMunicipalities} municipalities</Card.Description
				>
			</Card.Header>
			<Card.Content>
				{#if municipalityChartData.length > 0}
					<BarChart data={municipalityChartData} orientation="horizontal" height={220} />
				{:else}
					<div class="flex h-[220px] items-center justify-center text-sm text-slate-500">
						No data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Additional Stats Row -->
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">Barangays Covered</p>
						<p class="text-2xl font-bold text-slate-900">{geographic.totalBarangays}</p>
					</div>
					<div class="rounded-lg bg-purple-50 p-2">
						<Landmark class="size-5 text-purple-600" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">Avg. Household Size</p>
						<p class="text-2xl font-bold text-slate-900">
							{demographics.averageHouseholdSize.toFixed(1)}
						</p>
					</div>
					<div class="rounded-lg bg-cyan-50 p-2">
						<Users class="size-5 text-cyan-600" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">4Ps Beneficiaries</p>
						<p class="text-2xl font-bold text-slate-900">
							{formatNumber(social.fourpsBeneficiaries)}
						</p>
					</div>
					<div class="rounded-lg bg-rose-50 p-2">
						<Heart class="size-5 text-rose-600" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
