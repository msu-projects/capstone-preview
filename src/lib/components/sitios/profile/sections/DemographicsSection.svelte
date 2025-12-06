<script lang="ts">
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import TrendBadge from '$lib/components/sitios/profile/TrendBadge.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import type { SitioYearlySnapshot } from '$lib/types/sitio-yearly';
	import { formatNumber } from '$lib/utils/formatters';
	import {
		Activity,
		Baby,
		Briefcase,
		Church,
		Globe,
		Home,
		PersonStanding,
		TrendingUp,
		Users
	} from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
		previousSnapshot?: SitioYearlySnapshot | null;
	}

	const { sitio, previousSnapshot = null }: Props = $props();

	// Gender distribution
	const malePercentage = $derived(
		sitio.population > 0 ? (sitio.demographics.male / sitio.population) * 100 : 0
	);
	const femalePercentage = $derived(
		sitio.population > 0 ? (sitio.demographics.female / sitio.population) * 100 : 0
	);

	// Age group percentages
	const childrenPercentage = $derived(
		sitio.population > 0 ? (sitio.demographics.age_0_14 / sitio.population) * 100 : 0
	);
	const workingAgePercentage = $derived(
		sitio.population > 0 ? (sitio.demographics.age_15_64 / sitio.population) * 100 : 0
	);
	const seniorPercentage = $derived(
		sitio.population > 0 ? (sitio.demographics.age_65_above / sitio.population) * 100 : 0
	);

	// Dependency ratio
	const dependencyRatio = $derived.by(() => {
		const working = sitio.demographics.age_15_64;
		const dependent = sitio.demographics.age_0_14 + sitio.demographics.age_65_above;
		return working > 0 ? (dependent / working) * 100 : 0;
	});

	// Average household size
	const avgHouseholdSize = $derived(sitio.households > 0 ? sitio.population / sitio.households : 0);

	// Gender chart data
	const genderChartData = $derived([
		{ label: 'Male', value: sitio.demographics.male, color: 'hsl(217, 91%, 60%)' },
		{ label: 'Female', value: sitio.demographics.female, color: 'hsl(330, 81%, 60%)' }
	]);

	// Age distribution chart data
	const ageChartData = $derived([
		{ label: 'Children (0-14)', value: sitio.demographics.age_0_14, color: 'hsl(217, 91%, 60%)' },
		{
			label: 'Working Age (15-64)',
			value: sitio.demographics.age_15_64,
			color: 'hsl(142, 71%, 45%)'
		},
		{ label: 'Seniors (65+)', value: sitio.demographics.age_65_above, color: 'hsl(24, 95%, 53%)' }
	]);

	// Dependency ratio interpretation
	const dependencyInterpretation = $derived.by(() => {
		if (dependencyRatio < 50) {
			return { status: 'Low', color: 'emerald', description: 'Strong working-age population base' };
		} else if (dependencyRatio < 75) {
			return { status: 'Moderate', color: 'amber', description: 'Balanced population structure' };
		} else {
			return { status: 'High', color: 'red', description: 'Many dependents per working adult' };
		}
	});
</script>

<div class="space-y-6">
	<!-- Population Overview Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Total Population -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-50 opacity-50 dark:bg-blue-900/30"
			></div>
			<div
				class="absolute inset-0 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-30 dark:bg-blue-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-blue-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-blue-900/30">
						<Users class="size-5 text-blue-700 sm:size-6 dark:text-blue-400" />
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
								Total Population
							</p>
							<TrendBadge
								currentValue={sitio.population}
								previousValue={previousSnapshot?.population ?? null}
							/>
						</div>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{formatNumber(sitio.population)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Households -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50 dark:bg-emerald-900/30"
			></div>
			<div
				class="absolute inset-0 bg-emerald-50 opacity-0 transition-opacity group-hover:opacity-30 dark:bg-emerald-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div
						class="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-emerald-900/30"
					>
						<Home class="size-5 text-emerald-700 sm:size-6 dark:text-emerald-400" />
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
								Households
							</p>
							<TrendBadge
								currentValue={sitio.households}
								previousValue={previousSnapshot?.households ?? null}
							/>
						</div>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{formatNumber(sitio.households)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Avg Household Size -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-violet-50 opacity-50 dark:bg-violet-900/30"
			></div>
			<div
				class="absolute inset-0 bg-violet-50 opacity-0 transition-opacity group-hover:opacity-30 dark:bg-violet-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div
						class="rounded-xl bg-violet-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-violet-900/30"
					>
						<PersonStanding class="size-5 text-violet-700 sm:size-6 dark:text-violet-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Avg. Household Size
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{avgHouseholdSize.toFixed(1)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Working Age Population -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
			title="{formatNumber(sitio.demographics.age_15_64)} out of {formatNumber(
				sitio.population
			)} people"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-50 opacity-50 dark:bg-amber-900/30"
			></div>
			<div
				class="absolute inset-0 bg-amber-50 opacity-0 transition-opacity group-hover:opacity-30 dark:bg-amber-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-amber-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-amber-900/30">
						<Briefcase class="size-5 text-amber-700 sm:size-6 dark:text-amber-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Working Age
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{workingAgePercentage.toFixed(0)}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Charts Row -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Gender Distribution -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6 dark:bg-slate-800/50">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-slate-50/50 p-1.5 dark:bg-slate-800/50">
						<Activity class="size-4 text-slate-500 dark:text-slate-400" />
					</div>
					<Card.Title class="text-lg">Gender Distribution</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				<DonutChart
					data={genderChartData}
					centerLabel="Total"
					centerValue={formatNumber(sitio.population)}
					height={320}
				/>
			</Card.Content>
		</Card.Root>

		<!-- Age Distribution -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6 dark:bg-slate-800/50">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/30">
						<Activity class="size-4 text-emerald-600 dark:text-emerald-400" />
					</div>
					<Card.Title class="text-lg">Age Distribution</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				<DonutChart
					data={ageChartData}
					centerValue={formatNumber(sitio.population)}
					centerLabel="Total"
					height={320}
				/>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Dependency Ratio Analysis -->
	<Card.Root class="gap-0 py-0 shadow-sm">
		<Card.Header class="border-b bg-slate-50/50 py-6 dark:bg-slate-800/50">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-purple-100 p-1.5 dark:bg-purple-900/30">
						<TrendingUp class="size-4 text-purple-600 dark:text-purple-400" />
					</div>
					<div>
						<Card.Title class="text-lg">Dependency Ratio Analysis</Card.Title>
						<Card.Description>
							Ratio of dependents (children + seniors) to working-age population
						</Card.Description>
					</div>
				</div>
				<Badge
					variant="secondary"
					class={dependencyInterpretation.color === 'emerald'
						? 'bg-emerald-100 text-emerald-700'
						: dependencyInterpretation.color === 'amber'
							? 'bg-amber-100 text-amber-700'
							: 'bg-red-100 text-red-700'}
				>
					{dependencyInterpretation.status}
				</Badge>
			</div>
		</Card.Header>
		<Card.Content class="py-6">
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<!-- Dependency Ratio Display -->
				<div
					class="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-6 text-center dark:bg-slate-800"
				>
					<div class="text-5xl font-bold text-slate-900 dark:text-slate-100">
						{dependencyRatio.toFixed(1)}%
					</div>
					<div class="mt-2 text-sm text-slate-600 dark:text-slate-400">Dependency Ratio</div>
					<div class="mt-3 max-w-xs text-xs text-slate-500 dark:text-slate-400">
						{dependencyInterpretation.description}
					</div>
				</div>

				<!-- Population Breakdown -->
				<div class="lg:col-span-2">
					<div class="space-y-4">
						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
									<Briefcase class="size-4 text-emerald-600 dark:text-emerald-400" />
									Working Age Population (15-64)
								</span>
								<span class="font-semibold text-slate-900 dark:text-slate-100">
									{formatNumber(sitio.demographics.age_15_64)} ({workingAgePercentage.toFixed(1)}%)
								</span>
							</div>
							<Progress value={workingAgePercentage} class="h-3" />
						</div>

						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
									<Baby class="size-4 text-blue-600 dark:text-blue-400" />
									Young Dependents (0-14)
								</span>
								<span class="font-semibold text-slate-900 dark:text-slate-100">
									{formatNumber(sitio.demographics.age_0_14)} ({childrenPercentage.toFixed(1)}%)
								</span>
							</div>
							<Progress value={childrenPercentage} class="h-3" />
						</div>

						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
									<PersonStanding class="size-4 text-amber-600 dark:text-amber-400" />
									Senior Dependents (65+)
								</span>
								<span class="font-semibold text-slate-900 dark:text-slate-100">
									{formatNumber(sitio.demographics.age_65_above)} ({seniorPercentage.toFixed(1)}%)
								</span>
							</div>
							<Progress value={seniorPercentage} class="h-3" />
						</div>
					</div>

					<!-- Interpretation Box -->
					<div
						class="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
					>
						<div class="text-sm font-medium text-slate-700 dark:text-slate-300">
							What this means:
						</div>
						<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
							{#if dependencyRatio < 50}
								This community has a favorable age structure with a strong working-age population
								that can support economic development and social programs.
							{:else if dependencyRatio < 75}
								This community has a balanced population structure. Social support systems should be
								maintained to assist dependents while leveraging the working-age population.
							{:else}
								This community has a high proportion of dependents. Special attention may be needed
								for youth programs and senior care services.
							{/if}
						</p>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Cultural Diversity -->
	{#if (sitio.ethnicities && sitio.ethnicities.length > 0) || (sitio.religions && sitio.religions.length > 0)}
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header
				class="border-b bg-linear-to-r from-violet-50/50 to-pink-50/50 py-6 dark:from-violet-950/50 dark:to-pink-950/50"
			>
				<div class="flex items-center gap-2">
					<div
						class="rounded-lg bg-linear-to-br from-violet-100 to-pink-100 p-1.5 dark:from-violet-900/50 dark:to-pink-900/50"
					>
						<Globe class="size-4 text-violet-600 dark:text-violet-400" />
					</div>
					<div>
						<Card.Title class="text-lg">Cultural Diversity</Card.Title>
						<Card.Description>Ethnic and religious composition of the community</Card.Description>
					</div>
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				<div class="grid gap-6 md:grid-cols-2">
					<!-- Ethnicities -->
					{#if sitio.ethnicities && sitio.ethnicities.length > 0}
						<div class="space-y-3">
							<div class="flex items-center gap-2">
								<Globe class="size-4 text-violet-500 dark:text-violet-400" />
								<span class="text-sm font-medium text-slate-700 dark:text-slate-300"
									>Ethnicities</span
								>
								<Badge variant="outline" class="ml-auto text-xs">
									{sitio.ethnicities.length}
									{sitio.ethnicities.length > 1 ? 'Groups' : 'Group'}
								</Badge>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each sitio.ethnicities as ethnicity, i}
									{@const colors = [
										'bg-violet-100 text-violet-700 ring-violet-200',
										'bg-purple-100 text-purple-700 ring-purple-200',
										'bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200',
										'bg-pink-100 text-pink-700 ring-pink-200',
										'bg-rose-100 text-rose-700 ring-rose-200'
									]}
									<Badge
										variant="secondary"
										class="{colors[i % colors.length]} ring-1 transition-transform hover:scale-105"
									>
										{ethnicity}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Religions -->
					{#if sitio.religions && sitio.religions.length > 0}
						<div class="space-y-3">
							<div class="flex items-center gap-2">
								<Church class="size-4 text-amber-500 dark:text-amber-400" />
								<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Religions</span
								>
								<Badge variant="outline" class="ml-auto text-xs">
									{sitio.religions.length}
									{sitio.religions.length > 1 ? 'Faiths' : 'Faith'}
								</Badge>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each sitio.religions as religion, i}
									{@const colors = [
										'bg-amber-100 text-amber-700 ring-amber-200',
										'bg-orange-100 text-orange-700 ring-orange-200',
										'bg-yellow-100 text-yellow-700 ring-yellow-200',
										'bg-lime-100 text-lime-700 ring-lime-200',
										'bg-teal-100 text-teal-700 ring-teal-200'
									]}
									<Badge
										variant="secondary"
										class="{colors[i % colors.length]} ring-1 transition-transform hover:scale-105"
									>
										{religion}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
