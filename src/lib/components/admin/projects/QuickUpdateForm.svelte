<script lang="ts">
	import ImageUploadGallery from '$lib/components/admin/projects/ImageUploadGallery.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import NumberInput from '$lib/components/ui/number-input/NumberInput.svelte';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { PerformanceTarget, PhotoDocumentation, ProjectStatus } from '$lib/types';
	import { formatMonth } from '$lib/utils/monthly-planning';
	import {
		calculateBeneficiaryProgress,
		calculateDaysRemaining,
		calculateProgressSlippage,
		getCurrentMonth
	} from '$lib/utils/project-calculations';
	import {
		AlertTriangle,
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
		physicalActual: number;
		issues: string;
		recommendations: string;
		catchUpPlan: string;
		maleEmployment: number;
		femaleEmployment: number;
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
		cumulativeAchievedOutputs: Record<string, number>; // Cumulative from previous months (read-only)
		monthlyAchievedOutputs: Record<string, number>; // This month only (editable)
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
		startDate = $bindable(),
		contractDuration = $bindable(),
		targetBeneficiaries = $bindable(),
		currentBeneficiaries = $bindable(),
		householdsReached = $bindable(),
		plannedPercentage = $bindable(),
		photoDocumentation = $bindable(),
		cumulativeAchievedOutputs = $bindable(),
		monthlyAchievedOutputs = $bindable(),
		performanceTargets,
		onSwitchToFull
	}: Props = $props();

	if (physicalActual === 0) {
		physicalActual = Number(plannedPercentage) || 0;
	}

	// Derived computed values - Employment
	let totalEmployment = $derived(maleEmployment + femaleEmployment);

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
		calculateProgressSlippage(Number(plannedPercentage || 0), physicalActual)
	);

	// Derived computed values - Performance Indicators
	// Calculate updated cumulative (previous cumulative + this month's values)
	let updatedAchievedOutputs = $derived.by(() => {
		const updated: Record<string, number> = { ...cumulativeAchievedOutputs };
		Object.entries(monthlyAchievedOutputs).forEach(([key, value]) => {
			updated[key] = (updated[key] || 0) + (Number(value) || 0);
		});
		return updated;
	});

	// Get status label for display
	const getStatusLabel = (s: ProjectStatus) => {
		switch (s) {
			case 'preparation':
				return 'Preparation';
			case 'ongoing':
				return 'On Going';
			case 'completed':
				return 'Completed';
			case 'delayed':
				return 'Delayed';
			case 'non-completion':
				return 'Non-completion';
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
							<Select.Item value="preparation" label="Preparation">Preparation</Select.Item>
							<Select.Item value="ongoing" label="On Going">On Going</Select.Item>
							<Select.Item value="completed" label="Completed">Completed</Select.Item>
							<Select.Item value="delayed" label="Delayed">Delayed</Select.Item>
							<Select.Item value="non-completion" label="Non-completion">Non-completion</Select.Item
							>
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
						<NumberInput
							id="completion"
							min={0}
							max={100}
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
			{#if physicalActual > 100}
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
			{#if beneficiaryMetrics.status === 'below-target' && physicalActual > 70}
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
					<NumberInput id="male-employment" min={0} bind:value={maleEmployment} placeholder="0" />
				</div>

				<!-- Female Employment -->
				<div class="space-y-2">
					<Label for="female-employment">Female</Label>
					<NumberInput
						id="female-employment"
						min={0}
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
					{#each performanceTargets as target, index (target.indicator_type ?? `target-${index}`)}
						{@const cumulative = cumulativeAchievedOutputs[target.indicator_type] || 0}
						{@const monthly = monthlyAchievedOutputs[target.indicator_type] || 0}
						{@const achieved = updatedAchievedOutputs[target.indicator_type] || 0}
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
								<!-- Total Achieved (Read-only, cumulative) -->
								<div class="space-y-1">
									<span class="flex items-center gap-1 text-xs text-muted-foreground">
										Total Achieved
										<Info class="size-3 text-muted-foreground" />
									</span>
									<div class="relative">
										<Input type="text" value={achieved} disabled class="pr-12 text-sm opacity-75" />
										<span
											class="pointer-events-none absolute top-2.5 right-3 text-xs text-muted-foreground"
										>
											{target.unit_of_measure}
										</span>
									</div>
									{#if monthly > 0}
										<p class="text-xs text-muted-foreground">
											Previous: {cumulative} + This month: {monthly} = {achieved}
										</p>
									{:else if cumulative > 0}
										<p class="text-xs text-muted-foreground">Cumulative from previous months</p>
									{/if}
								</div>
							</div>
							<!-- This Month's Achievement (Editable) -->
							<div class="space-y-1">
								<span class="flex items-center gap-2 text-xs text-muted-foreground">
									<Badge variant="default" class="gap-1 text-xs">
										<Calendar class="size-3" />
										{currentMonthFormatted}
									</Badge>
									Achieved This Month
								</span>
								<div class="relative">
									<NumberInput
										id="indicator-{target.indicator_type}"
										min={0}
										value={monthlyAchievedOutputs[target.indicator_type] || 0}
										onvaluechange={(val) => {
											monthlyAchievedOutputs = {
												...monthlyAchievedOutputs,
												[target.indicator_type]: val
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
