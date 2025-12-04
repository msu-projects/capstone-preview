<script lang="ts">
	import ImageUploadGallery from '$lib/components/admin/projects/ImageUploadGallery.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import CurrencyInput from '$lib/components/ui/currency-input/currency-input.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { PerformanceTarget, PhotoDocumentation, ProjectStatus } from '$lib/types';
	import { formatMonth } from '$lib/utils/monthly-planning';
	import {
		calculateBeneficiaryProgress,
		calculateBudgetUtilization,
		calculateDaysRemaining,
		calculateProgressSlippage,
		formatCurrency,
		getCurrentMonth
	} from '$lib/utils/project-calculations';
	import {
		AlertTriangle,
		Banknote,
		Calendar,
		CheckCircle,
		ImageIcon,
		Info,
		Target,
		TrendingDown,
		TrendingUp,
		Users,
		Zap
	} from '@lucide/svelte';

	interface Props {
		// Existing fields
		status: ProjectStatus;
		physicalActual: string;
		issues: string;
		recommendations: string;
		catchUpPlan: string;
		maleEmployment: string;
		femaleEmployment: string;
		// New fields - Financial
		totalBudget: number;
		budgetDisbursed: string; // Cumulative (read-only)
		monthlyDisbursement: string; // This month only (editable)
		targetDisbursementThisMonth: number; // Planned budget for this month
		// New fields - Timeline
		startDate: string;
		contractDuration: string;
		// New fields - Beneficiaries
		targetBeneficiaries: number;
		currentBeneficiaries: string;
		householdsReached: string;
		// New fields - Progress tracking
		plannedPercentage: string;
		// Photo Documentation
		photoDocumentation: PhotoDocumentation[];
		// Performance Indicators
		achievedOutputs: Record<string, string>;
		performanceTargets: PerformanceTarget[];
		// Callback
		onSwitchToFull: () => void;
	}

	let {
		status = $bindable(),
		physicalActual = $bindable(),
		issues = $bindable(),
		recommendations = $bindable(),
		catchUpPlan = $bindable(),
		maleEmployment = $bindable(),
		femaleEmployment = $bindable(),
		totalBudget = $bindable(),
		budgetDisbursed = $bindable(),
		monthlyDisbursement = $bindable(),
		targetDisbursementThisMonth,
		startDate = $bindable(),
		contractDuration = $bindable(),
		targetBeneficiaries = $bindable(),
		currentBeneficiaries = $bindable(),
		householdsReached = $bindable(),
		plannedPercentage = $bindable(),
		photoDocumentation = $bindable(),
		achievedOutputs = $bindable(),
		performanceTargets,
		onSwitchToFull
	}: Props = $props();

	if (monthlyDisbursement === '0') {
		monthlyDisbursement = String(targetDisbursementThisMonth);
	}

	if (physicalActual === '0') {
		physicalActual = plannedPercentage;
	}

	// Derived computed values - Employment
	let totalEmployment = $derived(Number(maleEmployment || 0) + Number(femaleEmployment || 0));

	// Derived computed values - Budget
	// Calculate the new cumulative disbursement including this month's input
	let originalBudgetDisbursed = $derived(Number(budgetDisbursed || 0));
	let monthlyDisbursementAmount = $derived(Number(monthlyDisbursement || 0));
	let updatedBudgetDisbursed = $derived(originalBudgetDisbursed + monthlyDisbursementAmount);

	// Calculate both original and updated metrics for comparison
	let originalBudgetMetrics = $derived(
		calculateBudgetUtilization(totalBudget, originalBudgetDisbursed)
	);
	let budgetMetrics = $derived(calculateBudgetUtilization(totalBudget, updatedBudgetDisbursed));

	// Derived computed values - Timeline - calculate end date from start + duration
	const targetEndDate = $derived.by(() => {
		if (!startDate || !contractDuration) return '';
		const days = parseInt(contractDuration.replace(/\D/g, ''), 10);
		if (isNaN(days) || days <= 0) return '';
		const start = new Date(startDate);
		start.setDate(start.getDate() + days);
		return start.toISOString().split('T')[0];
	});
	let timelineMetrics = $derived(calculateDaysRemaining(targetEndDate));

	// Derived computed values - Beneficiaries
	let beneficiaryMetrics = $derived(
		calculateBeneficiaryProgress(targetBeneficiaries, Number(currentBeneficiaries || 0))
	);

	// Derived computed values - Progress slippage
	let slippageMetrics = $derived(
		calculateProgressSlippage(Number(plannedPercentage || 0), Number(physicalActual || 0))
	);

	// Get status label for display
	const getStatusLabel = (s: ProjectStatus) => {
		switch (s) {
			case 'planning':
				return 'Planning';
			case 'in-progress':
				return 'In Progress';
			case 'completed':
				return 'Completed';
			case 'suspended':
				return 'Suspended';
			default:
				return 'Select status';
		}
	};

	// Get badge variant for metrics (mapped to valid Badge variants)
	const getBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
		switch (status) {
			case 'on-track':
			case 'healthy':
			case 'ahead':
			case 'on-time':
				return 'default'; // Use 'default' for success states
			case 'warning':
			case 'needs-attention':
			case 'below-target':
				return 'secondary'; // Use 'secondary' for warning states
			case 'critical':
			case 'overrun':
			case 'overdue':
			case 'behind':
				return 'destructive';
			default:
				return 'outline';
		}
	};

	// Get current month for display
	const currentMonth = getCurrentMonth();
	const currentMonthFormatted = formatMonth(currentMonth);
</script>

<div class="space-y-6">
	<!-- Header with icon and description -->
	<div class="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
		<Zap class="mt-0.5 size-5 text-primary" />
		<div class="flex-1">
			<div class="flex items-center gap-2">
				<h3 class="text-sm font-semibold">Quick Update Mode</h3>
				<Badge variant="outline" class="gap-1.5 text-xs">
					<Calendar class="size-3" />
					{currentMonthFormatted}
				</Badge>
			</div>
			<p class="mt-1 text-xs text-muted-foreground">
				Update the most commonly changed monitoring fields for <strong
					>{currentMonthFormatted}</strong
				>. Need to edit project details?
				<button
					type="button"
					onclick={onSwitchToFull}
					class="text-primary underline-offset-4 hover:underline"
				>
					Switch to Full Edit
				</button>
			</p>
		</div>
	</div>

	<!-- Financial Section -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<div class="space-y-1.5">
				<div class="flex items-center gap-2">
					<Banknote class="size-4 text-primary" />
					<Card.Title>Financial Status</Card.Title>
				</div>
				<Card.Description>Track budget utilization and balance</Card.Description>
			</div>
			{#if budgetMetrics.status}
				<Badge variant={getBadgeVariant(budgetMetrics.status)}>
					{budgetMetrics.status.replace('-', ' ')}
				</Badge>
			{/if}
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<!-- Total Budget (Read-only, informational) -->
				<div class="space-y-2">
					<Label for="total-budget">Total Budget</Label>
					<Input
						id="total-budget"
						type="text"
						value={formatCurrency(totalBudget)}
						disabled
						class="font-medium opacity-75"
					/>
				</div>

				<!-- Cumulative Budget Disbursed (Read-only) -->
				<div class="space-y-2">
					<Label for="cumulative-disbursed" class="flex items-center gap-1.5">
						Total Disbursed (Cumulative)
						<Info class="size-3.5 text-muted-foreground" />
					</Label>
					<Input
						id="cumulative-disbursed"
						type="text"
						value={formatCurrency(updatedBudgetDisbursed)}
						disabled
						class="font-medium opacity-75"
					/>
					{#if monthlyDisbursementAmount > 0}
						<p class="text-xs text-muted-foreground">
							Original: {formatCurrency(originalBudgetDisbursed)} + This month: {formatCurrency(
								monthlyDisbursementAmount
							)} = {formatCurrency(updatedBudgetDisbursed)}
						</p>
					{:else}
						<p class="text-xs text-muted-foreground">Sum of all monthly disbursements until now</p>
					{/if}
				</div>

				<!-- Target Disbursement This Month (Read-only) -->
				<div class="space-y-2">
					<Label for="target-disbursement" class="flex items-center gap-2">
						<Badge variant="outline" class="gap-1.5">
							<Calendar class="size-3" />
							{currentMonthFormatted}
						</Badge>
						Target Amount
					</Label>
					<Input
						id="target-disbursement"
						type="text"
						value={formatCurrency(targetDisbursementThisMonth)}
						disabled
						class="font-medium opacity-75"
					/>
					<p class="text-xs text-muted-foreground">Planned disbursement for this month</p>
				</div>

				<!-- Monthly Disbursement (Input for THIS month) -->
				<div class="space-y-2">
					<Label for="monthly-disbursement" class="flex items-center gap-2">
						<Badge variant="default" class="gap-1.5">
							<Calendar class="size-3" />
							{currentMonthFormatted}
						</Badge>
						Amount Disbursed
					</Label>
					<div class="relative">
						<CurrencyInput
							id="monthly-disbursement"
							min={0}
							bind:value={monthlyDisbursement}
							placeholder="₱0"
						/>
						<span class="pointer-events-none absolute top-2.5 right-3 text-sm text-muted-foreground"
							>PHP</span
						>
					</div>
					{#if targetDisbursementThisMonth > 0}
						{@const disbursedAmount = Number(monthlyDisbursement || 0)}
						{@const variance = disbursedAmount - targetDisbursementThisMonth}
						{@const variancePercentage = (disbursedAmount / targetDisbursementThisMonth) * 100}
						<p class="text-xs text-muted-foreground">
							{#if variance === 0}
								On target
							{:else if variance > 0}
								<span class="text-primary"
									>{formatCurrency(variance)} above target ({variancePercentage.toFixed(1)}%)</span
								>
							{:else}
								<span class="text-muted-foreground"
									>{formatCurrency(Math.abs(variance))} below target ({variancePercentage.toFixed(
										1
									)}%)</span
								>
							{/if}
						</p>
					{/if}
				</div>

				<!-- Auto-calculated: Balance Remaining -->
				<div class="space-y-2">
					<Label for="budget-balance" class="flex items-center gap-1.5">
						Balance Remaining
						<Info class="size-3.5 text-muted-foreground" />
					</Label>
					<Input
						id="budget-balance"
						type="text"
						value={formatCurrency(budgetMetrics.balance)}
						disabled
						class="font-medium opacity-75"
					/>
				</div>

				<!-- Auto-calculated: Utilization % -->
				<div class="space-y-2">
					<Label for="budget-utilization" class="flex items-center gap-1.5">
						Budget Utilization
						<Info class="size-3.5 text-muted-foreground" />
					</Label>
					<div class="relative">
						<Input
							id="budget-utilization"
							type="text"
							value={budgetMetrics.utilizationPercentage.toFixed(2)}
							disabled
							class="font-medium opacity-75"
						/>
						<span class="pointer-events-none absolute top-2.5 right-3 text-sm text-muted-foreground"
							>%</span
						>
					</div>
					{#if monthlyDisbursementAmount > 0}
						<p class="text-xs text-muted-foreground">
							Original: {originalBudgetMetrics.utilizationPercentage.toFixed(2)}% → Updated: {budgetMetrics.utilizationPercentage.toFixed(
								2
							)}% (+{(
								budgetMetrics.utilizationPercentage - originalBudgetMetrics.utilizationPercentage
							).toFixed(2)}%)
						</p>
					{/if}
				</div>
			</div>

			<!-- Budget warnings -->
			{#if budgetMetrics.isOverBudget}
				<div
					class="flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-3"
				>
					<AlertTriangle class="mt-0.5 size-4 text-destructive" />
					<div class="flex-1 text-xs text-destructive">
						<strong>Budget Overrun:</strong> Disbursed amount exceeds total budget by
						{formatCurrency(Number(budgetDisbursed || 0) - totalBudget)}
					</div>
				</div>
			{:else if budgetMetrics.utilizationPercentage > 90}
				<div class="flex items-start gap-2 rounded-lg border border-warning bg-warning/10 p-3">
					<AlertTriangle class="mt-0.5 size-4 text-warning" />
					<div class="flex-1 text-xs text-warning">
						<strong>High Utilization:</strong> Budget is over 90% utilized. Monitor remaining balance
						carefully.
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Enhanced Progress Section -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<div class="space-y-1.5">
				<Card.Title>Physical Progress & Status</Card.Title>
				<Card.Description>Update project status, progress, and current stage</Card.Description>
			</div>
			{#if slippageMetrics.status !== 'on-track'}
				<Badge variant={getBadgeVariant(slippageMetrics.status)}>
					{#if slippageMetrics.status === 'ahead'}
						<TrendingUp class="mr-1 size-3" />
					{:else}
						<TrendingDown class="mr-1 size-3" />
					{/if}
					{slippageMetrics.formattedMessage}
				</Badge>
			{:else}
				<Badge variant="default">
					<CheckCircle class="mr-1 size-3" />
					On Schedule
				</Badge>
			{/if}
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<!-- Status -->
				<div class="space-y-2">
					<Label for="status">Project Status</Label>
					<Select.Root type="single" bind:value={status}>
						<Select.Trigger id="status" class="w-full">
							{getStatusLabel(status)}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="planning" label="Planning">Planning</Select.Item>
							<Select.Item value="in-progress" label="In Progress">In Progress</Select.Item>
							<Select.Item value="completed" label="Completed">Completed</Select.Item>
							<Select.Item value="suspended" label="Suspended">Suspended</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Planned Percentage (for comparison) -->
				<div class="space-y-2">
					<Label for="planned-percentage">Planned Progress (%)</Label>
					<div class="relative">
						<Input
							id="planned-percentage"
							type="number"
							min="0"
							max="100"
							bind:value={plannedPercentage}
							placeholder="0"
							disabled={true}
						/>
						<span class="pointer-events-none absolute top-2.5 right-3 text-sm text-muted-foreground"
							>%</span
						>
					</div>
				</div>

				<!-- Actual Completion Percentage -->
				<div class="space-y-2">
					<Label for="completion">Actual Progress (%)</Label>
					<div class="relative">
						<Input
							id="completion"
							type="number"
							min="0"
							max="100"
							bind:value={physicalActual}
							placeholder="0"
						/>
						<span class="pointer-events-none absolute top-2.5 right-3 text-sm text-muted-foreground"
							>%</span
						>
					</div>
				</div>
			</div>

			<!-- Slippage indicator -->
			{#if slippageMetrics.slippage !== 0}
				<div class="rounded-lg border bg-muted/30 p-3">
					<div class="mb-1 text-xs font-medium text-muted-foreground">Schedule Variance</div>
					<div class="flex items-center gap-2">
						{#if slippageMetrics.status === 'ahead'}
							<TrendingUp class="size-4 text-primary" />
							<span class="text-sm font-semibold text-primary">
								{Math.abs(slippageMetrics.slippage).toFixed(2)}% ahead of schedule
							</span>
						{:else if slippageMetrics.status === 'behind'}
							{#if slippageMetrics.severity === 'severe'}
								<TrendingDown class="size-4 text-destructive" />
								<span class="text-sm font-semibold text-destructive">
									{Math.abs(slippageMetrics.slippage).toFixed(2)}% behind schedule (Severe)
								</span>
							{:else}
								<TrendingDown class="size-4 text-muted-foreground" />
								<span class="text-sm font-semibold text-muted-foreground">
									{Math.abs(slippageMetrics.slippage).toFixed(2)}% behind schedule
									{#if slippageMetrics.severity === 'moderate'}
										(Moderate)
									{/if}
								</span>
							{/if}
						{/if}
					</div>
				</div>
			{/if}

			<!-- Progress warnings -->
			{#if Number(physicalActual || 0) > 100}
				<div class="flex items-start gap-2 rounded-lg border border-warning bg-warning/10 p-3">
					<AlertTriangle class="mt-0.5 size-4 text-warning" />
					<div class="flex-1 text-xs text-warning">
						<strong>Invalid Progress:</strong> Progress percentage cannot exceed 100%.
					</div>
				</div>
			{:else if slippageMetrics.severity === 'severe'}
				<div
					class="flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-3"
				>
					<AlertTriangle class="mt-0.5 size-4 text-destructive" />
					<div class="flex-1 text-xs text-destructive">
						<strong>Severe Delay:</strong> Project is significantly behind schedule. Review catch-up
						plan below.
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Timeline Section -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<div class="space-y-1.5">
				<div class="flex items-center gap-2">
					<Calendar class="size-4 text-primary" />
					<Card.Title>Timeline & Schedule</Card.Title>
				</div>
				<Card.Description>Track project timeline and deadlines</Card.Description>
			</div>
			{#if timelineMetrics.status}
				<Badge variant={getBadgeVariant(timelineMetrics.status)}>
					{timelineMetrics.formattedMessage}
				</Badge>
			{/if}
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<!-- Start Date (Read-only) -->
				<div class="space-y-2">
					<Label for="start-date">Start Date</Label>
					<Input id="start-date" type="date" bind:value={startDate} disabled class="opacity-75" />
				</div>

				<!-- Contract Duration -->
				<div class="space-y-2">
					<Label for="contract-duration">Contract Duration</Label>
					<Input
						id="contract-duration"
						type="text"
						value={contractDuration}
						disabled
						class="opacity-75"
					/>
				</div>

				<!-- Target End Date (Calculated) -->
				<div class="space-y-2">
					<Label for="target-end-date">Target End Date</Label>
					<Input
						id="target-end-date"
						type="date"
						value={targetEndDate}
						disabled
						class="opacity-75"
					/>
				</div>
			</div>

			<!-- Timeline status indicator -->
			{#if timelineMetrics.isOverdue}
				<div
					class="flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-3"
				>
					<AlertTriangle class="mt-0.5 size-4 text-destructive" />
					<div class="flex-1 text-xs text-destructive">
						<strong>Project Overdue:</strong>
						{timelineMetrics.formattedMessage}
					</div>
				</div>
			{:else if timelineMetrics.status === 'warning'}
				<div class="flex items-start gap-2 rounded-lg border border-warning bg-warning/10 p-3">
					<AlertTriangle class="mt-0.5 size-4 text-warning" />
					<div class="flex-1 text-xs text-warning">
						<strong>Deadline Approaching:</strong>
						{timelineMetrics.formattedMessage}
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Beneficiaries Section -->
	<Card.Root class="hidden">
		<Card.Header class="flex flex-row items-center justify-between">
			<div class="space-y-1.5">
				<div class="flex items-center gap-2">
					<Users class="size-4 text-primary" />
					<Card.Title>Beneficiaries & Reach</Card.Title>
				</div>
				<Card.Description>Track beneficiary targets and progress</Card.Description>
			</div>
			{#if beneficiaryMetrics.status}
				<Badge variant={getBadgeVariant(beneficiaryMetrics.status)}>
					{beneficiaryMetrics.percentage.toFixed(1)}% of target
				</Badge>
			{/if}
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<!-- Target Beneficiaries (Read-only) -->
				<div class="space-y-2">
					<Label for="target-beneficiaries">Target Beneficiaries</Label>
					<Input
						id="target-beneficiaries"
						type="number"
						value={targetBeneficiaries}
						disabled
						class="font-medium opacity-75"
					/>
				</div>

				<!-- Current Beneficiaries Served -->
				<div class="space-y-2">
					<Label for="current-beneficiaries">Beneficiaries Served</Label>
					<Input
						id="current-beneficiaries"
						type="number"
						min="0"
						bind:value={currentBeneficiaries}
						placeholder="0"
					/>
				</div>

				<!-- Auto-calculated: Remaining -->
				<div class="space-y-2 md:col-span-3">
					<Label class="flex items-center gap-1.5">
						Progress to Target
						<Info class="size-3.5 text-muted-foreground" />
					</Label>
					<div class="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
						<div class="flex-1">
							<div class="mb-1 text-xs text-muted-foreground">Remaining</div>
							<div class="text-sm font-semibold">{beneficiaryMetrics.remaining} beneficiaries</div>
						</div>
						<div class="flex-1">
							<div class="mb-1 text-xs text-muted-foreground">Progress</div>
							<div class="text-sm font-semibold">{beneficiaryMetrics.percentage.toFixed(1)}%</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Beneficiary warnings -->
			{#if beneficiaryMetrics.status === 'below-target' && Number(physicalActual || 0) > 70}
				<div class="flex items-start gap-2 rounded-lg border border-warning bg-warning/10 p-3">
					<AlertTriangle class="mt-0.5 size-4 text-warning" />
					<div class="flex-1 text-xs text-warning">
						<strong>Low Beneficiary Reach:</strong> Physical progress is at {physicalActual}% but
						beneficiary reach is only {beneficiaryMetrics.percentage.toFixed(1)}% of target.
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Employment Generated</Card.Title>
			<Card.Description>Track jobs created by this project</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-4 md:grid-cols-3">
				<!-- Male Employment -->
				<div class="space-y-2">
					<Label for="male-employment">Male</Label>
					<Input
						id="male-employment"
						type="number"
						min="0"
						bind:value={maleEmployment}
						placeholder="0"
					/>
				</div>

				<!-- Female Employment -->
				<div class="space-y-2">
					<Label for="female-employment">Female</Label>
					<Input
						id="female-employment"
						type="number"
						min="0"
						bind:value={femaleEmployment}
						placeholder="0"
					/>
				</div>

				<!-- Total Employment (Calculated) -->
				<div class="space-y-2">
					<Label for="total-employment">Total Employment</Label>
					<Input
						id="total-employment"
						type="number"
						value={totalEmployment}
						disabled
						class="opacity-75"
					/>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Performance Indicators Section -->
	{#if performanceTargets && performanceTargets.length > 0}
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<div class="space-y-1.5">
					<div class="flex items-center gap-2">
						<Target class="size-4 text-primary" />
						<Card.Title>Performance Indicators</Card.Title>
					</div>
					<Card.Description>Track achieved outputs for {currentMonthFormatted}</Card.Description>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2">
					{#each performanceTargets as target (target.indicator_type)}
						{@const achieved = Number(achievedOutputs[target.indicator_type] || 0)}
						{@const progressPct =
							target.target_value > 0 ? (achieved / target.target_value) * 100 : 0}
						{@const progressStatus =
							progressPct >= 100
								? 'on-track'
								: progressPct >= 75
									? 'warning'
									: progressPct >= 50
										? 'needs-attention'
										: 'behind'}
						<div class="space-y-2 rounded-lg border bg-card p-4">
							<div class="flex items-center justify-between">
								<Label for="indicator-{target.indicator_type}" class="text-sm font-medium">
									{target.indicator_name}
								</Label>
								<Badge variant={getBadgeVariant(progressStatus)} class="text-xs">
									{progressPct.toFixed(1)}%
								</Badge>
							</div>
							<div class="grid grid-cols-2 gap-3">
								<!-- Target (Read-only) -->
								<div class="space-y-1">
									<span class="text-xs text-muted-foreground">Target</span>
									<div class="relative">
										<Input
											type="text"
											value={target.target_value}
											disabled
											class="pr-12 text-sm opacity-75"
										/>
										<span
											class="pointer-events-none absolute top-2.5 right-3 text-xs text-muted-foreground"
										>
											{target.unit_of_measure}
										</span>
									</div>
								</div>
								<!-- Achieved (Editable) -->
								<div class="space-y-1">
									<span class="text-xs text-muted-foreground">Achieved</span>
									<div class="relative">
										<Input
											id="indicator-{target.indicator_type}"
											type="number"
											min="0"
											value={achievedOutputs[target.indicator_type] || '0'}
											oninput={(e) => {
												achievedOutputs = {
													...achievedOutputs,
													[target.indicator_type]: e.currentTarget.value
												};
											}}
											class="pr-12 text-sm"
											placeholder="0"
										/>
										<span
											class="pointer-events-none absolute top-2.5 right-3 text-xs text-muted-foreground"
										>
											{target.unit_of_measure}
										</span>
									</div>
								</div>
							</div>
							<!-- Progress bar -->
							<div class="mt-2">
								<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
									<div
										class="h-full transition-all duration-300 {progressPct >= 100
											? 'bg-primary'
											: progressPct >= 75
												? 'bg-yellow-500'
												: progressPct >= 50
													? 'bg-orange-500'
													: 'bg-destructive'}"
										style="width: {Math.min(progressPct, 100)}%"
									></div>
								</div>
								<p class="mt-1 text-xs text-muted-foreground">
									{achieved} of {target.target_value}
									{target.unit_of_measure}
									{#if target.target_value > achieved}
										<span class="text-muted-foreground"
											>({target.target_value - achieved} remaining)</span
										>
									{:else if achieved > target.target_value}
										<span class="text-primary">({achieved - target.target_value} over target)</span>
									{/if}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>Status Summary</Card.Title>
			<Card.Description>Document issues, recommendations, and catch-up plans</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<!-- Issues -->
			<div class="space-y-2">
				<Label for="issues">Issues Encountered</Label>
				<Textarea
					id="issues"
					bind:value={issues}
					placeholder="Describe any issues or challenges encountered during implementation"
					rows={3}
					class="h-25"
				/>
			</div>

			<!-- Recommendations -->
			<div class="space-y-2">
				<Label for="recommendations">Recommendations</Label>
				<Textarea
					id="recommendations"
					bind:value={recommendations}
					placeholder="Provide recommendations for addressing issues or improving implementation"
					rows={3}
					class="h-25"
				/>
			</div>

			<!-- Catch-Up Plan -->
			<div class="space-y-2">
				<Label for="catchup-plan">Catch-Up Plan</Label>
				<Textarea
					id="catchup-plan"
					bind:value={catchUpPlan}
					placeholder="Outline action plans to address delays or improve progress"
					rows={3}
					class="h-25"
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Progress Documentation Section -->
	<Card.Root>
		<Card.Header>
			<div class="space-y-1.5">
				<div class="flex items-center gap-2">
					<ImageIcon class="size-4 text-primary" />
					<Card.Title>Progress Documentation</Card.Title>
				</div>
				<Card.Description>
					Upload photos showing project progress, activities, or milestones for {currentMonthFormatted}
				</Card.Description>
			</div>
		</Card.Header>
		<Card.Content>
			<ImageUploadGallery bind:photoDocumentation />
		</Card.Content>
	</Card.Root>
</div>
