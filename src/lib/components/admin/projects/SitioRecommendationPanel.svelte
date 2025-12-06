<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Select from '$lib/components/ui/select';
	import { predefinedPPAs, type PredefinedPPA } from '$lib/config/issue-ppa-mappings';
	import { getNeedLevelBadgeClasses, getNeedLevelConfig } from '$lib/config/status-config';
	import { sitios } from '$lib/mock-data';
	import type { ProjectType, Sitio, SitioPPA } from '$lib/types';
	import { getNeedLevelFromScore } from '$lib/types';
	import {
		AlertCircle,
		ChevronDown,
		ChevronUp,
		Gauge,
		Lightbulb,
		MapPin,
		Plus,
		Sparkles,
		Users
	} from '@lucide/svelte';

	interface Props {
		projectType?: ProjectType;
		selectedSitioIds: number[];
		onAddSitio: (sitio: Sitio) => void;
	}

	let { projectType, selectedSitioIds, onAddSitio }: Props = $props();

	let isOpen = $state(true);
	let selectedMunicipality = $state('');
	let maxResults = $state(10);

	// Interface for recommendation result
	interface SitioRecommendation {
		sitio: Sitio;
		matchScore: number;
		matchedPPAs: Array<{
			ppa: SitioPPA;
			matchedKeywords: string[];
		}>;
		needScore: number;
		needLevel: ReturnType<typeof getNeedLevelFromScore>;
	}

	// Get PPAs that link to the selected project type
	const matchingPPAs = $derived.by((): PredefinedPPA[] => {
		if (!projectType) return [];
		return predefinedPPAs.filter((ppa) => ppa.projectTypeId === projectType.id);
	});

	// Get keywords for matching from the project type's related PPAs
	const matchingKeywords = $derived.by((): string[] => {
		if (!projectType) return [];
		const keywords = new Set<string>();

		// Add keywords from PPAs that match this project type
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

	// Filter available sitios (not already selected)
	const availableSitios = $derived(sitios.filter((s) => !selectedSitioIds.includes(s.id)));

	// Get unique municipalities for filter
	const municipalities = $derived([...new Set(availableSitios.map((s) => s.municipality))].sort());

	// Calculate recommendations
	const recommendations = $derived.by((): SitioRecommendation[] => {
		if (!projectType || matchingKeywords.length === 0) return [];

		const results: SitioRecommendation[] = [];

		for (const sitio of availableSitios) {
			// Filter by municipality if selected
			if (selectedMunicipality && sitio.municipality !== selectedMunicipality) continue;

			const matchedPPAs: SitioRecommendation['matchedPPAs'] = [];
			let totalScore = 0;

			// Check sitio's proposed PPAs for keyword matches
			if (sitio.proposed_ppas && sitio.proposed_ppas.length > 0) {
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
						// Score based on number of keyword matches
						totalScore += matchedKeywords.length * 10;
					}
				}
			}

			// Add secondary score based on need level (0-10 points)
			const needScore = sitio.need_score ?? 5;
			const needLevel = getNeedLevelFromScore(needScore);
			totalScore += needScore;

			// Only include sitios with at least some relevance
			if (matchedPPAs.length > 0 || needScore >= 7) {
				results.push({
					sitio,
					matchScore: totalScore,
					matchedPPAs,
					needScore,
					needLevel
				});
			}
		}

		// Sort by match score descending
		return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, maxResults);
	});

	// Check if we have any recommendations
	const hasRecommendations = $derived(recommendations.length > 0);
	const hasProjectType = $derived(!!projectType);
</script>

{#if hasProjectType}
	<Card.Card class="border-dashed border-primary/30 bg-primary/5 py-0">
		<Collapsible.Root bind:open={isOpen}>
			<Collapsible.Trigger
				class="w-full cursor-pointer py-6 text-left transition-colors select-none hover:bg-primary/10"
			>
				<Card.CardHeader>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<Sparkles class="size-5 text-primary" />
							<Card.CardTitle class="text-base">Sitio Recommendations</Card.CardTitle>
							{#if hasRecommendations}
								<Badge variant="secondary" class="ml-2">{recommendations.length}</Badge>
							{/if}
						</div>
						{#if isOpen}
							<ChevronUp class="size-5 text-muted-foreground" />
						{:else}
							<ChevronDown class="size-5 text-muted-foreground" />
						{/if}
					</div>
					<Card.CardDescription>
						Sitios with PPAs matching "{projectType?.name}" are prioritized
					</Card.CardDescription>
				</Card.CardHeader>
			</Collapsible.Trigger>

			<Collapsible.Content class="mt-4">
				<Card.CardContent class="space-y-4">
					<!-- Filters -->
					<div class="flex flex-wrap items-center gap-3">
						<Select.Root type="single" bind:value={selectedMunicipality}>
							<Select.Trigger class="h-9 w-[180px]">
								<span class="text-sm">
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

						<div class="flex items-center gap-2 text-sm text-muted-foreground">
							<Lightbulb class="size-4" />
							<span>Based on {matchingKeywords.length} matching keywords</span>
						</div>
					</div>

					<!-- Recommendations List -->
					{#if hasRecommendations}
						<div class="grid gap-3 md:grid-cols-2">
							{#each recommendations as rec (rec.sitio.id)}
								{@const needConfig = getNeedLevelConfig(rec.needLevel)}
								<div
									class="group relative flex flex-col gap-2 rounded-lg border bg-background p-3 transition-shadow hover:shadow-md"
								>
									<!-- Header: Name + Need Badge -->
									<div class="flex items-start justify-between gap-2">
										<div class="flex-1">
											<div class="flex items-center gap-2">
												<span class="font-medium">{rec.sitio.name}</span>
												<Badge
													variant="secondary"
													class="h-5 gap-0.5 px-1.5 text-[10px] {getNeedLevelBadgeClasses(
														rec.needLevel
													)}"
												>
													<Gauge class="size-2.5" />
													{needConfig.shortLabel} ({rec.needScore})
												</Badge>
											</div>
											<div class="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
												<MapPin class="size-3" />
												{rec.sitio.barangay}, {rec.sitio.municipality}
											</div>
										</div>
										<Button
											variant="ghost"
											size="sm"
											class="h-8 gap-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
											onclick={() => onAddSitio(rec.sitio)}
										>
											<Plus class="size-3.5" />
											Add
										</Button>
									</div>

									<!-- Stats -->
									<div class="flex gap-3 text-xs text-muted-foreground">
										<span class="flex items-center gap-1">
											<Users class="size-3" />
											{rec.sitio.population.toLocaleString()} pop
										</span>
										<span>•</span>
										<span>{rec.sitio.households.toLocaleString()} HH</span>
									</div>

									<!-- Matched PPAs -->
									{#if rec.matchedPPAs.length > 0}
										<div class="space-y-1">
											<div
												class="text-[10px] font-medium tracking-wide text-muted-foreground uppercase"
											>
												Matching PPAs
											</div>
											<div class="flex flex-wrap gap-1">
												{#each rec.matchedPPAs.slice(0, 3) as match}
													<Badge
														variant="outline"
														class="h-5 max-w-[200px] truncate px-1.5 text-[10px]"
														title={match.ppa.name}
													>
														{match.ppa.name}
													</Badge>
												{/each}
												{#if rec.matchedPPAs.length > 3}
													<Badge variant="outline" class="h-5 px-1.5 text-[10px]">
														+{rec.matchedPPAs.length - 3} more
													</Badge>
												{/if}
											</div>
										</div>
									{:else}
										<div class="text-[10px] text-muted-foreground italic">
											High need score ({rec.needScore}/10) - no direct PPA match
										</div>
									{/if}
								</div>
							{/each}
						</div>

						{#if recommendations.length >= maxResults}
							<div class="mb-4 flex justify-center">
								<Button
									variant="ghost"
									size="sm"
									onclick={() => (maxResults += 10)}
									class="text-xs"
								>
									Show more recommendations
								</Button>
							</div>
						{/if}
					{:else}
						<div class="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
							<AlertCircle class="size-8 opacity-50" />
							<p class="text-sm">No sitio recommendations found for this project type.</p>
							<p class="text-xs">
								Try selecting a different municipality filter or add sitios manually.
							</p>
						</div>
					{/if}
				</Card.CardContent>
			</Collapsible.Content>
		</Collapsible.Root>
	</Card.Card>
{/if}
