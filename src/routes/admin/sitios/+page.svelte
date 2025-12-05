<script lang="ts">
	import { goto } from '$app/navigation';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import {
		AggregatedDemographicsSection,
		AggregatedEconomySection,
		AggregatedInfrastructureSection,
		AggregatedOverviewSection,
		AggregatedSocialSection,
		DashboardSkeleton,
		SitiosMapSection
	} from '$lib/components/sitios/dashboard';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { Project, Sitio } from '$lib/types';
	import toTitleCase from '$lib/utils/common';
	import { loadProjects, loadSitios } from '$lib/utils/storage';
	import {
		Briefcase,
		Building2,
		FileText,
		Heart,
		List,
		Map,
		MapPin,
		Plus,
		Upload,
		Users,
		X
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	// Props from +page.ts
	interface Props {
		data: {
			municipality: string;
			barangay: string;
			tab: string;
		};
	}

	const { data }: Props = $props();

	let sitios = $state<Sitio[]>([]);
	let projects = $state<Project[]>([]);
	let isLoading = $state(true);

	// Filter state synced with URL
	let selectedMunicipality = $state(data.municipality);
	let selectedBarangay = $state(data.barangay);
	let activeTab = $state(data.tab);

	// Sync state when data changes (e.g., browser back/forward)
	$effect(() => {
		selectedMunicipality = data.municipality;
		selectedBarangay = data.barangay;
		activeTab = data.tab;
	});

	onMount(() => {
		sitios = loadSitios();
		projects = loadProjects();
		isLoading = false;
	});

	// Derived values for filter options
	let uniqueMunicipalities = $derived(
		Array.from(new Set(sitios.map((s) => s.municipality))).sort()
	);
	let uniqueBarangays = $derived(
		Array.from(
			new Set(
				sitios
					.filter((s) => selectedMunicipality === 'all' || s.municipality === selectedMunicipality)
					.map((s) => s.barangay)
			)
		).sort()
	);

	// Filter sitios based on selections
	const filteredSitios = $derived.by(() => {
		return sitios.filter((s) => {
			if (selectedMunicipality !== 'all' && s.municipality !== selectedMunicipality) {
				return false;
			}
			if (selectedBarangay !== 'all' && s.barangay !== selectedBarangay) {
				return false;
			}
			return true;
		});
	});

	// Filter projects based on their associated sitios matching the selected filters
	const filteredProjects = $derived.by(() => {
		if (selectedMunicipality === 'all' && selectedBarangay === 'all') {
			return projects;
		}
		return projects.filter((p) => {
			if (!p.project_sitios || p.project_sitios.length === 0) return false;
			return p.project_sitios.some((ps) => {
				if (selectedMunicipality !== 'all' && ps.municipality !== selectedMunicipality) {
					return false;
				}
				if (selectedBarangay !== 'all' && ps.barangay !== selectedBarangay) {
					return false;
				}
				return true;
			});
		});
	});

	// Create filter label for display
	const filterLabel = $derived.by(() => {
		if (selectedMunicipality === 'all') return 'All Sitios';
		if (selectedBarangay === 'all') return selectedMunicipality;
		return `${selectedBarangay}, ${selectedMunicipality}`;
	});

	// Check if filters are active
	const hasActiveFilters = $derived(selectedMunicipality !== 'all' || selectedBarangay !== 'all');

	// Update URL when filters or tab change
	function updateUrl() {
		const params = new URLSearchParams();
		if (selectedMunicipality !== 'all') params.set('municipality', selectedMunicipality);
		if (selectedBarangay !== 'all') params.set('barangay', selectedBarangay);
		if (activeTab !== 'overview') params.set('tab', activeTab);

		const queryString = params.toString();
		goto(`/admin/sitios${queryString ? `?${queryString}` : ''}`, {
			replaceState: true,
			noScroll: true
		});
	}

	// Handle filter changes
	function handleMunicipalityChange(value: string | undefined) {
		selectedMunicipality = value || 'all';
		selectedBarangay = 'all'; // Reset barangay when municipality changes
		updateUrl();
	}

	function handleBarangayChange(value: string | undefined) {
		selectedBarangay = value || 'all';
		updateUrl();
	}

	function handleTabChange(value: string) {
		activeTab = value;
		updateUrl();
	}

	function clearFilters() {
		selectedMunicipality = 'all';
		selectedBarangay = 'all';
		updateUrl();
	}

	// Tab configuration
	const tabs = [
		{ id: 'overview', label: 'Overview', icon: FileText },
		{ id: 'demographics', label: 'Demographics', icon: Users },
		{ id: 'infrastructure', label: 'Infrastructure', icon: Building2 },
		{ id: 'social', label: 'Social', icon: Heart },
		{ id: 'economy', label: 'Economy', icon: Briefcase },
		{ id: 'map', label: 'Map', icon: Map }
	];
</script>

<svelte:head>
	<title>Sitio Dashboard - Admin</title>
	<meta
		name="description"
		content="Admin dashboard for sitio data and community indicators across South Cotabato"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<AdminHeader title="Sitio Dashboard" description="Aggregated sitio analytics and insights">
		{#snippet actions()}
			<Button variant="outline" onclick={() => goto('/admin/sitios/list')} size="sm">
				<List class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Manage Sitios</span>
			</Button>
			<Button variant="outline" onclick={() => goto('/admin/import')} size="sm">
				<Upload class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Import Data</span>
			</Button>
			<Button onclick={() => goto('/admin/sitios/new')} size="sm">
				<Plus class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Add Sitio</span>
			</Button>
		{/snippet}
	</AdminHeader>

	<!-- Content -->
	<div class="flex-1 space-y-4 p-6">
		<!-- Filter Bar -->
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex flex-wrap items-center gap-3">
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

				<!-- Barangay Filter -->
				<Select.Root type="single" value={selectedBarangay} onValueChange={handleBarangayChange}>
					<Select.Trigger class="w-full sm:w-[180px]">
						{selectedBarangay === 'all' ? 'All Barangays' : selectedBarangay}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Barangays</Select.Item>
						{#each uniqueBarangays as barangay}
							<Select.Item value={barangay}>{barangay}</Select.Item>
						{/each}
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
						<MapPin class="size-3" />
						{toTitleCase(filterLabel)}
					</Badge>
				{/if}
			</div>
		</div>

		<!-- Loading State -->
		{#if isLoading}
			<DashboardSkeleton />
		{:else if filteredSitios.length === 0}
			<!-- Empty State -->
			<Card.Root class="py-16 text-center">
				<Card.Content>
					<div
						class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
					>
						<MapPin class="size-8 text-slate-400" />
					</div>
					<h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">No Sitios Found</h3>
					<p class="mt-2 text-slate-500 dark:text-slate-400">
						No sitios match your current filter criteria. Try adjusting your filters.
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
						<AggregatedOverviewSection
							sitios={filteredSitios}
							projects={filteredProjects}
							filterLabel={toTitleCase(filterLabel)}
						/>
					</Tabs.Content>

					<Tabs.Content
						value="demographics"
						class="animate-in duration-300 fade-in slide-in-from-bottom-2"
					>
						<AggregatedDemographicsSection sitios={filteredSitios} />
					</Tabs.Content>

					<Tabs.Content
						value="infrastructure"
						class="animate-in duration-300 fade-in slide-in-from-bottom-2"
					>
						<AggregatedInfrastructureSection sitios={filteredSitios} />
					</Tabs.Content>

					<Tabs.Content
						value="social"
						class="animate-in duration-300 fade-in slide-in-from-bottom-2"
					>
						<AggregatedSocialSection sitios={filteredSitios} />
					</Tabs.Content>

					<Tabs.Content
						value="economy"
						class="animate-in duration-300 fade-in slide-in-from-bottom-2"
					>
						<AggregatedEconomySection sitios={filteredSitios} />
					</Tabs.Content>

					<Tabs.Content value="map" class="animate-in duration-300 fade-in slide-in-from-bottom-2">
						<SitiosMapSection sitios={filteredSitios} currentTab={activeTab} />
					</Tabs.Content>
				</div>
			</Tabs.Root>
		{/if}
	</div>
</div>
