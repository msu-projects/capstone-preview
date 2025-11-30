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
	import toTitleCase from '$lib/utils/common';
	import { type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { Banknote, Briefcase, Calendar, Info, Target } from '@lucide/svelte';

	let {
		selectedProjectTypeId = undefined,
		performanceTargets = $bindable([]),
		targetStartDate = $bindable<DateValue | undefined>(undefined),
		durationInCalendarDays = $bindable(''),
		totalBudget = $bindable(''),
		employmentMale = $bindable(''),
		employmentFemale = $bindable('')
	} = $props<{
		selectedProjectTypeId: number | undefined;
		performanceTargets: Omit<PerformanceTarget, 'id' | 'project_id'>[];
		targetStartDate: DateValue | undefined;
		durationInCalendarDays: string;
		totalBudget: string;
		employmentMale: string;
		employmentFemale: string;
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
					unit_of_measure: indicator.unit
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
						unit_of_measure: indicator.unit
					}
				];
			}
		}
	}

	// Auto-calculate target end date based on start date + calendar days
	const targetEndDate = $derived.by(() => {
		if (targetStartDate && durationInCalendarDays) {
			const days = Number(durationInCalendarDays);
			if (days > 0) {
				return targetStartDate.add({ days });
			}
		}
		return undefined;
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
		{#if defaultIndicators.length > 0}
			<Card.Card>
				<Card.CardHeader>
					<Card.CardTitle>Performance Deliverables</Card.CardTitle>
					<Card.CardDescription>
						Define specific, measurable targets for {projectType?.name ?? 'this project'}
					</Card.CardDescription>
				</Card.CardHeader>
				<Card.CardContent>
					<div class="grid gap-4 md:grid-cols-2">
						{#each defaultIndicators as indicator (indicator.id)}
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
									<Badge variant="secondary" class="shrink-0">{toTitleCase(indicator.unit)}</Badge>
								</div>
								<p class="text-xs text-muted-foreground">{indicator.description}</p>
							</div>
						{/each}
					</div>
				</Card.CardContent>
			</Card.Card>
		{/if}

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

				<!-- Employment Generation -->
				<div>
					<Label class="mb-3 flex items-center gap-2">
						<Briefcase class="size-4" />
						Employment to Generate (Male/Female Breakdown)
					</Label>
					<div class="grid gap-4 md:grid-cols-3">
						<div class="space-y-2">
							<Label for="male-employment" class="text-sm">Male</Label>
							<Input
								id="male-employment"
								type="number"
								bind:value={employmentMale}
								placeholder="Male employment"
								min="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="female-employment" class="text-sm">Female</Label>
							<Input
								id="female-employment"
								type="number"
								bind:value={employmentFemale}
								placeholder="Female employment"
								min="0"
							/>
						</div>
						<div class="space-y-2">
							<Label class="text-sm">Total Employment</Label>
							<Input
								type="number"
								value={(Number(employmentMale) || 0) + (Number(employmentFemale) || 0)}
								disabled
								class="bg-muted"
							/>
						</div>
					</div>
					<p class="mt-2 text-xs text-muted-foreground">
						Total number of people expected to be employed by the project
					</p>
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
