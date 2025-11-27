<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import {
		Apple,
		Bus,
		Cat,
		Dog,
		Heart,
		Megaphone,
		Radio,
		Sprout,
		Syringe,
		Users,
		Vote
	} from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
	}

	const { sitio }: Props = $props();

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	// Calculate coverages
	const philhealthCoverage = $derived(
		sitio.social_services && sitio.population > 0
			? (sitio.social_services.philhealth_beneficiaries / sitio.population) * 100
			: 0
	);

	const fourpsCoverage = $derived(
		sitio.social_services && sitio.households > 0
			? (sitio.social_services.fourps_beneficiaries / sitio.households) * 100
			: 0
	);

	const backyardGardenCoverage = $derived(
		sitio.food_security && sitio.households > 0
			? (sitio.food_security.households_with_backyard_garden / sitio.households) * 100
			: 0
	);

	// Vaccination rates
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

	// Food security status
	const foodSecurityStatus = $derived.by(() => {
		if (backyardGardenCoverage >= 70) {
			return { status: 'Strong', color: 'emerald', description: 'High backyard garden adoption' };
		} else if (backyardGardenCoverage >= 40) {
			return { status: 'Moderate', color: 'amber', description: 'Growing food security practices' };
		} else {
			return { status: 'Limited', color: 'red', description: 'Opportunity for improvement' };
		}
	});
</script>

<div class="space-y-6">
	<!-- Key Social Indicators -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card.Root class="relative overflow-hidden shadow-sm">
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50"
			></div>
			<Card.Content class="relative p-5">
				<div class="flex items-center gap-4">
					<div class="rounded-xl bg-emerald-100 p-3 ring-1 ring-emerald-200">
						<Heart class="size-6 text-emerald-600" />
					</div>
					<div>
						<p class="text-sm font-medium text-slate-500">PhilHealth</p>
						<p class="text-2xl font-bold tracking-tight text-slate-900">
							{philhealthCoverage.toFixed(0)}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="relative overflow-hidden shadow-sm">
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-50 opacity-50"
			></div>
			<Card.Content class="relative p-5">
				<div class="flex items-center gap-4">
					<div class="rounded-xl bg-purple-100 p-3 ring-1 ring-purple-200">
						<Users class="size-6 text-purple-600" />
					</div>
					<div>
						<p class="text-sm font-medium text-slate-500">4Ps Coverage</p>
						<p class="text-2xl font-bold tracking-tight text-slate-900">
							{fourpsCoverage.toFixed(0)}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="relative overflow-hidden shadow-sm">
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-50 opacity-50"
			></div>
			<Card.Content class="relative p-5">
				<div class="flex items-center gap-4">
					<div class="rounded-xl bg-blue-100 p-3 ring-1 ring-blue-200">
						<Vote class="size-6 text-blue-600" />
					</div>
					<div>
						<p class="text-sm font-medium text-slate-500">Reg. Voters</p>
						<p class="text-2xl font-bold tracking-tight text-slate-900">
							{formatNumber(sitio.social_services?.registered_voters || 0)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="relative overflow-hidden shadow-sm">
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-green-50 opacity-50"
			></div>
			<Card.Content class="relative p-5">
				<div class="flex items-center gap-4">
					<div class="rounded-xl bg-green-100 p-3 ring-1 ring-green-200">
						<Sprout class="size-6 text-green-600" />
					</div>
					<div>
						<p class="text-sm font-medium text-slate-500">Gardens</p>
						<p class="text-2xl font-bold tracking-tight text-slate-900">
							{backyardGardenCoverage.toFixed(0)}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Health & Social Services -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Health Services -->
		<Card.Root class="shadow-sm">
			<Card.Header class="border-b bg-emerald-50/50 pb-4">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-emerald-100 p-1.5">
						<Heart class="size-4 text-emerald-600" />
					</div>
					<Card.Title class="text-lg">Health & Social Services</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="pt-4">
				{#if sitio.social_services}
					<div class="space-y-5">
						<!-- PhilHealth Coverage -->
						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="flex items-center gap-2 text-slate-600">
									<Heart class="size-4 text-emerald-600" />
									PhilHealth Coverage
								</span>
								<span class="font-semibold text-slate-900">{philhealthCoverage.toFixed(1)}%</span>
							</div>
							<Progress value={philhealthCoverage} class="h-3" />
							<div class="mt-1 text-xs text-slate-500">
								{formatNumber(sitio.social_services.philhealth_beneficiaries)} of {formatNumber(
									sitio.population
								)} covered
							</div>
						</div>

						<!-- 4Ps Coverage -->
						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="flex items-center gap-2 text-slate-600">
									<Users class="size-4 text-purple-600" />
									4Ps Beneficiaries
								</span>
								<span class="font-semibold text-slate-900">{fourpsCoverage.toFixed(1)}%</span>
							</div>
							<Progress value={fourpsCoverage} class="h-3" />
							<div class="mt-1 text-xs text-slate-500">
								{formatNumber(sitio.social_services.fourps_beneficiaries)} of {formatNumber(
									sitio.households
								)} households
							</div>
						</div>

						<!-- Registered Voters -->
						<div class="rounded-lg bg-blue-50 p-4 ring-1 ring-blue-100">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<Vote class="size-5 text-blue-600" />
									<span class="text-sm font-medium text-blue-700">Registered Voters</span>
								</div>
								<span class="text-2xl font-bold text-blue-800">
									{formatNumber(sitio.social_services.registered_voters)}
								</span>
							</div>
						</div>
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Heart class="size-16 text-slate-200" />
						<p class="mt-4 text-sm text-slate-500">No health services data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Food Security -->
		<Card.Root class="shadow-sm">
			<Card.Header class="border-b bg-green-50/50 pb-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-green-100 p-1.5">
							<Apple class="size-4 text-green-600" />
						</div>
						<Card.Title class="text-lg">Food Security</Card.Title>
					</div>
					{#if sitio.food_security}
						<Badge
							variant="secondary"
							class={foodSecurityStatus.color === 'emerald'
								? 'bg-emerald-100 text-emerald-700'
								: foodSecurityStatus.color === 'amber'
									? 'bg-amber-100 text-amber-700'
									: 'bg-red-100 text-red-700'}
						>
							{foodSecurityStatus.status}
						</Badge>
					{/if}
				</div>
			</Card.Header>
			<Card.Content class="pt-4">
				{#if sitio.food_security}
					<div class="space-y-4">
						<!-- Backyard Gardens -->
						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="text-slate-600">Households with Backyard Garden</span>
								<span class="font-semibold text-slate-900"
									>{backyardGardenCoverage.toFixed(1)}%</span
								>
							</div>
							<Progress value={backyardGardenCoverage} class="h-3" />
							<div class="mt-1 text-xs text-slate-500">
								{formatNumber(sitio.food_security.households_with_backyard_garden)} of {formatNumber(
									sitio.households
								)} households
							</div>
						</div>

						<!-- Common Crops -->
						{#if sitio.food_security.common_garden_commodities && sitio.food_security.common_garden_commodities.length > 0}
							<div>
								<div class="mb-2 text-xs font-medium tracking-wider text-slate-400 uppercase">
									Common Garden Commodities
								</div>
								<div class="flex flex-wrap gap-2">
									{#each sitio.food_security.common_garden_commodities as commodity, i}
										<Badge
											variant="secondary"
											class="gap-1 bg-green-50 text-green-700 ring-1 ring-green-200"
										>
											<Sprout class="size-3" />
											{commodity}
										</Badge>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Status Summary -->
						<div class="rounded-lg border border-green-200 bg-green-50/50 p-4">
							<div class="text-sm font-medium text-green-800">Food Security Assessment</div>
							<p class="mt-1 text-sm text-green-700">{foodSecurityStatus.description}</p>
						</div>
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Apple class="size-16 text-slate-200" />
						<p class="mt-4 text-sm text-slate-500">No food security data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Domestic Animals & Community Empowerment -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Domestic Animals -->
		<Card.Root class="shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 pb-4">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-amber-100 p-1.5">
						<Dog class="size-4 text-amber-600" />
					</div>
					<Card.Title class="text-lg">Domestic Animals & Vaccination</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="pt-4">
				{#if sitio.domestic_animals}
					<div class="space-y-4">
						<!-- Animal Counts -->
						<div class="grid grid-cols-2 gap-4">
							<div class="rounded-xl bg-amber-50 p-4 text-center ring-1 ring-amber-100">
								<Dog class="mx-auto size-8 text-amber-600" />
								<div class="mt-2 text-2xl font-bold text-amber-800">
									{formatNumber(sitio.domestic_animals.dogs)}
								</div>
								<div class="text-xs text-amber-600">Dogs</div>
							</div>
							<div class="rounded-xl bg-purple-50 p-4 text-center ring-1 ring-purple-100">
								<Cat class="mx-auto size-8 text-purple-600" />
								<div class="mt-2 text-2xl font-bold text-purple-800">
									{formatNumber(sitio.domestic_animals.cats)}
								</div>
								<div class="text-xs text-purple-600">Cats</div>
							</div>
						</div>

						<!-- Vaccination Rates -->
						<div class="space-y-3">
							<div class="text-xs font-medium tracking-wider text-slate-400 uppercase">
								Vaccination Status
							</div>
							<div>
								<div class="mb-1 flex items-center justify-between text-sm">
									<span class="flex items-center gap-1 text-slate-600">
										<Syringe class="size-3 text-emerald-600" />
										Dogs Vaccinated
									</span>
									<span class="font-semibold text-slate-900">{dogVaccinationRate.toFixed(0)}%</span>
								</div>
								<Progress value={dogVaccinationRate} class="h-2" />
								<div class="mt-0.5 text-xs text-slate-500">
									{sitio.domestic_animals.dogs_vaccinated} of {sitio.domestic_animals.dogs}
								</div>
							</div>
							<div>
								<div class="mb-1 flex items-center justify-between text-sm">
									<span class="flex items-center gap-1 text-slate-600">
										<Syringe class="size-3 text-emerald-600" />
										Cats Vaccinated
									</span>
									<span class="font-semibold text-slate-900">{catVaccinationRate.toFixed(0)}%</span>
								</div>
								<Progress value={catVaccinationRate} class="h-2" />
								<div class="mt-0.5 text-xs text-slate-500">
									{sitio.domestic_animals.cats_vaccinated} of {sitio.domestic_animals.cats}
								</div>
							</div>
						</div>
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Dog class="size-16 text-slate-200" />
						<p class="mt-4 text-sm text-slate-500">No domestic animals data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Community Empowerment -->
		<Card.Root class="shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 pb-4">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-violet-100 p-1.5">
						<Megaphone class="size-4 text-violet-600" />
					</div>
					<Card.Title class="text-lg">Community Empowerment</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="pt-4">
				{#if sitio.community_empowerment}
					<div class="space-y-4">
						<!-- Organizations -->
						<div class="rounded-lg bg-violet-50 p-4 ring-1 ring-violet-100">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-violet-700">Sectoral Organizations</span>
								<span class="text-2xl font-bold text-violet-800">
									{sitio.community_empowerment.sectoral_organizations}
								</span>
							</div>
						</div>

						<!-- Info Dissemination -->
						{#if sitio.community_empowerment.info_dissemination_methods && sitio.community_empowerment.info_dissemination_methods.length > 0}
							<div>
								<div class="mb-2 text-xs font-medium tracking-wider text-slate-400 uppercase">
									Information Dissemination Methods
								</div>
								<div class="flex flex-wrap gap-2">
									{#each sitio.community_empowerment.info_dissemination_methods as method}
										<Badge variant="secondary" class="gap-1 bg-slate-100 text-slate-700">
											{#if method.toLowerCase().includes('radio')}
												<Radio class="size-3" />
											{:else}
												<Megaphone class="size-3" />
											{/if}
											{method}
										</Badge>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Transportation -->
						{#if sitio.community_empowerment.transportation_methods && sitio.community_empowerment.transportation_methods.length > 0}
							<div>
								<div class="mb-2 text-xs font-medium tracking-wider text-slate-400 uppercase">
									Transportation Methods
								</div>
								<div class="flex flex-wrap gap-2">
									{#each sitio.community_empowerment.transportation_methods as transport}
										<Badge variant="secondary" class="gap-1 bg-blue-50 text-blue-700">
											<Bus class="size-3" />
											{transport}
										</Badge>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Megaphone class="size-16 text-slate-200" />
						<p class="mt-4 text-sm text-slate-500">No community empowerment data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
