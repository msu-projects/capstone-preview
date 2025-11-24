<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Calendar as CalendarComponent } from '$lib/components/ui/calendar';
	import * as Card from '$lib/components/ui/card';
	import { CurrencyInput } from '$lib/components/ui/currency-input';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import { getProjectTypeById } from '$lib/config/project-categories';
	import type { PerformanceTarget } from '$lib/types';
	import { cn } from '$lib/utils';
	import { type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { Banknote, Briefcase, Calendar, Info, Target, TrendingUp, Users } from '@lucide/svelte';

	let {
		selectedProjectTypeId = undefined,
		performanceTargets = $bindable([]),
		targetStartDate = $bindable<DateValue | undefined>(undefined),
		targetEndDate = $bindable<DateValue | undefined>(undefined),
		durationInCalendarDays = $bindable(''),
		totalBudget = $bindable(''),
		directBeneficiariesMale = $bindable(''),
		directBeneficiariesFemale = $bindable(''),
		employmentGenerated = $bindable('')
	} = $props<{
		selectedProjectTypeId: number | undefined;
		performanceTargets: Omit<PerformanceTarget, 'id' | 'project_id'>[];
		targetStartDate: DateValue | undefined;
		targetEndDate: DateValue | undefined;
		durationInCalendarDays: string;
		totalBudget: string;
		directBeneficiariesMale: string;
		directBeneficiariesFemale: string;
		employmentGenerated: string;
	}>();

	const projectType = $derived(
		selectedProjectTypeId ? getProjectTypeById(selectedProjectTypeId) : undefined
	);

	const defaultIndicators = $derived(projectType?.default_indicators ?? []);

	// Initialize performance targets when project type changes
	$effect(() => {
		if (selectedProjectTypeId && defaultIndicators.length > 0) {
			// Only initialize if empty
			if (performanceTargets.length === 0) {
				performanceTargets = defaultIndicators.map((indicator) => ({
					indicator_type: indicator.id,
					indicator_name: indicator.name,
					target_value: 0,
					unit_of_measure: indicator.unit,
					monthly_breakdown: {}
				}));
			}
		}
	});

	function getTargetValue(indicatorType: string): number {
		const target = performanceTargets.find(
			(t: Omit<PerformanceTarget, 'id' | 'project_id'>) => t.indicator_type === indicatorType
		);
		return target?.target_value ?? 0;
	}

	function setTargetValue(indicatorType: string, value: number) {
		const existingIndex = performanceTargets.findIndex(
			(t: Omit<PerformanceTarget, 'id' | 'project_id'>) => t.indicator_type === indicatorType
		);

		if (existingIndex >= 0) {
			performanceTargets[existingIndex].target_value = value;
		} else {
			const indicator = defaultIndicators.find((i) => i.id === indicatorType);
			if (indicator) {
				performanceTargets = [
					...performanceTargets,
					{
						indicator_type: indicator.id,
						indicator_name: indicator.name,
						target_value: value,
						unit_of_measure: indicator.unit,
						monthly_breakdown: {}
					}
				];
			}
		}
	}

	const totalDirectBeneficiaries = $derived(
		(Number(directBeneficiariesMale) || 0) + (Number(directBeneficiariesFemale) || 0)
	);

	// Auto-calculate target end date based on start date + calendar days
	$effect(() => {
		if (targetStartDate && durationInCalendarDays) {
			const days = Number(durationInCalendarDays);
			if (days > 0) {
				targetEndDate = targetStartDate.add({ days });
			}
		}
	});
</script>

<div class="space-y-6">
	{#if !selectedProjectTypeId}
		<Card.Card>
			<Card.CardContent class="">
				<div class="flex items-center gap-3 text-muted-foreground">
					<Info class="size-5" />
					<p>
						Please select a project category and type in the first tab to define performance
						targets.
					</p>
				</div>
			</Card.CardContent>
		</Card.Card>
	{:else}
		<!-- Category-Specific Deliverables -->
		<Card.Card>
			<Card.CardHeader>
				<Card.CardTitle>Performance Deliverables</Card.CardTitle>
				<Card.CardDescription>
					Define specific, measurable targets for {projectType?.name ?? 'this project'}
				</Card.CardDescription>
			</Card.CardHeader>
			<Card.CardContent>
				<div class="grid gap-4 md:grid-cols-2">
					{#each defaultIndicators as indicator}
						{@const value = getTargetValue(indicator.id)}
						<div class="space-y-2">
							<Label for={indicator.id} class="flex items-center gap-2">
								<Target class="size-4" />
								{indicator.name}
							</Label>
							<div class="flex items-center gap-2">
								<Input
									id={indicator.id}
									type="number"
									value={value || ''}
									oninput={(e) => setTargetValue(indicator.id, Number(e.currentTarget.value))}
									placeholder="Enter target"
									min="0"
									step="any"
									class="flex-1"
								/>
								<Badge variant="secondary" class="shrink-0">{indicator.unit}</Badge>
							</div>
							<p class="text-xs text-muted-foreground">{indicator.description}</p>
						</div>
					{/each}
				</div>
			</Card.CardContent>
		</Card.Card>

		<!-- Universal Performance Indicators -->
		<Card.Card>
			<Card.CardHeader>
				<Card.CardTitle>Universal Performance Indicators</Card.CardTitle>
				<Card.CardDescription>Standard indicators applicable to all projects</Card.CardDescription>
			</Card.CardHeader>
			<Card.CardContent class="space-y-6">
				<!-- Project Timeline -->
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label class="required flex items-center gap-2">
							<Calendar class="size-4" />
							Target Start Date
						</Label>
						<Popover.Root>
							<Popover.Trigger
								class={cn(
									'flex h-10 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
									!targetStartDate && 'text-muted-foreground'
								)}
							>
								<Calendar class="mr-2 size-4" />
								{targetStartDate
									? targetStartDate.toDate(getLocalTimeZone()).toLocaleDateString()
									: 'Pick a date'}
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0">
								<CalendarComponent
									type="single"
									bind:value={targetStartDate}
									class="rounded-md border"
									captionLayout="dropdown"
								/>
							</Popover.Content>
						</Popover.Root>
					</div>
					<div class="space-y-2">
						<Label for="duration-cd" class="required flex items-center gap-2">
							<Calendar class="size-4" />
							Project Duration (Calendar Days)
						</Label>
						<Input
							id="duration-cd"
							type="number"
							bind:value={durationInCalendarDays}
							placeholder="e.g., 120"
							min="1"
						/>
						<p class="text-xs text-muted-foreground">
							{#if targetStartDate && durationInCalendarDays && Number(durationInCalendarDays) > 0}
								Target completion: <strong
									>{targetEndDate?.toDate(getLocalTimeZone()).toLocaleDateString()}</strong
								>
							{:else}
								Enter duration in calendar days (CD)
							{/if}
						</p>
					</div>
				</div>

				<!-- Budget Allocation -->
				<div class="space-y-2">
					<Label for="total-budget" class="required flex items-center gap-2">
						<Banknote class="size-4" />
						Total Budget Allocation
					</Label>
					<CurrencyInput id="total-budget" bind:value={totalBudget} placeholder="₱ 0" min={0} />
				</div>

				<!-- Direct Beneficiaries -->
				<div>
					<Label class="mb-3 flex items-center gap-2">
						<Users class="size-4" />
						Direct Beneficiaries (Male/Female Breakdown)
					</Label>
					<div class="grid gap-4 md:grid-cols-3">
						<div class="space-y-2">
							<Label for="male-beneficiaries" class="text-sm">Male</Label>
							<Input
								id="male-beneficiaries"
								type="number"
								bind:value={directBeneficiariesMale}
								placeholder="Male count"
								min="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="female-beneficiaries" class="text-sm">Female</Label>
							<Input
								id="female-beneficiaries"
								type="number"
								bind:value={directBeneficiariesFemale}
								placeholder="Female count"
								min="0"
							/>
						</div>
						<div class="space-y-2">
							<Label class="text-sm">Total Direct</Label>
							<Input type="number" value={totalDirectBeneficiaries} disabled class="bg-muted" />
						</div>
					</div>
				</div>

				<!-- Employment Generation -->
				<div class="space-y-2">
					<Label for="employment" class="flex items-center gap-2">
						<Briefcase class="size-4" />
						Employment to Generate
					</Label>
					<Input
						id="employment"
						type="number"
						bind:value={employmentGenerated}
						placeholder="Person-days of employment"
						min="0"
					/>
					<p class="text-xs text-muted-foreground">
						Total person-days of employment expected to be generated
					</p>
				</div>
			</Card.CardContent>
		</Card.Card>

		<!-- Milestone-Based Targets Info -->
		<Card.Card class="hidden border-primary/20 bg-primary/5">
			<Card.CardContent class="">
				<div class="flex gap-3">
					<TrendingUp class="mt-0.5 size-5 shrink-0 text-primary" />
					<div>
						<p class="mb-1 font-medium">Monthly Progress Tracking</p>
						<p class="text-sm text-muted-foreground">
							In the Monthly Planning tab, you'll track overall physical progress as <strong
								>cumulative percentages</strong
							>
							(Plan % vs Actual %). Set planned monthly progress that reaches 100% by project completion,
							then update actual progress to automatically calculate slippage. This aligns with the official
							20% LDF monitoring form requirements.
						</p>
					</div>
				</div>
			</Card.CardContent>
		</Card.Card>
	{/if}
</div>

<style>
	:global(.required::after) {
		content: ' *';
		color: hsl(var(--destructive));
	}
</style>
