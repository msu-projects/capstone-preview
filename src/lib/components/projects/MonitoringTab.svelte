<script lang="ts">
	import PerformanceIndicatorsChart from '$lib/components/charts/PerformanceIndicatorsChart.svelte';
	import ProgressLineChart from '$lib/components/charts/ProgressLineChart.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Progress } from '$lib/components/ui/progress';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import type { MonthlyProgress, MonthlyReport, PerformanceTarget } from '$lib/types';
	import { aggregateAchievedOutputs } from '$lib/utils/project-adapters';
	import {
		Activity,
		BarChart3,
		CalendarClock,
		ChevronDown,
		Image as ImageIcon,
		Maximize2,
		Target,
		TrendingUp,
		Users
	} from '@lucide/svelte';

	interface Props {
		monthlyMonitoring: MonthlyReport[];
		monthlyProgress?: MonthlyProgress[];
		performanceTargets?: PerformanceTarget[];
		onReportClick: (report: MonthlyReport) => void;
	}

	const { monthlyMonitoring, monthlyProgress, performanceTargets, onReportClick }: Props = $props();

	const isMobile = new IsMobile();

	// Collapsible states - default open on desktop, closed on mobile
	let chartOpen = $state(true);
	let targetsOpen = $state(true);
	let indicatorsChartOpen = $state(true);

	// Initialize based on mobile state
	$effect(() => {
		chartOpen = !isMobile.current;
		targetsOpen = !isMobile.current;
		indicatorsChartOpen = !isMobile.current;
	});

	// Aggregate achieved outputs from all monthly progress entries
	const aggregatedOutputs = $derived(aggregateAchievedOutputs(monthlyProgress));

	// Format indicator key for display (e.g., 'seedlings_distributed' -> 'Seedlings Distributed')
	function formatIndicatorKey(key: string): string {
		return key
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	// Get achieved output value for a performance target
	function getAchievedValue(target: PerformanceTarget): number {
		// Try to match by indicator_type or indicator_name (normalized)
		const normalizedType = target.indicator_type?.toLowerCase().replace(/\s+/g, '_');
		const normalizedName = target.indicator_name?.toLowerCase().replace(/\s+/g, '_');

		return (
			aggregatedOutputs[normalizedType] ||
			aggregatedOutputs[normalizedName] ||
			aggregatedOutputs[target.indicator_type] ||
			aggregatedOutputs[target.indicator_name] ||
			0
		);
	}

	// Get beneficiaries reached from the latest monthly progress
	function getBeneficiariesReached(progress: MonthlyProgress | undefined): number | null {
		return progress?.beneficiaries_reached ?? null;
	}

	// Get achieved outputs for a specific month_year
	function getMonthlyAchievedOutputs(monthYear: string): Record<string, number> | undefined {
		const progress = monthlyProgress?.find((p) => p.month_year === monthYear);
		return progress?.achieved_outputs;
	}

	// Format achieved outputs as compact string
	function formatAchievedOutputs(outputs: Record<string, number> | undefined): string {
		if (!outputs || Object.keys(outputs).length === 0) return '';
		return Object.entries(outputs)
			.slice(0, 3)
			.map(([key, value]) => `${formatIndicatorKey(key).split(' ')[0]}: ${value}`)
			.join(' • ');
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'On Track':
				return 'bg-emerald-500';
			case 'Ahead of Schedule':
				return 'bg-blue-500';
			case 'Delayed':
				return 'bg-rose-500';
			default:
				return 'bg-slate-300';
		}
	}

	function getStatusBadgeVariant(
		status: string
	): 'default' | 'destructive' | 'outline' | 'secondary' {
		switch (status) {
			case 'On Track':
				return 'default';
			case 'Ahead of Schedule':
				return 'outline';
			case 'Delayed':
				return 'destructive';
			default:
				return 'secondary';
		}
	}
</script>

<!-- Monthly Monitoring Tab -->
<div class="relative space-y-6">
	<!-- Progress Over Time Chart (Collapsible) -->
	<Collapsible.Root bind:open={chartOpen}>
		<Card.Root class="overflow-hidden py-0">
			<Collapsible.Trigger class="w-full py-6 transition-colors hover:bg-muted/50">
				<Card.Header class="cursor-pointer">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<div class="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-900/30">
								<TrendingUp class="size-4 text-blue-600" />
							</div>
							<Card.Title class="text-base">Progress Over Time</Card.Title>
						</div>
						<ChevronDown
							class="size-5 text-muted-foreground transition-transform duration-200 {chartOpen
								? 'rotate-180'
								: ''}"
						/>
					</div>
				</Card.Header>
			</Collapsible.Trigger>
			<Collapsible.Content>
				<Card.Content class="pt-0">
					<ProgressLineChart data={monthlyMonitoring} height={280} showFinancial={false} />
				</Card.Content>
			</Collapsible.Content>
		</Card.Root>
	</Collapsible.Root>

	<!-- Performance Targets (Collapsible) - only show if targets exist -->
	{#if performanceTargets && performanceTargets.length > 0}
		<Collapsible.Root bind:open={targetsOpen}>
			<Card.Root class="overflow-hidden py-0">
				<Collapsible.Trigger class="w-full py-6 transition-colors hover:bg-muted/50">
					<Card.Header class="cursor-pointer">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="rounded-lg bg-amber-50 p-1.5 dark:bg-amber-900/30">
									<Target class="size-4 text-amber-600" />
								</div>
								<Card.Title class="text-base">Performance Targets</Card.Title>
							</div>
							<ChevronDown
								class="size-5 text-muted-foreground transition-transform duration-200 {targetsOpen
									? 'rotate-180'
									: ''}"
							/>
						</div>
					</Card.Header>
				</Collapsible.Trigger>
				<Collapsible.Content>
					<Card.Content class="space-y-4 pt-0 pb-4">
						{#each performanceTargets as target}
							{@const achieved = getAchievedValue(target)}
							{@const percentage = Math.min((achieved / target.target_value) * 100, 100)}
							<div class="space-y-2">
								<div class="flex items-center justify-between text-sm">
									<span class="font-medium text-slate-700 dark:text-slate-300">
										{target.indicator_name}
									</span>
									<span class="text-slate-500 dark:text-slate-400">
										{achieved.toLocaleString()} / {target.target_value.toLocaleString()}
										{target.unit_of_measure}
									</span>
								</div>
								<div class="flex items-center gap-3">
									<Progress value={percentage} class="h-2 flex-1" />
									<span
										class="min-w-12 text-right text-xs font-medium {percentage >= 100
											? 'text-emerald-600'
											: percentage >= 50
												? 'text-blue-600'
												: 'text-slate-500'}"
									>
										{percentage.toFixed(0)}%
									</span>
								</div>
							</div>
						{/each}
					</Card.Content>
				</Collapsible.Content>
			</Card.Root>
		</Collapsible.Root>

		<!-- Performance Indicators Progress Chart (Collapsible) -->
		{#if monthlyProgress && monthlyProgress.length > 0}
			<Collapsible.Root bind:open={indicatorsChartOpen}>
				<Card.Root class="overflow-hidden py-0">
					<Collapsible.Trigger class="w-full">
						<Card.Header class="cursor-pointer py-6 transition-colors hover:bg-muted/50">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<div class="rounded-lg bg-violet-50 p-1.5 dark:bg-violet-900/30">
										<BarChart3 class="size-4 text-violet-600" />
									</div>
									<Card.Title class="text-base">Indicators Progress Over Time</Card.Title>
								</div>
								<ChevronDown
									class="size-5 text-muted-foreground transition-transform duration-200 {indicatorsChartOpen
										? 'rotate-180'
										: ''}"
								/>
							</div>
						</Card.Header>
					</Collapsible.Trigger>
					<Collapsible.Content>
						<Card.Content class="pt-0">
							<PerformanceIndicatorsChart {monthlyProgress} {performanceTargets} height={300} />
						</Card.Content>
					</Collapsible.Content>
				</Card.Root>
			</Collapsible.Root>
		{/if}
	{/if}

	<!-- Monthly Timeline Section -->
	<div>
		<div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div class="flex items-center gap-2">
				<div class="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-900/30">
					<Activity class="size-4 text-blue-600" />
				</div>
				<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
					Monthly Progress Timeline
				</h3>
			</div>
			{#if monthlyMonitoring.length > 0}
				<div
					class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
				>
					Click a report card to view detailed documentation
				</div>
			{/if}
		</div>

		{#if monthlyMonitoring.length === 0}
			<!-- Empty State -->
			<div
				class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/50"
			>
				<div class="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-700">
					<CalendarClock class="size-8 text-slate-400" />
				</div>
				<h4 class="mb-2 text-lg font-semibold text-slate-700 dark:text-slate-300">
					No Monthly Reports Yet
				</h4>
				<p class="max-w-md text-sm text-slate-500 dark:text-slate-400">
					Monthly progress reports will appear here once the first update is submitted. Use the
					Quick Update form to add the first progress entry.
				</p>
			</div>
		{:else}
			<div
				class="relative space-y-8 pl-6 before:absolute before:inset-0 before:ml-6 before:w-0.5 before:-translate-x-1/2 before:bg-slate-200 before:content-[''] sm:pl-10 sm:before:ml-10 dark:before:bg-slate-700"
			>
				{#each monthlyMonitoring as report}
					{@const monthAchievedOutputs = getMonthlyAchievedOutputs(report.month_year)}
					{@const monthProgress = monthlyProgress?.find((p) => p.month_year === report.month_year)}
					{@const beneficiariesReached = getBeneficiariesReached(monthProgress)}
					<div class="group relative">
						<!-- Timeline Dot -->
						<div
							class="absolute top-6 -left-6 z-10 size-4 -translate-x-1/2 rounded-full border-4 border-white shadow-sm {getStatusColor(
								report.status
							)} sm:-left-10"
						></div>

						<!-- Content Card -->
						<Card.Root
							class="relative ml-2 cursor-pointer overflow-hidden py-0 shadow-sm transition-all hover:border-blue-300"
							onclick={() => onReportClick(report)}
						>
							<Card.Content class="p-5">
								<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
									<div class="flex-1">
										<div class="mb-2 flex items-center gap-3">
											<h4 class="text-lg font-bold text-slate-900 dark:text-slate-100">
												{report.month}
											</h4>
											<Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge>
										</div>
										{#if report.remarks}
											<p
												class="mb-4 line-clamp-2 max-w-xl text-sm text-slate-600 dark:text-slate-400"
											>
												{report.remarks}
											</p>
										{/if}

										<!-- Mini Stats Grid -->
										<div class="flex flex-wrap gap-3 text-sm">
											<div
												class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800"
											>
												<span
													class="block text-xs tracking-wider text-slate-500 uppercase dark:text-slate-400"
													>Physical</span
												>
												<div class="font-semibold text-slate-800 dark:text-slate-200">
													{report.actual_physical !== null ? `${report.actual_physical}%` : 'TBD'}
													<span class="font-normal text-slate-400 dark:text-slate-500">
														/ {report.plan_physical}%</span
													>
												</div>
											</div>

											<!-- Beneficiaries Reached -->
											{#if beneficiariesReached !== null && beneficiariesReached > 0}
												<div
													class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800"
												>
													<span
														class="block text-xs tracking-wider text-slate-500 uppercase dark:text-slate-400"
														>Beneficiaries</span
													>
													<div
														class="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200"
													>
														<Users class="size-3.5 text-slate-400" />
														{beneficiariesReached.toLocaleString()}
													</div>
												</div>
											{/if}
										</div>

										<!-- Achieved Outputs (compact inline display) -->
										{#if monthAchievedOutputs && Object.keys(monthAchievedOutputs).length > 0}
											<div class="mt-3 text-xs text-slate-500 dark:text-slate-400">
												<span class="font-medium">Outputs:</span>
												{formatAchievedOutputs(monthAchievedOutputs)}
												{#if Object.keys(monthAchievedOutputs).length > 3}
													<span class="text-slate-400">
														+{Object.keys(monthAchievedOutputs).length - 3} more</span
													>
												{/if}
											</div>
										{/if}
									</div>

									<!-- Image Preview Bubbles -->
									{#if report.photos && report.photos.length > 0}
										<div class="flex -space-x-3 self-start sm:self-center">
											{#each Array(Math.min(report.photos.length, 3)) as _, i}
												<div
													class="flex size-10 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-700"
												>
													<ImageIcon class="size-4" />
												</div>
											{/each}
											{#if report.photos.length > 3}
												<div
													class="flex size-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-700 dark:text-slate-300"
												>
													+{report.photos.length - 3}
												</div>
											{/if}
										</div>
									{/if}
								</div>

								<!-- Hover Indicator -->
								<div
									class="absolute top-1/2 right-4 -translate-y-1/2 text-blue-500 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<Maximize2 class="size-5" />
								</div>
							</Card.Content>
						</Card.Root>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
