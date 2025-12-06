<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { PhotoGallery } from '$lib/components/ui/photo-gallery';
	import { Progress } from '$lib/components/ui/progress';
	import type { MonthlyProgress, MonthlyReport, PerformanceTarget } from '$lib/types';
	import { formatCurrency } from '$lib/utils/formatters';
	import { Activity, Banknote, Camera, CheckCircle2, Target } from '@lucide/svelte';

	interface Props {
		open: boolean;
		selectedReport: MonthlyReport | null;
		performanceTargets?: PerformanceTarget[];
		monthlyProgress?: MonthlyProgress[];
	}

	let { open = $bindable(), selectedReport, performanceTargets, monthlyProgress }: Props = $props();

	// Get achieved outputs up to and including the selected month
	function getCumulativeAchievedOutputs(monthYear: string): Record<string, number> {
		if (!monthlyProgress) return {};

		// Parse the target month_year (e.g., "2024-03")
		const targetDate = new Date(monthYear + '-01');

		// Filter progress entries up to and including the target month and aggregate
		const cumulativeOutputs: Record<string, number> = {};

		monthlyProgress
			.filter((p) => {
				const progressDate = new Date(p.month_year + '-01');
				return progressDate <= targetDate;
			})
			.forEach((progress) => {
				if (progress.achieved_outputs) {
					Object.entries(progress.achieved_outputs).forEach(([key, value]) => {
						const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
						cumulativeOutputs[normalizedKey] = (cumulativeOutputs[normalizedKey] || 0) + value;
					});
				}
			});

		return cumulativeOutputs;
	}

	// Get achieved value for a specific performance target
	function getAchievedValue(
		target: PerformanceTarget,
		cumulativeOutputs: Record<string, number>
	): number {
		const normalizedType = target.indicator_type?.toLowerCase().replace(/\s+/g, '_');
		const normalizedName = target.indicator_name?.toLowerCase().replace(/\s+/g, '_');

		return (
			cumulativeOutputs[normalizedType] ||
			cumulativeOutputs[normalizedName] ||
			cumulativeOutputs[target.indicator_type] ||
			cumulativeOutputs[target.indicator_name] ||
			0
		);
	}

	// Format indicator key for display (e.g., 'seedlings_distributed' -> 'Seedlings Distributed')
	function formatIndicatorKey(key: string): string {
		return key
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
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
</script>

<!-- Detail Modal -->
<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] w-full max-w-3xl! overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Progress Report: {selectedReport?.month}</Dialog.Title>
		</Dialog.Header>
		{#if selectedReport}
			<div class="space-y-6 overflow-x-hidden">
				<!-- Status Banner -->
				<div
					class="rounded-xl border p-4 {getStatusColor(selectedReport.status)
						.replace('bg-', 'bg-opacity-10 bg-')
						.replace('500', '50')} {getStatusColor(selectedReport.status)
						.replace('bg-', 'border-')
						.replace('500', '200')}"
				>
					<div class="flex items-center gap-3">
						<div class="size-3 rounded-full {getStatusColor(selectedReport.status)}"></div>
						<span class="font-semibold text-slate-900 dark:text-slate-100"
							>{selectedReport.status}</span
						>
						{#if selectedReport.remarks}
							<span class="text-sm text-slate-500 dark:text-slate-400"
								>- {selectedReport.remarks}</span
							>
						{/if}
					</div>
				</div>

				<!-- Detailed Stats -->
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div
						class="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
					>
						<h4
							class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
						>
							<Activity class="size-4 shrink-0 text-blue-600" /> Physical Progress
						</h4>
						<div class="space-y-3">
							<div class="flex items-center justify-between gap-2 text-sm">
								<span class="shrink-0 text-slate-500 dark:text-slate-400">Planned</span>
								<span class="font-medium">{selectedReport.plan_physical}%</span>
							</div>
							<div class="flex items-center justify-between gap-2 text-sm">
								<span class="shrink-0 text-slate-500 dark:text-slate-400">Actual</span>
								<span class="font-bold text-slate-900 dark:text-slate-100"
									>{selectedReport.actual_physical ?? '-'}%</span
								>
							</div>
							<div class="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
								<div
									class="h-1.5 rounded-full bg-blue-600"
									style="width: {selectedReport.actual_physical || 0}%"
								></div>
							</div>
						</div>
					</div>

					<div
						class="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
					>
						<h4
							class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
						>
							<Banknote class="size-4 shrink-0 text-emerald-600" /> Financial Releases
						</h4>
						<div class="space-y-3">
							<div class="flex items-center justify-between gap-2 text-sm">
								<span class="shrink-0 text-slate-500 dark:text-slate-400">Planned</span>
								<span class="truncate font-medium"
									>{formatCurrency(selectedReport.plan_financial)}</span
								>
							</div>
							<div class="flex items-center justify-between gap-2 text-sm">
								<span class="shrink-0 text-slate-500 dark:text-slate-400">Actual</span>
								<span class="truncate font-bold text-slate-900 dark:text-slate-100"
									>{selectedReport.actual_financial
										? formatCurrency(selectedReport.actual_financial)
										: '-'}</span
								>
							</div>
							<div class="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
								<div
									class="h-1.5 rounded-full bg-emerald-500"
									style="width: {selectedReport.actual_financial && selectedReport.plan_financial
										? Math.min(selectedReport.actual_financial / selectedReport.plan_financial, 1) *
											100
										: 0}%"
								></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Performance Targets Progress -->
				{#if performanceTargets && performanceTargets.length > 0 && selectedReport.month_year}
					{@const cumulativeOutputs = getCumulativeAchievedOutputs(selectedReport.month_year)}
					<div
						class="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
					>
						<h4
							class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
						>
							<Target class="size-4 text-amber-600" /> Performance Targets
						</h4>
						<div class="space-y-4">
							{#each performanceTargets as target}
								{@const achieved = getAchievedValue(target, cumulativeOutputs)}
								{@const percentage = Math.min((achieved / target.target_value) * 100, 100)}
								<div class="space-y-1.5">
									<div class="flex items-center justify-between text-sm">
										<span class="font-medium text-slate-700 dark:text-slate-300">
											{target.indicator_name}
										</span>
										<span class="text-xs text-slate-500 dark:text-slate-400">
											{achieved.toLocaleString()} / {target.target_value.toLocaleString()}
											{target.unit_of_measure}
										</span>
									</div>
									<div class="flex items-center gap-3">
										<Progress value={percentage} class="h-2 flex-1" />
										<span
											class="min-w-10 text-right text-xs font-medium {percentage >= 100
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
						</div>
					</div>
				{/if}

				<!-- Achieved Outputs (this month) -->
				{#if selectedReport.achieved_outputs && Object.keys(selectedReport.achieved_outputs).length > 0}
					<div
						class="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
					>
						<h4
							class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
						>
							<CheckCircle2 class="size-4 text-violet-600" /> Outputs This Month
						</h4>
						<div class="space-y-2">
							{#each Object.entries(selectedReport.achieved_outputs) as [key, value]}
								<div class="flex justify-between text-sm">
									<span class="text-slate-500 dark:text-slate-400">{formatIndicatorKey(key)}</span>
									<span class="font-medium text-slate-900 dark:text-slate-100"
										>{value.toLocaleString()}</span
									>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Site Documentation / Images -->
				<div>
					<h4
						class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
					>
						<Camera class="size-4 text-slate-600" /> Site Documentation
					</h4>

					<PhotoGallery photos={selectedReport.photos} columns={3} />
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
