<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { predefinedPPAs } from '$lib/config/issue-ppa-mappings';
	import { getCategories, getProjectTypes } from '$lib/config/project-categories';
	import { getNeedLevelBadgeClasses, getNeedLevelConfig } from '$lib/config/status-config';
	import { sitios } from '$lib/mock-data';
	import type { Sitio, SitioPPA } from '$lib/types';
	import { getNeedLevelFromScore } from '$lib/types';
	import { cn } from '$lib/utils';
	import { formatNumber } from '$lib/utils/formatters';
	import {
		ArrowDownWideNarrow,
		ArrowUpNarrowWide,
		Gauge,
		Home,
		Lightbulb,
		MapPin,
		Search,
		Sparkles,
		Users,
		X
	} from '@lucide/svelte';

	interface Props {
		isAdminView?: boolean;
	}

	let { isAdminView = false }: Props = $props();

	// State
	let selectedCategoryKey = $state<string>('');
	let selectedProjectTypeId = $state<string>('');
	let searchQuery = $state('');
	let selectedMunicipality = $state('');
	let selectedBarangay = $state('');
	let sortByNeedScore = $state<'none' | 'desc' | 'asc'>('desc');

	// Computed
	const categories = getCategories();
	const allProjectTypes = getProjectTypes();

	const projectTypesForCategory = $derived(
		selectedCategoryKey
			? allProjectTypes.filter((pt) => pt.category_key === selectedCategoryKey)
			: []
	);

	const selectedProjectType = $derived(
		selectedProjectTypeId
			? allProjectTypes.find((pt) => pt.id === parseInt(selectedProjectTypeId))
			: undefined
	);

	const municipalities = $derived([...new Set(sitios.map((s) => s.municipality))].sort());
	const barangays = $derived(
		selectedMunicipality
			? [
					...new Set(
						sitios.filter((s) => s.municipality === selectedMunicipality).map((s) => s.barangay)
					)
				].sort()
			: [...new Set(sitios.map((s) => s.barangay))].sort()
	);

	// PPA matching keywords based on project type
	const matchingKeywords = $derived.by((): string[] => {
		if (!selectedProjectType) return [];
		const keywords = new Set<string>();

		// Get keywords from PPAs that match this project type
		const matchingPPAs = predefinedPPAs.filter(
			(ppa) => ppa.projectTypeId === selectedProjectType!.id
		);
		for (const ppa of matchingPPAs) {
			for (const keyword of ppa.keywords) {
				keywords.add(keyword.toLowerCase());
			}
		}

		// Also add the project type name itself as keywords
		const typeWords = selectedProjectType.name.toLowerCase().split(/\s+/);
		for (const word of typeWords) {
			if (word.length > 2) keywords.add(word);
		}

		return Array.from(keywords);
	});

	// Enhanced sitio type with match data
	interface EnhancedSitio extends Sitio {
		matchedPPAs: Array<{ ppa: SitioPPA; matchedKeywords: string[] }>;
		hasMatch: boolean;
	}

	// Filtered and sorted sitios
	const filteredSitios = $derived.by((): EnhancedSitio[] => {
		const filtered = sitios.filter((sitio) => {
			const matchesSearch =
				!searchQuery ||
				sitio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sitio.barangay.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sitio.municipality.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesMunicipality =
				!selectedMunicipality || sitio.municipality === selectedMunicipality;
			const matchesBarangay = !selectedBarangay || sitio.barangay === selectedBarangay;

			return matchesSearch && matchesMunicipality && matchesBarangay;
		});

		// Compute PPA matches for each sitio
		const enhanced: EnhancedSitio[] = filtered.map((sitio) => {
			const matchedPPAs: EnhancedSitio['matchedPPAs'] = [];

			if (selectedProjectType && matchingKeywords.length > 0 && sitio.proposed_ppas) {
				for (const ppa of sitio.proposed_ppas) {
					const ppaNameLower = ppa.name.toLowerCase();
					const matchedKeywords: string[] = [];

					for (const keyword of matchingKeywords) {
						if (ppaNameLower.includes(keyword)) {
							matchedKeywords.push(keyword);
						}
					}

					if (matchedKeywords.length > 0) {
						matchedPPAs.push({ ppa, matchedKeywords });
					}
				}
			}

			return {
				...sitio,
				matchedPPAs,
				hasMatch: matchedPPAs.length > 0
			};
		});

		// Sort: matched sitios first (by need score), then non-matched (by need score)
		const needScoreMultiplier = sortByNeedScore === 'asc' ? 1 : -1;

		return enhanced.sort((a, b) => {
			// If project type is set, prioritize matched sitios
			if (selectedProjectType) {
				if (a.hasMatch && !b.hasMatch) return -1;
				if (!a.hasMatch && b.hasMatch) return 1;
			}

			// Within the same group, sort by need score
			if (sortByNeedScore !== 'none') {
				return needScoreMultiplier * ((a.need_score ?? 5) - (b.need_score ?? 5));
			}

			return 0;
		});
	});

	const matchedSitiosCount = $derived(
		selectedProjectType ? filteredSitios.filter((s) => s.hasMatch).length : 0
	);

	// Determine sitio link based on view
	const getSitioLink = (sitioId: number) => {
		return isAdminView ? `/admin/sitios/${sitioId}` : `/sitios/${sitioId}`;
	};

	// Reset barangay when municipality changes
	$effect(() => {
		if (selectedMunicipality) {
			selectedBarangay = '';
		}
	});

	// Reset project type when category changes
	$effect(() => {
		if (selectedCategoryKey) {
			selectedProjectTypeId = '';
		}
	});

	// Handlers
	function clearFilters() {
		searchQuery = '';
		selectedMunicipality = '';
		selectedBarangay = '';
		sortByNeedScore = 'desc';
	}

	function toggleNeedScoreSort() {
		if (sortByNeedScore === 'desc') {
			sortByNeedScore = 'asc';
		} else if (sortByNeedScore === 'asc') {
			sortByNeedScore = 'none';
		} else {
			sortByNeedScore = 'desc';
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div
		class="relative overflow-hidden rounded-xl bg-linear-to-br from-blue-50 via-white to-indigo-50/30 p-6 dark:from-blue-950/30 dark:via-slate-900 dark:to-indigo-950/20"
	>
		<div
			class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"
		></div>
		<div class="relative flex items-center gap-4">
			<div
				class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30"
			>
				<Lightbulb class="h-7 w-7 text-white" />
			</div>
			<div class="flex-1">
				<h1
					class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100"
				>
					Sitio Recommendations
				</h1>
				<p class="mt-1 text-slate-600 dark:text-slate-400">
					Discover recommended sitios for specific project types based on community needs
				</p>
			</div>
		</div>
	</div>

	<!-- Project Type Selection -->
	<Card.Root class="shadow-sm">
		<Card.Header class="bg-slate-50/50 dark:bg-slate-900/50">
			<div class="flex items-start gap-3">
				<div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
					<Sparkles class="size-5 text-blue-600 dark:text-blue-400" />
				</div>
				<div>
					<Card.Title>Select Project Type</Card.Title>
					<Card.Description>
						Choose a project category and type to see recommended sitios based on their proposed
						PPAs
					</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="space-y-4 pt-6">
			<div class="grid gap-4 md:grid-cols-2">
				<!-- Category Select -->
				<div class="space-y-2">
					<Label for="category" class="text-sm font-medium">Category</Label>
					<Select.Root type="single" bind:value={selectedCategoryKey}>
						<Select.Trigger id="category">
							<span>{selectedCategoryKey || 'Select category...'}</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="">Select category...</Select.Item>
							{#each categories as category}
								<Select.Item value={category.key}>{category.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Project Type Select -->
				<div class="space-y-2">
					<Label for="project-type" class="text-sm font-medium">Project Type</Label>
					<Select.Root
						type="single"
						bind:value={selectedProjectTypeId}
						disabled={!selectedCategoryKey}
					>
						<Select.Trigger id="project-type">
							<span>{selectedProjectType?.name || 'Select project type...'}</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="">Select project type...</Select.Item>
							{#each projectTypesForCategory as type}
								<Select.Item value={String(type.id)}>{type.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Results Section -->
	{#if selectedProjectType}
		<Card.Root class="shadow-sm">
			<Card.Header class="bg-slate-50/50 dark:bg-slate-900/50">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<Card.Title>Recommended Sitios</Card.Title>
							{#if matchedSitiosCount > 0}
								<Badge variant="default" class="gap-1">
									<Sparkles class="size-3" />
									{matchedSitiosCount}
									{matchedSitiosCount === 1 ? 'match' : 'matches'}
								</Badge>
							{/if}
						</div>
						<Card.Description class="mt-1">
							{#if matchedSitiosCount > 0}
								{matchedSitiosCount}
								{matchedSitiosCount === 1 ? 'sitio has' : 'sitios have'} matching PPAs for {selectedProjectType.name}
							{:else}
								No sitios found with matching PPAs for {selectedProjectType.name}
							{/if}
						</Card.Description>
					</div>
					<Badge variant="secondary" class="h-7 gap-1">
						<MapPin class="size-3" />
						{filteredSitios.length}
						{filteredSitios.length === 1 ? 'sitio' : 'sitios'}
					</Badge>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4 pt-6">
				<!-- Filters -->
				<div class="flex flex-wrap items-end gap-3">
					<!-- Search -->
					<div class="min-w-[200px] flex-1 space-y-2">
						<Label for="search" class="text-sm font-medium">Search</Label>
						<div class="relative">
							<Search
								class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								id="search"
								placeholder="Search sitios..."
								bind:value={searchQuery}
								class="pl-9"
							/>
						</div>
					</div>

					<!-- Municipality -->
					<div class="w-full space-y-2 sm:w-48">
						<Label for="municipality" class="text-sm font-medium">Municipality</Label>
						<Select.Root type="single" bind:value={selectedMunicipality}>
							<Select.Trigger id="municipality">
								<span>{selectedMunicipality || 'All'}</span>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="">All Municipalities</Select.Item>
								{#each municipalities as municipality}
									<Select.Item value={municipality}>{municipality}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Barangay -->
					<div class="w-full space-y-2 sm:w-48">
						<Label for="barangay" class="text-sm font-medium">Barangay</Label>
						<Select.Root
							type="single"
							bind:value={selectedBarangay}
							disabled={!selectedMunicipality}
						>
							<Select.Trigger id="barangay">
								<span>{selectedBarangay || 'All'}</span>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="">All Barangays</Select.Item>
								{#each barangays as barangay}
									<Select.Item value={barangay}>{barangay}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Sort by Need Score -->
					<div class="space-y-2">
						<Label class="text-sm font-medium">Sort Order</Label>
						<Button
							variant="outline"
							size="default"
							onclick={toggleNeedScoreSort}
							class="w-full sm:w-auto"
						>
							{#if sortByNeedScore === 'desc'}
								<ArrowDownWideNarrow class="mr-2 h-4 w-4" />
								Need: High→Low
							{:else if sortByNeedScore === 'asc'}
								<ArrowUpNarrowWide class="mr-2 h-4 w-4" />
								Need: Low→High
							{:else}
								<Gauge class="mr-2 h-4 w-4" />
								Default Order
							{/if}
						</Button>
					</div>

					<!-- Clear Filters -->
					{#if searchQuery || selectedMunicipality || selectedBarangay || sortByNeedScore !== 'desc'}
						<div class="space-y-2">
							<Label class="invisible text-sm font-medium">Clear</Label>
							<Button
								variant="ghost"
								size="default"
								onclick={clearFilters}
								class="w-full sm:w-auto"
							>
								<X class="mr-2 h-4 w-4" />
								Clear Filters
							</Button>
						</div>
					{/if}
				</div>

				<!-- Results Table/Cards -->
				<div class="rounded-md border">
					{#if filteredSitios.length === 0}
						<div class="flex h-64 flex-col items-center justify-center gap-2 text-center">
							<MapPin class="h-12 w-12 text-muted-foreground/50" />
							<p class="text-sm font-medium text-muted-foreground">No sitios found</p>
							<p class="text-xs text-muted-foreground">Try adjusting your filters</p>
						</div>
					{:else}
						<!-- Desktop Table View -->
						<div class="hidden md:block">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Sitio</Table.Head>
										<Table.Head>Need Level</Table.Head>
										<Table.Head>Location</Table.Head>
										<Table.Head class="text-right">Population</Table.Head>
										<Table.Head class="text-right">Households</Table.Head>
										<Table.Head>Matched PPAs</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each filteredSitios as sitio (sitio.id)}
										{@const needLevel = getNeedLevelFromScore(sitio.need_score ?? 5)}
										{@const needConfig = getNeedLevelConfig(needLevel)}
										<Table.Row
											class={cn(
												sitio.hasMatch && 'bg-primary/5',
												'cursor-pointer transition-colors hover:bg-muted/50'
											)}
											onclick={() => (window.location.href = getSitioLink(sitio.id))}
										>
											<Table.Cell class="font-medium">
												<a
													href={getSitioLink(sitio.id)}
													class="flex items-center gap-2 hover:underline"
												>
													{sitio.name}
													{#if sitio.hasMatch}
														<Badge
															variant="secondary"
															class="h-4 gap-0.5 bg-primary/20 px-1 text-[9px] text-primary"
														>
															<Sparkles class="size-2" />
															<span>Match</span>
														</Badge>
													{/if}
												</a>
											</Table.Cell>
											<Table.Cell>
												<Badge class={cn('font-medium', getNeedLevelBadgeClasses(needLevel))}>
													{needConfig.label} ({sitio.need_score ?? 5})
												</Badge>
											</Table.Cell>
											<Table.Cell>
												<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
													<MapPin class="h-3.5 w-3.5" />
													{sitio.barangay}, {sitio.municipality}
												</div>
											</Table.Cell>
											<Table.Cell class="text-right">
												<div class="flex items-center justify-end gap-1.5 text-sm">
													<Users class="h-3.5 w-3.5 text-muted-foreground" />
													{formatNumber(sitio.population)}
												</div>
											</Table.Cell>
											<Table.Cell class="text-right">
												<div class="flex items-center justify-end gap-1.5 text-sm">
													<Home class="h-3.5 w-3.5 text-muted-foreground" />
													{formatNumber(sitio.households)}
												</div>
											</Table.Cell>
											<Table.Cell>
												{#if sitio.matchedPPAs.length > 0}
													<Popover.Root>
														<Popover.Trigger
															class="text-xs hover:underline"
															onclick={(e) => e.stopPropagation()}
														>
															{sitio.matchedPPAs[0].ppa.name}
															{#if sitio.matchedPPAs.length > 1}
																<span class="text-muted-foreground">
																	+{sitio.matchedPPAs.length - 1} more
																</span>
															{/if}
														</Popover.Trigger>
														<Popover.Content class="w-80">
															<div class="space-y-2">
																<h4 class="text-sm font-semibold">Matched PPAs</h4>
																<div class="space-y-1">
																	{#each sitio.matchedPPAs as { ppa, matchedKeywords }}
																		<div class="rounded-md bg-muted p-2 text-xs">
																			<p class="font-medium">{ppa.name}</p>
																			<p class="text-muted-foreground">
																				Keywords: {matchedKeywords.join(', ')}
																			</p>
																		</div>
																	{/each}
																</div>
															</div>
														</Popover.Content>
													</Popover.Root>
												{:else}
													<span class="text-xs text-muted-foreground">—</span>
												{/if}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>

						<!-- Mobile Card View -->
						<div class="space-y-3 p-4 md:hidden">
							{#each filteredSitios as sitio (sitio.id)}
								{@const needLevel = getNeedLevelFromScore(sitio.need_score ?? 5)}
								{@const needConfig = getNeedLevelConfig(needLevel)}
								<a href={getSitioLink(sitio.id)}>
									<Card.Root
										class={cn(
											sitio.hasMatch && 'border-primary/50 bg-primary/5',
											'cursor-pointer transition-colors hover:bg-muted/50'
										)}
									>
										<Card.Content class="p-4">
											<div class="space-y-3">
												<!-- Header -->
												<div class="flex items-start justify-between gap-2">
													<div class="flex-1">
														<div class="flex items-center gap-2">
															<h3 class="font-semibold">{sitio.name}</h3>
															{#if sitio.hasMatch}
																<Badge
																	variant="secondary"
																	class="h-4 gap-0.5 bg-primary/20 px-1 text-[9px] text-primary"
																>
																	<Sparkles class="size-2" />
																	<span>Match</span>
																</Badge>
															{/if}
														</div>
														<p class="text-xs text-muted-foreground">
															{sitio.barangay}, {sitio.municipality}
														</p>
													</div>
													<Badge
														class={cn('shrink-0 font-medium', getNeedLevelBadgeClasses(needLevel))}
													>
														{needConfig.label}
													</Badge>
												</div>

												<!-- Stats -->
												<div class="flex gap-4 text-sm">
													<div class="flex items-center gap-1.5">
														<Users class="h-3.5 w-3.5 text-muted-foreground" />
														<span>{formatNumber(sitio.population)}</span>
													</div>
													<div class="flex items-center gap-1.5">
														<Home class="h-3.5 w-3.5 text-muted-foreground" />
														<span>{formatNumber(sitio.households)}</span>
													</div>
													<div class="flex items-center gap-1.5">
														<Gauge class="h-3.5 w-3.5 text-muted-foreground" />
														<span>Score: {sitio.need_score ?? 5}</span>
													</div>
												</div>

												<!-- Matched PPAs -->
												{#if sitio.matchedPPAs.length > 0}
													<div class="space-y-1">
														<p class="text-xs font-medium text-muted-foreground">Matched PPAs:</p>
														<div class="space-y-1">
															{#each sitio.matchedPPAs.slice(0, 2) as { ppa }}
																<div class="rounded-md bg-muted px-2 py-1 text-xs">
																	{ppa.name}
																</div>
															{/each}
															{#if sitio.matchedPPAs.length > 2}
																<p class="text-xs text-muted-foreground">
																	+{sitio.matchedPPAs.length - 2} more
																</p>
															{/if}
														</div>
													</div>
												{/if}
											</div>
										</Card.Content>
									</Card.Root>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Empty State -->
		<Card.Root>
			<Card.Content class="flex h-64 flex-col items-center justify-center gap-3 text-center">
				<Lightbulb class="h-12 w-12 text-muted-foreground/50" />
				<div>
					<p class="font-medium text-muted-foreground">Select a project type to begin</p>
					<p class="text-sm text-muted-foreground">
						Choose a category and project type above to see recommended sitios
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
