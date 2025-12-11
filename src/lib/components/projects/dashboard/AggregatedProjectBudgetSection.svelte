<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import * as Card from '$lib/components/ui/card';
	import type { Project } from '$lib/types';
	import { formatCurrency, formatCurrencyCompact } from '$lib/utils/formatters';
	import {
		aggregateByCategory,
		aggregateByStatus,
		aggregateProjectStats,
		toCategoryBarData,
		toStatusBudgetPieData
	} from '$lib/utils/project-aggregation';
	import { Banknote, Briefcase, PieChart, Users, Wallet } from '@lucide/svelte';
	import { formatNumber } from '$lib/utils/formatters';

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
			label: 'Project Cost',
			value: stats.totalContractCost,
			description: 'Total project value',
			icon: Wallet,
			bgColor: 'bg-emerald-50',
			textColor: 'text-emerald-700',
			formatValue: (val: number) => formatCurrency(val)
		},
		{
			label: 'Total Beneficiaries',
			value: stats.totalBeneficiaries,
			description: 'People served',
			icon: Users,
			bgColor: 'bg-blue-50',
			textColor: 'text-blue-700',
			formatValue: (val: number) => formatNumber(val)
		},
		{
			label: 'Total Employment',
			value: stats.employmentGenerated.total,
			description: 'Jobs generated',
			icon: Briefcase,
			bgColor: 'bg-amber-50',
			textColor: 'text-amber-700',
			formatValue: (val: number) => formatNumber(val)
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
				percentage: stats.totalContractCost > 0 ? (s.budget / stats.totalContractCost) * 100 : 0
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
				percentage: stats.totalContractCost > 0 ? (c.budget / stats.totalContractCost) * 100 : 0
			}))
	);
</script>

<div class="space-y-6">
	<!-- Budget Summary Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		{#each budgetMetrics as metric}
			<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
				<Card.Content class="p-4 sm:p-5">
					<div class="flex items-start gap-4">
						<div class="rounded-xl {metric.bgColor} p-3 ring-1 ring-black/5">
							<metric.icon class="size-6 {metric.textColor}" />
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
							<p
								class="mt-1 text-xl font-bold tracking-tight text-slate-900 lg:text-2xl dark:text-slate-100"
							>
								{metric.formatValue(metric.value)}
							</p>
							<p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{metric.description}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Budget by Status Chart -->
		<Card.Root class="border-0 pb-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
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
						<DonutChart
							data={statusBudgetData}
							height={270}
							valueFormatter={formatCurrencyCompact}
						/>
					</div>
				{:else}
					<div
						class="flex h-[200px] items-center justify-center text-sm text-slate-500 dark:text-slate-400"
					>
						No budget data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Budget by Category Chart -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
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
	<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
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
								<th class="pb-3 font-medium text-slate-500 dark:text-slate-400">Category</th>
								<th class="pb-3 text-right font-medium text-slate-500 dark:text-slate-400"
									>Projects</th
								>
								<th class="pb-3 text-right font-medium text-slate-500 dark:text-slate-400"
									>Budget</th
								>
								<th class="pb-3 text-right font-medium text-slate-500 dark:text-slate-400">Share</th
								>
							</tr>
						</thead>
						<tbody>
							{#each budgetByCategory as item}
								<tr class="border-b border-slate-100 last:border-0 dark:border-slate-700">
									<td class="py-3 font-medium text-slate-900 dark:text-slate-100"
										>{item.category}</td
									>
									<td class="py-3 text-right text-slate-600 dark:text-slate-400">{item.count}</td>
									<td class="py-3 text-right font-medium text-slate-900 dark:text-slate-100">
										{formatCurrency(item.budget)}
									</td>
									<td class="py-3 text-right text-slate-600 dark:text-slate-400"
										>{item.percentage.toFixed(1)}%</td
									>
								</tr>
							{/each}
						</tbody>
						<tfoot>
							<tr class="border-t-2 border-slate-200 dark:border-slate-700">
								<td class="pt-3 font-semibold text-slate-900 dark:text-slate-100">Total</td>
								<td class="pt-3 text-right font-semibold text-slate-900 dark:text-slate-100"
									>{projects.length}</td
								>
								<td class="pt-3 text-right font-semibold text-slate-900 dark:text-slate-100">
									{formatCurrency(stats.totalBudget)}
								</td>
								<td class="pt-3 text-right font-semibold text-slate-900 dark:text-slate-100"
									>100%</td
								>
							</tr>
						</tfoot>
					</table>
				</div>
			{:else}
				<div class="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
					No budget data available
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
