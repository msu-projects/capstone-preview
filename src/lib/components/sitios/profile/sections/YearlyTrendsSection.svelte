<script lang="ts">
	import LineChart from '$lib/components/charts/LineChart.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { SitioYearlySnapshot, YearlyComparison } from '$lib/types/sitio-yearly';
	import { getKeyMetricsComparison } from '$lib/types/sitio-yearly';
	import { formatNumber } from '$lib/utils/formatters';
	import {
		ArrowDown,
		ArrowUp,
		BarChart3,
		Calendar,
		Minus,
		TrendingDown,
		TrendingUp
	} from '@lucide/svelte';

	interface Props {
		snapshots: SitioYearlySnapshot[];
		currentYear: number;
	}

	const { snapshots, currentYear }: Props = $props();

	// Get the current and previous year snapshots
	const currentSnapshot = $derived(snapshots.find((s) => s.year === currentYear));
	const previousSnapshot = $derived(
		snapshots.find((s) => s.year === currentYear - 1) ||
			snapshots.filter((s) => s.year < currentYear).sort((a, b) => b.year - a.year)[0]
	);

	// Get comparisons if we have both snapshots
	const comparisons = $derived<YearlyComparison[]>(
		currentSnapshot && previousSnapshot
			? getKeyMetricsComparison(currentSnapshot, previousSnapshot)
			: []
	);

	// Get years for trend chart (sorted ascending)
	const years = $derived(
		snapshots
			.map((s) => s.year)
			.sort((a, b) => a - b)
			.map((y) => y.toString())
	);

	// Prepare population trend data
	const populationTrendData = $derived({
		series: [
			{
				name: 'Population',
				data: snapshots.toSorted((a, b) => a.year - b.year).map((s) => s.population),
				color: 'hsl(217, 91%, 60%)'
			}
		],
		categories: years
	});

	// Prepare households trend data
	const householdsTrendData = $derived({
		series: [
			{
				name: 'Households',
				data: snapshots.toSorted((a, b) => a.year - b.year).map((s) => s.households),
				color: 'hsl(142, 71%, 45%)'
			}
		],
		categories: years
	});

	// Multi-metric trend (demographics)
	const demographicsTrendData = $derived({
		series: [
			{
				name: 'Children (0-14)',
				data: snapshots.toSorted((a, b) => a.year - b.year).map((s) => s.demographics.age_0_14),
				color: 'hsl(217, 91%, 60%)'
			},
			{
				name: 'Working Age (15-64)',
				data: snapshots.toSorted((a, b) => a.year - b.year).map((s) => s.demographics.age_15_64),
				color: 'hsl(142, 71%, 45%)'
			},
			{
				name: 'Seniors (65+)',
				data: snapshots.toSorted((a, b) => a.year - b.year).map((s) => s.demographics.age_65_above),
				color: 'hsl(24, 95%, 53%)'
			}
		],
		categories: years
	});

	// Services coverage trend
	const servicesTrendData = $derived({
		series: [
			{
				name: 'PhilHealth',
				data: snapshots
					.toSorted((a, b) => a.year - b.year)
					.map((s) => s.social_services?.philhealth_beneficiaries || 0),
				color: 'hsl(142, 71%, 45%)'
			},
			{
				name: '4Ps',
				data: snapshots
					.toSorted((a, b) => a.year - b.year)
					.map((s) => s.social_services?.fourps_beneficiaries || 0),
				color: 'hsl(262, 83%, 58%)'
			}
		],
		categories: years
	});

	// Utility to get trend color and icon
	function getTrendStyle(trend: 'up' | 'down' | 'stable', isPositiveGood: boolean = true) {
		if (trend === 'stable') {
			return {
				color: 'text-slate-500 dark:text-slate-400',
				bgColor: 'bg-slate-100 dark:bg-slate-800',
				icon: Minus
			};
		}
		const isGood = (trend === 'up') === isPositiveGood;
		if (isGood) {
			return {
				color: 'text-emerald-600 dark:text-emerald-400',
				bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
				icon: TrendingUp
			};
		}
		return {
			color: 'text-red-600 dark:text-red-400',
			bgColor: 'bg-red-50 dark:bg-red-900/30',
			icon: TrendingDown
		};
	}
</script>

<div class="space-y-6">
	<!-- Year-over-Year Comparison Cards -->
	{#if comparisons.length > 0 && previousSnapshot}
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6 dark:bg-slate-800/50">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/30">
							<BarChart3 class="size-4 text-blue-600 dark:text-blue-400" />
						</div>
						<Card.Title class="text-lg">Year-over-Year Comparison</Card.Title>
					</div>
					<Badge variant="outline" class="bg-slate-100">
						<Calendar class="mr-1 size-3" />
						{previousSnapshot.year} → {currentYear}
					</Badge>
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
					{#each comparisons as comparison}
						{@const style = getTrendStyle(comparison.trend)}
						<div
							class="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-sm dark:border-slate-700 dark:bg-slate-800"
						>
							<p class="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
								{comparison.metric}
							</p>
							<p class="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
								{formatNumber(comparison.currentValue)}
							</p>
							<div class="mt-2 flex items-center gap-1">
								<div class="{style.bgColor} rounded-full p-0.5">
									{#if comparison.trend === 'up'}
										<ArrowUp class="size-3 {style.color}" />
									{:else if comparison.trend === 'down'}
										<ArrowDown class="size-3 {style.color}" />
									{:else}
										<Minus class="size-3 {style.color}" />
									{/if}
								</div>
								<span class="text-xs font-medium {style.color}">
									{comparison.changePercent >= 0 ? '+' : ''}{comparison.changePercent.toFixed(1)}%
								</span>
								<span class="text-xs text-slate-400 dark:text-slate-500">
									({comparison.change >= 0 ? '+' : ''}{formatNumber(comparison.change)})
								</span>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Trend Charts -->
	{#if snapshots.length >= 2}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Population Trend -->
			<Card.Root class="gap-0 py-0 shadow-sm">
				<Card.Header class="border-b bg-slate-50/50 py-6 dark:bg-slate-800/50">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/30">
							<TrendingUp class="size-4 text-blue-600 dark:text-blue-400" />
						</div>
						<Card.Title class="text-lg">Population Trend</Card.Title>
					</div>
				</Card.Header>
				<Card.Content class="py-6">
					<LineChart
						series={populationTrendData.series}
						categories={populationTrendData.categories}
						height={250}
						showLegend={false}
					/>
				</Card.Content>
			</Card.Root>

			<!-- Households Trend -->
			<Card.Root class="gap-0 py-0 shadow-sm">
				<Card.Header class="border-b bg-slate-50/50 py-6 dark:bg-slate-800/50">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/30">
							<TrendingUp class="size-4 text-emerald-600 dark:text-emerald-400" />
						</div>
						<Card.Title class="text-lg">Households Trend</Card.Title>
					</div>
				</Card.Header>
				<Card.Content class="py-6">
					<LineChart
						series={householdsTrendData.series}
						categories={householdsTrendData.categories}
						height={250}
						showLegend={false}
					/>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Demographics Age Groups Trend -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6 dark:bg-slate-800/50">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-violet-100 p-1.5 dark:bg-violet-900/30">
						<TrendingUp class="size-4 text-violet-600 dark:text-violet-400" />
					</div>
					<Card.Title class="text-lg">Age Distribution Trend</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				<LineChart
					series={demographicsTrendData.series}
					categories={demographicsTrendData.categories}
					height={300}
					showLegend={true}
				/>
			</Card.Content>
		</Card.Root>

		<!-- Social Services Trend -->
		{#if snapshots.some((s) => s.social_services)}
			<Card.Root class="gap-0 py-0 shadow-sm">
				<Card.Header class="border-b bg-slate-50/50 py-6 dark:bg-slate-800/50">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-amber-100 p-1.5 dark:bg-amber-900/30">
							<TrendingUp class="size-4 text-amber-600 dark:text-amber-400" />
						</div>
						<Card.Title class="text-lg">Social Services Coverage Trend</Card.Title>
					</div>
				</Card.Header>
				<Card.Content class="py-6">
					<LineChart
						series={servicesTrendData.series}
						categories={servicesTrendData.categories}
						height={300}
						showLegend={true}
					/>
				</Card.Content>
			</Card.Root>
		{/if}
	{:else}
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Content class="flex flex-col items-center justify-center py-12 text-center">
				<div class="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
					<BarChart3 class="size-8 text-slate-400" />
				</div>
				<h3 class="mt-4 font-semibold text-slate-900 dark:text-slate-100">
					Not Enough Data for Trends
				</h3>
				<p class="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
					Trend charts require at least 2 years of data. Save the current year's data and check back
					next year to see how this sitio has changed over time.
				</p>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
