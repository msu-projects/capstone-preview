<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import { Heart, Apple, Users as UsersIcon, Dog, Syringe } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
	}

	const { sitio }: Props = $props();

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	// Calculate PhilHealth coverage
	const philhealthCoverage = $derived(
		sitio.social_services && sitio.population > 0
			? (sitio.social_services.philhealth_beneficiaries / sitio.population) * 100
			: 0
	);

	// Calculate vaccination rates
	const dogVaccinationRate = $derived(
		sitio.domestic_animals && sitio.domestic_animals.dogs > 0
			? (sitio.domestic_animals.dogs_vaccinated / sitio.domestic_animals.dogs) * 100
			: 0
	);

	const catVaccinationRate = $derived(
		sitio.domestic_animals && sitio.domestic_animals.cats > 0
			? (sitio.domestic_animals.cats_vaccinated / sitio.domestic_animals.cats) * 100
			: 0
	);

	// Calculate backyard garden percentage
	const backyardGardenPercentage = $derived(
		sitio.food_security && sitio.households > 0
			? (sitio.food_security.households_with_backyard_garden / sitio.households) * 100
			: 0
	);
</script>

<!-- Social Services Tab -->
<div class="space-y-6">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<!-- Health Services Card -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-emerald-50 p-1.5">
						<Heart class="size-4 text-emerald-600" />
					</div>
					<h3 class="text-base font-semibold text-slate-800">Health Services</h3>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4 pt-0">
				{#if sitio.social_services}
					<!-- PhilHealth Coverage -->
					<div>
						<div class="mb-2 flex justify-between text-sm">
							<span class="text-slate-600">PhilHealth Coverage</span>
							<span class="font-semibold text-slate-900">{philhealthCoverage.toFixed(1)}%</span>
						</div>
						<Progress value={philhealthCoverage} class="h-2" />
						<div class="mt-1 text-xs text-slate-500">
							{formatNumber(sitio.social_services.philhealth_beneficiaries)} of {formatNumber(
								sitio.population
							)} covered
						</div>
					</div>

					<!-- 4Ps Beneficiaries -->
					<div class="rounded bg-purple-50 p-3">
						<div class="text-sm font-medium text-purple-700">4Ps Beneficiaries</div>
						<div class="mt-1 text-2xl font-bold text-purple-900">
							{formatNumber(sitio.social_services.fourps_beneficiaries)}
						</div>
						<div class="mt-1 text-xs text-purple-600">
							{((sitio.social_services.fourps_beneficiaries / sitio.households) * 100).toFixed(1)}% of
							households
						</div>
					</div>

					<!-- Domestic Animals Vaccination -->
					{#if sitio.domestic_animals}
						<div class="space-y-2">
							<div class="text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Animal Vaccination
							</div>
							<div class="space-y-2">
								<div>
									<div class="flex items-center justify-between text-xs">
										<span class="flex items-center gap-1 text-slate-600">
											<Dog class="size-3" /> Dogs
										</span>
										<span class="font-semibold text-slate-900">{dogVaccinationRate.toFixed(0)}%</span>
									</div>
									<Progress value={dogVaccinationRate} class="mt-1 h-1" />
									<div class="mt-0.5 text-xs text-slate-500">
										{sitio.domestic_animals.dogs_vaccinated} of {sitio.domestic_animals.dogs}
									</div>
								</div>
								<div>
									<div class="flex items-center justify-between text-xs">
										<span class="flex items-center gap-1 text-slate-600">
											<Dog class="size-3" /> Cats
										</span>
										<span class="font-semibold text-slate-900">{catVaccinationRate.toFixed(0)}%</span>
									</div>
									<Progress value={catVaccinationRate} class="mt-1 h-1" />
									<div class="mt-0.5 text-xs text-slate-500">
										{sitio.domestic_animals.cats_vaccinated} of {sitio.domestic_animals.cats}
									</div>
								</div>
							</div>
						</div>
					{/if}
				{:else}
					<div class="py-8 text-center">
						<Heart class="mx-auto size-12 text-slate-300" />
						<p class="mt-2 text-sm text-slate-500">No health services data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Food Security Card -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-green-50 p-1.5">
						<Apple class="size-4 text-green-600" />
					</div>
					<h3 class="text-base font-semibold text-slate-800">Food Security</h3>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4 pt-0">
				{#if sitio.food_security}
					<!-- Backyard Gardens -->
					<div>
						<div class="mb-2 flex justify-between text-sm">
							<span class="text-slate-600">Backyard Gardens</span>
							<span class="font-semibold text-slate-900">
								{backyardGardenPercentage.toFixed(1)}%
							</span>
						</div>
						<Progress value={backyardGardenPercentage} class="h-2" />
						<div class="mt-1 text-xs text-slate-500">
							{formatNumber(sitio.food_security.households_with_backyard_garden)} of {formatNumber(
								sitio.households
							)} households
						</div>
					</div>

					<!-- Common Commodities -->
					{#if sitio.food_security.common_garden_commodities && sitio.food_security.common_garden_commodities.length > 0}
						<div>
							<div class="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Common Crops
							</div>
							<div class="flex flex-wrap gap-2">
								{#each sitio.food_security.common_garden_commodities as commodity, i}
									<Badge
										variant="outline"
										class="bg-green-50 text-green-700 border-green-200"
									>
										{i + 1}. {commodity}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Summary -->
					<div class="rounded bg-green-50 p-3">
						<div class="text-sm font-medium text-green-700">Food Security Status</div>
						<div class="mt-1 text-xs text-green-600">
							{#if backyardGardenPercentage >= 70}
								Strong - High backyard garden adoption
							{:else if backyardGardenPercentage >= 40}
								Moderate - Growing food security
							{:else}
								Limited - Opportunity for improvement
							{/if}
						</div>
					</div>
				{:else}
					<div class="py-8 text-center">
						<Apple class="mx-auto size-12 text-slate-300" />
						<p class="mt-2 text-sm text-slate-500">No food security data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Community Empowerment Card -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-blue-50 p-1.5">
						<UsersIcon class="size-4 text-blue-600" />
					</div>
					<h3 class="text-base font-semibold text-slate-800">Community Empowerment</h3>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4 pt-0">
				{#if sitio.community_empowerment}
					<!-- Organizations -->
					<div class="rounded bg-blue-50 p-3 text-center">
						<div class="text-3xl font-bold text-blue-600">
							{sitio.community_empowerment.sectoral_organizations}
						</div>
						<div class="text-xs text-blue-700">Sectoral Organizations</div>
					</div>

					<!-- Information Dissemination -->
					{#if sitio.community_empowerment.info_dissemination_methods && sitio.community_empowerment.info_dissemination_methods.length > 0}
						<div>
							<div class="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Info Dissemination
							</div>
							<div class="flex flex-wrap gap-2">
								{#each sitio.community_empowerment.info_dissemination_methods as method}
									<Badge variant="outline" class="bg-blue-50 text-blue-700">
										{method}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Transportation -->
					{#if sitio.community_empowerment.transportation_methods && sitio.community_empowerment.transportation_methods.length > 0}
						<div>
							<div class="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Transportation
							</div>
							<div class="flex flex-wrap gap-2">
								{#each sitio.community_empowerment.transportation_methods as method}
									<Badge variant="outline" class="bg-slate-50 text-slate-700">
										{method}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}
				{:else}
					<div class="py-8 text-center">
						<UsersIcon class="mx-auto size-12 text-slate-300" />
						<p class="mt-2 text-sm text-slate-500">No community empowerment data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
