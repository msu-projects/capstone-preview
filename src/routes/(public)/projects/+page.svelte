<script lang="ts">
	import { goto } from '$app/navigation';
	import AppBreadcrumb from '$lib/components/AppBreadcrumb.svelte';
	import {
		AggregatedProjectBudgetSection,
		AggregatedProjectOverviewSection,
		AggregatedProjectProgressSection,
		ProjectDashboardSkeleton,
		ProjectsMapSection
	} from '$lib/components/projects/dashboard';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import { categories } from '$lib/config/project-categories';
	import type { Project, Sitio } from '$lib/types';
	import toTitleCase from '$lib/utils/common';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import {
		aggregateByStatus,
		aggregateProjectStats,
		getUniqueMunicipalities,
		getUniqueYears
	} from '$lib/utils/project-aggregation';
	import { loadProjects, loadSitios } from '$lib/utils/storage';
	import {
		Banknote,
		FileText,
		FolderKanban,
		Gauge,
		List,
		Map,
		TrendingUp,
		Users,
		X
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	// Props from +page.ts
	interface Props {
		data: {
			municipality: string;
			category: string;
			status: string;
			year: string;
			tab: string;
		};
	}

	const { data }: Props = $props();

	let projects = $state<Project[]>([]);
	let sitios = $state<Sitio[]>([]);
	let isLoading = $state(true);

	// Filter state synced with URL
	let selectedMunicipality = $derived(data.municipality);
	let selectedCategory = $derived(data.category);
	let selectedStatus = $derived(data.status);
	let selectedYear = $derived(data.year);
	let activeTab = $derived(data.tab);

	onMount(() => {
		projects = loadProjects();
		sitios = loadSitios();
		isLoading = false;
	});

	// Derived values for filter options
	const uniqueYears = $derived(getUniqueYears(projects));
	const uniqueMunicipalities = $derived(getUniqueMunicipalities(projects));

	// Filter projects based on selections
	const filteredProjects = $derived.by(() => {
		return projects.filter((p) => {
			// Year filter
			if (selectedYear !== 'all' && p.project_year.toString() !== selectedYear) {
				return false;
			}

			// Category filter
			if (selectedCategory !== 'all' && p.category_key !== selectedCategory) {
				return false;
			}

			// Status filter
			if (selectedStatus !== 'all' && p.status !== selectedStatus) {
				return false;
			}

			// Municipality filter (via project_sitios)
			if (selectedMunicipality !== 'all') {
				if (!p.project_sitios || p.project_sitios.length === 0) {
					return false;
				}
				const hasMunicipality = p.project_sitios.some(
					(s) => s.municipality === selectedMunicipality
				);
				if (!hasMunicipality) {
					return false;
				}
			}

			return true;
		});
	});

	// Create filter label for display
	const filterLabel = $derived.by(() => {
		const parts: string[] = [];

		if (selectedYear !== 'all') {
			parts.push(selectedYear);
		}
		if (selectedMunicipality !== 'all') {
			parts.push(selectedMunicipality);
		}
		if (selectedCategory !== 'all') {
			const cat = categories.find((c) => c.key === selectedCategory);
			parts.push(cat?.name ?? selectedCategory);
		}
		if (selectedStatus !== 'all') {
			parts.push(toTitleCase(selectedStatus.replace('-', ' ')));
		}

		return parts.length > 0 ? parts.join(' • ') : 'All Projects';
	});

	// Check if filters are active
	const hasActiveFilters = $derived(
		selectedMunicipality !== 'all' ||
			selectedCategory !== 'all' ||
			selectedStatus !== 'all' ||
			selectedYear !== 'all'
	);

	// Summary stats
	const stats = $derived(aggregateProjectStats(filteredProjects));
	const statusDist = $derived(aggregateByStatus(filteredProjects));
	const activeProjectsCount = $derived(
		statusDist.find((s) => s.status === 'in-progress')?.count ?? 0
	);

	// Update URL when filters or tab change
	function updateUrl() {
		const params = new URLSearchParams();
		if (selectedMunicipality !== 'all') params.set('municipality', selectedMunicipality);
		if (selectedCategory !== 'all') params.set('category', selectedCategory);
		if (selectedStatus !== 'all') params.set('status', selectedStatus);
		if (selectedYear !== 'all') params.set('year', selectedYear);
		if (activeTab !== 'overview') params.set('tab', activeTab);

		const queryString = params.toString();
		goto(`/projects${queryString ? `?${queryString}` : ''}`, {
			replaceState: true,
			noScroll: true
		});
	}

	// Handle filter changes
	function handleMunicipalityChange(value: string | undefined) {
		selectedMunicipality = value || 'all';
		updateUrl();
	}

	function handleCategoryChange(value: string | undefined) {
		selectedCategory = value || 'all';
		updateUrl();
	}

	function handleStatusChange(value: string | undefined) {
		selectedStatus = value || 'all';
		updateUrl();
	}

	function handleYearChange(value: string | undefined) {
		selectedYear = value || 'all';
		updateUrl();
	}

	function handleTabChange(value: string) {
		activeTab = value;
		updateUrl();
	}

	function clearFilters() {
		selectedMunicipality = 'all';
		selectedCategory = 'all';
		selectedStatus = 'all';
		selectedYear = 'all';
		updateUrl();
	}

	// Tab configuration
	const tabs = [
		{ id: 'overview', label: 'Overview', icon: FileText },
		{ id: 'budget', label: 'Budget', icon: Banknote },
		{ id: 'progress', label: 'Progress', icon: Gauge },
		{ id: 'map', label: 'Map', icon: Map }
	];
</script>

<svelte:head>
	<title>Projects Dashboard - South Cotabato Data Bank</title>
	<meta
		name="description"
		content="Explore aggregated development project data and analytics across South Cotabato"
	/>
</svelte:head>

<div>
	<!-- Breadcrumb -->
	<AppBreadcrumb items={[{ label: 'Projects Dashboard' }]} sticky={false} />

	<!-- Hero Section -->
	<section
		class="relative overflow-hidden bg-linear-to-br from-slate-50 via-white to-blue-50/30 py-8 md:py-12 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30"
	>
		<div
			class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"
		></div>

		<div class="relative container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<Badge
					variant="secondary"
					class="mb-4 gap-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
				>
					<FolderKanban class="size-3" />
					{filterLabel} Dashboard
				</Badge>
				<h1
					class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-100"
				>
					Projects Dashboard
				</h1>
				<p class="mt-4 text-lg text-slate-600 dark:text-slate-400">
					Aggregated development project data across South Cotabato. Filter by year, municipality,
					or category to explore specific projects.
				</p>

				<!-- View Project List Button -->
				<Button href="/projects/list" variant="default" size="sm" class="mt-5 gap-1.5">
					<List class="size-4" />
					View Project List
				</Button>
			</div>

			<!-- Quick Stats -->
			<div class="mx-auto mt-8 hidden max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4">
				<Card.Root class="relative overflow-hidden border-0 shadow-sm">
					<div
						class="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-blue-500 to-blue-600"
					></div>
					<Card.Content class="pt-5 pb-4">
						<div class="flex items-start justify-between">
							<div class="space-y-1">
								<p class="text-sm font-medium text-slate-500 dark:text-slate-400">
									{hasActiveFilters ? 'Filtered' : 'Total'} Projects
								</p>
								<p class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
									{filteredProjects.length}
								</p>
							</div>
							<div class="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/30">
								<FolderKanban class="size-5 text-blue-600" />
							</div>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root class="relative overflow-hidden border-0 shadow-sm">
					<div
						class="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-emerald-500 to-emerald-600"
					></div>
					<Card.Content class="pt-5 pb-4">
						<div class="flex items-start justify-between">
							<div class="space-y-1">
								<p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Budget</p>
								<p class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
									{formatCurrency(stats.totalBudget)}
								</p>
							</div>
							<div class="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-900/30">
								<Banknote class="size-5 text-emerald-600" />
							</div>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root class="relative overflow-hidden border-0 shadow-sm">
					<div
						class="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-indigo-500 to-indigo-600"
					></div>
					<Card.Content class="pt-5 pb-4">
						<div class="flex items-start justify-between">
							<div class="space-y-1">
								<p class="text-sm font-medium text-slate-500 dark:text-slate-400">Beneficiaries</p>
								<p class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
									{formatNumber(stats.totalBeneficiaries)}
								</p>
							</div>
							<div class="rounded-xl bg-indigo-100 p-2.5 dark:bg-indigo-900/30">
								<Users class="size-5 text-indigo-600" />
							</div>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root class="relative overflow-hidden border-0 shadow-sm">
					<div
						class="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-amber-500 to-amber-600"
					></div>
					<Card.Content class="pt-5 pb-4">
						<div class="flex items-start justify-between">
							<div class="space-y-1">
								<p class="text-sm font-medium text-slate-500 dark:text-slate-400">
									Active Projects
								</p>
								<p class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
									{activeProjectsCount}
								</p>
							</div>
							<div class="rounded-xl bg-amber-100 p-2.5 dark:bg-amber-900/30">
								<TrendingUp class="size-5 text-amber-600" />
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</section>

	<!-- Filter Bar & Tabs -->
	<section class="container mx-auto px-4 py-6">
		<!-- Filter Bar -->
		<div class="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex flex-wrap items-center gap-3">
				<!-- Year Filter -->
				<Select.Root type="single" value={selectedYear} onValueChange={handleYearChange}>
					<Select.Trigger class="w-full sm:w-[120px]">
						{selectedYear === 'all' ? 'All Years' : selectedYear}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Years</Select.Item>
						{#each uniqueYears as year}
							<Select.Item value={year.toString()}>{year}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>

				<!-- Municipality Filter -->
				<Select.Root
					type="single"
					value={selectedMunicipality}
					onValueChange={handleMunicipalityChange}
				>
					<Select.Trigger class="w-full sm:w-[180px]">
						{selectedMunicipality === 'all' ? 'All Municipalities' : selectedMunicipality}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Municipalities</Select.Item>
						{#each uniqueMunicipalities as municipality}
							<Select.Item value={municipality}>{municipality}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>

				<!-- Category Filter -->
				<Select.Root type="single" value={selectedCategory} onValueChange={handleCategoryChange}>
					<Select.Trigger class="w-full sm:w-40">
						{selectedCategory === 'all'
							? 'All Categories'
							: (categories.find((c) => c.key === selectedCategory)?.name ?? selectedCategory)}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Categories</Select.Item>
						{#each categories as category}
							<Select.Item value={category.key}>{category.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>

				<!-- Status Filter -->
				<Select.Root type="single" value={selectedStatus} onValueChange={handleStatusChange}>
					<Select.Trigger class="w-full sm:w-[140px]">
						{selectedStatus === 'all'
							? 'All Status'
							: toTitleCase(selectedStatus.replace('-', ' '))}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Status</Select.Item>
						<Select.Item value="planning">Planning</Select.Item>
						<Select.Item value="in-progress">In Progress</Select.Item>
						<Select.Item value="completed">Completed</Select.Item>
						<Select.Item value="suspended">Suspended</Select.Item>
					</Select.Content>
				</Select.Root>

				<!-- Clear Filters -->
				{#if hasActiveFilters}
					<Button variant="ghost" size="sm" onclick={clearFilters} class="gap-1.5">
						<X class="size-4" />
						Clear Filters
					</Button>
				{/if}
			</div>

			<div class="flex items-center gap-3">
				<!-- Current filter label -->
				{#if hasActiveFilters}
					<Badge variant="secondary" class="gap-1.5">
						<FolderKanban class="size-3" />
						{filterLabel}
					</Badge>
				{/if}
			</div>
		</div>

		<!-- Loading State -->
		{#if isLoading}
			<ProjectDashboardSkeleton />
		{:else if filteredProjects.length === 0}
			<!-- Empty State -->
			<Card.Root class="py-16 text-center">
				<Card.Content>
					<div
						class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
					>
						<FolderKanban class="size-8 text-slate-400" />
					</div>
					<h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
						No Projects Found
					</h3>
					<p class="mt-2 text-slate-500 dark:text-slate-400">
						No projects match your current filter criteria. Try adjusting your filters.
					</p>
					<Button onclick={clearFilters} class="mt-4">Clear Filters</Button>
				</Card.Content>
			</Card.Root>
		{:else}
			<!-- Tabs -->
			<Tabs.Root bind:value={activeTab} onValueChange={handleTabChange}>
				<div
					class="sticky top-0 z-50 -mx-4 bg-linear-to-b from-slate-50 to-transparent px-4 pt-2 pb-2 sm:-mx-6 sm:px-6 dark:from-slate-900"
				>
					<Tabs.List
						class="inline-flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200/50 dark:bg-slate-800 dark:ring-slate-700/50"
					>
						{#each tabs as tab}
							<Tabs.Trigger
								value={tab.id}
								class="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
							>
								<tab.icon class="size-4" />
								<span class="hidden sm:inline">{tab.label}</span>
							</Tabs.Trigger>
						{/each}
					</Tabs.List>
				</div>

				<div class="mt-3">
					<Tabs.Content
						value="overview"
						class="animate-in duration-300 fade-in slide-in-from-bottom-2"
					>
						<AggregatedProjectOverviewSection projects={filteredProjects} {filterLabel} />
					</Tabs.Content>

					<Tabs.Content
						value="budget"
						class="animate-in duration-300 fade-in slide-in-from-bottom-2"
					>
						<AggregatedProjectBudgetSection projects={filteredProjects} {filterLabel} />
					</Tabs.Content>

					<Tabs.Content
						value="progress"
						class="animate-in duration-300 fade-in slide-in-from-bottom-2"
					>
						<AggregatedProjectProgressSection projects={filteredProjects} {filterLabel} />
					</Tabs.Content>

					<Tabs.Content value="map" class="animate-in duration-300 fade-in slide-in-from-bottom-2">
						<ProjectsMapSection
							projects={filteredProjects}
							currentTab={activeTab}
							{sitios}
							{filterLabel}
						/>
					</Tabs.Content>
				</div>
			</Tabs.Root>
		{/if}
	</section>
</div>
