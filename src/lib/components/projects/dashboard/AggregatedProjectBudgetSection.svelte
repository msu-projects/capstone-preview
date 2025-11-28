<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Project } from '$lib/types';
	import { formatCurrency, formatCurrencyCompact } from '$lib/utils/formatters';
	import {
		aggregateByCategory,
		aggregateByStatus,
		aggregateProjectStats,
		toCategoryBarData,
		toStatusBudgetPieData
	} from '$lib/utils/project-aggregation';
	import { Banknote, PieChart, TrendingUp, Wallet } from '@lucide/svelte';

	interface Props {
		projects: Project[];
		filterLabel?: string;
	}

	const { projects, filterLabel = 'All Projects' }: Props = $props();

	// Compute aggregations
	const stats = $derived(aggregateProjectStats(projects));
	const statusDist = $derived(aggregateByStatus(projects));
	const categoryDist = $derived(aggregateByCategory(projects));

	// Chart data
	const statusBudgetData = $derived(toStatusBudgetPieData(statusDist));
	const categoryBudgetData = $derived(toCategoryBarData(categoryDist, 'budget'));

	// Budget metrics
	const budgetMetrics = $derived([
		{
			label: 'Total Budget',
			value: stats.totalBudget,
			description: 'Combined project budgets',
			icon: Banknote,
			bgColor: 'bg-blue-50',
			textColor: 'text-blue-700'
		},
		{
			label: 'Contract Cost',
			value: stats.totalContractCost,
			description: 'Total contract value',
			icon: Wallet,
			bgColor: 'bg-emerald-50',
			textColor: 'text-emerald-700'
		},
		{
			label: 'Average Budget',
			value: stats.averageBudgetPerProject,
			description: 'Per project average',
			icon: TrendingUp,
			bgColor: 'bg-amber-50',
			textColor: 'text-amber-700'
		}
	]);

	// Budget by status for table
	const budgetByStatus = $derived(
		statusDist
			.filter((s) => s.budget > 0)
			.map((s) => ({
				status: s.status,
				label:
					s.status === 'in-progress'
						? 'In Progress'
						: s.status.charAt(0).toUpperCase() + s.status.slice(1),
				budget: s.budget,
				count: s.count,
				percentage: stats.totalBudget > 0 ? (s.budget / stats.totalBudget) * 100 : 0
			}))
	);

	// Budget by category for table
	const budgetByCategory = $derived(
		categoryDist
			.filter((c) => c.budget > 0)
			.sort((a, b) => b.budget - a.budget)
			.map((c) => ({
				category: c.categoryName,
				budget: c.budget,
				count: c.count,
				percentage: stats.totalBudget > 0 ? (c.budget / stats.totalBudget) * 100 : 0
			}))
	);
</script>

<div class="space-y-6">
	<!-- Budget Summary Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		{#each budgetMetrics as metric}
			<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
				<Card.Content class="p-4 sm:p-5">
					<div class="flex items-start gap-4">
						<div class="rounded-xl {metric.bgColor} p-3 ring-1 ring-black/5">
							<metric.icon class="size-6 {metric.textColor}" />
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-sm font-medium text-slate-500">{metric.label}</p>
							<p class="mt-1 text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">
								{formatCurrency(metric.value)}
							</p>
							<p class="mt-0.5 text-xs text-slate-400">{metric.description}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Budget by Status Chart -->
		<Card.Root class="border-0 pb-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<PieChart class="size-5 text-slate-500" />
					Budget by Status
				</Card.Title>
				<Card.Description>Distribution of funds across project statuses</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if statusBudgetData.length > 0}
					<div class="flex items-center gap-6">
						<div class="w-1/2">
							<DonutChart
								data={statusBudgetData}
								height={0}
								valueFormatter={formatCurrencyCompact}
							/>
						</div>
						<div class="w-1/2 space-y-3">
							{#each budgetByStatus as item}
								<div class="space-y-1">
									<div class="flex items-center justify-between text-sm">
										<span class="text-slate-600">{item.label}</span>
										<span class="font-medium text-slate-900">{item.percentage.toFixed(1)}%</span>
									</div>
									<Progress value={item.percentage} class="h-1.5" />
									<p class="text-xs text-slate-500">{formatCurrency(item.budget)}</p>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="flex h-[200px] items-center justify-center text-sm text-slate-500">
						No budget data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Budget by Category Chart -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Banknote class="size-5 text-slate-500" />
					Budget by Category
				</Card.Title>
				<Card.Description>Investment distribution across categories</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if categoryBudgetData.length > 0}
					<BarChart data={categoryBudgetData} orientation="horizontal" height={220} />
				{:else}
					<div class="flex h-[220px] items-center justify-center text-sm text-slate-500">
						No data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Detailed Budget Table -->
	<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-base">
				<Wallet class="size-5 text-slate-500" />
				Budget Allocation by Category
			</Card.Title>
			<Card.Description>Detailed breakdown of budget distribution</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if budgetByCategory.length > 0}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left">
								<th class="pb-3 font-medium text-slate-500">Category</th>
								<th class="pb-3 text-right font-medium text-slate-500">Projects</th>
								<th class="pb-3 text-right font-medium text-slate-500">Budget</th>
								<th class="pb-3 text-right font-medium text-slate-500">Share</th>
							</tr>
						</thead>
						<tbody>
							{#each budgetByCategory as item}
								<tr class="border-b border-slate-100 last:border-0">
									<td class="py-3 font-medium text-slate-900">{item.category}</td>
									<td class="py-3 text-right text-slate-600">{item.count}</td>
									<td class="py-3 text-right font-medium text-slate-900">
										{formatCurrency(item.budget)}
									</td>
									<td class="py-3 text-right text-slate-600">{item.percentage.toFixed(1)}%</td>
								</tr>
							{/each}
						</tbody>
						<tfoot>
							<tr class="border-t-2 border-slate-200">
								<td class="pt-3 font-semibold text-slate-900">Total</td>
								<td class="pt-3 text-right font-semibold text-slate-900">{projects.length}</td>
								<td class="pt-3 text-right font-semibold text-slate-900">
									{formatCurrency(stats.totalBudget)}
								</td>
								<td class="pt-3 text-right font-semibold text-slate-900">100%</td>
							</tr>
						</tfoot>
					</table>
				</div>
			{:else}
				<div class="py-8 text-center text-sm text-slate-500">No budget data available</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
