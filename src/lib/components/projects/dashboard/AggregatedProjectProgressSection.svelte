<script lang="ts">
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Project } from '$lib/types';
	import toTitleCase from '$lib/utils/common';
	import {
		aggregateByCategory,
		aggregateProgress,
		aggregateProjectStats,
		toProgressDonutData
	} from '$lib/utils/project-aggregation';
	import { getCompletionPercentage } from '$lib/utils/project-calculations';
	import {
		AlertTriangle,
		CheckCircle2,
		Gauge,
		Target,
		TrendingDown,
		TrendingUp
	} from '@lucide/svelte';

	interface Props {
		projects: Project[];
		filterLabel?: string;
	}

	const { projects, filterLabel = 'All Projects' }: Props = $props();

	// Compute aggregations
	const stats = $derived(aggregateProjectStats(projects));
	const progressStats = $derived(aggregateProgress(projects));
	const categoryDist = $derived(aggregateByCategory(projects));

	// Chart data
	const progressChartData = $derived(toProgressDonutData(progressStats));

	// Progress metrics
	const progressMetrics = $derived([
		{
			label: 'Average Completion',
			value: `${progressStats.averageCompletion.toFixed(1)}%`,
			description: 'Across all projects',
			icon: Gauge,
			bgColor: 'bg-blue-50',
			textColor: 'text-blue-700'
		},
		{
			label: 'Completed Projects',
			value: progressStats.completedCount.toString(),
			description: `${((progressStats.completedCount / (projects.length || 1)) * 100).toFixed(0)}% of total`,
			icon: CheckCircle2,
			bgColor: 'bg-emerald-50',
			textColor: 'text-emerald-700'
		},
		{
			label: 'Projects On Track',
			value: progressStats.onTrackCount.toString(),
			description: 'Within schedule',
			icon: TrendingUp,
			bgColor: 'bg-cyan-50',
			textColor: 'text-cyan-700'
		},
		{
			label: 'Delayed Projects',
			value: progressStats.delayedCount.toString(),
			description: 'Behind schedule',
			icon: AlertTriangle,
			bgColor: 'bg-red-50',
			textColor: 'text-red-700'
		}
	]);

	// Get top performing and underperforming projects
	const projectsByProgress = $derived(
		projects
			.map((p) => ({
				project: p,
				progress: getCompletionPercentage(p)
			}))
			.sort((a, b) => b.progress - a.progress)
	);

	const topPerforming = $derived(projectsByProgress.filter((p) => p.progress >= 75).slice(0, 5));
	const underperforming = $derived(
		projectsByProgress
			.filter((p) => p.progress < 50 && p.project.status === 'ongoing')
			.reverse()
			.slice(0, 5)
	);

	// Category progress
	const categoryProgress = $derived(
		categoryDist
			.filter((c) => c.count > 0)
			.map((c) => {
				const categoryProjects = projects.filter((p) => p.category_key === c.categoryKey);
				const avgProgress =
					categoryProjects.length > 0
						? categoryProjects.reduce((sum, p) => sum + getCompletionPercentage(p), 0) /
							categoryProjects.length
						: 0;
				return {
					...c,
					avgProgress
				};
			})
			.sort((a, b) => b.avgProgress - a.avgProgress)
	);
</script>

<div class="space-y-6">
	<!-- Progress Summary Cards -->
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		{#each progressMetrics as metric}
			<Card.Root
				class="border-0 shadow-sm ring-1 ring-slate-200/50 transition-shadow hover:shadow-md dark:ring-slate-700/50"
			>
				<Card.Content class="p-4 sm:p-5">
					<div class="flex items-start gap-3 sm:gap-4">
						<div
							class="shrink-0 rounded-xl {metric.bgColor} p-2.5 ring-1 ring-black/5 sm:p-3 dark:{metric.bgColor.replace(
								'50',
								'900/30'
							)}"
						>
							<metric.icon class="size-5 {metric.textColor} sm:size-6" />
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
								{metric.label}
							</p>
							<p
								class="mt-1 truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
							>
								{metric.value}
							</p>
							<p class="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
								{metric.description}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Progress Distribution Chart -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Gauge class="size-5 text-slate-500" />
					Progress Distribution
				</Card.Title>
				<Card.Description>Project status breakdown</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if progressChartData.length > 0}
					<div class="flex items-center gap-6">
						<DonutChart data={progressChartData} height={300} />
					</div>
				{:else}
					<div
						class="flex h-[200px] items-center justify-center text-sm text-slate-500 dark:text-slate-400"
					>
						No progress data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Category Progress -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Target class="size-5 text-slate-500" />
					Progress by Category
				</Card.Title>
				<Card.Description>Average completion by category</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#each categoryProgress as category}
					<div class="space-y-1.5">
						<div class="flex items-center justify-between text-sm">
							<div class="flex items-center gap-2">
								<span class="font-medium text-slate-700 dark:text-slate-300"
									>{category.categoryName}</span
								>
								<Badge variant="outline" class="text-xs">{category.count}</Badge>
							</div>
							<span class="font-semibold text-slate-900 dark:text-slate-100"
								>{category.avgProgress.toFixed(1)}%</span
							>
						</div>
						<Progress value={category.avgProgress} class="h-2" />
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Top Performing Projects -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<TrendingUp class="size-5 text-emerald-500" />
					Top Performing Projects
				</Card.Title>
				<Card.Description>Projects with highest completion rates</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if topPerforming.length > 0}
					<div class="space-y-3">
						{#each topPerforming as item}
							{@const circumference = 2 * Math.PI * 18}
							{@const strokeDashoffset = circumference - (item.progress / 100) * circumference}
							<div class="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
								<div class="relative size-11 shrink-0">
									<svg class="size-11 -rotate-90" viewBox="0 0 44 44">
										<circle
											cx="22"
											cy="22"
											r="18"
											stroke="currentColor"
											stroke-width="4"
											fill="none"
											class="text-emerald-100 dark:text-emerald-900/30"
										/>
										<circle
											cx="22"
											cy="22"
											r="18"
											stroke="currentColor"
											stroke-width="4"
											fill="none"
											stroke-linecap="round"
											class="text-emerald-500 transition-all duration-500"
											style="stroke-dasharray: {circumference}; stroke-dashoffset: {strokeDashoffset};"
										/>
									</svg>
									<span
										class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400"
									>
										{item.progress.toFixed(0)}%
									</span>
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
										{item.project.title}
									</p>
									<p class="text-xs text-slate-500 dark:text-slate-400">
										{item.project.project_sitios?.[0]?.municipality ?? 'N/A'}
									</p>
								</div>
								<Badge
									variant={item.project.status === 'completed' ? 'default' : 'secondary'}
									class="shrink-0"
								>
									{item.project.status === 'ongoing'
										? 'On Going'
										: toTitleCase(item.project.status)}
								</Badge>
							</div>
						{/each}
					</div>
				{:else}
					<div class="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
						No projects with significant progress yet
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Underperforming Projects -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<TrendingDown class="size-5 text-amber-500" />
					Projects Needing Attention
				</Card.Title>
				<Card.Description>In-progress projects with low completion</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if underperforming.length > 0}
					<div class="space-y-3">
						{#each underperforming as item}
							{@const circumference = 2 * Math.PI * 18}
							{@const strokeDashoffset = circumference - (item.progress / 100) * circumference}
							<div
								class="flex items-center gap-3 rounded-lg bg-amber-50/50 p-3 dark:bg-amber-900/10"
							>
								<div class="relative size-11 shrink-0">
									<svg class="size-11 -rotate-90" viewBox="0 0 44 44">
										<circle
											cx="22"
											cy="22"
											r="18"
											stroke="currentColor"
											stroke-width="4"
											fill="none"
											class="text-amber-100 dark:text-amber-900/30"
										/>
										<circle
											cx="22"
											cy="22"
											r="18"
											stroke="currentColor"
											stroke-width="4"
											fill="none"
											stroke-linecap="round"
											class="text-amber-500 transition-all duration-500"
											style="stroke-dasharray: {circumference}; stroke-dashoffset: {strokeDashoffset};"
										/>
									</svg>
									<span
										class="absolute inset-0 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400"
									>
										{item.progress.toFixed(0)}%
									</span>
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
										{item.project.title}
									</p>
									<p class="text-xs text-slate-500 dark:text-slate-400">
										{item.project.project_sitios?.[0]?.municipality ?? 'N/A'}
									</p>
								</div>
								<Badge
									variant="outline"
									class="shrink-0 border-amber-200 text-amber-700 dark:border-amber-700 dark:text-amber-400"
								>
									Needs Review
								</Badge>
							</div>
						{/each}
					</div>
				{:else}
					<div class="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
						All active projects are progressing well
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
