<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { Project } from '$lib/types';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import { Briefcase, PiggyBank, Users, Wallet } from '@lucide/svelte';

	interface Props {
		project: Project;
	}

	const { project }: Props = $props();

	// Calculate financial metrics
	const utilized = $derived(project.project_cost * 0.45);
	const remaining = $derived(project.project_cost - utilized);
	const utilizationRate = $derived((utilized / project.project_cost) * 100);

	// Employment data
	const totalEmployment = $derived(
		(project.employment_generated?.male || 0) + (project.employment_generated?.female || 0)
	);
</script>

<!-- Financials Tab -->
<div class="space-y-6">
	<!-- Key Metrics Row -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<!-- Project Cost -->
		<Card.Root class="border-l-4 border-l-emerald-600 bg-white py-0 dark:bg-slate-800">
			<Card.Content class="p-5">
				<div class="flex items-start justify-between">
					<div>
						<p
							class="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
						>
							Project Cost
						</p>
						<h3 class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
							{formatCurrency(project.project_cost)}
						</h3>
					</div>
					<div class="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/30">
						<Wallet class="size-5" />
					</div>
				</div>
				<div class="mt-4 text-xs text-slate-500 dark:text-slate-400">Total project value</div>
			</Card.Content>
		</Card.Root>

		<!-- Beneficiaries -->
		<Card.Root class="border-l-4 border-l-blue-500 bg-white py-0 dark:bg-slate-800">
			<Card.Content class="p-5">
				<div class="flex items-start justify-between">
					<div>
						<p
							class="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
						>
							Beneficiaries
						</p>
						<h3 class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
							{formatNumber(project.beneficiaries)}
						</h3>
					</div>
					<div class="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30">
						<Users class="size-5" />
					</div>
				</div>
				<div class="mt-4 text-xs text-slate-500 dark:text-slate-400">People served</div>
			</Card.Content>
		</Card.Root>

		<!-- Employment Generated -->
		<Card.Root class="border-l-4 border-l-amber-500 bg-white py-0 dark:bg-slate-800">
			<Card.Content class="p-5">
				<div class="flex items-start justify-between">
					<div>
						<p
							class="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
						>
							Employment Generated
						</p>
						<h3 class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
							{formatNumber(totalEmployment)}
						</h3>
					</div>
					<div class="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/30">
						<Briefcase class="size-5" />
					</div>
				</div>
				<div class="mt-4 text-xs text-slate-500 dark:text-slate-400">
					{#if project.employment_generated}
						{formatNumber(project.employment_generated.male)} M / {formatNumber(
							project.employment_generated.female
						)} F
					{:else}
						Jobs created
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Breakdown Section -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Funding Sources -->
		<Card.Root class="flex h-[500px] flex-col gap-0 py-0">
			<Card.Header class="shrink-0 border-b border-slate-100 p-6 pb-4! dark:border-slate-700">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-900/30">
							<Wallet class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
							Funding Sources
						</h3>
					</div>
					<Badge variant="secondary">
						{project.funding_sources?.length || 0} Sources
					</Badge>
				</div>
			</Card.Header>
			<Card.Content class="flex-1 overflow-y-auto p-6">
				<div class="space-y-3">
					{#if project.funding_sources && project.funding_sources.length > 0}
						{#each project.funding_sources as source}
							<div
								class="group rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-blue-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-800 dark:hover:bg-slate-800"
							>
								<div class="mb-2 flex items-start justify-between">
									<div>
										<h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
											{source.source_name}
										</h4>
										<p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
											{source.source_type === 'national' ? 'National' : 'Provincial'} Funding
										</p>
									</div>
									<Badge variant="outline">
										{source.percentage}%
									</Badge>
								</div>
								<div
									class="mt-3 flex items-end justify-between border-t border-slate-200/60 pt-3 dark:border-slate-700/60"
								>
									<span class="text-xl font-bold text-slate-900 dark:text-slate-100">
										{formatCurrency(source.amount)}
									</span>
								</div>
							</div>
						{/each}
					{:else}
						<div class="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
							No funding sources specified
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Budget Breakdown -->
		<Card.Root class="flex h-[500px] flex-col gap-0 py-0">
			<Card.Header class="shrink-0 border-b border-slate-100 p-6 pb-4! dark:border-slate-700">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-900/30">
						<PiggyBank class="size-4 text-blue-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">Budget Breakdown</h3>
				</div>
			</Card.Header>
			<Card.Content class="flex-1 overflow-y-auto p-6">
				<div class="space-y-6">
					{#if project.budget_components && project.budget_components.length > 0}
						{#each project.budget_components as comp}
							<div>
								<div class="mb-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="text-sm font-semibold text-slate-900 dark:text-slate-100">
											{comp.component_name}
										</span>
										<Badge variant="secondary" class="text-xs">
											{comp.percentage}%
										</Badge>
									</div>
									<span class="text-base font-bold text-slate-900 dark:text-slate-100">
										{formatCurrency(comp.amount)}
									</span>
								</div>
								<div class="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
									<div
										class="h-2 rounded-full bg-blue-500 transition-all"
										style="width: {comp.percentage}%"
									></div>
								</div>
							</div>
						{/each}
					{:else}
						<div class="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
							No budget breakdown available
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
