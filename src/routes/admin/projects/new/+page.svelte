<script lang="ts">
	import { goto } from '$app/navigation';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import BudgetResourcesTab from '$lib/components/admin/projects/BudgetResourcesTab.svelte';
	import CategoryProjectSelectionTab from '$lib/components/admin/projects/CategoryProjectSelectionTab.svelte';
	import LocationBeneficiariesTab from '$lib/components/admin/projects/LocationBeneficiariesTab.svelte';
	import PerformanceTargetsTab from '$lib/components/admin/projects/PerformanceTargetsTab.svelte';
	import MonthlyTargetsForm from '$lib/components/projects/MonthlyTargetsForm.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { FormSection } from '$lib/components/ui/form-section';
	import { FormStepper, type Step } from '$lib/components/ui/form-stepper';
	import { getProjectTypeById } from '$lib/config/project-categories';
	import { authStore } from '$lib/stores/auth.svelte';
	import type {
		BudgetComponent,
		CategoryKey,
		FundingSource,
		MonthlyTarget,
		PerformanceTarget,
		Project,
		ProjectSitio,
		ProjectStatus
	} from '$lib/types';
	import { addProject, getNextProjectId } from '$lib/utils/storage';
	import type { DateValue } from '@internationalized/date';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import {
		ArrowLeft,
		ArrowRight,
		Banknote,
		Calendar,
		FolderOpen,
		MapPin,
		Save,
		Target,
		X
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	// Check permissions on mount
	onMount(() => {
		if (!authStore.canPerform('projects', 'write')) {
			toast.error('Access Denied', {
				description: 'You do not have permission to create projects.'
			});
			goto('/admin/projects');
		}
	});

	// Form state
	let isSaving = $state(false);
	let activeStep = $state('category');
	let cancelDialogOpen = $state(false);

	// Track visited steps to only show errors after user has visited them
	let visitedSteps = $state<Set<string>>(new Set(['category']));

	// Tab 1: Category & Project Selection
	let title = $state('');
	let description = $state('');
	let selectedCategory = $state<CategoryKey | ''>('');
	let selectedProjectType = $state<number | undefined>(undefined);
	let implementingAgencies = $state<string[]>([]);

	// Tab 2: Location & Beneficiaries
	let projectSitios = $state<Omit<ProjectSitio, 'project_id'>[]>([]);
	let showSitioSelection = $state(true);

	// Tab 3: Performance Targets
	let performanceTargets = $state<Omit<PerformanceTarget, 'id' | 'project_id'>[]>([]);
	let targetStartDate = $state<DateValue | undefined>(today(getLocalTimeZone()));
	let durationInCalendarDays = $state('');
	let projectCost = $state('');
	let employmentMale = $state('');
	let employmentFemale = $state('');

	// Tab 5: Budget & Resources
	let fundingSources = $state<Omit<FundingSource, 'id' | 'project_id'>[]>([]);
	let budgetComponents = $state<Omit<BudgetComponent, 'id' | 'project_id'>[]>([]);

	// Tab 6: Monthly Planning
	let monthlyTargets = $state<MonthlyTarget[]>([]);

	// Validation
	const isTab1Valid = $derived(
		title.trim() !== '' &&
			description.trim() !== '' &&
			selectedCategory !== '' &&
			selectedProjectType !== undefined
	);

	const isTab2Valid = $derived(projectSitios.length > 0);

	const isTab3Valid = $derived(
		targetStartDate !== undefined &&
			durationInCalendarDays !== '' &&
			Number(durationInCalendarDays) > 0 &&
			projectCost !== ''
	);

	const isTab4Valid = $derived(fundingSources.length > 0 && budgetComponents.length > 0);

	const isTab5Valid = $derived(
		monthlyTargets.length > 0 &&
			monthlyTargets.every((mt) => mt.planned_physical_progress !== undefined)
	);

	const canSave = $derived(isTab1Valid && isTab2Valid && isTab3Valid && isTab4Valid && isTab5Valid);

	// Step configuration for stepper
	const steps: Step[] = $derived([
		{
			id: 'category',
			label: 'Category & Type',
			shortLabel: 'Category',
			icon: FolderOpen,
			isValid: isTab1Valid,
			hasError: !isTab1Valid && visitedSteps.has('category') && activeStep !== 'category'
		},
		{
			id: 'location',
			label: 'Location & Beneficiaries',
			shortLabel: 'Location',
			icon: MapPin,
			isValid: isTab2Valid,
			hasError: !isTab2Valid && visitedSteps.has('location') && activeStep !== 'location'
		},
		{
			id: 'performance',
			label: 'Performance Targets',
			shortLabel: 'Targets',
			icon: Target,
			isValid: isTab3Valid,
			hasError: !isTab3Valid && visitedSteps.has('performance') && activeStep !== 'performance'
		},
		{
			id: 'budget',
			label: 'Budget & Resources',
			shortLabel: 'Budget',
			icon: Banknote,
			isValid: isTab4Valid,
			hasError: !isTab4Valid && visitedSteps.has('budget') && activeStep !== 'budget'
		},
		{
			id: 'monthly',
			label: 'Monthly Planning',
			shortLabel: 'Planning',
			icon: Calendar,
			isValid: isTab5Valid,
			hasError: !isTab5Valid && visitedSteps.has('monthly') && activeStep !== 'monthly'
		}
	]);

	// Step navigation
	const stepOrder = ['category', 'location', 'performance', 'budget', 'monthly'];
	const currentStepIndex = $derived(stepOrder.indexOf(activeStep));
	const canGoNext = $derived(currentStepIndex < stepOrder.length - 1);
	const canGoPrevious = $derived(currentStepIndex > 0);
	const isLastStep = $derived(currentStepIndex === stepOrder.length - 1);

	// Get validation state for current step (for strict validation)
	const getCurrentStepValid = $derived(() => {
		switch (activeStep) {
			case 'category':
				return isTab1Valid;
			case 'location':
				return isTab2Valid;
			case 'performance':
				return isTab3Valid;
			case 'budget':
				return isTab4Valid;
			case 'monthly':
				return isTab5Valid;
			default:
				return false;
		}
	});

	function nextStep() {
		// Strict validation - must complete current step before proceeding
		if (!getCurrentStepValid()) {
			toast.error('Please complete all required fields before proceeding');
			return;
		}
		if (canGoNext) {
			const nextStepId = stepOrder[currentStepIndex + 1];
			visitedSteps = new Set([...visitedSteps, nextStepId]);
			activeStep = nextStepId;
		}
	}

	function previousStep() {
		if (canGoPrevious) {
			const prevStepId = stepOrder[currentStepIndex - 1];
			visitedSteps = new Set([...visitedSteps, prevStepId]);
			activeStep = prevStepId;
		}
	}

	function goToStep(stepId: string) {
		visitedSteps = new Set([...visitedSteps, stepId]);
		activeStep = stepId;
	}

	async function handleSave() {
		if (!canSave) {
			toast.error('Please complete all required fields in all tabs');
			return;
		}

		isSaving = true;

		try {
			// Get next available ID
			const nextId = getNextProjectId();

			const totalBeneficiaries = projectSitios.reduce(
				(sum, ps) => sum + ps.beneficiaries_target,
				0
			);

			// Determine project status based on start date
			const startDateValue = targetStartDate?.toString() || '';
			const today = new Date();
			const projectStartDate = new Date(startDateValue);
			let status: ProjectStatus = 'preparation';

			if (projectStartDate <= today) {
				status = 'ongoing';
			}

			// Get current year for project_year
			const currentYear = new Date().getFullYear();
			// Create the Project object
			const newProject: Project = {
				id: nextId,
				title,
				description,
				category_key: selectedCategory as CategoryKey,
				project_type_id: selectedProjectType,
				status,
				start_date: startDateValue,
				contract_duration: durationInCalendarDays ? `${durationInCalendarDays} CD` : '',
				project_cost: Number(projectCost),
				beneficiaries: totalBeneficiaries,
				project_year: currentYear,
				// New enhanced fields
				project_sitios: projectSitios.map((ps) => ({
					...ps,
					project_id: nextId
				})),
				funding_sources: fundingSources.map((fs) => ({
					...fs,
					id: 0,
					project_id: nextId
				})),
				budget_components: budgetComponents.map((bc) => ({
					...bc,
					id: 0,
					project_id: nextId
				})),
				monthly_targets: monthlyTargets,
				performance_targets: performanceTargets.map((pt) => ({
					...pt,
					id: 0,
					project_id: nextId
				})),
				employment_generated: {
					male: Number(employmentMale) || 0,
					female: Number(employmentFemale) || 0
				},
				implementing_agencies: implementingAgencies.length > 0 ? implementingAgencies : undefined,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};

			// Save to localStorage
			const saved = addProject(newProject);

			if (!saved) {
				throw new Error('Failed to save project to localStorage');
			}

			console.log('Project saved successfully:', newProject);

			isSaving = false;
			toast.success('Project created successfully!');

			// Redirect after save
			setTimeout(() => {
				window.location.href = '/admin/projects';
			}, 1000);
		} catch (error) {
			console.error('Error saving project:', error);
			isSaving = false;
			toast.error('Failed to save project. Please try again.');
		}
	}

	function handleCancel() {
		cancelDialogOpen = true;
	}

	function confirmCancel() {
		window.location.href = '/admin/projects';
	}
</script>

<svelte:head>
	<title>Create New Project - Admin</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<AdminHeader
		sticky
		title="Create New Project"
		description="Enhanced multi-sitio project tracking system"
	>
		{#snippet actions()}
			<Button variant="outline" onclick={handleCancel} disabled={isSaving} class="gap-2" size="sm">
				<X class="size-4" />
				<span class="hidden sm:inline">Cancel</span>
			</Button>
			<Button onclick={handleSave} disabled={!canSave || isSaving} class="gap-2" size="sm">
				<Save class="size-4" />
				<span class="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Project'}</span>
			</Button>
		{/snippet}
	</AdminHeader>

	<!-- Content -->
	<div class="flex-1 p-4 md:p-6">
		<div class="flex flex-col gap-6 lg:flex-row">
			<!-- Stepper Sidebar -->
			<FormStepper {steps} bind:activeStep />

			<!-- Form Content -->
			<div class="min-w-0 flex-1">
				<p class="mb-4 text-sm text-muted-foreground">
					Fields marked with <span class="text-destructive">*</span> are required.
				</p>
				{#if activeStep === 'category'}
					<CategoryProjectSelectionTab
						bind:title
						bind:description
						bind:selectedCategory
						bind:selectedProjectType
						bind:implementingAgencies
					/>
				{:else if activeStep === 'location'}
					<LocationBeneficiariesTab
						bind:projectSitios
						bind:showSitioSelection
						projectType={selectedProjectType ? getProjectTypeById(selectedProjectType) : undefined}
					/>
				{:else if activeStep === 'performance'}
					<PerformanceTargetsTab
						selectedProjectTypeId={selectedProjectType}
						bind:performanceTargets
						bind:targetStartDate
						bind:durationInCalendarDays
						bind:projectCost
						bind:employmentMale
						bind:employmentFemale
					/>
				{:else if activeStep === 'budget'}
					<BudgetResourcesTab {projectCost} bind:fundingSources bind:budgetComponents />
				{:else if activeStep === 'monthly'}
					<FormSection
						title="Monthly Planning"
						description="Plan monthly physical progress and budget allocation across the project timeline"
						icon={Calendar}
						variant="info"
						isComplete={isTab5Valid}
						collapsible={false}
					>
						{@const endDate =
							targetStartDate && durationInCalendarDays
								? targetStartDate.add({ days: Number(durationInCalendarDays) }).toString()
								: ''}
						<MonthlyTargetsForm
							startDate={targetStartDate?.toString() || ''}
							{endDate}
							onUpdate={(data) => {
								monthlyTargets = data.monthlyTargets;
							}}
						/>
					</FormSection>
				{/if}

				<!-- Navigation Footer -->
				<Card.Root class="mt-6 py-0">
					<Card.Content class="flex items-center justify-between p-4">
						<Button
							variant="outline"
							onclick={previousStep}
							disabled={!canGoPrevious}
							class="gap-2"
						>
							<ArrowLeft class="size-4" />
							<span class="hidden sm:inline">Previous</span>
						</Button>

						<!-- Step dots for mobile -->
						<div class="flex items-center gap-1.5 sm:hidden">
							{#each steps as step, index (step.id)}
								<button
									type="button"
									onclick={() => goToStep(step.id)}
									class="h-2 w-2 rounded-full transition-all {step.id === activeStep
										? 'w-4 bg-primary'
										: step.isValid
											? 'bg-emerald-500'
											: 'bg-muted-foreground/30'}"
									aria-label="Go to step {index + 1}"
								></button>
							{/each}
						</div>

						<!-- Step text for desktop -->
						<div class="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
							Step {currentStepIndex + 1} of {stepOrder.length}
						</div>

						{#if isLastStep && canSave}
							<Button onclick={handleSave} disabled={isSaving} class="gap-2">
								<Save class="size-4" />
								<span class="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Project'}</span>
							</Button>
						{:else}
							<Button
								variant="outline"
								onclick={nextStep}
								disabled={!canGoNext || !getCurrentStepValid()}
								class="gap-2"
							>
								<span class="hidden sm:inline">Next</span>
								<ArrowRight class="size-4" />
							</Button>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
</div>

<!-- Cancel Confirmation Dialog -->
<AlertDialog.Root bind:open={cancelDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Discard Changes</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to cancel? Any unsaved changes will be lost.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Continue Editing</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmCancel} class="bg-destructive hover:bg-destructive/60">
				Discard Changes
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
