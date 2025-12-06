<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { MonthlyReport } from '$lib/types';
	import { formatCurrency } from '$lib/utils/formatters';
	import { Activity, CalendarClock, Image as ImageIcon, Maximize2 } from '@lucide/svelte';

	interface Props {
		monthlyMonitoring: MonthlyReport[];
		onReportClick: (report: MonthlyReport) => void;
	}

	const { monthlyMonitoring, onReportClick }: Props = $props();

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
<div class="relative">
	<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
				Monthly progress reports will appear here once the first update is submitted. Use the Quick
				Update form to add the first progress entry.
			</p>
		</div>
	{:else}
		<div
			class="relative space-y-8 pl-6 before:absolute before:inset-0 before:ml-6 before:w-0.5 before:-translate-x-1/2 before:bg-slate-200 before:content-[''] sm:pl-10 sm:before:ml-10 dark:before:bg-slate-700"
		>
			{#each monthlyMonitoring as report}
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
								<div>
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
									<div class="flex flex-wrap gap-4 text-sm">
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
										<div
											class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800"
										>
											<span
												class="block text-xs tracking-wider text-slate-500 uppercase dark:text-slate-400"
												>Financial Release</span
											>
											<div class="font-semibold text-slate-800 dark:text-slate-200">
												{report.actual_financial !== null
													? formatCurrency(report.actual_financial)
													: 'TBD'}
											</div>
										</div>
									</div>
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
