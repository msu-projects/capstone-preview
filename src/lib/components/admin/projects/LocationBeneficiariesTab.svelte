<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { FormSection } from '$lib/components/ui/form-section';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { predefinedPPAs } from '$lib/config/issue-ppa-mappings';
	import { getNeedLevelBadgeClasses, getNeedLevelConfig } from '$lib/config/status-config';
	import { sitios } from '$lib/mock-data';
	import type { ProjectSitio, ProjectType, Sitio, SitioPPA } from '$lib/types';
	import { getNeedLevelFromScore } from '$lib/types';
	import { cn } from '$lib/utils';
	import {
		ArrowDownWideNarrow,
		ArrowUpNarrowWide,
		Check,
		Gauge,
		Home,
		MapPin,
		Plus,
		Search,
		Sparkles,
		Trash2,
		TrendingUp,
		Users
	} from '@lucide/svelte';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';

	let {
		projectSitios = $bindable([]),
		showSitioSelection = $bindable(true),
		projectType
	} = $props<{
		projectSitios: Omit<ProjectSitio, 'project_id'>[];
		showSitioSelection: boolean;
		projectType?: ProjectType;
	}>();

	let selectedSitioId = $state<number | undefined>(undefined);
	let beneficiariesTarget = $state('');
	let focalPerson = $state('');
	let focalContact = $state('');

	// Popover state
	let popoverOpen = $state(false);
	let searchQuery = $state('');
	let selectedMunicipality = $state('');
	let selectedBarangay = $state('');
	let sortByNeedScore = $state<'none' | 'desc' | 'asc'>('desc'); // Default to highest need first

	// Filter out already selected sitios
	const availableSitios = $derived(
		sitios.filter(
			(s) => !projectSitios.some((ps: Omit<ProjectSitio, 'project_id'>) => ps.sitio_id === s.id)
		)
	);

	// Get unique municipalities and barangays
	const municipalities = $derived([...new Set(availableSitios.map((s) => s.municipality))].sort());
	const barangays = $derived(
		selectedMunicipality
			? [
					...new Set(
						availableSitios
							.filter((s) => s.municipality === selectedMunicipality)
							.map((s) => s.barangay)
					)
				].sort()
			: [...new Set(availableSitios.map((s) => s.barangay))].sort()
	);

	// PPA matching keywords based on project type
	const matchingKeywords = $derived.by((): string[] => {
		if (!projectType) return [];
		const keywords = new Set<string>();

		// Get keywords from PPAs that match this project type
		const matchingPPAs = predefinedPPAs.filter((ppa) => ppa.projectTypeId === projectType.id);
		for (const ppa of matchingPPAs) {
			for (const keyword of ppa.keywords) {
				keywords.add(keyword.toLowerCase());
			}
		}

		// Also add the project type name itself as keywords
		const typeWords = projectType.name.toLowerCase().split(/\s+/);
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

	// Filtered and sorted sitios based on search, filters, and PPA matching
	const filteredSitios = $derived.by((): EnhancedSitio[] => {
		const filtered = availableSitios.filter((sitio) => {
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

			if (projectType && matchingKeywords.length > 0 && sitio.proposed_ppas) {
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

		// Sort: matched sitios first (by need score desc), then non-matched (by need score desc)
		const needScoreMultiplier = sortByNeedScore === 'asc' ? 1 : -1;

		return enhanced.sort((a, b) => {
			// If project type is set, prioritize matched sitios
			if (projectType) {
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

	// Count of matched sitios for display
	const matchedSitiosCount = $derived(
		projectType ? filteredSitios.filter((s) => s.hasMatch).length : 0
	);

	// Get selected sitio data
	const selectedSitioData = $derived(
		selectedSitioId ? sitios.find((s) => s.id === selectedSitioId) : undefined
	);

	// Calculate percentage of households with smooth animation
	const beneficiariesPercentage = new Tween(0, {
		duration: 500,
		easing: cubicOut
	});

	$effect(() => {
		if (!selectedSitioData || !beneficiariesTarget) {
			beneficiariesPercentage.target = 0;
			return;
		}
		const target = Number(beneficiariesTarget);
		if (isNaN(target) || target === 0) {
			beneficiariesPercentage.target = 0;
			return;
		}
		const percentage = Math.round((target / selectedSitioData.households) * 100);
		beneficiariesPercentage.target = percentage;
	});

	function selectSitio(sitio: Sitio) {
		selectedSitioId = sitio.id;
		// Auto-populate with sitio's household count
		beneficiariesTarget = sitio.households.toString();
		popoverOpen = false;
		searchQuery = '';
	}

	function clearFilters() {
		searchQuery = '';
		selectedMunicipality = '';
		selectedBarangay = '';
	}

	function toggleNeedScoreSort() {
		if (sortByNeedScore === 'none') sortByNeedScore = 'desc';
		else if (sortByNeedScore === 'desc') sortByNeedScore = 'asc';
		else sortByNeedScore = 'none';
	}

	// Get sitio data by ID for the table (to access need_score)
	function getSitioById(sitioId: number): Sitio | undefined {
		return sitios.find((s) => s.id === sitioId);
	}

	// Calculated totals
	const totalSitios = $derived(projectSitios.length);
	const totalBeneficiaries = $derived(
		projectSitios.reduce(
			(sum: number, ps: Omit<ProjectSitio, 'project_id'>) => sum + ps.beneficiaries_target,
			0
		)
	);
	const totalMunicipalities = $derived(
		[...new Set(projectSitios.map((ps: Omit<ProjectSitio, 'project_id'>) => ps.municipality))]
			.length
	);
	const totalBarangays = $derived(
		[...new Set(projectSitios.map((ps: Omit<ProjectSitio, 'project_id'>) => ps.barangay))].length
	);

	function addSitio() {
		if (!selectedSitioId || !beneficiariesTarget) {
			return;
		}

		const sitio = sitios.find((s) => s.id === selectedSitioId);
		if (!sitio) return;

		const newProjectSitio: Omit<ProjectSitio, 'project_id'> = {
			sitio_id: sitio.id,
			sitio_name: sitio.name,
			municipality: sitio.municipality,
			barangay: sitio.barangay,
			beneficiaries_target: Number(beneficiariesTarget),
			focal_person: focalPerson || undefined,
			focal_contact: focalContact || undefined
		};

		projectSitios = [...projectSitios, newProjectSitio];

		// Reset form
		selectedSitioId = undefined;
		beneficiariesTarget = '';
		focalPerson = '';
		focalContact = '';
		showSitioSelection = false;
	}

	function removeSitio(sitioId: number) {
		projectSitios = projectSitios.filter(
			(ps: Omit<ProjectSitio, 'project_id'>) => ps.sitio_id !== sitioId
		);
	}

	// Check if section is complete
	const isSectionComplete = $derived(projectSitios.length > 0);
</script>

<FormSection
	title="Location & Beneficiaries"
	description="Select target sitios and define beneficiary households for this project"
	icon={MapPin}
	variant="purple"
	isComplete={isSectionComplete}
	collapsible={false}
>
	<div class="space-y-6">
		<!-- Summary Cards -->
		{#if projectSitios.length > 0}
			<div class="grid gap-4 md:grid-cols-4">
				<Card.Card>
					<Card.CardContent class="">
						<div class="flex items-center gap-5">
							<MapPin class="size-5 text-primary" />
							<div>
								<p class="text-sm text-muted-foreground">Total Sitios</p>
								<p class="text-2xl font-bold">{totalSitios}</p>
							</div>
						</div>
					</Card.CardContent>
				</Card.Card>
				<Card.Card>
					<Card.CardContent class="">
						<div class="flex items-center gap-5">
							<Users class="size-5 text-primary" />
							<div>
								<p class="text-sm text-muted-foreground">Total Beneficiaries</p>
								<p class="text-2xl font-bold">{totalBeneficiaries.toLocaleString()}</p>
							</div>
						</div>
					</Card.CardContent>
				</Card.Card>
				<Card.Card>
					<Card.CardContent class="">
						<div class="flex items-center gap-5">
							<Home class="size-5 text-primary" />
							<div>
								<p class="text-sm text-muted-foreground">Municipalities</p>
								<p class="text-2xl font-bold">{totalMunicipalities}</p>
							</div>
						</div>
					</Card.CardContent>
				</Card.Card>
				<Card.Card>
					<Card.CardContent class="">
						<div class="flex items-center gap-5">
							<TrendingUp class="size-5 text-primary" />
							<div>
								<p class="text-sm text-muted-foreground">Barangays</p>
								<p class="text-2xl font-bold">{totalBarangays}</p>
							</div>
						</div>
					</Card.CardContent>
				</Card.Card>
			</div>
		{/if}

		<!-- Selected Sitios Table -->
		{#if projectSitios.length > 0}
			<Card.Card>
				<Card.CardHeader>
					<Card.CardTitle>Selected Sitios</Card.CardTitle>
					<Card.CardDescription>
						Multi-sitio projects allow a single project to benefit multiple communities
						simultaneously
					</Card.CardDescription>
				</Card.CardHeader>
				<Card.CardContent>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Sitio Name</Table.Head>
								<Table.Head>Need Level</Table.Head>
								<Table.Head>Municipality</Table.Head>
								<Table.Head>Barangay</Table.Head>
								<Table.Head>Beneficiaries</Table.Head>
								<Table.Head>Focal Person</Table.Head>
								<Table.Head class="text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each projectSitios as ps}
								{@const sitioData = getSitioById(ps.sitio_id)}
								{@const needScore = sitioData?.need_score ?? 5}
								{@const needLevel = getNeedLevelFromScore(needScore)}
								{@const needConfig = getNeedLevelConfig(needLevel)}
								<Table.Row>
									<Table.Cell class="font-medium">{ps.sitio_name}</Table.Cell>
									<Table.Cell>
										<Badge variant="secondary" class="gap-1 {getNeedLevelBadgeClasses(needLevel)}">
											<Gauge class="size-3" />
											{needScore}/10
										</Badge>
									</Table.Cell>
									<Table.Cell>{ps.municipality}</Table.Cell>
									<Table.Cell>{ps.barangay}</Table.Cell>
									<Table.Cell>{ps.beneficiaries_target}</Table.Cell>
									<Table.Cell>
										<div class="text-sm">
											{ps.focal_person || '—'}
											{#if ps.focal_contact}
												<br />
												<span class="text-muted-foreground">{ps.focal_contact}</span>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell class="text-right">
										<Button
											variant="ghost"
											size="sm"
											onclick={() => removeSitio(ps.sitio_id)}
											class="text-destructive hover:text-destructive"
										>
											<Trash2 class="size-4" />
										</Button>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.CardContent>
			</Card.Card>
		{/if}

		<!-- Add Sitio Form -->
		<Card.Card>
			<Card.CardHeader>
				<Card.CardTitle>
					{projectSitios.length === 0 ? 'Select Project Location(s)' : 'Add Another Sitio'}
				</Card.CardTitle>
				<Card.CardDescription>
					{projectSitios.length === 0
						? 'Start by selecting the first sitio for this project'
						: 'You can add multiple sitios to create a multi-sitio project'}
				</Card.CardDescription>
			</Card.CardHeader>
			<Card.CardContent>
				{#if showSitioSelection || projectSitios.length === 0}
					<div class="grid gap-4 md:grid-cols-2">
						<!-- Sitio Selection with Popover -->
						<div class="space-y-2 md:col-span-2">
							<Label for="sitio" class="required">Select Sitio</Label>
							<Popover.Root bind:open={popoverOpen}>
								<Popover.Trigger
									class={cn(
										'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
									)}
								>
									{#if selectedSitioData}
										<div class="flex flex-col items-start">
											<span class="font-medium">{selectedSitioData.name}</span>
											<span class="text-xs text-muted-foreground">
												{selectedSitioData.barangay}, {selectedSitioData.municipality}
											</span>
										</div>
									{:else}
										<span class="text-muted-foreground">Select a sitio...</span>
									{/if}
									<Search class="ml-2 size-4 shrink-0 opacity-50" />
								</Popover.Trigger>
								<Popover.Content class="w-full p-0 md:w-[500px]" align="start">
									<div class="space-y-3 border-b p-3">
										<!-- Search Input -->
										<div class="relative">
											<Search class="absolute top-2.5 left-2 size-4 text-muted-foreground" />
											<Input placeholder="Search sitios..." bind:value={searchQuery} class="pl-8" />
										</div>

										<!-- Filter Dropdowns -->
										<!-- <div class="grid gap-2 md:grid-cols-2"> -->
										<div class="flex gap-3">
											<Select.Root type="single" bind:value={selectedMunicipality}>
												<Select.Trigger class="h-9">
													<span class="text-xs">
														{selectedMunicipality || 'All Municipalities'}
													</span>
												</Select.Trigger>
												<Select.Content>
													<Select.Item value="">All Municipalities</Select.Item>
													{#each municipalities as municipality}
														<Select.Item value={municipality}>{municipality}</Select.Item>
													{/each}
												</Select.Content>
											</Select.Root>

											<Select.Root type="single" bind:value={selectedBarangay}>
												<Select.Trigger class="h-9">
													<span class="text-xs">
														{selectedBarangay || 'All Barangays'}
													</span>
												</Select.Trigger>
												<Select.Content>
													<Select.Item value="">All Barangays</Select.Item>
													{#each barangays as barangay}
														<Select.Item value={barangay}>{barangay}</Select.Item>
													{/each}
												</Select.Content>
											</Select.Root>

											<!-- Sort by Need Score Button -->
											<Button
												variant={sortByNeedScore !== 'none' ? 'secondary' : 'outline'}
												size="sm"
												class="h-9 gap-1.5 text-xs"
												onclick={toggleNeedScoreSort}
												title="Sort by need score"
											>
												{#if sortByNeedScore === 'desc'}
													<ArrowDownWideNarrow class="size-3.5" />
													<span>Need ↓</span>
												{:else if sortByNeedScore === 'asc'}
													<ArrowUpNarrowWide class="size-3.5" />
													<span>Need ↑</span>
												{:else}
													<Gauge class="size-3.5" />
													<span>Sort</span>
												{/if}
											</Button>
										</div>
										<!-- Clear Filters Button -->
										{#if searchQuery || selectedMunicipality || selectedBarangay}
											<Button
												variant="ghost"
												size="sm"
												class="h-7 w-full text-xs"
												onclick={clearFilters}
											>
												Clear Filters
											</Button>
										{/if}
									</div>

									<!-- Match count indicator when project type is set -->
									{#if projectType && matchedSitiosCount > 0}
										<div
											class="flex items-center gap-2 border-b bg-primary/5 px-3 py-2 text-xs text-primary"
										>
											<Sparkles class="size-3.5" />
											<span
												>{matchedSitiosCount} sitio{matchedSitiosCount !== 1 ? 's' : ''} with matching
												PPAs</span
											>
										</div>
									{/if}

									<!-- Sitio List -->
									<div class="max-h-[300px] overflow-y-auto">
										{#if filteredSitios.length === 0}
											<div class="p-4 text-center text-sm text-muted-foreground">
												{availableSitios.length === 0
													? 'All sitios have been selected'
													: 'No sitios found matching your filters'}
											</div>
										{:else}
											<div class="p-1">
												{#each filteredSitios as sitio (sitio.id)}
													{@const needScore = sitio.need_score ?? 5}
													{@const needLevel = getNeedLevelFromScore(needScore)}
													{@const needConfig = getNeedLevelConfig(needLevel)}
													<button
														type="button"
														class={cn(
															'relative flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-sm transition-colors outline-none select-none hover:bg-accent/30',
															selectedSitioId === sitio.id && 'bg-accent',
															sitio.hasMatch && 'bg-primary/5 hover:bg-primary/10'
														)}
														onclick={() => selectSitio(sitio)}
													>
														<div class="flex flex-1 flex-col items-start gap-1">
															<div class="flex w-full items-center justify-between gap-2">
																<div class="flex items-center gap-1.5">
																	<span class="font-medium">{sitio.name}</span>
																	{#if sitio.hasMatch}
																		<Popover.Root>
																			<Popover.Trigger
																				class="cursor-help"
																				onclick={(e) => e.stopPropagation()}
																				onmouseenter={(e) =>
																					(e.target as HTMLButtonElement).click()}
																				onmouseleave={(e) =>
																					(e.target as HTMLButtonElement).click()}
																			>
																				<Badge
																					variant="secondary"
																					class="h-4 gap-0.5 bg-primary/20 px-1 text-[9px] text-primary hover:bg-primary/30"
																				>
																					<Sparkles class="size-2" />
																					<span class="hidden sm:inline">Match</span>
																					<span class="sm:hidden">{sitio.matchedPPAs.length}</span>
																				</Badge>
																			</Popover.Trigger>
																			<Popover.Content class="w-72 p-3" side="top" align="start">
																				<div class="space-y-2">
																					<div
																						class="flex items-center gap-1.5 text-xs font-medium text-primary"
																					>
																						<Sparkles class="size-3" />
																						<span>Matching PPAs ({sitio.matchedPPAs.length})</span>
																					</div>
																					<ul class="space-y-1.5">
																						{#each sitio.matchedPPAs as match}
																							<li class="rounded bg-muted/50 px-2 py-1.5">
																								<p class="text-xs leading-tight font-medium">
																									{match.ppa.name}
																								</p>
																								<p class="mt-0.5 text-[10px] text-muted-foreground">
																									Keywords: {match.matchedKeywords.join(', ')}
																								</p>
																							</li>
																						{/each}
																					</ul>
																				</div>
																			</Popover.Content>
																		</Popover.Root>
																	{/if}
																</div>
																<Badge
																	variant="secondary"
																	class="flex h-5 gap-1 px-1.5 text-[10px] {getNeedLevelBadgeClasses(
																		needLevel
																	)}"
																>
																	<Gauge class="size-2.5" />
																	{needConfig.shortLabel} ({needScore})
																</Badge>
															</div>
															<span class="text-xs text-muted-foreground">
																{sitio.barangay}, {sitio.municipality}
															</span>
															<div
																class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
															>
																<span>Pop: {sitio.population.toLocaleString()}</span>
																<span>•</span>
																<span>HH: {sitio.households.toLocaleString()}</span>
															</div>
														</div>
														{#if selectedSitioId === sitio.id}
															<Check class="size-4 shrink-0" />
														{/if}
													</button>
												{/each}
											</div>
										{/if}
									</div>
								</Popover.Content>
							</Popover.Root>
						</div>

						<!-- Beneficiaries Target -->
						<div class="space-y-2">
							<Label for="beneficiaries-target" class="required"
								>Target Beneficiary Households</Label
							>
							<Input
								id="beneficiaries-target"
								type="number"
								bind:value={beneficiariesTarget}
								placeholder="Enter number of households"
								min="1"
								max={selectedSitioData?.households}
							/>
							{#if selectedSitioData && beneficiariesTarget}
								<div class="flex items-center gap-2 text-xs">
									<div class="flex-1">
										<div class="mb-1 flex items-center justify-between">
											<span class="text-muted-foreground">
												{beneficiariesTarget} of {selectedSitioData.households.toLocaleString()} households
											</span>
											<span class="font-medium">{Math.round(beneficiariesPercentage.current)}%</span
											>
										</div>
										<div class="h-2 overflow-hidden rounded-full bg-secondary">
											<div
												class="h-full bg-primary"
												style="width: {Math.min(beneficiariesPercentage.current, 100)}%"
											></div>
										</div>
									</div>
								</div>
							{/if}
						</div>

						<div class="hidden md:block"></div>

						<!-- Focal Person -->
						<div class="space-y-2">
							<Label for="focal-person">Local Focal Person</Label>
							<Input
								id="focal-person"
								bind:value={focalPerson}
								placeholder="Name of local coordinator"
							/>
						</div>

						<!-- Focal Contact -->
						<div class="space-y-2">
							<Label for="focal-contact">Contact Number</Label>
							<Input id="focal-contact" bind:value={focalContact} placeholder="0912-345-6789" />
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-2 md:col-span-2">
							<Button
								onclick={addSitio}
								disabled={!selectedSitioId || !beneficiariesTarget}
								class="gap-2"
							>
								<Plus class="size-4" />
								Add Sitio
							</Button>
							{#if projectSitios.length > 0}
								<Button variant="outline" onclick={() => (showSitioSelection = false)}
									>Cancel</Button
								>
							{/if}
						</div>
					</div>
				{:else}
					<Button onclick={() => (showSitioSelection = true)} variant="outline" class="gap-2">
						<Plus class="size-4" />
						Add Another Sitio
					</Button>
				{/if}
			</Card.CardContent>
		</Card.Card>
	</div>
</FormSection>

<style>
	:global(.required::after) {
		content: ' *';
		color: hsl(var(--destructive));
	}
</style>
