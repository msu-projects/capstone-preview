<script lang="ts">
	import StackedBarChart from '$lib/components/charts/StackedBarChart.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import { formatNumber } from '$lib/utils/formatters';
	import { aggregateSocialServices } from '$lib/utils/sitio-aggregation';
	import { Cat, Dog, Heart, ShieldCheck, Sprout, Syringe, Users, Vote } from '@lucide/svelte';

	interface Props {
		sitios: Sitio[];
	}

	const { sitios }: Props = $props();

	// Compute aggregated social services
	const social = $derived(aggregateSocialServices(sitios));

	// Stacked bar chart data for coverage comparison
	const coverageCategories = $derived(['Voter Registration', 'PhilHealth', '4Ps']);
	const coverageSeries = $derived([
		{
			name: 'Covered',
			data: [
				Math.round(social.voterRegistrationPercent),
				Math.round(social.philhealthCoveragePercent),
				Math.round(social.fourpsCoveragePercent)
			],
			color: 'hsl(142, 71%, 45%)'
		},
		{
			name: 'Not Covered',
			data: [
				Math.round(100 - social.voterRegistrationPercent),
				Math.round(100 - social.philhealthCoveragePercent),
				Math.round(100 - social.fourpsCoveragePercent)
			],
			color: 'hsl(0, 84%, 60%)'
		}
	]);

	// Food security status
	const foodSecurityStatus = $derived.by(() => {
		if (social.backyardGardenPercent >= 70) {
			return { status: 'Strong', color: 'emerald', description: 'High backyard garden adoption' };
		} else if (social.backyardGardenPercent >= 40) {
			return { status: 'Moderate', color: 'amber', description: 'Growing food security practices' };
		} else {
			return { status: 'Limited', color: 'red', description: 'Opportunity for improvement' };
		}
	});
</script>

<div class="space-y-6">
	<!-- Key Social Indicators -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- PhilHealth -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
			title="{formatNumber(social.philhealthBeneficiaries)} out of {formatNumber(
				social.totalPopulation
			)} people"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50 dark:bg-emerald-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div
						class="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-emerald-900/30"
					>
						<Heart class="size-5 text-emerald-700 sm:size-6 dark:text-emerald-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							PhilHealth
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{formatNumber(social.philhealthBeneficiaries)}
						</p>
						<p class="text-xs text-slate-400 dark:text-slate-500">
							{social.philhealthCoveragePercent.toFixed(1)}% of population
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- 4Ps -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
			title="{formatNumber(social.fourpsBeneficiaries)} out of {formatNumber(
				social.totalHouseholds
			)} households"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-50 opacity-50 dark:bg-purple-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div
						class="rounded-xl bg-purple-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-purple-900/30"
					>
						<Users class="size-5 text-purple-700 sm:size-6 dark:text-purple-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							4Ps Beneficiaries
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{formatNumber(social.fourpsBeneficiaries)}
						</p>
						<p class="text-xs text-slate-400 dark:text-slate-500">
							{social.fourpsCoveragePercent.toFixed(1)}% of households
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Registered Voters -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
			title="{formatNumber(social.registeredVoters)} out of {formatNumber(
				social.totalPopulation
			)} people"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-50 opacity-50 dark:bg-blue-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-blue-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-blue-900/30">
						<Vote class="size-5 text-blue-700 sm:size-6 dark:text-blue-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Registered Voters
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{formatNumber(social.registeredVoters)}
						</p>
						<p class="text-xs text-slate-400 dark:text-slate-500">
							{social.voterRegistrationPercent.toFixed(1)}% of population
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Backyard Gardens -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
			title="{formatNumber(social.householdsWithBackyardGarden)} out of {formatNumber(
				social.totalHouseholds
			)} households"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-green-50 opacity-50 dark:bg-green-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-green-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-green-900/30">
						<Sprout class="size-5 text-green-700 sm:size-6 dark:text-green-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Backyard Gardens
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{formatNumber(social.householdsWithBackyardGarden)}
						</p>
						<p class="text-xs text-slate-400 dark:text-slate-500">
							{social.backyardGardenPercent.toFixed(1)}% of households
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Charts Row -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Coverage Comparison -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<ShieldCheck class="size-5 text-slate-500 dark:text-slate-400" />
					Social Safety Net Coverage
				</Card.Title>
				<Card.Description>Comparison of coverage rates across programs</Card.Description>
			</Card.Header>
			<Card.Content>
				<StackedBarChart
					series={coverageSeries}
					categories={coverageCategories}
					height={250}
					stacked100={true}
				/>
			</Card.Content>
		</Card.Root>

		<!-- Food Security -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Sprout class="size-5 text-slate-500 dark:text-slate-400" />
					Food Security Status
				</Card.Title>
				<Card.Description>Household food security indicators</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<div class="text-center">
					<div class="text-4xl font-bold text-slate-900 dark:text-slate-100">
						{social.backyardGardenPercent.toFixed(1)}%
					</div>
					<Badge
						variant="secondary"
						class="mt-2 bg-{foodSecurityStatus.color}-50 text-{foodSecurityStatus.color}-700"
					>
						{foodSecurityStatus.status}
					</Badge>
					<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
						{foodSecurityStatus.description}
					</p>
				</div>

				<div class="space-y-3">
					<div class="space-y-1">
						<div class="flex justify-between text-sm">
							<span class="text-slate-600 dark:text-slate-400">Households with Backyard Garden</span
							>
							<span class="font-medium">{formatNumber(social.householdsWithBackyardGarden)}</span>
						</div>
						<Progress value={social.backyardGardenPercent} class="h-2" />
					</div>
				</div>

				<div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
					<p class="text-sm text-green-800 dark:text-green-300">
						<strong>{formatNumber(social.householdsWithBackyardGarden)}</strong> out of
						<strong>{formatNumber(social.totalHouseholds)}</strong> households maintain backyard gardens
						for food production.
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Animal Welfare Section -->
	<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-base">
				<Syringe class="size-5 text-slate-500 dark:text-slate-400" />
				Domestic Animal Vaccination
			</Card.Title>
			<Card.Description>Vaccination rates for dogs and cats across all sitios</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-6 sm:grid-cols-2">
				<!-- Dogs -->
				<div class="space-y-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
							<Dog class="size-6 text-orange-600 dark:text-orange-400" />
						</div>
						<div>
							<p class="font-medium text-slate-900 dark:text-slate-100">Dogs</p>
							<p class="text-sm text-slate-500 dark:text-slate-400">
								{formatNumber(social.totalDogs)} total
							</p>
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex justify-between text-sm">
							<span>Vaccinated</span>
							<span class="font-medium">{social.dogVaccinationRate.toFixed(1)}%</span>
						</div>
						<Progress value={social.dogVaccinationRate} class="h-2" />
						<p class="text-xs text-slate-500 dark:text-slate-400">
							{formatNumber(social.dogsVaccinated)} vaccinated
						</p>
					</div>
				</div>

				<!-- Cats -->
				<div class="space-y-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
							<Cat class="size-6 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<p class="font-medium text-slate-900 dark:text-slate-100">Cats</p>
							<p class="text-sm text-slate-500 dark:text-slate-400">
								{formatNumber(social.totalCats)} total
							</p>
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex justify-between text-sm">
							<span>Vaccinated</span>
							<span class="font-medium">{social.catVaccinationRate.toFixed(1)}%</span>
						</div>
						<Progress value={social.catVaccinationRate} class="h-2" />
						<p class="text-xs text-slate-500 dark:text-slate-400">
							{formatNumber(social.catsVaccinated)} vaccinated
						</p>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
