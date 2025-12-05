<script lang="ts">
	import SitioMap from '$lib/components/sitios/SitioMap.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import {
		categoryColors,
		categoryLabels,
		getPredefinedIssue,
		getPredefinedPPA
	} from '$lib/config/issue-ppa-mappings';
	import type { CategoryKey, Project, Sitio, SitioIssue, SitioPPA } from '$lib/types';
	import type { SitioYearlySnapshot } from '$lib/types/sitio-yearly';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import {
		AlertTriangle,
		ArrowUpRight,
		Briefcase,
		Building2,
		Crown,
		FolderKanban,
		GraduationCap,
		Heart,
		HeartPulse,
		Home,
		Leaf,
		Lightbulb,
		Link,
		MapPin,
		Shield,
		Sparkles,
		Sprout,
		TrendingUp,
		Users,
		Vote,
		Zap,
		type Icon as IconType
	} from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
		relatedProjects: Project[];
		previousSnapshot?: SitioYearlySnapshot | null;
	}

	const { sitio, relatedProjects, previousSnapshot = null }: Props = $props();

	// Category icon mapping
	const categoryIcons: Record<CategoryKey, typeof IconType> = {
		infrastructure: Building2,
		agriculture: Sprout,
		education: GraduationCap,
		health: HeartPulse,
		livelihood: Briefcase,
		environment: Leaf
	};

	// Normalize issue: handle both string and object formats
	function normalizeIssue(item: SitioIssue | string): SitioIssue {
		if (typeof item === 'string') {
			return {
				id: `legacy_${Date.now()}_${Math.random()}`,
				name: item,
				category: 'infrastructure', // default category for legacy strings
				isCustom: true
			};
		}
		return item;
	}

	// Normalize PPA: handle both string and object formats
	function normalizePPA(item: SitioPPA | string): SitioPPA {
		if (typeof item === 'string') {
			return {
				id: `legacy_${Date.now()}_${Math.random()}`,
				name: item,
				category: 'infrastructure', // default category for legacy strings
				isCustom: true
			};
		}
		return item;
	}

	// Group items by category and return as typed array of entries
	function groupByCategory<T extends { category: CategoryKey }>(
		items: T[]
	): Array<{ category: CategoryKey; items: T[] }> {
		const grouped = new Map<CategoryKey, T[]>();
		for (const item of items) {
			const existing = grouped.get(item.category) || [];
			existing.push(item);
			grouped.set(item.category, existing);
		}
		return Array.from(grouped.entries()).map(([category, items]) => ({ category, items }));
	}

	// Derived: normalized and grouped issues
	const groupedIssues = $derived.by(() => {
		if (!sitio.issues_concerns || sitio.issues_concerns.length === 0) return [];
		const normalized = sitio.issues_concerns.map(normalizeIssue);
		return groupByCategory(normalized);
	});

	// Derived: normalized and grouped PPAs
	const groupedPPAs = $derived.by(() => {
		if (!sitio.proposed_ppas || sitio.proposed_ppas.length === 0) return [];
		const normalized = sitio.proposed_ppas.map(normalizePPA);
		return groupByCategory(normalized);
	});

	// Helper: Get linked PPA names from IDs
	function getLinkedPPANames(ppaIds: string[]): string[] {
		return ppaIds
			.map((id) => {
				const ppa = getPredefinedPPA(id);
				return ppa?.name ?? id;
			})
			.filter(Boolean);
	}

	// Helper: Get linked Issue names from IDs
	function getLinkedIssueNames(issueIds: string[]): string[] {
		return issueIds
			.map((id) => {
				const issue = getPredefinedIssue(id);
				return issue?.name ?? id;
			})
			.filter(Boolean);
	}

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
					{#if sitio.coding}
						<div class="rounded-lg bg-slate-50 p-3">
							<div class="text-xs font-medium tracking-wider text-slate-400 uppercase">
								Sitio Code
							</div>
							<div class="mt-1 font-mono text-base font-semibold text-slate-900">
								{sitio.coding}
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

	<!-- Community Leadership -->
	{#if (sitio.local_officials && sitio.local_officials.length > 0) || (sitio.rst_officials && sitio.rst_officials.length > 0)}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Local Officials -->
			{#if sitio.local_officials && sitio.local_officials.length > 0}
				<Card.Root class="gap-0 py-0 shadow-sm">
					<Card.Header class="border-b bg-amber-50/50 py-6">
						<div class="flex items-center gap-2">
							<div class="rounded-lg bg-amber-100 p-1.5">
								<Crown class="size-4 text-amber-600" />
							</div>
							<Card.Title class="text-lg">Local Officials</Card.Title>
						</div>
						<Card.Description>Community leaders and barangay officials</Card.Description>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="divide-y divide-slate-100">
							{#each sitio.local_officials as official}
								<div class="flex items-center justify-between px-4 py-3 sm:px-6">
									<div class="flex items-center gap-3">
										<div
											class="flex size-9 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700"
										>
											{official.name.charAt(0).toUpperCase()}
										</div>
										<span class="font-medium text-slate-900">{official.name}</span>
									</div>
									<Badge variant="secondary" class="bg-amber-50 text-amber-700">
										{official.position}
									</Badge>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- RST Officials -->
			{#if sitio.rst_officials && sitio.rst_officials.length > 0}
				<Card.Root class="gap-0 py-0 shadow-sm">
					<Card.Header class="border-b bg-indigo-50/50 py-6">
						<div class="flex items-center gap-2">
							<div class="rounded-lg bg-indigo-100 p-1.5">
								<Shield class="size-4 text-indigo-600" />
							</div>
							<Card.Title class="text-lg">RST Officials</Card.Title>
						</div>
						<Card.Description>Resident Support Team members</Card.Description>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="divide-y divide-slate-100">
							{#each sitio.rst_officials as official}
								<div class="flex items-center justify-between px-4 py-3 sm:px-6">
									<div class="flex items-center gap-3">
										<div
											class="flex size-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
										>
											{official.name.charAt(0).toUpperCase()}
										</div>
										<span class="font-medium text-slate-900">{official.name}</span>
									</div>
									<Badge variant="secondary" class="bg-indigo-50 text-indigo-700">
										{official.position}
									</Badge>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	{/if}

	<!-- Community Priorities -->
	{#if (sitio.issues_concerns && sitio.issues_concerns.length > 0) || (sitio.proposed_ppas && sitio.proposed_ppas.length > 0)}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Issues & Concerns -->
			{#if sitio.issues_concerns && sitio.issues_concerns.length > 0}
				<Card.Root
					class="gap-0 py-0 shadow-sm dark:bg-slate-900/50 dark:ring-1 dark:ring-slate-800"
				>
					<Card.Header
						class="border-b bg-rose-50/50 py-6 dark:border-rose-900/50 dark:bg-rose-950/30"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="rounded-lg bg-rose-100 p-1.5 dark:bg-rose-900/50">
									<AlertTriangle class="size-4 text-rose-600 dark:text-rose-400" />
								</div>
								<Card.Title class="text-lg dark:text-slate-100">Issues & Concerns</Card.Title>
							</div>
							<Badge
								variant="outline"
								class="bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
							>
								{sitio.issues_concerns.length} Items
							</Badge>
						</div>
						<Card.Description class="dark:text-slate-400"
							>Priority areas identified by the community</Card.Description
						>
					</Card.Header>
					<Card.Content class="py-4">
						<div class="space-y-4">
							{#each groupedIssues as group}
								{@const colors = categoryColors[group.category]}
								{@const CategoryIcon = categoryIcons[group.category]}
								<div class="space-y-2">
									<!-- Category Header -->
									<div class="flex items-center gap-2">
										<div class="flex items-center gap-1.5 rounded-md px-2 py-1 {colors.bg}">
											<CategoryIcon class="size-3.5 {colors.text}" />
											<span class="text-xs font-semibold {colors.text}">
												{categoryLabels[group.category]}
											</span>
										</div>
										<span class="text-xs text-slate-400 dark:text-slate-500">
											{group.items.length}
											{group.items.length === 1 ? 'issue' : 'issues'}
										</span>
									</div>
									<!-- Issues in this category -->
									<ul class="space-y-1.5 pl-1">
										{#each group.items as issue}
											<li
												class="group flex items-start gap-3 rounded-lg border border-slate-100 bg-white/50 px-3
													py-2.5 transition-colors hover:bg-slate-50/80
													dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50"
											>
												<div class="flex-1">
													<div class="flex items-center gap-2">
														<span class="text-sm font-medium text-slate-700 dark:text-slate-200">
															{issue.name}
														</span>
														{#if issue.isCustom}
															<Sparkles class="size-3.5 text-amber-500 dark:text-amber-400" />
														{/if}
													</div>
													{#if issue.linkedPPAIds && issue.linkedPPAIds.length > 0}
														{@const linkedNames = getLinkedPPANames(issue.linkedPPAIds)}
														<Tooltip.Root>
															<Tooltip.Trigger class="cursor-help">
																<div
																	class="mt-1 flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
																>
																	<Link class="size-3" />
																	<span class="underline decoration-dashed underline-offset-2"
																		>{issue.linkedPPAIds.length} linked PPA{issue.linkedPPAIds
																			.length > 1
																			? 's'
																			: ''}</span
																	>
																</div>
															</Tooltip.Trigger>
															<Tooltip.Content
																side="bottom"
																align="start"
																class="max-w-xs bg-blue-100 text-black shadow-md"
															>
																<div class="space-y-1.5">
																	<p
																		class="text-xs font-semibold text-emerald-600 dark:text-emerald-400"
																	>
																		Linked Programs & Activities:
																	</p>
																	<ul class="space-y-1">
																		{#each linkedNames as name}
																			<li class="flex items-start gap-1.5 text-xs">
																				<Lightbulb
																					class="mt-0.5 size-3 shrink-0 text-emerald-500"
																				/>
																				<span>{name}</span>
																			</li>
																		{/each}
																	</ul>
																</div>
															</Tooltip.Content>
														</Tooltip.Root>
													{/if}
												</div>
											</li>
										{/each}
									</ul>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Proposed PPAs -->
			{#if sitio.proposed_ppas && sitio.proposed_ppas.length > 0}
				<Card.Root
					class="gap-0 py-0 shadow-sm dark:bg-slate-900/50 dark:ring-1 dark:ring-slate-800"
				>
					<Card.Header
						class="border-b bg-emerald-50/50 py-6 dark:border-emerald-900/50 dark:bg-emerald-950/30"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/50">
									<Lightbulb class="size-4 text-emerald-600 dark:text-emerald-400" />
								</div>
								<Card.Title class="text-lg dark:text-slate-100"
									>Proposed Programs & Activities</Card.Title
								>
							</div>
							<Badge
								variant="outline"
								class="bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
							>
								{sitio.proposed_ppas.length} PPAs
							</Badge>
						</div>
						<Card.Description class="dark:text-slate-400"
							>Community-proposed interventions</Card.Description
						>
					</Card.Header>
					<Card.Content class="py-4">
						<div class="space-y-4">
							{#each groupedPPAs as group}
								{@const colors = categoryColors[group.category]}
								{@const CategoryIcon = categoryIcons[group.category]}
								<div class="space-y-2">
									<!-- Category Header -->
									<div class="flex items-center gap-2">
										<div class="flex items-center gap-1.5 rounded-md px-2 py-1 {colors.bg}">
											<CategoryIcon class="size-3.5 {colors.text}" />
											<span class="text-xs font-semibold {colors.text}">
												{categoryLabels[group.category]}
											</span>
										</div>
										<span class="text-xs text-slate-400 dark:text-slate-500">
											{group.items.length}
											{group.items.length === 1 ? 'program' : 'programs'}
										</span>
									</div>
									<!-- PPAs in this category -->
									<ul class="space-y-1.5 pl-1">
										{#each group.items as ppa}
											<li
												class="group flex items-start gap-3 rounded-lg border border-slate-100 bg-white/50 px-3
													py-2.5 transition-colors hover:bg-slate-50/80
													dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50"
											>
												<div class="flex-1">
													<div class="flex items-center gap-2">
														<span class="text-sm font-medium text-slate-700 dark:text-slate-200">
															{ppa.name}
														</span>
														{#if ppa.isCustom}
															<Sparkles class="size-3.5 text-amber-500 dark:text-amber-400" />
														{/if}
													</div>
													{#if ppa.linkedIssueIds && ppa.linkedIssueIds.length > 0}
														{@const linkedNames = getLinkedIssueNames(ppa.linkedIssueIds)}
														<Tooltip.Root>
															<Tooltip.Trigger class="cursor-help">
																<div
																	class="mt-1 flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
																>
																	<Link class="size-3" />
																	<span class="underline decoration-dashed underline-offset-2"
																		>Addresses {ppa.linkedIssueIds.length} issue{ppa.linkedIssueIds
																			.length > 1
																			? 's'
																			: ''}</span
																	>
																</div>
															</Tooltip.Trigger>
															<Tooltip.Content
																side="bottom"
																align="start"
																class="max-w-xs bg-blue-50 text-black shadow-md"
															>
																<div class="space-y-1.5">
																	<p class="text-xs font-semibold text-rose-600 dark:text-rose-400">
																		Addresses These Issues:
																	</p>
																	<ul class="space-y-1">
																		{#each linkedNames as name}
																			<li class="flex items-start gap-1.5 text-xs">
																				<AlertTriangle
																					class="mt-0.5 size-3 shrink-0 text-rose-500"
																				/>
																				<span>{name}</span>
																			</li>
																		{/each}
																	</ul>
																</div>
															</Tooltip.Content>
														</Tooltip.Root>
													{/if}
												</div>
											</li>
										{/each}
									</ul>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	{/if}

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
