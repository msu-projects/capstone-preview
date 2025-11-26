<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import {
		Activity,
		AlertTriangle,
		FastForward,
		Image as ImageIcon,
		Lightbulb,
		Maximize2
	} from '@lucide/svelte';

	interface MonthlyReport {
		month: string;
		plan_physical: number;
		actual_physical: number | null;
		plan_financial: number;
		actual_financial: number | null;
		status: string;
		remarks: string;
		issues: string;
		recommendations: string;
		catch_up_plan: string;
		images: number;
	}

	interface Props {
		monthlyMonitoring: MonthlyReport[];
		onReportClick: (report: MonthlyReport) => void;
	}

	const { monthlyMonitoring, onReportClick }: Props = $props();

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'On Track':
				return 'bg-emerald-500';
			case 'Slight Delay':
				return 'bg-amber-500';
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
			case 'Slight Delay':
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
			<div class="rounded-lg bg-blue-50 p-1.5">
				<Activity class="size-4 text-blue-600" />
			</div>
			<h3 class="text-lg font-semibold text-slate-800">Monthly Progress Timeline</h3>
		</div>
		<div class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
			Click a report card to view detailed documentation
		</div>
	</div>

	<div
		class="relative space-y-8 pl-6 before:absolute before:inset-0 before:ml-6 before:w-0.5 before:-translate-x-1/2 before:bg-slate-200 before:content-[''] sm:pl-10 sm:before:ml-10"
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
					class="relative ml-2 cursor-pointer overflow-hidden shadow-sm transition-all hover:border-blue-300"
					onclick={() => onReportClick(report)}
				>
					<Card.Content class="p-5">
						<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<div class="mb-2 flex items-center gap-3">
									<h4 class="text-lg font-bold text-slate-900">{report.month}</h4>
									<Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge>
								</div>
								<p class="mb-4 line-clamp-2 max-w-xl text-sm text-slate-600">
									{report.remarks}
								</p>

								<!-- Issues, Recommendations, Catch-up Plan -->
								{#if report.issues || report.recommendations || report.catch_up_plan}
									<div class="mb-4 space-y-3">
										{#if report.issues}
											<div class="flex gap-2.5">
												<div class="mt-0.5">
													<AlertTriangle class="size-4 text-amber-500" />
												</div>
												<div class="flex-1">
													<div class="mb-1 text-xs font-semibold text-slate-700">
														Issues Encountered
													</div>
													<div class="text-sm text-slate-600">
														{report.issues}
													</div>
												</div>
											</div>
										{/if}

										{#if report.recommendations}
											<div class="flex gap-2.5">
												<div class="mt-0.5">
													<Lightbulb class="size-4 text-amber-500" />
												</div>
												<div class="flex-1">
													<div class="mb-1 text-xs font-semibold text-slate-700">
														Recommendations
													</div>
													<div class="text-sm text-slate-600">
														{report.recommendations}
													</div>
												</div>
											</div>
										{/if}

										{#if report.catch_up_plan}
											<div class="flex gap-2.5">
												<div class="mt-0.5">
													<FastForward class="size-4 text-blue-500" />
												</div>
												<div class="flex-1">
													<div class="mb-1 text-xs font-semibold text-slate-700">Catch-up Plan</div>
													<div class="text-sm text-slate-600">
														{report.catch_up_plan}
													</div>
												</div>
											</div>
										{/if}
									</div>
								{/if}

								<!-- Mini Stats Grid -->
								<div class="flex flex-wrap gap-4 text-sm">
									<div class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
										<span class="block text-xs tracking-wider text-slate-500 uppercase"
											>Physical</span
										>
										<div class="font-semibold text-slate-800">
											{report.actual_physical !== null ? `${report.actual_physical}%` : 'TBD'}
											<span class="font-normal text-slate-400"> / {report.plan_physical}%</span>
										</div>
									</div>
									<div class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
										<span class="block text-xs tracking-wider text-slate-500 uppercase"
											>Financial Release</span
										>
										<div class="font-semibold text-slate-800">
											{report.actual_financial !== null
												? formatCurrency(report.actual_financial)
												: 'TBD'}
										</div>
									</div>
								</div>
							</div>

							<!-- Image Preview Bubbles -->
							{#if report.images && report.images > 0}
								<div class="flex -space-x-3 self-start sm:self-center">
									{#each Array(Math.min(report.images, 3)) as _, i}
										<div
											class="flex size-10 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-slate-400 shadow-sm"
										>
											<ImageIcon class="size-4" />
										</div>
									{/each}
									{#if report.images > 3}
										<div
											class="flex size-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-medium text-slate-600 shadow-sm"
										>
											+{report.images - 3}
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
</div>
