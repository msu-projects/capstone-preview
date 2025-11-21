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
		generateMonthRange,
		generateMonthlyTemplate,
		validateMonthlyBreakdown
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

	let { performanceTargets, startDate, endDate, totalBudget, onUpdate }: Props = $props();

	// Generate month range
	const months = $derived(generateMonthRange(startDate, endDate));

	// Initialize monthly breakdown for each target
	let targets = $state<PerformanceTarget[]>(
		performanceTargets.map((target) => ({
			...target,
			monthly_breakdown: target.monthly_breakdown || {}
		}))
	);

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
	 * Generate smart template for a specific performance indicator
	 */
	function generateTemplate(targetIndex: number, strategy: 'even' | 'weighted' = 'even') {
		const target = targets[targetIndex];
		const template = generateMonthlyTemplate(target.target_value, months, strategy);
		targets[targetIndex] = {
			...target,
			monthly_breakdown: template
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
	 * Update monthly value for a target
	 */
	function updateMonthlyValue(targetIndex: number, month: string, value: number) {
		const target = targets[targetIndex];
		targets[targetIndex] = {
			...target,
			monthly_breakdown: {
				...target.monthly_breakdown,
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
	 * Get validation status for a target
	 */
	function getValidationStatus(target: PerformanceTarget) {
		if (!target.monthly_breakdown || Object.keys(target.monthly_breakdown).length === 0) {
			return { isValid: false, message: 'No monthly targets set', variant: 'secondary' as const };
		}
		const validation = validateMonthlyBreakdown(target.monthly_breakdown, target.target_value);
		if (!validation.isValid) {
			return {
				isValid: false,
				message: `Total: ${validation.total} (${validation.difference > 0 ? '+' : ''}${validation.difference})`,
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
				Break down your performance targets and budget into monthly deliverables
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
				Use the "Generate Template" button to automatically distribute targets evenly across months,
				then adjust individual months as needed.
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
									Target: {target.target_value.toLocaleString()} units
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
						<div class="grid grid-cols-3 gap-3">
							{#each months as month (month)}
								{@const value = target.monthly_breakdown?.[month] || 0}
								<div class="space-y-1.5">
									<Label for={`target-${targetIndex}-${month}`} class="text-xs">
										{formatMonth(month)}
									</Label>
									<Input
										id={`target-${targetIndex}-${month}`}
										type="number"
										min="0"
										{value}
										oninput={(e) => {
											const val = parseInt(e.currentTarget.value) || 0;
											updateMonthlyValue(targetIndex, month, val);
										}}
										class="h-8 text-sm"
									/>
								</div>
							{/each}
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
				Please ensure all monthly targets sum to their overall targets before proceeding.
			</Alert.Description>
		</Alert.Root>
	{/if}
</div>
