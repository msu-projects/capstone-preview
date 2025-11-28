<script lang="ts">
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import PopulationPyramid from '$lib/components/charts/PopulationPyramid.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import { formatNumber } from '$lib/utils/formatters';
	import {
		aggregateDemographics,
		toAgeChartData,
		toGenderChartData,
		toPopulationPyramidData
	} from '$lib/utils/sitio-aggregation';
	import { Activity, Baby, Briefcase, Home, PersonStanding, Users } from '@lucide/svelte';

	interface Props {
		sitios: Sitio[];
	}

	const { sitios }: Props = $props();

	// Compute aggregated demographics
	const demographics = $derived(aggregateDemographics(sitios));

	// Chart data
	const genderChartData = $derived(toGenderChartData(demographics));
	const ageChartData = $derived(toAgeChartData(demographics));
	const pyramidData = $derived(toPopulationPyramidData(demographics));

	// Dependency ratio interpretation
	const dependencyInterpretation = $derived.by(() => {
		if (demographics.dependencyRatio < 50) {
			return { status: 'Low', color: 'emerald', description: 'Strong working-age population base' };
		} else if (demographics.dependencyRatio < 75) {
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
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Total Population</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{formatNumber(demographics.totalPopulation)}
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
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Total Households</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{formatNumber(demographics.totalHouseholds)}
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
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-purple-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-purple-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<PersonStanding class="size-5 text-purple-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">
							Avg. Household Size
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{demographics.averageHouseholdSize.toFixed(1)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Working Age Population -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
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
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">
							Working Age (15-64)
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{demographics.age15to64Percentage.toFixed(0)}%
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Charts Row -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Population Pyramid -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 lg:col-span-2">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Users class="size-5 text-slate-500" />
					Population Pyramid
				</Card.Title>
				<Card.Description>Age and gender distribution across all sitios</Card.Description>
			</Card.Header>
			<Card.Content>
				<PopulationPyramid data={pyramidData} height={280} />
			</Card.Content>
		</Card.Root>

		<!-- Gender Distribution -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Activity class="size-5 text-slate-500" />
					Gender Distribution
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<DonutChart
					data={genderChartData}
					centerLabel="Total"
					centerValue={formatNumber(demographics.totalPopulation)}
					height={200}
				/>
				<div class="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
					<div class="rounded-lg bg-blue-50 p-2">
						<div class="font-semibold text-blue-700">{demographics.malePercentage.toFixed(1)}%</div>
						<div class="text-xs text-slate-500">Male</div>
					</div>
					<div class="rounded-lg bg-pink-50 p-2">
						<div class="font-semibold text-pink-700">
							{demographics.femalePercentage.toFixed(1)}%
						</div>
						<div class="text-xs text-slate-500">Female</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Age Distribution & Dependency -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Age Distribution -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Baby class="size-5 text-slate-500" />
					Age Distribution
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<DonutChart
					data={ageChartData}
					centerLabel="Population"
					centerValue={formatNumber(demographics.totalPopulation)}
					height={200}
				/>
				<div class="mt-4 space-y-3">
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2">
							<div class="h-3 w-3 rounded-full bg-blue-500"></div>
							<span>Children (0-14)</span>
						</div>
						<span class="font-medium">{formatNumber(demographics.age0to14)}</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2">
							<div class="h-3 w-3 rounded-full bg-emerald-500"></div>
							<span>Working Age (15-64)</span>
						</div>
						<span class="font-medium">{formatNumber(demographics.age15to64)}</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2">
							<div class="h-3 w-3 rounded-full bg-orange-500"></div>
							<span>Seniors (65+)</span>
						</div>
						<span class="font-medium">{formatNumber(demographics.age65above)}</span>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Dependency Ratio -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Activity class="size-5 text-slate-500" />
					Dependency Ratio
				</Card.Title>
				<Card.Description>
					Ratio of dependents (0-14 and 65+) to working-age population
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<div class="text-center">
					<div class="text-4xl font-bold text-slate-900">
						{demographics.dependencyRatio.toFixed(1)}%
					</div>
					<Badge
						variant="secondary"
						class="mt-2 bg-{dependencyInterpretation.color}-50 text-{dependencyInterpretation.color}-700"
					>
						{dependencyInterpretation.status} Dependency
					</Badge>
					<p class="mt-2 text-sm text-slate-500">{dependencyInterpretation.description}</p>
				</div>

				<div class="space-y-3">
					<div class="space-y-1">
						<div class="flex justify-between text-sm">
							<span class="text-slate-600">Children (0-14)</span>
							<span class="font-medium">{demographics.age0to14Percentage.toFixed(1)}%</span>
						</div>
						<Progress value={demographics.age0to14Percentage} class="h-2" />
					</div>
					<div class="space-y-1">
						<div class="flex justify-between text-sm">
							<span class="text-slate-600">Working Age (15-64)</span>
							<span class="font-medium">{demographics.age15to64Percentage.toFixed(1)}%</span>
						</div>
						<Progress value={demographics.age15to64Percentage} class="h-2" />
					</div>
					<div class="space-y-1">
						<div class="flex justify-between text-sm">
							<span class="text-slate-600">Seniors (65+)</span>
							<span class="font-medium">{demographics.age65abovePercentage.toFixed(1)}%</span>
						</div>
						<Progress value={demographics.age65abovePercentage} class="h-2" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
