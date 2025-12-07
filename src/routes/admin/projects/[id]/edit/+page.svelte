<script lang="ts">
	import { goto } from '$app/navigation';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import BudgetResourcesTab from '$lib/components/admin/projects/BudgetResourcesTab.svelte';
	import CategoryProjectSelectionTab from '$lib/components/admin/projects/CategoryProjectSelectionTab.svelte';
	import LocationBeneficiariesTab from '$lib/components/admin/projects/LocationBeneficiariesTab.svelte';
	import PerformanceTargetsTab from '$lib/components/admin/projects/PerformanceTargetsTab.svelte';
	import MonthlyTargetsForm from '$lib/components/projects/MonthlyTargetsForm.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { FormSection } from '$lib/components/ui/form-section';
	import { FormStepper, type Step } from '$lib/components/ui/form-stepper';
	import { getProjectTypeById } from '$lib/config/project-categories';
	import { refreshProjects } from '$lib/mock-data';
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
	import { updateProject } from '$lib/utils/storage';
	import type { DateValue } from '@internationalized/date';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import {
		ArrowLeft,
		ArrowRight,
		Banknote,
		Calendar,
		Clock,
		FolderOpen,
		List,
		MapPin,
		Save,
		Target,
		X,
		Zap
	} from '@lucide/svelte';
	import { onMount, untrack } from 'svelte';
	import { toast } from 'svelte-sonner';

	const { data } = $props();

	// Check permissions on mount
	onMount(() => {
		if (!authStore.canPerform('projects', 'write')) {
			toast.error('Access Denied', {
				description: 'You do not have permission to edit projects.'
			});
			goto(`/admin/projects/${data.id}`);
		}
	});

	// Load projects from storage (includes both mock data and localStorage projects)
	const allProjects = refreshProjects();

	// Try to find project in all projects (including localStorage)
	const existingProject = allProjects.find((p) => p.id === Number(data.id));

	if (!existingProject) {
		// Redirect if project not found
		if (typeof window !== 'undefined') {
			window.location.href = '/admin/projects';
		}
	}

	// Helper function to map old category names to new category keys
	// Helper function to map old category names to new category keys
	function getCategoryKey(project: typeof existingProject): CategoryKey | '' {
		if (!project) return '';

		// If project has category_key, use it
		if ('category_key' in project && project.category_key) {
			return project.category_key as CategoryKey;
		}

		return '';
	}

	// Form state
	let isSaving = $state(false);
	let activeStep = $state('category');
	let cancelDialogOpen = $state(false);

	// Tab 1: Category & Project Selection
	let title = $state(existingProject?.title ?? '');
	let description = $state(existingProject?.description ?? '');
	let selectedCategory = $state<CategoryKey | ''>(getCategoryKey(existingProject));
	let selectedProjectType = $state<number | undefined>(existingProject?.project_type_id);
	let implementingAgency = $state(existingProject?.implementing_agency ?? '');

	// Tab 2: Location & Beneficiaries
	let projectSitios = $state<Omit<ProjectSitio, 'project_id'>[]>(
		existingProject?.project_sitios?.map((ps) => ({
			sitio_id: ps.sitio_id,
			sitio_name: ps.sitio_name,
			municipality: ps.municipality,
			barangay: ps.barangay,
			beneficiaries_target: ps.beneficiaries_target,
			focal_person: ps.focal_person,
			focal_contact: ps.focal_contact
		})) ?? []
	);
	let showSitioSelection = $state(false);

	// Tab 3: Performance Targets
	let performanceTargets = $state<Omit<PerformanceTarget, 'id' | 'project_id'>[]>(
		existingProject?.performance_targets?.map((pt) => ({
			indicator_type: pt.indicator_type,
			indicator_name: pt.indicator_name,
			target_value: pt.target_value,
			unit_of_measure: pt.unit_of_measure
		})) ?? []
	);
	let targetStartDate = $state<DateValue | undefined>(
		existingProject?.start_date ? parseDate(existingProject.start_date) : today(getLocalTimeZone())
	);
	// Calculate duration from contract_duration string (e.g., "180 CD")
	let durationInCalendarDays = $state(
		existingProject?.contract_duration ? existingProject.contract_duration.replace(/\D/g, '') : ''
	);
	let totalBudget = $state(existingProject?.total_budget?.toString() ?? '');
	let employmentMale = $state(existingProject?.employment_generated?.male?.toString() ?? '');
	let employmentFemale = $state(existingProject?.employment_generated?.female?.toString() ?? ''); // Tab 4: Accountability & Partners

	// Define type for sitio coordinator form data
	interface SitioCoordinatorFormData {
		sitio_id: number;
		sitio_name: string;
		barangay_captain: string;
		sitio_leader: string;
		volunteer_coordinator: string;
		contact_numbers: string;
	}

	// Auto-generate/load sitio coordinators
	let sitioCoordinators = $state<SitioCoordinatorFormData[]>(
		existingProject?.project_sitios?.map((ps) => ({
			sitio_id: ps.sitio_id,
			sitio_name: ps.sitio_name ?? '',
			barangay_captain: '',
			sitio_leader: '',
			volunteer_coordinator: '',
			contact_numbers: ''
		})) ?? []
	);

	// Sync sitio coordinators when projectSitios changes
	$effect(() => {
		sitioCoordinators = projectSitios.map((ps) => {
			// Use untrack to read sitioCoordinators without creating a dependency
			const existing = untrack(() => sitioCoordinators.find((sc) => sc.sitio_id === ps.sitio_id));
			return existing
				? { ...existing, sitio_name: ps.sitio_name }
				: {
						sitio_id: ps.sitio_id,
						sitio_name: ps.sitio_name,
						barangay_captain: '',
						sitio_leader: '',
						volunteer_coordinator: '',
						contact_numbers: ''
					};
		});
	});

	// Tab 5: Budget & Resources
	let fundingSources = $state<Omit<FundingSource, 'id' | 'project_id'>[]>(
		existingProject?.funding_sources?.map((fs) => ({
			source_name: fs.source_name,
			source_type: fs.source_type,
			amount: fs.amount,
			percentage: fs.percentage
		})) ?? []
	);
	let budgetComponents = $state<Omit<BudgetComponent, 'id' | 'project_id'>[]>(
		existingProject?.budget_components?.map((bc) => ({
			component_name: bc.component_name,
			amount: bc.amount,
			percentage: bc.percentage
		})) ?? []
	);

	// Tab 6: Monthly Planning
	let monthlyTargets = $state<MonthlyTarget[]>(
		existingProject?.monthly_targets?.map((mt: MonthlyTarget) => ({
			month_year: mt.month_year,
			planned_physical_progress: mt.planned_physical_progress,
			planned_budget: mt.planned_budget
		})) ?? []
	);

	// Validation
	const isTab1Valid = $derived(
		title.trim() !== '' &&
			description.trim() !== '' &&
			selectedCategory !== '' &&
			selectedProjectType !== undefined &&
			implementingAgency.trim() !== ''
	);

	const isTab2Valid = $derived(projectSitios.length > 0);

	const isTab3Valid = $derived(
		targetStartDate !== undefined && durationInCalendarDays !== '' && totalBudget !== ''
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
			hasError: !isTab1Valid && activeStep !== 'category'
		},
		{
			id: 'location',
			label: 'Location & Beneficiaries',
			shortLabel: 'Location',
			icon: MapPin,
			isValid: isTab2Valid,
			hasError: !isTab2Valid && activeStep !== 'location'
		},
		{
			id: 'performance',
			label: 'Performance Targets',
			shortLabel: 'Targets',
			icon: Target,
			isValid: isTab3Valid,
			hasError: !isTab3Valid && activeStep !== 'performance'
		},
		{
			id: 'budget',
			label: 'Budget & Resources',
			shortLabel: 'Budget',
			icon: Banknote,
			isValid: isTab4Valid,
			hasError: !isTab4Valid && activeStep !== 'budget'
		},
		{
			id: 'monthly',
			label: 'Monthly Planning',
			shortLabel: 'Planning',
			icon: Calendar,
			isValid: isTab5Valid,
			hasError: !isTab5Valid && activeStep !== 'monthly'
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
			activeStep = stepOrder[currentStepIndex + 1];
		}
	}

	function previousStep() {
		if (canGoPrevious) {
			activeStep = stepOrder[currentStepIndex - 1];
		}
	}

	async function handleSave() {
		if (!canSave) {
			toast.error('Please complete all required fields in all tabs');
			return;
		}

		isSaving = true;

		try {
			// Get the first sitio info for legacy fields (required by Project type)
			const firstSitio = projectSitios[0];
			const totalBeneficiaries = projectSitios.reduce(
				(sum, ps) => sum + ps.beneficiaries_target,
				0
			);

			// Determine project status based on start date and completion
			const startDateValue = targetStartDate?.toString() || existingProject?.start_date || '';
			const today = new Date();
			const projectStartDate = new Date(startDateValue);
			let status: ProjectStatus = existingProject?.status || 'planning';

			// Auto-update status based on dates if still in planning
			if (status === 'planning' && projectStartDate <= today) {
				status = 'in-progress';
			}

			// Create the updated Project object
			const updatedProjectData: Partial<Project> = {
				// Tab 1
				title,
				description,
				category_key: selectedCategory as CategoryKey,
				project_type_id: selectedProjectType,
				status,
				start_date: startDateValue,
				contract_duration: durationInCalendarDays ? `${durationInCalendarDays} CD` : '',
				total_budget: Number(totalBudget),
				beneficiaries: totalBeneficiaries,
				// Tab 2
				project_sitios: projectSitios.map((ps) => ({
					...ps,
					project_id: existingProject!.id
				})),
				// Tab 4
				funding_sources: fundingSources.map((fs) => ({
					...fs,
					id: 0,
					project_id: existingProject!.id
				})),
				budget_components: budgetComponents.map((bc) => ({
					...bc,
					id: 0,
					project_id: existingProject!.id
				})),
				// Tab 5: Monthly targets
				monthly_targets: monthlyTargets,
				// Tab 3: Performance targets
				performance_targets: performanceTargets.map((pt) => ({
					...pt,
					id: 0,
					project_id: existingProject!.id
				})),
				employment_generated: {
					male: Number(employmentMale) || 0,
					female: Number(employmentFemale) || 0
				},
				implementing_agency: implementingAgency,
				updated_at: new Date().toISOString()
			};

			// Save to localStorage
			const saved = updateProject(existingProject!.id, updatedProjectData);

			if (!saved) {
				throw new Error('Failed to save project to localStorage');
			}

			console.log('Project updated successfully:', updatedProjectData);

			isSaving = false;
			toast.success('Project updated successfully!');

			// Redirect after save
			setTimeout(() => {
				window.location.href = '/admin/projects';
			}, 1000);
		} catch (error) {
			console.error('Error updating project:', error);
			isSaving = false;
			toast.error('Failed to update project. Please try again.');
		}
	}

	function handleCancel() {
		cancelDialogOpen = true;
	}

	function confirmCancel() {
		window.location.href = '/admin/projects';
	}

	function switchToQuickEdit() {
		window.location.href = `/admin/projects/${existingProject?.id}/quick-edit`;
	}
</script>

<svelte:head>
	<title>Edit {existingProject?.title ?? 'Project'} - Admin</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<AdminHeader sticky title="Edit Project" description={existingProject?.title}>
		{#snippet badges()}
			<Badge variant="outline" class="gap-1.5">
				<Clock class="size-3" />
				ID: {existingProject?.id}
			</Badge>
			<Badge variant="secondary" class="gap-1.5">
				<List class="size-3" />
				Full Edit
			</Badge>
		{/snippet}
		{#snippet actions()}
			<!-- Switch to Quick Edit Button -->
			<Button
				variant="outline"
				onclick={switchToQuickEdit}
				disabled={isSaving}
				class="gap-2 border-primary text-primary hover:bg-primary/10 hover:text-primary"
			>
				<Zap class="size-4" />
				Switch to Quick Edit
			</Button>

			<Button variant="outline" onclick={handleCancel} disabled={isSaving} class="gap-2">
				<X class="size-4" />
				Cancel
			</Button>
			<Button onclick={handleSave} disabled={!canSave || isSaving} class="gap-2">
				<Save class="size-4" />
				{isSaving ? 'Saving...' : 'Save Changes'}
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
						bind:implementingAgency
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
						bind:totalBudget
						bind:employmentMale
						bind:employmentFemale
					/>
				{:else if activeStep === 'budget'}
					<BudgetResourcesTab {totalBudget} bind:fundingSources bind:budgetComponents />
				{:else if activeStep === 'monthly'}
					<FormSection
						title="Monthly Planning"
						description="Plan monthly physical progress and budget allocation across the project timeline"
						icon={Calendar}
						variant="rose"
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
							totalBudget={Number(totalBudget)}
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
									onclick={() => (activeStep = step.id)}
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
								<span class="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Changes'}</span>
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
