<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Project } from '$lib/types';
	import { formatCurrency } from '$lib/utils/formatters';
	import { getCategoryName } from '$lib/utils/project-calculations';
	import { AlertCircle, AlertTriangle } from '@lucide/svelte';

	interface Props {
		project: Project;
	}

	const { project }: Props = $props();

	// Get the latest monthly progress to extract issues for delayed/non-completion
	const latestMonthlyProgress = $derived(() => {
		if (!project.monthly_progress || project.monthly_progress.length === 0) return null;
		const sorted = [...project.monthly_progress].sort((a, b) =>
			b.month_year.localeCompare(a.month_year)
		);
		return sorted[0];
	});

	const statusExplanation = $derived(() => {
		if (
			(project.status === 'delayed' || project.status === 'non-completion') &&
			latestMonthlyProgress()?.issues
		) {
			return latestMonthlyProgress()!.issues;
		}
		return null;
	});

	// Status configuration with colors
	const statusConfig = $derived(() => {
		switch (project.status) {
			case 'ongoing':
				return {
					label: 'On Going',
					bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
					textClass: 'text-emerald-700 dark:text-emerald-400',
					borderClass: 'border-emerald-300 dark:border-emerald-700',
					icon: null
				};
			case 'completed':
				return {
					label: 'Completed',
					bgClass: 'bg-blue-100 dark:bg-blue-900/30',
					textClass: 'text-blue-700 dark:text-blue-400',
					borderClass: 'border-blue-300 dark:border-blue-700',
					icon: null
				};
			case 'delayed':
				return {
					label: 'Delayed',
					bgClass: 'bg-orange-100 dark:bg-orange-900/30',
					textClass: 'text-orange-700 dark:text-orange-400',
					borderClass: 'border-orange-300 dark:border-orange-700',
					icon: AlertTriangle
				};
			case 'non-completion':
				return {
					label: 'Non-completion',
					bgClass: 'bg-red-100 dark:bg-red-900/30',
					textClass: 'text-red-700 dark:text-red-400',
					borderClass: 'border-red-300 dark:border-red-700',
					icon: AlertCircle
				};
			default:
				return {
					label: 'Preparation',
					bgClass: 'bg-slate-100 dark:bg-slate-800',
					textClass: 'text-slate-700 dark:text-slate-300',
					borderClass: 'border-slate-300 dark:border-slate-700',
					icon: null
				};
		}
	});
</script>

<!-- Project Header Block -->
<div class="mb-5 flex flex-col gap-6">
	<!-- Title and Category Row -->
	<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
		<div class="flex-1 space-y-3">
			<div class="flex flex-wrap items-center gap-2">
				<Badge
					variant="outline"
					class="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
				>
					{getCategoryName(project.category_key)}
				</Badge>
			</div>
			<h1
				class="text-3xl leading-tight font-bold tracking-tight text-slate-900 dark:text-slate-100"
			>
				{project.title}
			</h1>
		</div>
		<div
			class="flex flex-col items-start gap-1 rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 md:min-w-[200px] md:items-end dark:border-slate-700 dark:bg-slate-800"
		>
			<span
				class="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
				>Project Cost</span
			>
			<span class="text-2xl font-bold text-slate-900 dark:text-slate-100"
				>{formatCurrency(project.project_cost)}</span
			>
		</div>
	</div>

	<!-- Prominent Status Section -->
	<div
		class="rounded-lg border-2 p-4 {statusConfig().borderClass} {statusConfig()
			.bgClass} transition-all"
	>
		<div class="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
			<!-- Status Badge with Icon -->
			<div class="flex items-center gap-2">
				{#if statusConfig().icon}
					{@const IconComponent = statusConfig().icon}
					<IconComponent class="h-6 w-6 {statusConfig().textClass}" />
				{/if}
				<div class="flex flex-col gap-1">
					<span
						class="text-xs font-medium tracking-wider uppercase opacity-75 {statusConfig()
							.textClass}"
					>
						Project Status
					</span>
					<span class="text-2xl font-bold {statusConfig().textClass}">
						{statusConfig().label}
					</span>
				</div>
			</div>

			<!-- Explanation for Delayed/Non-completion -->
			{#if statusExplanation()}
				<div class="flex-1 rounded-md bg-white/50 p-3 dark:bg-slate-950/30">
					<h3
						class="mb-1 text-xs font-semibold tracking-wider uppercase {statusConfig().textClass}"
					>
						Reason:
					</h3>
					<p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
						{statusExplanation()}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
