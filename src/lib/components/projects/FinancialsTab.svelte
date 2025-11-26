<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Project } from '$lib/types';
	import { Banknote, ChartPie, TrendingUp } from '@lucide/svelte';

	interface Props {
		project: Project;
	}

	const { project }: Props = $props();

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 0
		}).format(amount);
	}
</script>

<!-- Financials Tab -->
<div class="space-y-6">
	<!-- Top Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<Card.Root class="border-none bg-linear-to-br from-blue-600 to-blue-700 text-white shadow-sm">
			<Card.Content class="p-6">
				<div class="mb-2 flex items-center gap-3 opacity-90">
					<Banknote class="size-5" />
					<span class="font-medium">Total Allocation</span>
				</div>
				<div class="text-3xl font-bold tracking-tight">{formatCurrency(project.budget)}</div>
				<div class="mt-4 flex gap-4 border-t border-blue-500/30 pt-4 text-sm opacity-90">
					<div>
						<span class="block text-xs text-blue-200">Utilized</span>
						<span class="font-semibold">{formatCurrency(project.budget * 0.45)}</span>
					</div>
					<div>
						<span class="block text-xs text-blue-200">Remaining</span>
						<span class="font-semibold">{formatCurrency(project.budget * 0.55)}</span>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="shadow-sm">
			<Card.Header class="pb-4">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-blue-50 p-1.5">
						<ChartPie class="size-4 text-blue-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Funding Sources</h3>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4 pt-0">
				{#if project.funding_sources && project.funding_sources.length > 0}
					{#each project.funding_sources as source}
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div
									class="size-2 rounded-full {source.source_type === 'national'
										? 'bg-indigo-500'
										: 'bg-emerald-500'}"
								></div>
								<div>
									<div class="text-sm font-medium text-slate-900">{source.source_name}</div>
									<div class="text-xs text-slate-500">
										{source.source_type === 'national' ? 'National' : 'Provincial'} Gov't
									</div>
								</div>
							</div>
							<div class="text-right">
								<div class="text-sm font-semibold text-slate-900">
									{formatCurrency(source.amount)}
								</div>
								<div class="text-xs text-slate-500">{source.percentage}%</div>
							</div>
						</div>
					{/each}
				{:else}
					<div class="py-4 text-center text-sm text-slate-500">No funding sources specified</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root class="shadow-sm">
		<Card.Header class="pb-4">
			<div class="flex items-center gap-2">
				<div class="rounded-lg bg-blue-50 p-1.5">
					<TrendingUp class="size-4 text-blue-600" />
				</div>
				<h3 class="text-lg font-semibold text-slate-800">Budget Breakdown</h3>
			</div>
		</Card.Header>
		<Card.Content class="space-y-5 pt-0">
			{#if project.budget_components && project.budget_components.length > 0}
				{#each project.budget_components as comp}
					<div>
						<div class="mb-1 flex items-end justify-between">
							<span class="text-sm font-medium text-slate-700">{comp.component_name}</span>
							<span class="text-sm text-slate-600"
								>{formatCurrency(comp.amount)}
								<span class="text-xs text-slate-400">({comp.percentage}%)</span></span
							>
						</div>
						<div class="h-2 w-full rounded-full bg-slate-100">
							<div class="h-2 rounded-full bg-slate-600" style="width: {comp.percentage}%"></div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="py-4 text-center text-sm text-slate-500">No budget breakdown available</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
