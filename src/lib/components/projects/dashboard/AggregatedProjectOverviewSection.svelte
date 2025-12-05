<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Project } from '$lib/types';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import {
		aggregateByCategory,
		aggregateByMunicipality,
		aggregateByStatus,
		aggregateProgress,
		aggregateProjectStats,
		toCategoryBarData,
		toMunicipalityProjectBarData,
		toStatusPieData
	} from '$lib/utils/project-aggregation';
	import {
		Banknote,
		Building2,
		CheckCircle2,
		Clock,
		FolderKanban,
		Loader2,
		MapPin,
		TrendingUp,
		Users
	} from '@lucide/svelte';

	interface Props {
		projects: Project[];
		filterLabel?: string;
	}

	const { projects, filterLabel = 'All Projects' }: Props = $props();

	// Compute aggregations
	const stats = $derived(aggregateProjectStats(projects));
	const statusDist = $derived(aggregateByStatus(projects));
	const categoryDist = $derived(aggregateByCategory(projects));
	const geoDist = $derived(aggregateByMunicipality(projects));
	const progressStats = $derived(aggregateProgress(projects));

	// Chart data
	const statusChartData = $derived(toStatusPieData(statusDist));
	const categoryChartData = $derived(toCategoryBarData(categoryDist, 'count'));
	const municipalityChartData = $derived(toMunicipalityProjectBarData(geoDist, 'projectCount'));

	// Key metrics for hero cards
	const keyMetrics = $derived([
		{
			label: 'Total Projects',
			value: stats.totalProjects.toString(),
			icon: FolderKanban,
			color: 'bg-blue-500',
			bgColor: 'bg-blue-50',
			textColor: 'text-blue-700'
		},
		{
			label: 'Total Budget',
			value: formatCurrency(stats.totalBudget),
			icon: Banknote,
			color: 'bg-emerald-500',
			bgColor: 'bg-emerald-50',
			textColor: 'text-emerald-700'
		},
		{
			label: 'Beneficiaries',
			value: formatNumber(stats.totalBeneficiaries),
			icon: Users,
			color: 'bg-indigo-500',
			bgColor: 'bg-indigo-50',
			textColor: 'text-indigo-700'
		},
		{
			label: 'Municipalities',
			value: geoDist.totalMunicipalities.toString(),
			icon: MapPin,
			color: 'bg-amber-500',
			bgColor: 'bg-amber-50',
			textColor: 'text-amber-700'
		}
	]);

	// Status summary for quick view
	const statusSummary = $derived([
		{
			label: 'In Progress',
			value: statusDist.find((s) => s.status === 'in-progress')?.count ?? 0,
			color: 'amber'
		},
		{
			label: 'Completed',
			value: statusDist.find((s) => s.status === 'completed')?.count ?? 0,
			color: 'emerald'
		},
		{
			label: 'Planning',
			value: statusDist.find((s) => s.status === 'planning')?.count ?? 0,
			color: 'blue'
		},
		{
			label: 'Suspended',
			value: statusDist.find((s) => s.status === 'suspended')?.count ?? 0,
			color: 'red'
		}
	]);
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
		<!-- Status Distribution -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<TrendingUp class="size-5 text-slate-500" />
					Project Status Distribution
				</Card.Title>
				<Card.Description>Breakdown of {projects.length} projects by status</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if statusChartData.length > 0}
					<div class="flex items-center justify-center gap-6">
						<DonutChart data={statusChartData} />
					</div>
				{:else}
					<div class="flex h-[180px] items-center justify-center text-sm text-slate-500">
						No project data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Category Distribution -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Building2 class="size-5 text-slate-500" />
					Projects by Category
				</Card.Title>
				<Card.Description>Distribution across project categories</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if categoryChartData.length > 0}
					<BarChart data={categoryChartData} orientation="horizontal" height={220} />
				{:else}
					<div class="flex h-[220px] items-center justify-center text-sm text-slate-500">
						No data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Progress Overview & Geographic -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Progress Snapshot -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Clock class="size-5 text-slate-500" />
					Progress Snapshot
				</Card.Title>
				<Card.Description>Overall project progress metrics</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<!-- Average Progress -->
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="font-medium text-slate-700">Average Completion</span>
						<span class="font-semibold text-slate-900"
							>{progressStats.averageCompletion.toFixed(1)}%</span
						>
					</div>
					<Progress value={progressStats.averageCompletion} class="h-2" />
				</div>

				<!-- Progress Status Breakdown -->
				<div class="grid grid-cols-2 gap-3 pt-2">
					<div class="rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-100">
						<div class="flex items-center gap-2">
							<CheckCircle2 class="size-4 text-emerald-600" />
							<span class="text-xs font-medium text-emerald-700">Completed</span>
						</div>
						<div class="mt-1 text-xl font-bold text-emerald-700">
							{progressStats.completedCount}
						</div>
					</div>
					<div class="rounded-lg bg-blue-50 p-3 ring-1 ring-blue-100">
						<div class="flex items-center gap-2">
							<Loader2 class="size-4 text-blue-600" />
							<span class="text-xs font-medium text-blue-700">On Track</span>
						</div>
						<div class="mt-1 text-xl font-bold text-blue-700">{progressStats.onTrackCount}</div>
					</div>
					<div class="rounded-lg bg-amber-50 p-3 ring-1 ring-amber-100">
						<div class="flex items-center gap-2">
							<Clock class="size-4 text-amber-600" />
							<span class="text-xs font-medium text-amber-700">Delayed</span>
						</div>
						<div class="mt-1 text-xl font-bold text-amber-700">{progressStats.delayedCount}</div>
					</div>
					<div class="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
						<div class="flex items-center gap-2">
							<Clock class="size-4 text-slate-600" />
							<span class="text-xs font-medium text-slate-700">Not Started</span>
						</div>
						<div class="mt-1 text-xl font-bold text-slate-700">{progressStats.notStartedCount}</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Geographic Distribution -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<MapPin class="size-5 text-slate-500" />
					Projects by Municipality
				</Card.Title>
				<Card.Description>
					Distribution across {geoDist.totalMunicipalities} municipalities
				</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if municipalityChartData.length > 0}
					<BarChart data={municipalityChartData} orientation="horizontal" height={220} />
				{:else}
					<div class="flex h-[220px] items-center justify-center text-sm text-slate-500">
						No location data available
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
						<p class="text-sm text-slate-500">Employment Generated</p>
						<p class="text-2xl font-bold text-slate-900">
							{formatNumber(stats.employmentGenerated.total)}
						</p>
						<p class="text-xs text-slate-500">
							{formatNumber(stats.employmentGenerated.male)} male, {formatNumber(
								stats.employmentGenerated.female
							)} female
						</p>
					</div>
					<div class="rounded-lg bg-purple-50 p-2">
						<Users class="size-5 text-purple-600" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">Avg. Budget per Project</p>
						<p class="text-2xl font-bold text-slate-900">
							{formatCurrency(stats.averageBudgetPerProject)}
						</p>
					</div>
					<div class="rounded-lg bg-cyan-50 p-2">
						<Banknote class="size-5 text-cyan-600" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">Active Projects</p>
						<p class="text-2xl font-bold text-slate-900">
							{statusDist.find((s) => s.status === 'in-progress')?.count ?? 0}
						</p>
					</div>
					<div class="rounded-lg bg-amber-50 p-2">
						<Loader2 class="size-5 text-amber-600" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
