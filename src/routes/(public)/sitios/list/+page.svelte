<script lang="ts">
	import AppBreadcrumb from '$lib/components/AppBreadcrumb.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Tabs from '$lib/components/ui/tabs';
	import { getNeedLevelBadgeClasses, getNeedLevelConfig } from '$lib/config/status-config';
	import type { Sitio } from '$lib/types';
	import { getNeedLevelFromScore } from '$lib/types';
	import { cn } from '$lib/utils';
	import { formatNumber } from '$lib/utils/formatters';
	import { loadSitios } from '$lib/utils/storage';
	import {
		ArrowLeft,
		ArrowRight,
		Gauge,
		Grid3x3,
		Heart,
		Home,
		Lightbulb,
		List,
		MapPin,
		Search,
		Users,
		Zap
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	let sitios = $state<Sitio[]>([]);
	let isLoading = $state(true);
	let searchTerm = $state('');
	let selectedMunicipality = $state<string>('all');
	let selectedBarangay = $state<string>('all');
	let sortBy = $state<string>('name');
	let currentPage = $state(1);
	let viewMode = $state<'grid' | 'list'>('grid');
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
	function getNeedConfig(sitio: Sitio) {
		const needScore = sitio.need_score ?? 5;
		const needLevel = sitio.need_level ?? getNeedLevelFromScore(needScore);
		const config = getNeedLevelConfig(needLevel);
		return { needScore, needLevel, config };
	}

	// Get highlights for sitio
	function getSitioHighlights(sitio: Sitio): Array<{ label: string; value: string; icon: any }> {
		const highlights = [];

		// PhilHealth coverage
		if (sitio.social_services?.philhealth_beneficiaries) {
			const coverage =
				sitio.population > 0
					? ((sitio.social_services.philhealth_beneficiaries / sitio.population) * 100).toFixed(0)
					: '0';
			highlights.push({ label: 'PhilHealth', value: `${coverage}%`, icon: Heart });
		}

		// Infrastructure access
		if (sitio.utilities?.households_with_electricity) {
			const coverage = getElectricityCoverage(sitio).toFixed(0);
			highlights.push({ label: 'Electricity', value: `${coverage}%`, icon: Zap });
		}

		// 4Ps beneficiaries
		if (sitio.social_services?.fourps_beneficiaries) {
			highlights.push({
				label: '4Ps',
				value: formatNumber(sitio.social_services.fourps_beneficiaries),
				icon: Users
			});
		}

		return highlights.slice(0, 3);
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

<div
	class="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20"
>
	<!-- Breadcrumb -->
	<AppBreadcrumb
		items={[{ label: 'Sitios Dashboard', href: '/sitios' }, { label: 'All Sitios' }]}
	/>

	<!-- Header -->
	<section class="border-b bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
		<div class="container mx-auto px-4">
			<div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-4">
					<Button href="/sitios" variant="ghost" size="icon" class="shrink-0">
						<ArrowLeft class="size-5" />
					</Button>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<h1
								class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100"
							>
								All Sitios
							</h1>
							<Badge variant="secondary" class="gap-1">
								<MapPin class="size-3" />
								{filteredSitios.length}
								{filteredSitios.length === 1 ? 'sitio' : 'sitios'}
							</Badge>
						</div>
						<p class="mt-1 text-slate-600 dark:text-slate-400">
							Browse and search through all registered sitios in South Cotabato
						</p>
					</div>
				</div>
				<div class="flex gap-2">
					<Button href="/recommendations" variant="outline" class="gap-2">
						<Lightbulb class="size-4" />
						<span class="hidden sm:inline">Find Recommendations</span>
					</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Filters & Grid -->
	<section class="container mx-auto px-4 py-6">
		<!-- Filters -->
		<Card.Root class="mb-6 shadow-sm">
			<Card.Content class="pt-6">
				<div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex flex-1 flex-wrap gap-3">
						<!-- Search -->
						<div class="relative w-full sm:max-w-xs">
							<Search
								class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								type="search"
								placeholder="Search sitios..."
								bind:value={searchTerm}
								class="pl-9"
								oninput={() => (currentPage = 1)}
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
						<Select.Root
							type="single"
							value={selectedBarangay}
							onValueChange={handleBarangayChange}
						>
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
									Sort: Population ↓
								{:else if sortBy === 'population-low'}
									Sort: Population ↑
								{:else if sortBy === 'households-high'}
									Sort: Households ↓
								{:else if sortBy === 'households-low'}
									Sort: Households ↑
								{:else if sortBy === 'need-high'}
									Sort: Need Score ↓
								{:else if sortBy === 'need-low'}
									Sort: Need Score ↑
								{/if}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="name">Name (A-Z)</Select.Item>
								<Select.Item value="need-high">Need Score (High→Low)</Select.Item>
								<Select.Item value="need-low">Need Score (Low→High)</Select.Item>
								<Select.Item value="population-high">Population (High→Low)</Select.Item>
								<Select.Item value="population-low">Population (Low→High)</Select.Item>
								<Select.Item value="households-high">Households (High→Low)</Select.Item>
								<Select.Item value="households-low">Households (Low→High)</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<div class="flex items-center gap-2">
						<!-- View Mode Toggle -->
						<Tabs.Root bind:value={viewMode} class="w-auto">
							<Tabs.List class="grid w-full grid-cols-2">
								<Tabs.Trigger value="grid" class="gap-1.5">
									<Grid3x3 class="size-4" />
									<span class="hidden sm:inline">Grid</span>
								</Tabs.Trigger>
								<Tabs.Trigger value="list" class="gap-1.5">
									<List class="size-4" />
									<span class="hidden sm:inline">List</span>
								</Tabs.Trigger>
							</Tabs.List>
						</Tabs.Root>
					</div>
				</div>

				<div class="flex items-center justify-between text-sm text-muted-foreground">
					<span>
						Showing {paginatedSitios.length} of {filteredSitios.length}
						{filteredSitios.length === 1 ? 'sitio' : 'sitios'}
					</span>
					{#if searchTerm || selectedMunicipality !== 'all' || selectedBarangay !== 'all'}
						<Button
							variant="ghost"
							size="sm"
							onclick={() => {
								searchTerm = '';
								selectedMunicipality = 'all';
								selectedBarangay = 'all';
								currentPage = 1;
							}}
						>
							Clear filters
						</Button>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

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
			<!-- Sitios Grid View -->
			{#if viewMode === 'grid'}
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each paginatedSitios as sitio}
						{@const electricityCoverage = getElectricityCoverage(sitio)}
						{@const { needScore, needLevel, config: needConfig } = getNeedConfig(sitio)}
						{@const highlights = getSitioHighlights(sitio)}
						<a href="/sitios/{sitio.id}">
							<Card.Root
								class="group relative h-full overflow-hidden transition-all hover:shadow-xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20"
							>
								<div
									class="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-blue-500 to-indigo-500"
								></div>
								<Card.Content class="pt-5">
									<div class="mb-3 flex items-start justify-between gap-2">
										<div class="min-w-0 flex-1">
											<h3
												class="truncate font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400"
											>
												{sitio.name}
											</h3>
											<p
												class="mt-0.5 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
											>
												<MapPin class="size-3 shrink-0" />
												<span class="truncate">{sitio.barangay}, {sitio.municipality}</span>
											</p>
										</div>
										<Badge
											class={cn('shrink-0 gap-1 font-medium', getNeedLevelBadgeClasses(needLevel))}
										>
											<Gauge class="size-3" />
											{needScore}
										</Badge>
									</div>

									<!-- Quick Stats -->
									<div class="mb-3 grid grid-cols-2 gap-2 text-center">
										<div class="rounded-lg bg-blue-50/50 p-2 dark:bg-blue-950/20">
											<Users class="mx-auto mb-1 size-4 text-blue-600 dark:text-blue-400" />
											<div class="text-sm font-semibold dark:text-slate-100">
												{formatNumber(sitio.population)}
											</div>
											<div class="text-xs text-slate-500 dark:text-slate-400">Population</div>
										</div>
										<div class="rounded-lg bg-indigo-50/50 p-2 dark:bg-indigo-950/20">
											<Home class="mx-auto mb-1 size-4 text-indigo-600 dark:text-indigo-400" />
											<div class="text-sm font-semibold dark:text-slate-100">
												{formatNumber(sitio.households)}
											</div>
											<div class="text-xs text-slate-500 dark:text-slate-400">Households</div>
										</div>
									</div>

									<!-- Highlights -->
									{#if highlights.length > 0}
										<div class="space-y-1.5 border-t pt-3 dark:border-slate-700">
											{#each highlights as highlight}
												<div class="flex items-center justify-between text-xs">
													<div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
														<highlight.icon class="size-3" />
														<span>{highlight.label}</span>
													</div>
													<span class="font-medium text-slate-900 dark:text-slate-100"
														>{highlight.value}</span
													>
												</div>
											{/each}
										</div>
									{/if}

									<Button
										variant="ghost"
										class="mt-3 w-full justify-between group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-950/30 dark:group-hover:text-blue-400"
									>
										View Profile
										<ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
									</Button>
								</Card.Content>
							</Card.Root>
						</a>
					{/each}
				</div>
			{:else}
				<!-- List View -->
				<div class="space-y-3">
					{#each paginatedSitios as sitio}
						{@const electricityCoverage = getElectricityCoverage(sitio)}
						{@const { needScore, needLevel, config: needConfig } = getNeedConfig(sitio)}
						<a href="/sitios/{sitio.id}">
							<Card.Root
								class="group transition-all hover:shadow-md hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20"
							>
								<Card.Content class="p-4">
									<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
										<div class="flex-1 space-y-2">
											<div class="flex items-start justify-between gap-3">
												<div class="flex-1">
													<h3
														class="font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400"
													>
														{sitio.name}
													</h3>
													<p
														class="mt-0.5 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
													>
														<MapPin class="size-3" />
														{sitio.barangay}, {sitio.municipality}
													</p>
												</div>
												<Badge
													class={cn(
														'shrink-0 gap-1 font-medium',
														getNeedLevelBadgeClasses(needLevel)
													)}
												>
													{needConfig.label} ({needScore})
												</Badge>
											</div>
											<div class="flex flex-wrap gap-4 text-sm">
												<div class="flex items-center gap-1.5">
													<Users class="size-4 text-blue-600 dark:text-blue-400" />
													<span class="dark:text-slate-300"
														>{formatNumber(sitio.population)} people</span
													>
												</div>
												<div class="flex items-center gap-1.5">
													<Home class="size-4 text-indigo-600 dark:text-indigo-400" />
													<span class="dark:text-slate-300"
														>{formatNumber(sitio.households)} households</span
													>
												</div>
												<div class="flex items-center gap-1.5">
													<Zap class="size-4 text-amber-600 dark:text-amber-400" />
													<span class="dark:text-slate-300"
														>{electricityCoverage.toFixed(0)}% electricity</span
													>
												</div>
											</div>
										</div>
										<Button
											variant="outline"
											size="sm"
											class="shrink-0 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:border-blue-800 dark:group-hover:bg-blue-950/30 dark:group-hover:text-blue-400"
										>
											View Details
											<ArrowRight
												class="ml-2 size-4 transition-transform group-hover:translate-x-1"
											/>
										</Button>
									</div>
								</Card.Content>
							</Card.Root>
						</a>
					{/each}
				</div>
			{/if}

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
