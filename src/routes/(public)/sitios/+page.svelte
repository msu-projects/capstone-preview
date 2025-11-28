<script lang="ts">
	import { goto } from '$app/navigation';
	import PublicFooter from '$lib/components/public/PublicFooter.svelte';
	import PublicHeader from '$lib/components/public/PublicHeader.svelte';
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
	import { formatNumber } from '$lib/utils/formatters';
	import { loadProjects, loadSitios } from '$lib/utils/storage';
	import {
		Briefcase,
		Building2,
		FileText,
		Heart,
		Home,
		Landmark,
		List,
		Map,
		MapPin,
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

	// Summary stats
	const totalPopulation = $derived(filteredSitios.reduce((sum, s) => sum + s.population, 0));
	const totalHouseholds = $derived(filteredSitios.reduce((sum, s) => sum + s.households, 0));

	// Update URL when filters or tab change
	function updateUrl() {
		const params = new URLSearchParams();
		if (selectedMunicipality !== 'all') params.set('municipality', selectedMunicipality);
		if (selectedBarangay !== 'all') params.set('barangay', selectedBarangay);
		if (activeTab !== 'overview') params.set('tab', activeTab);

		const queryString = params.toString();
		goto(`/sitios${queryString ? `?${queryString}` : ''}`, { replaceState: true, noScroll: true });
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
	<title>Sitios Dashboard - South Cotabato Data Bank</title>
	<meta
		name="description"
		content="Explore aggregated sitio data and community indicators across South Cotabato"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<PublicHeader />

	<main class="flex-1">
		<!-- Hero Section -->
		<section
			class="relative overflow-hidden bg-linear-to-br from-slate-50 via-white to-blue-50/30 py-8 md:py-12"
		>
			<div
				class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"
			></div>

			<div class="relative container mx-auto px-4">
				<div class="mx-auto max-w-3xl text-center">
					<Badge variant="secondary" class="mb-4 gap-1.5 bg-blue-50 text-blue-700">
						<MapPin class="size-3" />
						{toTitleCase(filterLabel) || 'All Sitios'} Data Dashboard
					</Badge>
					<h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
						Sitio Dashboard
					</h1>
					<p class="mt-4 text-lg text-slate-600">
						Aggregated community data across South Cotabato. Filter by municipality or barangay to
						explore specific areas.
					</p>
				</div>

				<!-- Quick Stats -->
				<div class="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
					<Card.Root class="relative overflow-hidden border-0 shadow-sm">
						<div
							class="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-blue-500 to-blue-600"
						></div>
						<Card.Content class="pt-5 pb-4">
							<div class="flex items-start justify-between">
								<div class="space-y-1">
									<p class="text-sm font-medium text-slate-500">
										{hasActiveFilters ? 'Filtered Sitios' : 'Total Sitios'}
									</p>
									<p class="text-2xl font-bold tracking-tight text-slate-900">
										{filteredSitios.length}
									</p>
								</div>
								<div class="rounded-xl bg-blue-100 p-2.5">
									<MapPin class="size-5 text-blue-600" />
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
									<p class="text-sm font-medium text-slate-500">Population</p>
									<p class="text-2xl font-bold tracking-tight text-slate-900">
										{formatNumber(totalPopulation)}
									</p>
								</div>
								<div class="rounded-xl bg-indigo-100 p-2.5">
									<Users class="size-5 text-indigo-600" />
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
									<p class="text-sm font-medium text-slate-500">Households</p>
									<p class="text-2xl font-bold tracking-tight text-slate-900">
										{formatNumber(totalHouseholds)}
									</p>
								</div>
								<div class="rounded-xl bg-emerald-100 p-2.5">
									<Home class="size-5 text-emerald-600" />
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
									<p class="text-sm font-medium text-slate-500">Municipalities</p>
									<p class="text-2xl font-bold tracking-tight text-slate-900">
										{uniqueMunicipalities.length}
									</p>
								</div>
								<div class="rounded-xl bg-amber-100 p-2.5">
									<Landmark class="size-5 text-amber-600" />
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
							{filterLabel}
						</Badge>
					{/if}

					<!-- View Sitio List Button -->
					<Button href="/sitios/list" variant="outline" size="sm" class="gap-1.5">
						<List class="size-4" />
						View Sitio List
					</Button>
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
							class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100"
						>
							<MapPin class="size-8 text-slate-400" />
						</div>
						<h3 class="text-lg font-semibold text-slate-900">No Sitios Found</h3>
						<p class="mt-2 text-slate-500">
							No sitios match your current filter criteria. Try adjusting your filters.
						</p>
						<Button onclick={clearFilters} class="mt-4">Clear Filters</Button>
					</Card.Content>
				</Card.Root>
			{:else}
				<!-- Tabs -->
				<Tabs.Root value={activeTab} onValueChange={handleTabChange}>
					<div
						class="sticky top-0 z-50 -mx-4 bg-linear-to-b from-slate-50 to-transparent px-4 pt-2 pb-2 sm:-mx-6 sm:px-6"
					>
						<Tabs.List
							class="inline-flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200/50"
						>
							{#each tabs as tab}
								<Tabs.Trigger
									value={tab.id}
									class="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
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
							<AggregatedOverviewSection sitios={filteredSitios} projects={filteredProjects} />
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

						<Tabs.Content
							value="map"
							class="animate-in duration-300 fade-in slide-in-from-bottom-2"
						>
							<SitiosMapSection sitios={filteredSitios} />
						</Tabs.Content>
					</div>
				</Tabs.Root>
			{/if}
		</section>
	</main>

	<PublicFooter />
</div>
