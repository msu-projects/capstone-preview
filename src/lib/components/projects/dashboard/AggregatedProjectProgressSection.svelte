<script lang="ts">
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Project } from '$lib/types';
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
			.filter((p) => p.progress < 50 && p.project.status === 'in-progress')
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
			<Card.Root class="border-0 py-0 shadow-sm ring-1 ring-slate-200/50">
				<Card.Content class="p-4">
					<div class="flex items-start gap-3">
						<div class="rounded-lg {metric.bgColor} p-2 ring-1 ring-black/5">
							<metric.icon class="size-5 {metric.textColor}" />
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-xs font-medium text-slate-500">{metric.label}</p>
							<p class="mt-0.5 text-xl font-bold tracking-tight text-slate-900">{metric.value}</p>
							<p class="mt-0.5 text-xs text-slate-400">{metric.description}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Progress Distribution Chart -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
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
						<div class="w-1/2">
							<DonutChart data={progressChartData} height={200} />
						</div>
						<div class="w-1/2 space-y-2">
							{#each progressChartData as item}
								<div class="flex items-center justify-between text-sm">
									<div class="flex items-center gap-2">
										<div class="size-3 rounded-full" style="background-color: {item.color}"></div>
										<span class="text-slate-600">{item.label}</span>
									</div>
									<span class="font-semibold text-slate-900">{item.value}</span>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="flex h-[200px] items-center justify-center text-sm text-slate-500">
						No progress data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Category Progress -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
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
								<span class="font-medium text-slate-700">{category.categoryName}</span>
								<Badge variant="outline" class="text-xs">{category.count}</Badge>
							</div>
							<span class="font-semibold text-slate-900">{category.avgProgress.toFixed(1)}%</span>
						</div>
						<Progress value={category.avgProgress} class="h-2" />
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Top Performing Projects -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
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
							<div class="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
								<div
									class="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700"
								>
									{item.progress.toFixed(0)}%
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-slate-900">
										{item.project.title}
									</p>
									<p class="text-xs text-slate-500">
										{item.project.project_sitios?.[0]?.municipality ?? 'N/A'}
									</p>
								</div>
								<Badge
									variant={item.project.status === 'completed' ? 'default' : 'secondary'}
									class="shrink-0"
								>
									{item.project.status === 'in-progress' ? 'In Progress' : item.project.status}
								</Badge>
							</div>
						{/each}
					</div>
				{:else}
					<div class="py-8 text-center text-sm text-slate-500">
						No projects with significant progress yet
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Underperforming Projects -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
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
							<div class="flex items-center gap-3 rounded-lg bg-amber-50/50 p-3">
								<div
									class="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700"
								>
									{item.progress.toFixed(0)}%
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-slate-900">
										{item.project.title}
									</p>
									<p class="text-xs text-slate-500">
										{item.project.project_sitios?.[0]?.municipality ?? 'N/A'}
									</p>
								</div>
								<Badge variant="outline" class="shrink-0 border-amber-200 text-amber-700">
									Needs Review
								</Badge>
							</div>
						{/each}
					</div>
				{:else}
					<div class="py-8 text-center text-sm text-slate-500">
						All active projects are progressing well
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
