<script lang="ts">
	import BudgetResourcesTab from '$lib/components/admin/projects/BudgetResourcesTab.svelte';
	import CategoryProjectSelectionTab from '$lib/components/admin/projects/CategoryProjectSelectionTab.svelte';
	import LocationBeneficiariesTab from '$lib/components/admin/projects/LocationBeneficiariesTab.svelte';
	import PerformanceTargetsTab from '$lib/components/admin/projects/PerformanceTargetsTab.svelte';
	import QuickUpdateForm from '$lib/components/admin/projects/QuickUpdateForm.svelte';
	import MonthlyTargetsForm from '$lib/components/projects/MonthlyTargetsForm.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { projects } from '$lib/mock-data';
	import { enhancedProjects } from '$lib/mock-data/enhanced-projects';
	import type {
		BudgetComponent,
		CategoryKey,
		FundingSource,
		MonthlyPhysicalProgress,
		MonthlyReleaseSchedule,
		PerformanceTarget,
		ProjectSitio
	} from '$lib/types';
	import {
		applyQuickUpdateToProject,
		getQuickUpdateWarnings,
		projectToQuickUpdate,
		validateQuickUpdateData
	} from '$lib/utils/project-adapters';
	import type { DateValue } from '@internationalized/date';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
	import {
		ArrowLeft,
		ArrowRight,
		Banknote,
		Calendar,
		CircleAlert,
		Clock,
		FolderOpen,
		List,
		MapPin,
		Save,
		Target,
		Users,
		X,
		Zap
	} from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';

	const { data } = $props();

	// Try to find project in enhanced projects first, then fall back to regular projects
	const existingProject =
		enhancedProjects.find((p) => p.id === Number(data.id)) ||
		projects.find((p) => p.id === Number(data.id));

	if (!existingProject) {
		// Redirect if project not found
		if (typeof window !== 'undefined') {
			window.location.href = '/admin/projects';
		}
	}

	// Helper function to map old category names to new category keys
	function getCategoryKey(project: typeof existingProject): CategoryKey | '' {
		if (!project) return '';

		// If project has category_key, use it
		if ('category_key' in project && project.category_key) {
			return project.category_key as CategoryKey;
		}

		// Otherwise, map from old category name to new category key
		const categoryMap: Record<string, CategoryKey> = {
			'Water and Sanitation': 'infrastructure',
			Education: 'education',
			Livelihood: 'livelihood',
			Agriculture: 'agriculture',
			Health: 'health',
			Environment: 'environment',
			Infrastructure: 'infrastructure'
		};

		return categoryMap[project.category] ?? '';
	}

	// Form state
	let isSaving = $state(false);
	let activeTab = $state('category');
	let cancelDialogOpen = $state(false);

	// Edit mode: 'quick' for Quick Update, 'full' for comprehensive editing
	type EditMode = 'quick' | 'full';
	let editMode = $state<EditMode>('quick'); // Default to quick mode as per user preference

	// Quick Update form data (initialized from existing project)
	let quickUpdateData = $state(projectToQuickUpdate(existingProject!));

	// Tab 1: Category & Project Selection
	let title = $state(existingProject?.title ?? '');
	let description = $state(existingProject?.description ?? '');
	let selectedCategory = $state<CategoryKey | ''>(getCategoryKey(existingProject));
	let selectedProjectType = $state<number | undefined>(existingProject?.project_type_id);
	let implementingAgency = $state(
		existingProject?.project_manager_team?.agency ??
			existingProject?.accountability?.pm_agency ??
			''
	);

	// Tab 2: Location & Beneficiaries
	let projectSitios = $state<Omit<ProjectSitio, 'project_id'>[]>(
		existingProject?.project_sitios?.map((ps) => ({
			sitio_id: ps.sitio_id,
			sitio_name: ps.sitio_name,
			municipality: ps.municipality,
			barangay: ps.barangay,
			beneficiaries_target: ps.beneficiaries_target,
			priority_level: ps.priority_level,
			focal_person: ps.focal_person,
			focal_contact: ps.focal_contact
		})) ??
			(existingProject?.sitio_id
				? [
						{
							sitio_id: existingProject.sitio_id,
							sitio_name: existingProject.sitio_name,
							municipality: existingProject.municipality,
							barangay: '',
							beneficiaries_target: existingProject.beneficiaries,
							priority_level: 'medium' as const,
							focal_person: undefined,
							focal_contact: undefined
						}
					]
				: [])
	);
	let showSitioSelection = $state(false);

	// Tab 3: Performance Targets
	let performanceTargets = $state<Omit<PerformanceTarget, 'id' | 'project_id'>[]>(
		existingProject?.performance_targets?.map((pt) => ({
			indicator_type: pt.indicator_type,
			indicator_name: pt.indicator_name,
			target_value: pt.target_value,
			unit_of_measure: pt.unit_of_measure,
			monthly_breakdown: pt.monthly_breakdown
		})) ?? []
	);
	let targetStartDate = $state<DateValue | undefined>(
		existingProject?.start_date ? parseDate(existingProject.start_date) : today(getLocalTimeZone())
	);
	let targetEndDate = $state<DateValue | undefined>(
		existingProject?.end_date ? parseDate(existingProject.end_date) : undefined
	);
	// Calculate duration in calendar days from existing dates
	let durationInCalendarDays = $state(
		existingProject?.start_date && existingProject?.end_date
			? Math.ceil(
					(new Date(existingProject.end_date).getTime() -
						new Date(existingProject.start_date).getTime()) /
						(1000 * 60 * 60 * 24)
				).toString()
			: ''
	);
	let totalBudget = $state(existingProject?.budget?.toString() ?? '');
	let directBeneficiariesMale = $state('');
	let directBeneficiariesFemale = $state('');
	let employmentGenerated = $state('');

	// Tab 4: Accountability & Partners
	let projectManager = $state(
		existingProject?.project_manager_team?.project_manager ??
			existingProject?.accountability?.project_manager ??
			''
	);
	let pmAgency = $state(
		existingProject?.project_manager_team?.agency ??
			existingProject?.accountability?.pm_agency ??
			''
	);
	let technicalLead = $state(
		existingProject?.project_manager_team?.technical_lead ??
			existingProject?.accountability?.technical_lead ??
			''
	);
	let lguCounterparts = $state<string[]>(
		existingProject?.project_manager_team?.lgu_counterpart ?? []
	);
	let provincialTeam = $state<string[]>(
		existingProject?.oversight_structure?.provincial_team ?? []
	);
	let dilgRep = $state(existingProject?.oversight_structure?.dilg_rep ?? '');
	let sectoralRep = $state(existingProject?.oversight_structure?.sectoral_rep ?? '');

	// Auto-generate/load sitio coordinators
	let sitioCoordinators = $state(
		existingProject?.sitio_coordinators?.map((sc) => {
			// Find the sitio from existing data
			const sitio =
				existingProject?.project_sitios?.find((ps) => ps.sitio_id === sc.sitio_id) ??
				(existingProject?.sitio_id === sc.sitio_id
					? {
							sitio_id: existingProject.sitio_id,
							sitio_name: existingProject.sitio_name
						}
					: null);

			return {
				sitio_id: sc.sitio_id,
				sitio_name: sitio?.sitio_name ?? '',
				barangay_captain: sc.barangay_captain ?? '',
				sitio_leader: sc.sitio_leader ?? '',
				volunteer_coordinator: sc.volunteer_coordinator ?? '',
				contact_numbers: sc.contact_numbers?.join(', ') ?? ''
			};
		}) ?? []
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
	let monthlyReleaseSchedule = $state<Omit<MonthlyReleaseSchedule, 'id' | 'project_id'>[]>(
		(existingProject as any)?.release_schedule?.map((rs: MonthlyReleaseSchedule) => ({
			month_year: rs.month_year,
			planned_release: rs.planned_release,
			actual_release: rs.actual_release
		})) ?? []
	);
	let monthlyPhysicalProgress = $state<MonthlyPhysicalProgress[]>(
		(existingProject as any)?.monthly_physical_progress?.map((mp: MonthlyPhysicalProgress) => ({
			month_year: mp.month_year,
			plan_percentage: mp.plan_percentage,
			actual_percentage: mp.actual_percentage
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
		performanceTargets.length > 0 &&
			targetStartDate !== undefined &&
			targetEndDate !== undefined &&
			totalBudget !== ''
	);

	const isTab4Valid = $derived(fundingSources.length > 0 && budgetComponents.length > 0);

	const isTab5Valid = $derived(
		monthlyPhysicalProgress.length > 0 &&
			monthlyPhysicalProgress.every((mp) => mp.plan_percentage !== undefined) &&
			monthlyReleaseSchedule.length > 0
	);

	const canSave = $derived(
		isTab1Valid && isTab2Valid && isTab3Valid && isTab4Valid && isTab5Valid
	);

	// Tab navigation
	const tabOrder = ['category', 'location', 'performance', 'budget', 'monthly'];
	const currentTabIndex = $derived(tabOrder.indexOf(activeTab));
	const canGoNext = $derived(currentTabIndex < tabOrder.length - 1);
	const canGoPrevious = $derived(currentTabIndex > 0);

	function nextTab() {
		if (canGoNext) {
			activeTab = tabOrder[currentTabIndex + 1];
		}
	}

	function previousTab() {
		if (canGoPrevious) {
			activeTab = tabOrder[currentTabIndex - 1];
		}
	}

	async function handleSave() {
		// Quick mode vs Full mode handling
		if (editMode === 'quick') {
			// Validate quick update data
			const validation = validateQuickUpdateData(quickUpdateData);
			if (!validation.isValid) {
				toast.error('Please fix the following errors: ' + validation.errors.join(', '));
				return;
			}

			// Show warnings if any
			const warnings = getQuickUpdateWarnings(quickUpdateData);
			warnings.forEach((warning) => {
				if (warning.type === 'warning') {
					toast.warning(warning.message, { duration: 5000 });
				}
			});

			isSaving = true;

			// Apply quick update to project
			const updatedProject = applyQuickUpdateToProject(quickUpdateData, existingProject!);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			console.log('Quick Update - Updated project:', updatedProject);

			isSaving = false;

			// Success toast with continuation options
			toast.success('Quick update saved successfully!', {
				duration: 10000,
				action: {
					label: 'View Project',
					onClick: () => {
						window.location.href = `/admin/projects/${existingProject?.id}`;
					}
				}
			});

			// Show additional action options via separate toast
			toast.info('What would you like to do next?', {
				duration: 10000,
				action: {
					label: 'Back to List',
					onClick: () => {
						window.location.href = '/admin/projects';
					}
				}
			});

			// Auto-redirect to list after delay if no action taken
			setTimeout(() => {
				window.location.href = '/admin/projects';
			}, 10000);
		} else {
			// Full mode - existing validation and save logic
			if (!canSave) {
				toast.error('Please complete all required fields in all tabs');
				return;
			}

			isSaving = true;

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			const projectData = {
				id: existingProject?.id,
				// Tab 1
				title,
				description,
				category_key: selectedCategory,
				project_type_id: selectedProjectType,
				implementing_agency: implementingAgency,
				// Tab 2
				project_sitios: projectSitios,
				total_beneficiaries: projectSitios.reduce((sum, ps) => sum + ps.beneficiaries_target, 0),
				// Tab 3
				performance_targets: performanceTargets,
				start_date: targetStartDate?.toString(),
				end_date: targetEndDate?.toString(),
				direct_beneficiaries_male: Number(directBeneficiariesMale),
				direct_beneficiaries_female: Number(directBeneficiariesFemale),
				employment_generated: Number(employmentGenerated),
				// Tab 4
				budget: Number(totalBudget),
				funding_sources: fundingSources,
				budget_components: budgetComponents,
				// Tab 5
				monthly_physical_progress: monthlyPhysicalProgress,
				release_schedule: monthlyReleaseSchedule
			};

			console.log('Updating enhanced project:', projectData);

			isSaving = false;
			toast.success('Project updated successfully!');

			// Redirect after save
			setTimeout(() => {
				window.location.href = '/admin/projects';
			}, 1000);
		}
	}

	function handleCancel() {
		cancelDialogOpen = true;
	}

	function confirmCancel() {
		window.location.href = '/admin/projects';
	}

	// Mode switching
	function switchToQuickMode() {
		editMode = 'quick';
		// Re-initialize quick update data from current state (if in full mode, preserve changes)
		quickUpdateData = projectToQuickUpdate(existingProject!);
	}

	function switchToFullMode() {
		editMode = 'full';
	}
</script>

<svelte:head>
	<title>Edit {existingProject?.title ?? 'Project'} - Admin</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<div class="sticky top-0 z-10 border-b border-border bg-background shadow-sm">
		<div class="flex items-center justify-between p-4">
			<div>
				<div class="flex items-center gap-3">
					<h1 class="text-2xl font-bold">Edit Project</h1>
					<Badge variant="outline" class="gap-1.5">
						<Clock class="size-3" />
						ID: {existingProject?.id}
					</Badge>
					<!-- Mode indicator -->
					{#if editMode === 'quick'}
						<Badge variant="default" class="gap-1.5 bg-primary">
							<Zap class="size-3" />
							Quick Update
						</Badge>
					{:else}
						<Badge variant="secondary" class="gap-1.5">
							<List class="size-3" />
							Full Edit
						</Badge>
					{/if}
				</div>
				<p class="mt-1 text-sm text-muted-foreground">
					{existingProject?.title}
				</p>
			</div>
			<div class="flex items-center gap-2">
				<!-- Mode Toggle Button -->
				{#if editMode === 'quick'}
					<Button variant="outline" onclick={switchToFullMode} disabled={isSaving} class="gap-2">
						<List class="size-4" />
						Switch to Full Edit
					</Button>
				{:else}
					<Button
						variant="outline"
						onclick={switchToQuickMode}
						disabled={isSaving}
						class="gap-2 border-primary text-primary hover:bg-primary/10"
					>
						<Zap class="size-4" />
						Quick Update Mode
					</Button>
				{/if}

				<Button variant="outline" onclick={handleCancel} disabled={isSaving} class="gap-2">
					<X class="size-4" />
					Cancel
				</Button>
				<Button onclick={handleSave} disabled={!canSave || isSaving} class="gap-2">
					<Save class="size-4" />
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 p-6">
		<div class="w-full">
			{#if editMode === 'quick'}
				<!-- Quick Update Mode -->
				<Card.Card class="p-0">
					<Card.CardContent class="p-6">
						<QuickUpdateForm
							bind:status={quickUpdateData.status}
							bind:physicalActual={quickUpdateData.physicalActual}
							bind:statusStage={quickUpdateData.statusStage}
							bind:statusIssues={quickUpdateData.statusIssues}
							bind:statusRecommendations={quickUpdateData.statusRecommendations}
							bind:catchUpPlan={quickUpdateData.catchUpPlan}
							bind:maleEmployment={quickUpdateData.maleEmployment}
							bind:femaleEmployment={quickUpdateData.femaleEmployment}
							bind:totalBudget={quickUpdateData.totalBudget}
							bind:budgetDisbursed={quickUpdateData.budgetDisbursed}
							bind:startDate={quickUpdateData.startDate}
							bind:targetEndDate={quickUpdateData.targetEndDate}
							bind:extensionRequested={quickUpdateData.extensionRequested}
							bind:extensionDate={quickUpdateData.extensionDate}
							bind:targetBeneficiaries={quickUpdateData.targetBeneficiaries}
							bind:currentBeneficiaries={quickUpdateData.currentBeneficiaries}
							bind:householdsReached={quickUpdateData.householdsReached}
							bind:plannedPercentage={quickUpdateData.plannedPercentage}
							onSwitchToFull={switchToFullMode}
						/>
					</Card.CardContent>
				</Card.Card>
			{:else}
				<!-- Full Edit Mode -->
				<Tabs.Root bind:value={activeTab} class="w-full">
					<!-- Tabs List -->
					<Card.Card class="mb-6 py-0">
						<Card.CardContent class="p-3">
							<Tabs.List class="grid w-full grid-cols-5 gap-1">
								<Tabs.Trigger value="category" class="flex items-center gap-2 text-xs">
									<FolderOpen class="size-4" />
									<span class="hidden lg:inline">Category &</span> Type
									{#if !isTab1Valid && activeTab !== 'category'}
										<CircleAlert class="size-3 text-destructive" />
									{/if}
								</Tabs.Trigger>
								<Tabs.Trigger value="location" class="flex items-center gap-2 text-xs">
									<MapPin class="size-4" />
									<span class="hidden lg:inline">Location &</span> Beneficiaries
									{#if !isTab2Valid && activeTab !== 'location'}
										<CircleAlert class="size-3 text-destructive" />
									{/if}
								</Tabs.Trigger>
								<Tabs.Trigger value="performance" class="flex items-center gap-2 text-xs">
									<Target class="size-4" />
									<span class="hidden lg:inline">Performance</span> Targets
									{#if !isTab3Valid && activeTab !== 'performance'}
										<CircleAlert class="size-3 text-destructive" />
									{/if}
								</Tabs.Trigger>
								<Tabs.Trigger value="budget" class="flex items-center gap-2 text-xs">
									<Banknote class="size-4" />
									<span class="hidden lg:inline">Budget &</span> Resources
									{#if !isTab4Valid && activeTab !== 'budget'}
										<CircleAlert class="size-3 text-destructive" />
									{/if}
								</Tabs.Trigger>
								<Tabs.Trigger value="monthly" class="flex items-center gap-2 text-xs">
									<Calendar class="size-4" />
									<span class="hidden lg:inline">Monthly</span> Planning
									{#if !isTab5Valid && activeTab !== 'monthly'}
										<CircleAlert class="size-3 text-destructive" />
									{/if}
								</Tabs.Trigger>
							</Tabs.List>
						</Card.CardContent>
					</Card.Card>

					<!-- Tab Content -->
					<Tabs.Content value="category">
						<CategoryProjectSelectionTab
							bind:title
							bind:description
							bind:selectedCategory
							bind:selectedProjectType
							bind:implementingAgency
						/>
					</Tabs.Content>

					<Tabs.Content value="location">
						<LocationBeneficiariesTab bind:projectSitios bind:showSitioSelection />
					</Tabs.Content>

					<Tabs.Content value="performance">
						<PerformanceTargetsTab
							selectedProjectTypeId={selectedProjectType}
							bind:performanceTargets
							bind:targetStartDate
							bind:targetEndDate
							bind:durationInCalendarDays
							bind:totalBudget
							bind:directBeneficiariesMale
							bind:directBeneficiariesFemale
							bind:employmentGenerated
						/>
					</Tabs.Content>

					<Tabs.Content value="budget">
						<BudgetResourcesTab {totalBudget} bind:fundingSources bind:budgetComponents />
					</Tabs.Content>

					<Tabs.Content value="monthly">
						<Card.Card class="py-0">
							<Card.CardContent class="p-6">
								<MonthlyTargetsForm
									startDate={targetStartDate?.toString() || ''}
									endDate={targetEndDate?.toString() || ''}
									totalBudget={Number(totalBudget)}
									onUpdate={(data) => {
										monthlyPhysicalProgress = data.physicalProgress;
										monthlyReleaseSchedule = data.releaseSchedule;
									}}
								/>
							</Card.CardContent>
						</Card.Card>
					</Tabs.Content>
				</Tabs.Root>

				<!-- Navigation Buttons (Full Edit Mode only) -->
				<Card.Card class="mt-6 p-0">
					<Card.CardContent class="flex justify-between p-4">
						<Button variant="outline" onclick={previousTab} disabled={!canGoPrevious} class="gap-2">
							<ArrowLeft class="size-4" />
							Previous
						</Button>
						<div class="flex items-center gap-2 text-sm text-muted-foreground">
							Step {currentTabIndex + 1} of {tabOrder.length}
						</div>
						<Button variant="outline" onclick={nextTab} disabled={!canGoNext} class="gap-2">
							Next
							<ArrowRight class="size-4" />
						</Button>
					</Card.CardContent>
				</Card.Card>
			{/if}
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
