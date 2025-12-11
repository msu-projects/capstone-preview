<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import type { MonthlyTarget } from '$lib/types';
	import {
		formatMonth,
		generateCumulativePercentageTemplate,
		generateMonthRange,
		validateCumulativePercentage
	} from '$lib/utils/monthly-planning';
	import { Calendar, CircleAlert, CircleCheck, TrendingUp } from '@lucide/svelte';

	interface Props {
		startDate: string;
		endDate: string;
		onUpdate: (data: { monthlyTargets: MonthlyTarget[] }) => void;
	}

	let { startDate, endDate, onUpdate }: Props = $props();

	// Generate month range
	const months = $derived(generateMonthRange(startDate, endDate));

	// Initialize monthly targets (combined physical progress and budget)
	let monthlyTargets = $state<MonthlyTarget[]>([]);

	// Initialize monthly targets when months change - automatically generate template
	$effect(() => {
		if (months.length > 0) {
			// Auto-generate cumulative percentage template for physical progress
			const progressTemplate = generateCumulativePercentageTemplate(months, 'even');

			monthlyTargets = months.map((month) => ({
				month_year: month,
				planned_physical_progress: progressTemplate[month] || 0
			}));
		}
	});

	// Notify parent when data changes
	$effect(() => {
		if (monthlyTargets.length > 0) {
			notifyUpdate();
		}
	});

	/**
	 * Notify parent of updates
	 */
	function notifyUpdate() {
		onUpdate({ monthlyTargets });
	}

	/**
	 * Get validation status for physical progress (Plan %)
	 */
	function getPhysicalProgressValidationStatus() {
		if (monthlyTargets.length === 0) {
			return { isValid: false, message: 'No monthly plan set', variant: 'secondary' as const };
		}

		const planPercentages = monthlyTargets.reduce(
			(acc, mt) => {
				acc[mt.month_year] = mt.planned_physical_progress;
				return acc;
			},
			{} as Record<string, number>
		);

		const validation = validateCumulativePercentage(planPercentages, months);

		if (!validation.isValid) {
			return {
				isValid: false,
				message: validation.message,
				variant: 'destructive' as const
			};
		}
		return { isValid: true, message: 'Valid', variant: 'secondary' as const };
	}

	/**
	 * Check if all validations pass
	 */
	const allValid = $derived.by(() => {
		return getPhysicalProgressValidationStatus().isValid;
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-start justify-between">
		<div>
			<h3 class="text-lg font-semibold">Monthly Targets & Planning</h3>
			<p class="mt-1 text-sm text-muted-foreground">
				Set cumulative planned physical progress % targets for each month
			</p>
			{#if months.length > 0}
				<div class="mt-2 flex items-center gap-4 text-sm">
					<div class="flex items-center gap-1.5">
						<Calendar class="size-4 text-muted-foreground" />
						<span>{formatMonth(months[0])} - {formatMonth(months[months.length - 1])}</span>
					</div>
					<div class="flex items-center gap-1.5">
						<TrendingUp class="size-4 text-muted-foreground" />
						<span>{months.length} months</span>
					</div>
				</div>
			{/if}
		</div>
		<div>
			{#if allValid}
				<Badge variant="secondary" class="gap-1.5 bg-green-500 text-white">
					<CircleCheck class="size-3" />
					All Valid
				</Badge>
			{:else}
				<Badge variant="secondary" class="gap-1.5 bg-yellow-500 text-white">
					<CircleAlert class="size-3" />
					Needs Attention
				</Badge>
			{/if}
		</div>
	</div>

	<!-- Info Alert -->
	{#if months.length === 0}
		<Alert.Root variant="destructive">
			<CircleAlert class="size-4" />
			<Alert.Title>Missing Project Dates</Alert.Title>
			<Alert.Description>
				Please set the project start and end dates in the Performance Targets tab before setting up
				monthly planning.
			</Alert.Description>
		</Alert.Root>
	{:else}
		<!-- <Alert.Root>
			<Sparkles class="size-4" />
			<Alert.Title>Auto-Generated Templates</Alert.Title>
			<Alert.Description>
				Monthly targets are automatically distributed evenly across all project months. Physical
				progress reaches 100% by the final month. Adjust individual months as needed.
			</Alert.Description>
		</Alert.Root> -->
	{/if}

	<!-- Physical Progress Tracker -->
	<div class="space-y-4">
		<h4 class="flex items-center gap-2 text-sm font-semibold">
			<TrendingUp class="size-4" />
			Physical Progress Tracker
		</h4>

		<Card.Root>
			{@const validation = getPhysicalProgressValidationStatus()}
			<Card.Header class="pb-3">
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<Card.Title class="text-sm">Monthly Physical Progress (Cumulative %)</Card.Title>
						<div class="mt-1 flex items-center gap-2">
							<span class="text-xs text-muted-foreground">
								Track overall project completion progress monthly
							</span>
							<Badge variant={validation.variant} class="text-xs">
								{validation.message}
							</Badge>
						</div>
					</div>
				</div>
			</Card.Header>

			<Card.Content>
				<div class="space-y-4">
					<!-- Header Row -->
					<div
						class="grid grid-cols-2 gap-2 border-b pb-2 text-xs font-semibold text-muted-foreground"
					>
						<div>Month</div>
						<div>Planned Target %</div>
					</div>

					<!-- Data Rows -->
					{#each monthlyTargets as target, index (target.month_year)}
						<div class="grid grid-cols-2 items-center gap-2">
							<div class="text-xs font-medium">{formatMonth(target.month_year)}</div>
							<div>
								<Input
									id={`plan-${target.month_year}`}
									type="number"
									min="0"
									max="100"
									step="0.1"
									bind:value={monthlyTargets[index].planned_physical_progress}
									oninput={() => notifyUpdate()}
									class="h-8 text-sm"
									placeholder="0%"
								/>
							</div>
						</div>
					{/each}

					<!-- Summary Row -->
					{#if monthlyTargets.length > 0}
						{@const finalTarget = monthlyTargets[monthlyTargets.length - 1]}
						<div class="grid grid-cols-2 gap-2 border-t pt-2 text-sm font-semibold">
							<div>Final Target</div>
							<div
								class={finalTarget.planned_physical_progress === 100
									? 'text-green-600'
									: 'text-destructive'}
							>
								{finalTarget.planned_physical_progress}%
							</div>
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Validation Summary -->
	{#if !allValid}
		<Alert.Root variant="destructive">
			<CircleAlert class="size-4" />
			<Alert.Title>Validation Issues</Alert.Title>
			<Alert.Description>
				Please ensure all plan percentages are cumulative and reach 100% in the final month before
				proceeding.
			</Alert.Description>
		</Alert.Root>
	{/if}
</div>
