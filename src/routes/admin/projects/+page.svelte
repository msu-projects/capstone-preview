<script lang="ts">
	import { goto } from '$app/navigation';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
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
	import { authStore } from '$lib/stores/auth.svelte';
	import type { Project, Sitio } from '$lib/types';
	import toTitleCase from '$lib/utils/common';
	import { downloadProjectMonitoringPDF } from '$lib/utils/pdf-generator';
	import {
		aggregateByStatus,
		getUniqueMunicipalities,
		getUniqueYears
	} from '$lib/utils/project-aggregation';
	import { loadProjects, loadSitios } from '$lib/utils/storage';
	import {
		Banknote,
		Download,
		FileText,
		FolderKanban,
		Gauge,
		List,
		Map,
		Plus,
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
	let selectedMunicipality = $state(data.municipality);
	let selectedCategory = $state(data.category);
	let selectedStatus = $state(data.status);
	let selectedYear = $state(data.year);
	let activeTab = $state(data.tab);

	// Sync state when data changes (e.g., browser back/forward)
	$effect(() => {
		selectedMunicipality = data.municipality;
		selectedCategory = data.category;
		selectedStatus = data.status;
		selectedYear = data.year;
		activeTab = data.tab;
	});

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

	// Status summary for quick stats
	const statusDist = $derived(aggregateByStatus(filteredProjects));
	const activeProjectsCount = $derived(statusDist.find((s) => s.status === 'ongoing')?.count ?? 0);

	// Update URL when filters or tab change
	function updateUrl() {
		const params = new URLSearchParams();
		if (selectedMunicipality !== 'all') params.set('municipality', selectedMunicipality);
		if (selectedCategory !== 'all') params.set('category', selectedCategory);
		if (selectedStatus !== 'all') params.set('status', selectedStatus);
		if (selectedYear !== 'all') params.set('year', selectedYear);
		if (activeTab !== 'overview') params.set('tab', activeTab);

		const queryString = params.toString();
		goto(`/admin/projects${queryString ? `?${queryString}` : ''}`, {
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

	function handleExport() {
		const projectsToExport = filteredProjects.length > 0 ? filteredProjects : projects;
		downloadProjectMonitoringPDF(projectsToExport, '3rd');
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
	<title>Project Dashboard - Admin</title>
	<meta
		name="description"
		content="Admin dashboard for project data and analytics across South Cotabato"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<AdminHeader title="Project Dashboard" description="Aggregated project analytics and insights">
		{#snippet actions()}
			<Button variant="outline" onclick={() => goto('/admin/projects/list')} size="sm">
				<List class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Manage Projects</span>
			</Button>
			<Button variant="outline" size="sm" onclick={handleExport}>
				<Download class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Export</span>
			</Button>
			{#if authStore.canPerform('projects', 'write')}
				<Button onclick={() => goto('/admin/projects/new')} size="sm">
					<Plus class="size-4 sm:mr-2" />
					<span class="hidden sm:inline">New Project</span>
				</Button>
			{/if}
		{/snippet}
	</AdminHeader>

	<!-- Content -->
	<div class="flex-1 space-y-4 p-6">
		<!-- Filter Bar -->
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
					<div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
						<FolderKanban class="size-8 text-muted-foreground" />
					</div>
					<h3 class="text-lg font-semibold">No Projects Found</h3>
					<p class="mt-2 text-muted-foreground">
						No projects match your current filter criteria. Try adjusting your filters.
					</p>
					<Button onclick={clearFilters} class="mt-4">Clear Filters</Button>
				</Card.Content>
			</Card.Root>
		{:else}
			<!-- Tabs -->
			<Tabs.Root value={activeTab} onValueChange={handleTabChange}>
				<div class="sticky top-0 z-50 -mx-6 bg-muted/30 px-6 pt-2 pb-2 backdrop-blur-sm">
					<Tabs.List
						class="inline-flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-background p-1.5 shadow-sm ring-1 ring-border"
					>
						{#each tabs as tab}
							<Tabs.Trigger
								value={tab.id}
								class="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
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
	</div>
</div>
