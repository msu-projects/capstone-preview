<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { CurrencyInput } from '$lib/components/ui/currency-input';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { MonthlyReleaseSchedule, PerformanceTarget } from '$lib/types';
	import {
		formatMonth,
		generateCumulativePercentageTemplate,
		generateMonthRange,
		generateMonthlyTemplate,
		validateCumulativePercentage
	} from '$lib/utils/monthly-planning';
	import {
		Calendar,
		CircleAlert,
		CircleCheck,
		DollarSign,
		Sparkles,
		TrendingUp
	} from '@lucide/svelte';

	interface Props {
		performanceTargets: PerformanceTarget[];
		startDate: string;
		endDate: string;
		totalBudget: number;
		onUpdate: (data: {
			performanceTargets: PerformanceTarget[];
			releaseSchedule: Omit<MonthlyReleaseSchedule, 'id' | 'project_id'>[];
		}) => void;
	}

	let { performanceTargets: targets, startDate, endDate, totalBudget, onUpdate }: Props = $props();

	// Generate month range
	const months = $derived(generateMonthRange(startDate, endDate));

	// Initialize budget release schedule
	let releaseSchedule = $state<Omit<MonthlyReleaseSchedule, 'id' | 'project_id'>[]>([]);

	// Update release schedule when months change
	$effect(() => {
		releaseSchedule = months.map((month) => ({
			month_year: month,
			planned_release: 0,
			actual_release: 0,
			milestone_tied: ''
		}));
	});

	// Notify parent when releaseSchedule changes
	$effect(() => {
		if (releaseSchedule.length > 0) {
			notifyUpdate();
		}
	});

	// Track which section is expanded
	let expandedTarget = $state<number | null>(null);
	let budgetExpanded = $state(false);

	/**
	 * Generate smart template for a specific performance indicator (Plan %)
	 */
	function generateTemplate(targetIndex: number, strategy: 'even' | 'weighted' = 'even') {
		const target = targets[targetIndex];
		const template = generateCumulativePercentageTemplate(months, strategy);
		targets[targetIndex] = {
			...target,
			monthly_plan_percentage: template
		};
		notifyUpdate();
	}

	/**
	 * Generate smart template for budget
	 */
	function generateBudgetTemplate(strategy: 'even' | 'weighted' = 'even') {
		const template = generateMonthlyTemplate(totalBudget, months, strategy);
		releaseSchedule = months.map((month) => ({
			month_year: month,
			planned_release: template[month] || 0,
			actual_release: 0,
			milestone_tied: ''
		}));
		notifyUpdate();
	}

	/**
	 * Update monthly plan percentage for a target
	 */
	function updateMonthlyPlanPercentage(targetIndex: number, month: string, value: number) {
		const target = targets[targetIndex];
		targets[targetIndex] = {
			...target,
			monthly_plan_percentage: {
				...target.monthly_plan_percentage,
				[month]: value
			}
		};
		notifyUpdate();
	}

	/**
	 * Update monthly actual percentage for a target
	 */
	function updateMonthlyActualPercentage(targetIndex: number, month: string, value: number) {
		const target = targets[targetIndex];
		targets[targetIndex] = {
			...target,
			monthly_actual_percentage: {
				...target.monthly_actual_percentage,
				[month]: value
			}
		};
		notifyUpdate();
	}

	/**
	 * Notify parent of updates
	 */
	function notifyUpdate() {
		onUpdate({
			performanceTargets: targets,
			releaseSchedule
		});
	}

	/**
	 * Get validation status for a target (Plan %)
	 */
	function getValidationStatus(target: PerformanceTarget) {
		if (
			!target.monthly_plan_percentage ||
			Object.keys(target.monthly_plan_percentage).length === 0
		) {
			return { isValid: false, message: 'No monthly plan set', variant: 'secondary' as const };
		}
		const validation = validateCumulativePercentage(target.monthly_plan_percentage, months);
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
	 * Get validation status for budget
	 */
	function getBudgetValidationStatus() {
		const total = releaseSchedule.reduce((sum, item) => sum + item.planned_release, 0);
		const difference = total - totalBudget;
		if (difference !== 0) {
			return {
				isValid: false,
				message: `Total: ₱${total.toLocaleString()} (${difference > 0 ? '+' : ''}₱${Math.abs(difference).toLocaleString()})`,
				variant: 'destructive' as const
			};
		}
		return { isValid: true, message: 'Valid', variant: 'secondary' as const };
	}

	/**
	 * Check if all validations pass
	 */
	const allValid = $derived.by(() => {
		const targetsValid = targets.every((t) => getValidationStatus(t).isValid);
		const budgetValid = getBudgetValidationStatus().isValid;
		return targetsValid && budgetValid;
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-start justify-between">
		<div>
			<h3 class="text-lg font-semibold">Monthly Targets & Planning</h3>
			<p class="mt-1 text-sm text-muted-foreground">
				Track cumulative physical progress % (Plan vs Actual) and monthly budget releases
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
		<Alert.Root>
			<Sparkles class="size-4" />
			<Alert.Title>Smart Templates Available</Alert.Title>
			<Alert.Description>
				Use the "Generate Template" button to create cumulative percentage plans that reach 100% by
				the final month. Adjust individual months as needed. Enter actual progress % as work
				progresses to track slippage.
			</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Performance Targets -->
	<div class="space-y-4">
		<h4 class="flex items-center gap-2 text-sm font-semibold">
			<TrendingUp class="size-4" />
			Physical Progress Targets
		</h4>

		{#each targets as target, targetIndex (target.indicator_type || targetIndex)}
			{@const validation = getValidationStatus(target)}
			{@const isExpanded = expandedTarget === targetIndex}
			<Card.Root>
				<Card.Header class="pb-3">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<Card.Title class="text-sm">
								{target.indicator_name}
							</Card.Title>
							<div class="mt-1 flex items-center gap-2">
								<span class="text-xs text-muted-foreground">
									Target: {target.target_value.toLocaleString()}
									{target.unit_of_measure}
								</span>
								<Badge variant={validation.variant} class="text-xs">
									{validation.message}
								</Badge>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={() => generateTemplate(targetIndex, 'even')}
							>
								<Sparkles class="size-3" />
								Generate Template
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => (expandedTarget = isExpanded ? null : targetIndex)}
							>
								{isExpanded ? 'Collapse' : 'Expand'}
							</Button>
						</div>
					</div>
				</Card.Header>

				{#if isExpanded}
					<Card.Content>
						<div class="space-y-4">
							<!-- Header Row -->
							<div
								class="grid grid-cols-4 gap-2 border-b pb-2 text-xs font-semibold text-muted-foreground"
							>
								<div>Month</div>
								<div>Plan %</div>
								<div>Actual %</div>
								<div>Slippage</div>
							</div>

							<!-- Data Rows -->
							{#each months as month (month)}
								{@const planValue = target.monthly_plan_percentage?.[month] || 0}
								{@const actualValue = target.monthly_actual_percentage?.[month] || 0}
								{@const slippageValue = planValue - actualValue}
								{@const slippageColor =
									Math.abs(slippageValue) < 1
										? 'text-green-600'
										: slippageValue > 0
											? 'text-red-600'
											: 'text-green-600'}
								<div class="grid grid-cols-4 items-center gap-2">
									<div class="text-xs font-medium">{formatMonth(month)}</div>
									<div>
										<Input
											id={`plan-${targetIndex}-${month}`}
											type="number"
											min="0"
											max="100"
											step="0.1"
											value={planValue}
											oninput={(e) => {
												const val = parseFloat(e.currentTarget.value) || 0;
												updateMonthlyPlanPercentage(targetIndex, month, val);
											}}
											class="h-8 text-sm"
											placeholder="0%"
										/>
									</div>
									<div>
										<Input
											id={`actual-${targetIndex}-${month}`}
											type="number"
											min="0"
											max="100"
											step="0.1"
											value={actualValue}
											oninput={(e) => {
												const val = parseFloat(e.currentTarget.value) || 0;
												updateMonthlyActualPercentage(targetIndex, month, val);
											}}
											class="h-8 bg-muted/30 text-sm"
											placeholder="0%"
										/>
									</div>
									<div class="text-sm font-medium {slippageColor}">
										{slippageValue > 0 ? '+' : ''}{slippageValue.toFixed(1)}%
									</div>
								</div>
							{/each}

							<!-- Summary Row -->
							{#if months.length > 0}
								{@const finalPlanValue =
									target.monthly_plan_percentage?.[months[months.length - 1]] || 0}
								{@const finalActualValue =
									target.monthly_actual_percentage?.[months[months.length - 1]] || 0}
								<div class="grid grid-cols-4 gap-2 border-t pt-2 text-sm font-semibold">
									<div>Final</div>
									<div class={finalPlanValue === 100 ? 'text-green-600' : 'text-destructive'}>
										{finalPlanValue}%
									</div>
									<div>{finalActualValue}%</div>
									<div
										class={finalPlanValue - finalActualValue === 0
											? 'text-green-600'
											: 'text-destructive'}
									>
										{finalPlanValue - finalActualValue > 0 ? '+' : ''}{(
											finalPlanValue - finalActualValue
										).toFixed(1)}%
									</div>
								</div>
							{/if}
						</div>
					</Card.Content>
				{/if}
			</Card.Root>
		{/each}
	</div>

	<!-- Budget Release Schedule -->
	<div class="space-y-4">
		<h4 class="flex items-center gap-2 text-sm font-semibold">
			<DollarSign class="size-4" />
			Budget Release Schedule
		</h4>

		{#snippet budgetCard()}
			{@const budgetValidation = getBudgetValidationStatus()}
			<Card.Root>
				<Card.Header class="pb-3">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<Card.Title class="text-sm">Monthly Budget Releases</Card.Title>
							<div class="mt-1 flex items-center gap-2">
								<span class="text-xs text-muted-foreground">
									Total Budget: ₱{totalBudget.toLocaleString()}
								</span>
								<Badge variant={budgetValidation.variant} class="text-xs">
									{budgetValidation.message}
								</Badge>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<Button variant="outline" size="sm" onclick={() => generateBudgetTemplate('even')}>
								<Sparkles class="size-3" />
								Generate Template
							</Button>
							<Button variant="ghost" size="sm" onclick={() => (budgetExpanded = !budgetExpanded)}>
								{budgetExpanded ? 'Collapse' : 'Expand'}
							</Button>
						</div>
					</div>
				</Card.Header>

				{#if budgetExpanded}
					<Card.Content>
						<div class="grid grid-cols-3 gap-3">
							{#each releaseSchedule as schedule, index (schedule.month_year)}
								{@const budgetInputId = `budget-${schedule.month_year}`}
								<div class="space-y-1.5">
									<Label for={budgetInputId} class="text-xs">
										{formatMonth(schedule.month_year)}
									</Label>
									<CurrencyInput
										id={budgetInputId}
										bind:value={releaseSchedule[index].planned_release}
										class="h-8 text-sm"
										placeholder="₱ 0"
										min={0}
									/>
								</div>
							{/each}
						</div>
					</Card.Content>
				{/if}
			</Card.Root>
		{/snippet}

		{@render budgetCard()}
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
