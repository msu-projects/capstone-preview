<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Calendar as CalendarComponent } from '$lib/components/ui/calendar';
	import * as Card from '$lib/components/ui/card';
	import { CurrencyInput } from '$lib/components/ui/currency-input';
	import { FormSection } from '$lib/components/ui/form-section';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import { getProjectTypeById } from '$lib/config/project-categories';
	import type { PerformanceTarget } from '$lib/types';
	import { cn } from '$lib/utils';
	import toTitleCase from '$lib/utils/common';
	import { type DateValue, getLocalTimeZone } from '@internationalized/date';
	import {
		Banknote,
		Briefcase,
		Calendar,
		Check,
		Info,
		Pencil,
		Plus,
		Target,
		Trash2,
		X
	} from '@lucide/svelte';

	let {
		selectedProjectTypeId = undefined,
		performanceTargets = $bindable([]),
		targetStartDate = $bindable<DateValue | undefined>(undefined),
		durationInCalendarDays = $bindable(''),
		projectCost = $bindable(''),
		employmentMale = $bindable(''),
		employmentFemale = $bindable('')
	} = $props<{
		selectedProjectTypeId: number | undefined;
		performanceTargets: Omit<PerformanceTarget, 'id' | 'project_id'>[];
		targetStartDate: DateValue | undefined;
		durationInCalendarDays: string;
		projectCost: string;
		employmentMale: string;
		employmentFemale: string;
	}>();

	const projectType = $derived(
		selectedProjectTypeId ? getProjectTypeById(selectedProjectTypeId) : undefined
	);

	const defaultIndicators = $derived(projectType?.default_indicators ?? []);

	// Custom deliverables state
	let customName = $state('');
	let customUnit = $state('');
	let customDescription = $state('');
	let customTargetValue = $state('');
	let validationError = $state('');

	// Edit mode state
	let editingIndicatorType = $state<string | null>(null);
	let editForm = $state({
		name: '',
		unit: '',
		description: '',
		targetValue: ''
	});

	// Derived: filter custom targets from performanceTargets
	const customTargets = $derived(
		performanceTargets.filter((t: Omit<PerformanceTarget, 'id' | 'project_id'>) =>
			t.indicator_type.startsWith('custom_')
		)
	);

	// Helper: check if indicator is custom
	function isCustomIndicator(indicatorType: string): boolean {
		return indicatorType.startsWith('custom_');
	}

	// Helper: check for duplicate name
	function isDuplicateName(name: string, excludeType?: string): boolean {
		const normalizedName = name.trim().toLowerCase();
		return performanceTargets.some(
			(t: Omit<PerformanceTarget, 'id' | 'project_id'>) =>
				t.indicator_name.toLowerCase() === normalizedName &&
				(excludeType ? t.indicator_type !== excludeType : true)
		);
	}

	// Add custom deliverable
	function addCustomDeliverable() {
		const trimmedName = customName.trim();
		if (!trimmedName || !customUnit.trim() || !customTargetValue) {
			validationError = 'Please fill in name, unit, and target value.';
			return;
		}

		if (isDuplicateName(trimmedName)) {
			validationError = `A deliverable named "${trimmedName}" already exists.`;
			return;
		}

		const newTarget: Omit<PerformanceTarget, 'id' | 'project_id'> = {
			indicator_type: `custom_${Date.now()}`,
			indicator_name: trimmedName,
			target_value: Number(customTargetValue),
			unit_of_measure: customUnit.trim()
		};

		performanceTargets = [...performanceTargets, newTarget];

		// Reset form
		customName = '';
		customUnit = '';
		customDescription = '';
		customTargetValue = '';
		validationError = '';
	}

	// Remove deliverable (works for custom only)
	function removeDeliverable(indicatorType: string) {
		performanceTargets = performanceTargets.filter(
			(t: Omit<PerformanceTarget, 'id' | 'project_id'>) => t.indicator_type !== indicatorType
		);
	}

	// Start editing a custom deliverable
	function startEdit(target: Omit<PerformanceTarget, 'id' | 'project_id'>) {
		editingIndicatorType = target.indicator_type;
		editForm = {
			name: target.indicator_name,
			unit: target.unit_of_measure,
			description: '', // Description not stored in PerformanceTarget type
			targetValue: String(target.target_value)
		};
		validationError = '';
	}

	// Cancel editing
	function cancelEdit() {
		editingIndicatorType = null;
		editForm = { name: '', unit: '', description: '', targetValue: '' };
		validationError = '';
	}

	// Save edited deliverable
	function saveEdit() {
		if (!editingIndicatorType) return;

		const trimmedName = editForm.name.trim();
		if (!trimmedName || !editForm.unit.trim() || !editForm.targetValue) {
			validationError = 'Please fill in name, unit, and target value.';
			return;
		}

		if (isDuplicateName(trimmedName, editingIndicatorType)) {
			validationError = `A deliverable named "${trimmedName}" already exists.`;
			return;
		}

		const index = performanceTargets.findIndex(
			(t: Omit<PerformanceTarget, 'id' | 'project_id'>) => t.indicator_type === editingIndicatorType
		);

		if (index >= 0) {
			performanceTargets[index] = {
				...performanceTargets[index],
				indicator_name: trimmedName,
				unit_of_measure: editForm.unit.trim(),
				target_value: Number(editForm.targetValue)
			};
		}

		cancelEdit();
	}

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

	// Check if section is complete
	const isSectionComplete = $derived(
		targetStartDate !== undefined &&
			durationInCalendarDays !== '' &&
			Number(durationInCalendarDays) > 0 &&
			projectCost !== ''
	);
</script>

<FormSection
	title="Performance Targets"
	description="Define performance deliverables, timeline, and budget allocation for this project"
	icon={Target}
	variant="amber"
	isComplete={isSectionComplete}
	collapsible={false}
>
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
										<Badge variant="secondary" class="shrink-0">{toTitleCase(indicator.unit)}</Badge
										>
									</div>
									<p class="text-xs text-muted-foreground">{indicator.description}</p>
								</div>
							{/each}
						</div>
					</Card.CardContent>
				</Card.Card>
			{/if}

			<!-- Custom Deliverables -->
			<Card.Card>
				<Card.CardHeader>
					<Card.CardTitle class="flex items-center gap-2">
						<Plus class="size-5" />
						Custom Deliverables
					</Card.CardTitle>
					<Card.CardDescription>
						Add project-specific deliverables not covered by the default indicators
					</Card.CardDescription>
				</Card.CardHeader>
				<Card.CardContent class="space-y-4">
					<!-- Add Custom Deliverable Form -->
					<div class="rounded-lg border bg-muted/30 p-4">
						<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<div class="space-y-2">
								<Label for="custom-name" class="text-sm">Name</Label>
								<Input id="custom-name" bind:value={customName} placeholder="e.g., Trees Planted" />
							</div>
							<div class="space-y-2">
								<Label for="custom-unit" class="text-sm">Unit</Label>
								<Input id="custom-unit" bind:value={customUnit} placeholder="e.g., trees" />
							</div>
							<div class="space-y-2">
								<Label for="custom-target" class="text-sm">Target Value</Label>
								<Input
									id="custom-target"
									type="number"
									bind:value={customTargetValue}
									placeholder="e.g., 500"
									min="0"
								/>
							</div>
							<div class="flex items-end">
								<Button onclick={addCustomDeliverable} class="w-full sm:w-auto">
									<Plus class="mr-2 size-4" />
									Add
								</Button>
							</div>
						</div>
						{#if validationError && !editingIndicatorType}
							<p class="mt-2 text-sm text-destructive">{validationError}</p>
						{/if}
					</div>

					<!-- Custom Deliverables List -->
					{#if customTargets.length > 0}
						<div class="space-y-3">
							{#each customTargets as target (target.indicator_type)}
								<div
									class="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
								>
									{#if editingIndicatorType === target.indicator_type}
										<!-- Edit Mode -->
										<div class="flex-1 space-y-3">
											<div class="grid gap-3 sm:grid-cols-3">
												<Input bind:value={editForm.name} placeholder="Name" />
												<Input bind:value={editForm.unit} placeholder="Unit" />
												<Input
													type="number"
													bind:value={editForm.targetValue}
													placeholder="Target"
													min="0"
												/>
											</div>
											{#if validationError && editingIndicatorType}
												<p class="text-sm text-destructive">{validationError}</p>
											{/if}
										</div>
										<div class="flex gap-2">
											<Button size="sm" onclick={saveEdit}>
												<Check class="mr-1 size-4" />
												Save
											</Button>
											<Button size="sm" variant="outline" onclick={cancelEdit}>
												<X class="mr-1 size-4" />
												Cancel
											</Button>
										</div>
									{:else}
										<!-- View Mode -->
										<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
											<div class="flex items-center gap-2">
												<Target class="size-4 text-muted-foreground" />
												<span class="font-medium">{target.indicator_name}</span>
												<Badge variant="outline" class="text-xs">Custom</Badge>
											</div>
											<div class="flex items-center gap-2 text-sm text-muted-foreground">
												<span class="font-semibold text-foreground">{target.target_value}</span>
												<Badge variant="secondary">{toTitleCase(target.unit_of_measure)}</Badge>
											</div>
										</div>
										<div class="flex gap-2">
											<Button size="sm" variant="ghost" onclick={() => startEdit(target)}>
												<Pencil class="size-4" />
												<span class="sr-only">Edit</span>
											</Button>
											<Button
												size="sm"
												variant="ghost"
												class="text-destructive hover:bg-destructive/10 hover:text-destructive"
												onclick={() => removeDeliverable(target.indicator_type)}
											>
												<Trash2 class="size-4" />
												<span class="sr-only">Delete</span>
											</Button>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-sm text-muted-foreground">
							No custom deliverables added yet. Use the form above to add one.
						</p>
					{/if}
				</Card.CardContent>
			</Card.Card>

			<!-- Universal Performance Indicators -->
			<Card.Card>
				<Card.CardHeader>
					<Card.CardTitle>Universal Performance Indicators</Card.CardTitle>
					<Card.CardDescription>Standard indicators applicable to all projects</Card.CardDescription
					>
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

					<!-- Project Cost -->
					<div class="space-y-2">
						<Label for="project-cost" class="required flex items-center gap-2">
							<Banknote class="size-4" />
							Project Cost
						</Label>
						<CurrencyInput id="project-cost" bind:value={projectCost} placeholder="₱ 0" min={0} />
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
</FormSection>

<style>
	:global(.required::after) {
		content: ' *';
		color: hsl(var(--destructive));
	}
</style>
