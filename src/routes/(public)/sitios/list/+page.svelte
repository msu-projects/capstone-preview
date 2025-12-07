<script lang="ts">
	import AppBreadcrumb from '$lib/components/AppBreadcrumb.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { NeedLevel, Sitio } from '$lib/types';
	import { getNeedLevelFromScore } from '$lib/types';
	import { formatNumber } from '$lib/utils/formatters';
	import { loadSitios } from '$lib/utils/storage';
	import { ArrowLeft, ArrowRight, Gauge, Home, MapPin, Search, Users, Zap } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let sitios = $state<Sitio[]>([]);
	let isLoading = $state(true);
	let searchTerm = $state('');
	let selectedMunicipality = $state<string>('all');
	let selectedBarangay = $state<string>('all');
	let sortBy = $state<string>('name');
	let currentPage = $state(1);
	const itemsPerPage = 12;

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

	onMount(() => {
		sitios = loadSitios();
		isLoading = false;
	});

	// Filter sitios
	const filteredSitios = $derived.by(() => {
		let filtered = sitios.filter((s) => {
			// Municipality filter
			if (selectedMunicipality !== 'all' && s.municipality !== selectedMunicipality) {
				return false;
			}

			// Barangay filter
			if (selectedBarangay !== 'all' && s.barangay !== selectedBarangay) {
				return false;
			}

			// Search term filter
			if (searchTerm) {
				const term = searchTerm.toLowerCase();
				return (
					s.name.toLowerCase().includes(term) ||
					s.municipality.toLowerCase().includes(term) ||
					s.barangay.toLowerCase().includes(term)
				);
			}

			return true;
		});

		// Sort the filtered results
		return filtered.sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.name.localeCompare(b.name);
				case 'population-high':
					return b.population - a.population;
				case 'population-low':
					return a.population - b.population;
				case 'households-high':
					return b.households - a.households;
				case 'households-low':
					return a.households - b.households;
				case 'need-high':
					return (b.need_score ?? 5) - (a.need_score ?? 5);
				case 'need-low':
					return (a.need_score ?? 5) - (b.need_score ?? 5);
				default:
					return 0;
			}
		});
	});

	// Paginate
	const totalPages = $derived(Math.ceil(filteredSitios.length / itemsPerPage));
	const paginatedSitios = $derived(
		filteredSitios.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	// Calculate electricity coverage for a sitio
	function getElectricityCoverage(sitio: Sitio): number {
		if (!sitio.utilities || sitio.households <= 0) return 0;
		return (sitio.utilities.households_with_electricity / sitio.households) * 100;
	}

	// Get need level configuration
	const needLevelConfig: Record<
		NeedLevel,
		{ label: string; bgClass: string; textClass: string; borderClass: string }
	> = {
		critical: {
			label: 'Critical',
			bgClass: 'bg-red-50 dark:bg-red-950/30',
			textClass: 'text-red-700 dark:text-red-400',
			borderClass: 'border-red-200 dark:border-red-800'
		},
		high: {
			label: 'High',
			bgClass: 'bg-orange-50 dark:bg-orange-950/30',
			textClass: 'text-orange-700 dark:text-orange-400',
			borderClass: 'border-orange-200 dark:border-orange-800'
		},
		medium: {
			label: 'Medium',
			bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
			textClass: 'text-yellow-700 dark:text-yellow-400',
			borderClass: 'border-yellow-200 dark:border-yellow-800'
		},
		low: {
			label: 'Low',
			bgClass: 'bg-green-50 dark:bg-green-950/30',
			textClass: 'text-green-700 dark:text-green-400',
			borderClass: 'border-green-200 dark:border-green-800'
		}
	};

	function getNeedConfig(sitio: Sitio) {
		const needScore = sitio.need_score ?? 5;
		const needLevel = sitio.need_level ?? getNeedLevelFromScore(needScore);
		return { needScore, needLevel, config: needLevelConfig[needLevel] };
	}

	// Handle filter changes
	function handleMunicipalityChange(value: string | undefined) {
		selectedMunicipality = value || 'all';
		selectedBarangay = 'all';
		currentPage = 1;
	}

	function handleBarangayChange(value: string | undefined) {
		selectedBarangay = value || 'all';
		currentPage = 1;
	}

	function handleSortChange(value: string | undefined) {
		sortBy = value || 'name';
		currentPage = 1;
	}
</script>

<svelte:head>
	<title>All Sitios - South Cotabato Data Bank</title>
	<meta
		name="description"
		content="Browse all sitio profiles and community data across South Cotabato"
	/>
</svelte:head>

<div class="min-h-screen bg-slate-50/50 dark:bg-slate-950">
	<!-- Breadcrumb -->
	<AppBreadcrumb
		items={[{ label: 'Sitios Dashboard', href: '/sitios' }, { label: 'All Sitios' }]}
	/>

	<!-- Header -->
	<section class="border-b bg-white py-6">
		<div class="container mx-auto px-4">
			<div class="flex items-center gap-4">
				<Button href="/sitios" variant="ghost" size="icon" class="shrink-0">
					<ArrowLeft class="size-5" />
				</Button>
				<div class="flex-1">
					<h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">All Sitios</h1>
					<p class="mt-1 text-slate-600">
						Browse and search through all registered sitios in South Cotabato
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Filters & Grid -->
	<section class="container mx-auto px-4 py-6">
		<!-- Filters -->
		<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex flex-1 flex-wrap gap-3">
				<!-- Search -->
				<div class="relative w-full sm:max-w-xs">
					<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search sitios..."
						bind:value={searchTerm}
						class="pl-9"
					/>
				</div>

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

				<!-- Sort Filter -->
				<Select.Root type="single" value={sortBy} onValueChange={handleSortChange}>
					<Select.Trigger class="w-full sm:w-[200px]">
						{#if sortBy === 'name'}
							Sort: Name (A-Z)
						{:else if sortBy === 'population-high'}
							Sort: Population (High-Low)
						{:else if sortBy === 'population-low'}
							Sort: Population (Low-High)
						{:else if sortBy === 'households-high'}
							Sort: Households (High-Low)
						{:else if sortBy === 'households-low'}
							Sort: Households (Low-High)
						{:else if sortBy === 'need-high'}
							Sort: Need Score (High-Low)
						{:else if sortBy === 'need-low'}
							Sort: Need Score (Low-High)
						{/if}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="name">Name (A-Z)</Select.Item>
						<Select.Item value="need-high">Need Score (High-Low)</Select.Item>
						<Select.Item value="need-low">Need Score (Low-High)</Select.Item>
						<Select.Item value="population-high">Population (High-Low)</Select.Item>
						<Select.Item value="population-low">Population (Low-High)</Select.Item>
						<Select.Item value="households-high">Households (High-Low)</Select.Item>
						<Select.Item value="households-low">Households (Low-High)</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="text-sm text-muted-foreground">
				Showing {paginatedSitios.length} of {filteredSitios.length} sitios
			</div>
		</div>

		<!-- Loading State -->
		{#if isLoading}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each Array(8) as _}
					<Card.Root class="overflow-hidden">
						<Card.Content class="pt-5">
							<div class="mb-3 flex items-start justify-between">
								<div class="space-y-2">
									<Skeleton class="h-5 w-32" />
									<Skeleton class="h-4 w-24" />
								</div>
								<Skeleton class="h-5 w-16" />
							</div>
							<div class="grid grid-cols-3 gap-2">
								{#each Array(3) as _}
									<Skeleton class="h-16 w-full rounded-lg" />
								{/each}
							</div>
							<Skeleton class="mt-4 h-9 w-full" />
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{:else if paginatedSitios.length === 0}
			<!-- Empty State -->
			<Card.Root class="py-12 text-center">
				<Card.Content>
					<div
						class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100"
					>
						<MapPin class="size-6 text-slate-400" />
					</div>
					<h3 class="text-lg font-semibold text-slate-900">No Sitios Found</h3>
					<p class="mt-1 text-slate-500">Try adjusting your search or filter criteria.</p>
					<Button
						variant="outline"
						class="mt-4"
						onclick={() => {
							searchTerm = '';
							selectedMunicipality = 'all';
							selectedBarangay = 'all';
							sortBy = 'name';
						}}
					>
						Clear Filters
					</Button>
				</Card.Content>
			</Card.Root>
		{:else}
			<!-- Sitios Grid -->
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each paginatedSitios as sitio}
					{@const electricityCoverage = getElectricityCoverage(sitio)}
					{@const { needScore, needLevel, config: needConfig } = getNeedConfig(sitio)}
					<Card.Root class="group relative overflow-hidden transition-all hover:shadow-lg">
						<div
							class="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-blue-500 to-indigo-500"
						></div>
						<Card.Content class="">
							<div class="mb-3 flex items-start justify-between gap-2">
								<div class="flex-1">
									<h3
										class="font-semibold text-slate-900 transition-colors group-hover:text-blue-600"
									>
										{sitio.name}
									</h3>
									<p class="text-sm text-slate-500">
										{sitio.barangay}, {sitio.municipality}
									</p>
								</div>
								<div class="flex shrink-0 flex-col items-end gap-1">
									{#if sitio.coding}
										<Badge variant="outline" class="font-mono text-xs">{sitio.coding}</Badge>
									{/if}
									<!-- Need Score Badge -->
									<Badge
										variant="outline"
										class="gap-1 border-2 {needConfig.bgClass} {needConfig.textClass} {needConfig.borderClass}"
									>
										<Gauge class="size-3" />
										<span class="font-bold">{needScore}</span>
									</Badge>
								</div>
							</div>

							<div class="grid grid-cols-3 gap-2 text-center">
								<div class="rounded-lg bg-slate-50 p-2">
									<Users class="mx-auto mb-1 size-4 text-blue-500" />
									<div class="text-sm font-semibold">{formatNumber(sitio.population)}</div>
									<div class="text-xs text-slate-500">Population</div>
								</div>
								<div class="rounded-lg bg-slate-50 p-2">
									<Home class="mx-auto mb-1 size-4 text-indigo-500" />
									<div class="text-sm font-semibold">{formatNumber(sitio.households)}</div>
									<div class="text-xs text-slate-500">Households</div>
								</div>
								<div class="rounded-lg bg-slate-50 p-2">
									<Zap class="mx-auto mb-1 size-4 text-amber-500" />
									<div class="text-sm font-semibold">{electricityCoverage.toFixed(0)}%</div>
									<div class="text-xs text-slate-500">Electricity</div>
								</div>
							</div>

							<Button
								href="/sitios/{sitio.id}"
								variant="ghost"
								class="mt-4 w-full group-hover:bg-blue-50 group-hover:text-blue-600"
							>
								View Profile
								<ArrowRight class="ml-2 size-4 transition-transform group-hover:translate-x-1" />
							</Button>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="mt-8 flex items-center justify-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === 1}
						onclick={() => (currentPage = Math.max(1, currentPage - 1))}
					>
						<ArrowLeft class="mr-1 size-4" />
						Previous
					</Button>
					<div class="flex items-center gap-1">
						{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
							return start + i;
						}).filter((p) => p <= totalPages) as pageNum}
							<Button
								variant={currentPage === pageNum ? 'default' : 'outline'}
								size="sm"
								class="w-10"
								onclick={() => (currentPage = pageNum)}
							>
								{pageNum}
							</Button>
						{/each}
					</div>
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === totalPages}
						onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
					>
						Next
						<ArrowRight class="ml-1 size-4" />
					</Button>
				</div>
			{/if}
		{/if}
	</section>
</div>
