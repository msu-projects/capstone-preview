<script lang="ts">
	import SitioMap from '$lib/components/sitios/SitioMap.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { Project, Sitio } from '$lib/types';
	import type { SitioYearlySnapshot } from '$lib/types/sitio-yearly';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import {
		ArrowUpRight,
		Building2,
		FolderKanban,
		Heart,
		Home,
		Leaf,
		MapPin,
		Sparkles,
		TrendingUp,
		Users,
		Vote,
		Zap
	} from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
		relatedProjects: Project[];
		previousSnapshot?: SitioYearlySnapshot | null;
	}

	const { sitio, relatedProjects, previousSnapshot = null }: Props = $props();

	// Calculate key metrics
	const philhealthCoverage = $derived(
		sitio.social_services && sitio.population > 0
			? (sitio.social_services.philhealth_beneficiaries / sitio.population) * 100
			: 0
	);

	const fourpsCoverage = $derived(
		sitio.social_services && sitio.households > 0
			? (sitio.social_services.fourps_beneficiaries / sitio.households) * 100
			: 0
	);

	const electricityCoverage = $derived(
		sitio.utilities && sitio.households > 0
			? (sitio.utilities.households_with_electricity / sitio.households) * 100
			: 0
	);

	const waterCoverage = $derived(
		sitio.water_sanitation?.water_systems_count ? sitio.water_sanitation.water_systems_count : 0
	);

	const totalBudget = $derived(relatedProjects.reduce((sum, p) => sum + p.total_budget, 0));
	const activeProjects = $derived(relatedProjects.filter((p) => p.status === 'in-progress').length);
	const completedProjects = $derived(
		relatedProjects.filter((p) => p.status === 'completed').length
	);

	// Quick stats for community snapshot
	const communitySnapshot = $derived([
		{
			label: 'PhilHealth Coverage',
			value: `${philhealthCoverage.toFixed(0)}%`,
			progress: philhealthCoverage,
			icon: Heart,
			color: 'emerald'
		},
		{
			label: '4Ps Beneficiaries',
			value: `${fourpsCoverage.toFixed(0)}%`,
			progress: fourpsCoverage,
			icon: Users,
			color: 'purple'
		},
		{
			label: 'Electricity Access',
			value: `${electricityCoverage.toFixed(0)}%`,
			progress: electricityCoverage,
			icon: Zap,
			color: 'amber'
		}
	]);

	// Calculate key metrics
	const avgHouseholdSize = $derived(
		sitio.households > 0 ? (sitio.population / sitio.households).toFixed(1) : '0'
	);

	const keyMetrics = $derived([
		{
			label: 'Population',
			value: formatNumber(sitio.population),
			icon: Users,
			color: 'bg-blue-500',
			bgColor: 'bg-blue-50',
			textColor: 'text-blue-700'
		},
		{
			label: 'Households',
			value: formatNumber(sitio.households),
			icon: Home,
			color: 'bg-emerald-500',
			bgColor: 'bg-emerald-50',
			textColor: 'text-emerald-700'
		},
		{
			label: 'Active Projects',
			value: activeProjects.toString(),
			icon: FolderKanban,
			color: 'bg-amber-500',
			bgColor: 'bg-amber-50',
			textColor: 'text-amber-700'
		},
		{
			label: 'Total Investment',
			value: formatCurrency(totalBudget),
			icon: TrendingUp,
			color: 'bg-purple-500',
			bgColor: 'bg-purple-50',
			textColor: 'text-purple-700'
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
	<!-- Top Row: Map and Location Info -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Map Card (Takes 2 columns) -->
		<Card.Root class="relative z-0 gap-0 overflow-hidden py-0 shadow-sm lg:col-span-2">
			<Card.Header class="border-b bg-slate-50/50 py-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-100 p-1.5">
							<MapPin class="size-4 text-blue-600" />
						</div>
						<Card.Title class="text-lg">Location Map</Card.Title>
					</div>
					{#if sitio.coordinates.lat && sitio.coordinates.lng}
						<Badge variant="outline" class="font-mono text-xs">
							{sitio.coordinates.lat.toFixed(4)}°N, {sitio.coordinates.lng.toFixed(4)}°E
						</Badge>
					{/if}
				</div>
			</Card.Header>
			<Card.Content class="h-full p-0">
				<div class="h-full w-full">
					<SitioMap
						latitude={sitio.coordinates.lat}
						longitude={sitio.coordinates.lng}
						sitioName={sitio.name}
						height="100%"
						class="rounded-t-none!"
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Location Details Card -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-indigo-100 p-1.5">
						<Building2 class="size-4 text-indigo-600" />
					</div>
					<Card.Title class="text-lg">Location Details</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4 py-6">
				<div class="space-y-3">
					<div class="rounded-lg bg-slate-50 p-3">
						<div class="text-xs font-medium tracking-wider text-slate-400 uppercase">
							Municipality
						</div>
						<div class="mt-1 text-base font-semibold text-slate-900">{sitio.municipality}</div>
					</div>
					<div class="rounded-lg bg-slate-50 p-3">
						<div class="text-xs font-medium tracking-wider text-slate-400 uppercase">Barangay</div>
						<div class="mt-1 text-base font-semibold text-slate-900">{sitio.barangay}</div>
					</div>
					{#if sitio.province}
						<div class="rounded-lg bg-slate-50 p-3">
							<div class="text-xs font-medium tracking-wider text-slate-400 uppercase">
								Province
							</div>
							<div class="mt-1 text-base font-semibold text-slate-900">{sitio.province}</div>
						</div>
					{/if}
					{#if sitio.coding?.code}
						<div class="rounded-lg bg-slate-50 p-3">
							<div class="text-xs font-medium tracking-wider text-slate-400 uppercase">
								Sitio Code
							</div>
							<div class="mt-1 font-mono text-base font-semibold text-slate-900">
								{sitio.coding.code}
							</div>
						</div>
					{/if}
				</div>

				<!-- Quick Population Stats -->
				<div class="mt-6 border-t pt-4">
					<div class="mb-3 text-xs font-medium tracking-wider text-slate-400 uppercase">
						Population Stats
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div class="rounded-lg bg-blue-50 p-3 text-center">
							<div class="text-2xl font-bold text-blue-700">{formatNumber(sitio.population)}</div>
							<div class="text-xs text-blue-600">Total Pop.</div>
						</div>
						<div class="rounded-lg bg-emerald-50 p-3 text-center">
							<div class="text-2xl font-bold text-emerald-700">
								{formatNumber(sitio.households)}
							</div>
							<div class="text-xs text-emerald-600">Households</div>
						</div>
					</div>
				</div>

				<!-- Registered Voters -->
				{#if sitio.social_services?.registered_voters}
					<div class="mt-4 border-t pt-4">
						<div class="flex items-center justify-between rounded-lg bg-slate-50 p-3">
							<div class="flex items-center gap-2">
								<Vote class="size-4 text-slate-500" />
								<span class="text-sm text-slate-600">Registered Voters</span>
							</div>
							<span class="font-semibold text-slate-900">
								{formatNumber(sitio.social_services.registered_voters)}
							</span>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Middle Row: Community Snapshot -->
	<Card.Root class="gap-0 py-0 shadow-sm">
		<Card.Header class="border-b bg-slate-50/50 py-6">
			<div class="flex items-center gap-2">
				<div class="rounded-lg bg-violet-100 p-1.5">
					<Sparkles class="size-4 text-violet-600" />
				</div>
				<Card.Title class="text-lg">Community Snapshot</Card.Title>
			</div>
			<Card.Description>Key social coverage indicators at a glance</Card.Description>
		</Card.Header>
		<Card.Content class="py-6">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each communitySnapshot as stat}
					{@const colorMap = {
						emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', progress: 'bg-emerald-500' },
						purple: { bg: 'bg-purple-50', text: 'text-purple-600', progress: 'bg-purple-500' },
						amber: { bg: 'bg-amber-50', text: 'text-amber-600', progress: 'bg-amber-500' }
					}}
					{@const colorClasses = colorMap[stat.color as keyof typeof colorMap] ?? colorMap.emerald}
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="rounded-lg {colorClasses.bg} p-1.5">
									<stat.icon class="size-4 {colorClasses.text}" />
								</div>
								<span class="text-sm font-medium text-slate-700">{stat.label}</span>
							</div>
							<span class="text-lg font-bold text-slate-900">{stat.value}</span>
						</div>
						<div class="h-2 overflow-hidden rounded-full bg-slate-100">
							<div
								class="h-full rounded-full {colorClasses.progress} transition-all duration-500"
								style="width: {Math.min(stat.progress, 100)}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Bottom Row: Projects Summary and Additional Info -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Projects Summary Card -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-100 p-1.5">
							<FolderKanban class="size-4 text-blue-600" />
						</div>
						<Card.Title class="text-lg">Development Projects</Card.Title>
					</div>
					<Badge variant="outline" class="bg-blue-50 text-blue-700">
						{relatedProjects.length} Total
					</Badge>
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				<div class="grid grid-cols-3 gap-4">
					<div class="rounded-xl bg-emerald-50 p-4 text-center ring-1 ring-emerald-100">
						<div class="text-3xl font-bold text-emerald-700">{activeProjects}</div>
						<div class="mt-1 text-xs font-medium text-emerald-600">Active</div>
					</div>
					<div class="rounded-xl bg-blue-50 p-4 text-center ring-1 ring-blue-100">
						<div class="text-3xl font-bold text-blue-700">{completedProjects}</div>
						<div class="mt-1 text-xs font-medium text-blue-600">Completed</div>
					</div>
					<div class="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
						<div class="text-3xl font-bold text-slate-700">
							{relatedProjects.length - activeProjects - completedProjects}
						</div>
						<div class="mt-1 text-xs font-medium text-slate-600">Other</div>
					</div>
				</div>

				<div class="mt-6 space-y-3 border-t pt-4">
					<div class="flex items-center justify-between">
						<span class="text-sm text-slate-600">Total Investment</span>
						<span class="text-lg font-bold text-slate-900">{formatCurrency(totalBudget)}</span>
					</div>
					{#if relatedProjects.length > 0}
						<a
							href="#projects-tab"
							class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
						>
							View all projects
							<ArrowUpRight class="size-4" />
						</a>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Agriculture & Environment Quick View -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-green-100 p-1.5">
						<Leaf class="size-4 text-green-600" />
					</div>
					<Card.Title class="text-lg">Agriculture Overview</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				{#if sitio.agriculture}
					<div class="grid grid-cols-2 gap-4">
						<div class="rounded-xl bg-green-50 p-4 ring-1 ring-green-100">
							<div class="text-2xl font-bold text-green-700">
								{formatNumber(sitio.agriculture.farmers_count)}
							</div>
							<div class="mt-1 text-xs font-medium text-green-600">Registered Farmers</div>
						</div>
						<div class="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
							<div class="text-2xl font-bold text-emerald-700">
								{sitio.agriculture.farm_area_hectares.toFixed(0)} ha
							</div>
							<div class="mt-1 text-xs font-medium text-emerald-600">Farm Area</div>
						</div>
					</div>

					{#if sitio.agriculture.top_crops && sitio.agriculture.top_crops.length > 0}
						<div class="mt-4">
							<div class="mb-2 text-xs font-medium tracking-wider text-slate-400 uppercase">
								Primary Crops
							</div>
							<div class="flex flex-wrap gap-2">
								{#each sitio.agriculture.top_crops.slice(0, 4) as crop}
									<Badge variant="secondary" class="bg-green-50 text-green-700">
										{crop}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}
				{:else}
					<div class="flex flex-col items-center justify-center py-8 text-center">
						<Leaf class="size-12 text-slate-300" />
						<p class="mt-2 text-sm text-slate-500">No agriculture data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
