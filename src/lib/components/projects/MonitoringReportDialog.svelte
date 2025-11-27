<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { PhotoGallery } from '$lib/components/ui/photo-gallery';
	import type { MonthlyReport } from '$lib/types';
	import { formatCurrency } from '$lib/utils/formatters';
	import { Activity, Banknote, Camera } from '@lucide/svelte';

	interface Props {
		open: boolean;
		selectedReport: MonthlyReport | null;
	}

	let { open = $bindable(), selectedReport }: Props = $props();

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
						{#if selectedReport.remarks}
							<span class="text-sm text-slate-500">- {selectedReport.remarks}</span>
						{/if}
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
									style="width: {selectedReport.actual_financial && selectedReport.plan_financial
										? (selectedReport.actual_financial / selectedReport.plan_financial) * 100
										: 0}%"
								></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Site Documentation / Images -->
				<div>
					<h4 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
						<Camera class="size-4 text-slate-600" /> Site Documentation
					</h4>

					<PhotoGallery photos={selectedReport.photos} columns={3} />
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
