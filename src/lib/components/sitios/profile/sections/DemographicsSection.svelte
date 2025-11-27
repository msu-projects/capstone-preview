<script lang="ts">
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import TrendBadge from '$lib/components/sitios/profile/TrendBadge.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import type { SitioYearlySnapshot } from '$lib/types/sitio-yearly';
	import {
		Activity,
		Baby,
		Briefcase,
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

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

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
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-blue-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Users class="size-5 text-blue-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Total Population</p>
							<TrendBadge
								currentValue={sitio.population}
								previousValue={previousSnapshot?.population ?? null}
							/>
						</div>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{formatNumber(sitio.population)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Households -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-emerald-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Home class="size-5 text-emerald-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Households</p>
							<TrendBadge
								currentValue={sitio.households}
								previousValue={previousSnapshot?.households ?? null}
							/>
						</div>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{formatNumber(sitio.households)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Avg Household Size -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-violet-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-violet-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-violet-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<PersonStanding class="size-5 text-violet-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">
							Avg. Household Size
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{avgHouseholdSize.toFixed(1)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Working Age Population -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
			title="{formatNumber(sitio.demographics.age_15_64)} out of {formatNumber(
				sitio.population
			)} people"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-amber-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-amber-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Briefcase class="size-5 text-amber-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Working Age</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
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
			<Card.Header class="border-b bg-slate-50/50 py-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-indigo-100 p-1.5">
							<Users class="size-4 text-indigo-600" />
						</div>
						<Card.Title class="text-lg">Gender Distribution</Card.Title>
					</div>
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				<!-- Visual Gender Bar -->
				<div class="mb-6">
					<div class="flex h-4 overflow-hidden rounded-full">
						<div
							class="bg-blue-500 transition-all duration-500"
							style="width: {malePercentage}%"
						></div>
						<div
							class="bg-pink-500 transition-all duration-500"
							style="width: {femalePercentage}%"
						></div>
					</div>
					<div class="mt-3 flex justify-between text-sm">
						<div class="flex items-center gap-2">
							<div class="h-3 w-3 rounded-full bg-blue-500"></div>
							<span class="text-slate-600">Male</span>
							<span class="font-semibold text-slate-900">{malePercentage.toFixed(1)}%</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="h-3 w-3 rounded-full bg-pink-500"></div>
							<span class="text-slate-600">Female</span>
							<span class="font-semibold text-slate-900">{femalePercentage.toFixed(1)}%</span>
						</div>
					</div>
				</div>

				<!-- Gender Count Cards -->
				<div class="grid grid-cols-2 gap-4">
					<div class="rounded-xl bg-blue-50 p-4 text-center ring-1 ring-blue-100">
						<div class="text-3xl font-bold text-blue-700">
							{formatNumber(sitio.demographics.male)}
						</div>
						<div class="mt-1 text-sm text-blue-600">Male</div>
					</div>
					<div class="rounded-xl bg-pink-50 p-4 text-center ring-1 ring-pink-100">
						<div class="text-3xl font-bold text-pink-700">
							{formatNumber(sitio.demographics.female)}
						</div>
						<div class="mt-1 text-sm text-pink-600">Female</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Age Distribution -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-emerald-100 p-1.5">
						<Activity class="size-4 text-emerald-600" />
					</div>
					<Card.Title class="text-lg">Age Distribution</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				<div style="height: 220px;">
					<DonutChart
						data={ageChartData}
						centerValue={formatNumber(sitio.population)}
						centerLabel="Total"
						height={220}
					/>
				</div>

				<!-- Age Group Details -->
				<div class="mt-4 space-y-3">
					{#each [{ label: 'Children (0-14)', value: sitio.demographics.age_0_14, percent: childrenPercentage, color: 'blue', icon: Baby }, { label: 'Working Age (15-64)', value: sitio.demographics.age_15_64, percent: workingAgePercentage, color: 'emerald', icon: Briefcase }, { label: 'Seniors (65+)', value: sitio.demographics.age_65_above, percent: seniorPercentage, color: 'amber', icon: PersonStanding }] as group}
						{@const bgClass = {
							blue: 'bg-blue-50',
							emerald: 'bg-emerald-50',
							amber: 'bg-amber-50'
						}[group.color]}
						{@const textClass = {
							blue: 'text-blue-700',
							emerald: 'text-emerald-700',
							amber: 'text-amber-700'
						}[group.color]}
						<div class="flex items-center justify-between rounded-lg {bgClass} px-3 py-2">
							<div class="flex items-center gap-2">
								<group.icon class="size-4 {textClass}" />
								<span class="text-sm {textClass}">{group.label}</span>
							</div>
							<div class="text-right">
								<span class="font-semibold {textClass}">{formatNumber(group.value)}</span>
								<span class="ml-1 text-xs {textClass}">({group.percent.toFixed(1)}%)</span>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Dependency Ratio Analysis -->
	<Card.Root class="gap-0 py-0 shadow-sm">
		<Card.Header class="border-b bg-slate-50/50 py-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-purple-100 p-1.5">
						<TrendingUp class="size-4 text-purple-600" />
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
					class="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-6 text-center"
				>
					<div class="text-5xl font-bold text-slate-900">{dependencyRatio.toFixed(1)}%</div>
					<div class="mt-2 text-sm text-slate-600">Dependency Ratio</div>
					<div class="mt-3 max-w-xs text-xs text-slate-500">
						{dependencyInterpretation.description}
					</div>
				</div>

				<!-- Population Breakdown -->
				<div class="lg:col-span-2">
					<div class="space-y-4">
						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="flex items-center gap-2 text-slate-600">
									<Briefcase class="size-4 text-emerald-600" />
									Working Age Population (15-64)
								</span>
								<span class="font-semibold text-slate-900">
									{formatNumber(sitio.demographics.age_15_64)} ({workingAgePercentage.toFixed(1)}%)
								</span>
							</div>
							<Progress value={workingAgePercentage} class="h-3" />
						</div>

						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="flex items-center gap-2 text-slate-600">
									<Baby class="size-4 text-blue-600" />
									Young Dependents (0-14)
								</span>
								<span class="font-semibold text-slate-900">
									{formatNumber(sitio.demographics.age_0_14)} ({childrenPercentage.toFixed(1)}%)
								</span>
							</div>
							<Progress value={childrenPercentage} class="h-3" />
						</div>

						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="flex items-center gap-2 text-slate-600">
									<PersonStanding class="size-4 text-amber-600" />
									Senior Dependents (65+)
								</span>
								<span class="font-semibold text-slate-900">
									{formatNumber(sitio.demographics.age_65_above)} ({seniorPercentage.toFixed(1)}%)
								</span>
							</div>
							<Progress value={seniorPercentage} class="h-3" />
						</div>
					</div>

					<!-- Interpretation Box -->
					<div class="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
						<div class="text-sm font-medium text-slate-700">What this means:</div>
						<p class="mt-1 text-sm text-slate-600">
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
</div>
