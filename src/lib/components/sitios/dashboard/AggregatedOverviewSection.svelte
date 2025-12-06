<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Project, Sitio } from '$lib/types';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import {
		aggregateDemographics,
		aggregateInfrastructure,
		aggregateNeedScores,
		aggregateSocialServices,
		getGeographicDistribution,
		toMunicipalityBarData,
		toNeedLevelDonutData
	} from '$lib/utils/sitio-aggregation';
	import {
		Building2,
		FolderKanban,
		Gauge,
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
		projects?: Project[];
		filterLabel?: string;
	}

	const { sitios, projects = [], filterLabel = 'All Sitios' }: Props = $props();

	// Project aggregations
	const totalBudget = $derived(projects.reduce((sum, p) => sum + p.total_budget, 0));
	const activeProjects = $derived(projects.filter((p) => p.status === 'in-progress').length);
	const completedProjects = $derived(projects.filter((p) => p.status === 'completed').length);
	const planningProjects = $derived(projects.filter((p) => p.status === 'planning').length);
	const suspendedProjects = $derived(projects.filter((p) => p.status === 'suspended').length);

	// Compute aggregations
	const demographics = $derived(aggregateDemographics(sitios));
	const infrastructure = $derived(aggregateInfrastructure(sitios));
	const social = $derived(aggregateSocialServices(sitios));
	const geographic = $derived(getGeographicDistribution(sitios));
	const needScores = $derived(aggregateNeedScores(sitios));

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
			label: 'Avg Need Score',
			value: needScores.averageScore.toFixed(1) + '/10',
			icon: Gauge,
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

	// Need level distribution chart data
	const needLevelChartData = $derived(toNeedLevelDonutData(needScores));
</script>

<div class="space-y-6">
	<!-- Key Metrics Grid -->
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		{#each keyMetrics as metric}
			<Card.Root
				class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
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
							<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
								{metric.label}
							</p>
							<p
								class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
							>
								{metric.value}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Community Snapshot -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<TrendingUp class="size-5 text-slate-500 dark:text-slate-400" />
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
								<span class="font-medium text-slate-700 dark:text-slate-300">{stat.label}</span>
							</div>
							<span class="font-semibold text-slate-900 dark:text-slate-100"
								>{stat.value.toFixed(1)}%</span
							>
						</div>
						<Progress value={stat.value} class="h-2" />
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<!-- Need Level Distribution -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Gauge class="size-5 text-slate-500 dark:text-slate-400" />
					Need Level Distribution
				</Card.Title>
				<Card.Description>Sitios by priority level</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if needLevelChartData.length > 0}
					<DonutChart data={needLevelChartData} height={250} />
				{:else}
					<div
						class="flex h-[220px] items-center justify-center text-sm text-slate-500 dark:text-slate-400"
					>
						No need score data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Geographic Distribution -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Building2 class="size-5 text-slate-500 dark:text-slate-400" />
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
					<div
						class="flex h-[220px] items-center justify-center text-sm text-slate-500 dark:text-slate-400"
					>
						No data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Additional Stats Row -->
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500 dark:text-slate-400">Barangays Covered</p>
						<p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
							{geographic.totalBarangays}
						</p>
					</div>
					<div class="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/30">
						<Landmark class="size-5 text-purple-600 dark:text-purple-400" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500 dark:text-slate-400">Avg. Household Size</p>
						<p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
							{demographics.averageHouseholdSize.toFixed(1)}
						</p>
					</div>
					<div class="rounded-lg bg-cyan-50 p-2 dark:bg-cyan-900/30">
						<Users class="size-5 text-cyan-600 dark:text-cyan-400" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500 dark:text-slate-400">4Ps Beneficiaries</p>
						<p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
							{formatNumber(social.fourpsBeneficiaries)}
						</p>
					</div>
					<div class="rounded-lg bg-rose-50 p-2 dark:bg-rose-900/30">
						<Heart class="size-5 text-rose-600 dark:text-rose-400" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Development Projects Section -->
	{#if projects.length > 0}
		<Card.Root
			class="gap-0 border-0 py-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50"
		>
			<Card.Header class="border-b bg-slate-50/50 py-6 dark:bg-slate-800/50">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/30">
							<FolderKanban class="size-4 text-blue-600 dark:text-blue-400" />
						</div>
						<Card.Title class="text-lg">Development Projects</Card.Title>
					</div>
					<Badge
						variant="outline"
						class="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
					>
						{projects.length} Total
					</Badge>
				</div>
				<Card.Description>Project overview across {filterLabel}</Card.Description>
			</Card.Header>
			<Card.Content class="py-6">
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div
						class="rounded-xl bg-amber-50 p-4 text-center ring-1 ring-amber-100 dark:bg-amber-900/30 dark:ring-amber-800"
					>
						<div class="text-3xl font-bold text-amber-700 dark:text-amber-400">
							{activeProjects}
						</div>
						<div class="mt-1 text-xs font-medium text-amber-600 dark:text-amber-500">
							In Progress
						</div>
					</div>
					<div
						class="rounded-xl bg-emerald-50 p-4 text-center ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:ring-emerald-800"
					>
						<div class="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
							{completedProjects}
						</div>
						<div class="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-500">
							Completed
						</div>
					</div>
					<div
						class="rounded-xl bg-blue-50 p-4 text-center ring-1 ring-blue-100 dark:bg-blue-900/30 dark:ring-blue-800"
					>
						<div class="text-3xl font-bold text-blue-700 dark:text-blue-400">
							{planningProjects}
						</div>
						<div class="mt-1 text-xs font-medium text-blue-600 dark:text-blue-500">Planning</div>
					</div>
					<div
						class="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
					>
						<div class="text-3xl font-bold text-slate-700 dark:text-slate-300">
							{suspendedProjects}
						</div>
						<div class="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">Suspended</div>
					</div>
				</div>

				<div class="mt-6 border-t pt-4 dark:border-slate-700">
					<div class="flex items-center justify-between">
						<span class="text-sm text-slate-600 dark:text-slate-400">Total Investment</span>
						<span class="text-lg font-bold text-slate-900 dark:text-slate-100"
							>{formatCurrency(totalBudget)}</span
						>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
