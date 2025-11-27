<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { formatCurrency } from '$lib/utils/formatters';
	import {
		Activity,
		Banknote,
		Camera,
		FastForward,
		Image as ImageIcon,
		Lightbulb,
		TriangleAlert
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
		open: boolean;
		selectedReport: MonthlyReport | null;
	}

	let { open = $bindable(), selectedReport }: Props = $props();

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
</script>

<!-- Detail Modal -->
<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] max-w-3xl! overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Progress Report: {selectedReport?.month}</Dialog.Title>
		</Dialog.Header>
		{#if selectedReport}
			<div class="space-y-6">
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
						<span class="font-semibold text-slate-900">{selectedReport.status}</span>
						<span class="text-sm text-slate-500">- {selectedReport.remarks}</span>
					</div>
				</div>

				<!-- Detailed Stats -->
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
						<h4 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
							<Activity class="size-4 text-blue-600" /> Physical Progress
						</h4>
						<div class="space-y-3">
							<div class="flex justify-between text-sm">
								<span class="text-slate-500">Planned</span>
								<span class="font-medium">{selectedReport.plan_physical}%</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-slate-500">Actual</span>
								<span class="font-bold text-slate-900"
									>{selectedReport.actual_physical ?? '-'}%</span
								>
							</div>
							<div class="mt-2 h-1.5 w-full rounded-full bg-slate-200">
								<div
									class="h-1.5 rounded-full bg-blue-600"
									style="width: {selectedReport.actual_physical || 0}%"
								></div>
							</div>
						</div>
					</div>

					<div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
						<h4 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
							<Banknote class="size-4 text-emerald-600" /> Financial Releases
						</h4>
						<div class="space-y-3">
							<div class="flex justify-between text-sm">
								<span class="text-slate-500">Planned</span>
								<span class="font-medium">{formatCurrency(selectedReport.plan_financial)}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-slate-500">Actual</span>
								<span class="font-bold text-slate-900"
									>{selectedReport.actual_financial
										? formatCurrency(selectedReport.actual_financial)
										: '-'}</span
								>
							</div>
							<div class="mt-2 h-1.5 w-full rounded-full bg-slate-200">
								<div
									class="h-1.5 rounded-full bg-emerald-500"
									style="width: {selectedReport.actual_financial
										? (selectedReport.actual_financial / selectedReport.plan_financial) * 100
										: 0}%"
								></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Status Summary -->
				{#if selectedReport.issues || selectedReport.recommendations || selectedReport.catch_up_plan}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						<!-- Issues -->
						<div class="rounded-xl border border-rose-100 bg-rose-50 p-4">
							<h4 class="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-800">
								<TriangleAlert class="size-4" /> Issues Encountered
							</h4>
							<p class="text-xs leading-relaxed text-rose-700">
								{selectedReport.issues || 'No issues reported for this period.'}
							</p>
						</div>

						<!-- Recommendations -->
						<div class="rounded-xl border border-amber-100 bg-amber-50 p-4">
							<h4 class="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
								<Lightbulb class="size-4" /> Recommendations
							</h4>
							<p class="text-xs leading-relaxed text-amber-700">
								{selectedReport.recommendations || 'No recommendations for this period.'}
							</p>
						</div>

						<!-- Catch-up Plan -->
						<div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
							<h4 class="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-800">
								<FastForward class="size-4" /> Catch-up Plan
							</h4>
							<p class="text-xs leading-relaxed text-blue-700">
								{selectedReport.catch_up_plan || 'No catch-up plan required.'}
							</p>
						</div>
					</div>
				{/if}

				<!-- Site Documentation / Images -->
				<div>
					<h4 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
						<Camera class="size-4 text-slate-600" /> Site Documentation
					</h4>

					{#if selectedReport.images && selectedReport.images > 0}
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
							{#each Array(selectedReport.images) as _, idx}
								<div
									class="group flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200"
								>
									<ImageIcon class="mb-2 size-8 transition-transform group-hover:scale-110" />
									<span class="text-xs font-medium">Image {idx + 1}</span>
								</div>
							{/each}
						</div>
					{:else}
						<div
							class="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-400"
						>
							No documentation images uploaded for this month.
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
