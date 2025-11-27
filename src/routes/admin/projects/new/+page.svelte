<script lang="ts">
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import BudgetResourcesTab from '$lib/components/admin/projects/BudgetResourcesTab.svelte';
	import CategoryProjectSelectionTab from '$lib/components/admin/projects/CategoryProjectSelectionTab.svelte';
	import LocationBeneficiariesTab from '$lib/components/admin/projects/LocationBeneficiariesTab.svelte';
	import PerformanceTargetsTab from '$lib/components/admin/projects/PerformanceTargetsTab.svelte';
	import MonthlyTargetsForm from '$lib/components/projects/MonthlyTargetsForm.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { categories } from '$lib/config/project-categories';
	import type {
		BudgetComponent,
		CategoryKey,
		FundingSource,
		MonthlyPhysicalProgress,
		MonthlyReleaseSchedule,
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
		CircleAlert,
		FolderOpen,
		MapPin,
		Save,
		Target,
		X
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	// Form state
	let isSaving = $state(false);
	let activeTab = $state('category');
	let cancelDialogOpen = $state(false);

	// Tab 1: Category & Project Selection
	let title = $state('');
	let description = $state('');
	let selectedCategory = $state<CategoryKey | ''>('');
	let selectedProjectType = $state<number | undefined>(undefined);
	let implementingAgency = $state('');

	// Tab 2: Location & Beneficiaries
	let projectSitios = $state<Omit<ProjectSitio, 'project_id'>[]>([]);
	let showSitioSelection = $state(true);

	// Tab 3: Performance Targets
	let targetStartDate = $state<DateValue | undefined>(today(getLocalTimeZone()));
	let targetEndDate = $state<DateValue | undefined>(undefined);
	let durationInCalendarDays = $state('');
	let totalBudget = $state('');
	let employmentMale = $state('');
	let employmentFemale = $state('');

	// Tab 5: Budget & Resources
	let fundingSources = $state<Omit<FundingSource, 'id' | 'project_id'>[]>([]);
	let budgetComponents = $state<Omit<BudgetComponent, 'id' | 'project_id'>[]>([]);

	// Tab 6: Monthly Planning
	let monthlyReleaseSchedule = $state<Omit<MonthlyReleaseSchedule, 'id' | 'project_id'>[]>([]);
	let monthlyPhysicalProgress = $state<MonthlyPhysicalProgress[]>([]);

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
		targetStartDate !== undefined &&
			durationInCalendarDays !== '' &&
			Number(durationInCalendarDays) > 0 &&
			totalBudget !== ''
	);

	const isTab4Valid = $derived(fundingSources.length > 0 && budgetComponents.length > 0);

	const isTab5Valid = $derived(
		monthlyPhysicalProgress.length > 0 &&
			monthlyPhysicalProgress.every((mp) => mp.plan_percentage !== undefined) &&
			monthlyReleaseSchedule.length > 0
	);

	const canSave = $derived(isTab1Valid && isTab2Valid && isTab3Valid && isTab4Valid && isTab5Valid);

	// Tab navigation
	const tabOrder = ['category', 'location', 'performance', 'budget', 'monthly'];
	const currentTabIndex = $derived(tabOrder.indexOf(activeTab));
	const canGoNext = $derived(currentTabIndex < tabOrder.length - 1);
	const canGoPrevious = $derived(currentTabIndex > 0);
	const isLastTab = $derived(currentTabIndex === tabOrder.length - 1);

	// Get validation state for current tab
	const getCurrentTabValid = $derived(() => {
		switch (activeTab) {
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

	// Check if a tab can be accessed (all previous tabs must be valid)
	const canAccessTab = $derived((tabName: string) => {
		const tabIndex = tabOrder.indexOf(tabName);
		if (tabIndex === 0) return true; // First tab is always accessible
		if (tabIndex === 1) return isTab1Valid;
		if (tabIndex === 2) return isTab1Valid && isTab2Valid;
		if (tabIndex === 3) return isTab1Valid && isTab2Valid && isTab3Valid;
		if (tabIndex === 4) return isTab1Valid && isTab2Valid && isTab3Valid && isTab4Valid;
		return false;
	});

	function nextTab() {
		if (!getCurrentTabValid()) {
			toast.error('Please complete all required fields before proceeding');
			return;
		}
		if (canGoNext) {
			activeTab = tabOrder[currentTabIndex + 1];
		}
	}

	function previousTab() {
		if (canGoPrevious) {
			activeTab = tabOrder[currentTabIndex - 1];
		}
	}

	function handleTabChange(newTab: string | undefined) {
		if (!newTab) return;

		// Allow going back to any previous tab
		const newTabIndex = tabOrder.indexOf(newTab);
		if (newTabIndex <= currentTabIndex) {
			activeTab = newTab;
			return;
		}

		// For going forward, check if we can access the tab
		if (!canAccessTab(newTab)) {
			toast.error('Please complete previous sections before accessing this tab');
			return;
		}

		activeTab = newTab;
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
			let status: ProjectStatus = 'planning';

			if (projectStartDate <= today) {
				status = 'in-progress';
			}

			// Get current year for project_year
			const currentYear = new Date().getFullYear();

			// Create the Project object
			const newProject: Project = {
				id: nextId,
				title,
				description,
				category: categories.find((v) => v.key === selectedCategory)?.name || '',
				category_key: selectedCategory as any,
				project_type_id: selectedProjectType,
				status,
				start_date: startDateValue,
				end_date: targetEndDate?.toString() || '',
				budget: Number(totalBudget),
				beneficiaries: totalBeneficiaries,
				completion_percentage: 0,
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
				release_schedule: monthlyReleaseSchedule.map((mrs) => ({
					...mrs,
					id: 0,
					project_id: nextId
				})),
				monthly_physical_progress: monthlyPhysicalProgress,
				employment_generated: {
					male: Number(employmentMale) || 0,
					female: Number(employmentFemale) || 0
				},
				project_manager_team: {
					agency: implementingAgency
				},
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
			<Button variant="outline" onclick={handleCancel} disabled={isSaving} class="gap-2">
				<X class="size-4" />
				Cancel
			</Button>
			<Button onclick={handleSave} disabled={!canSave || isSaving} class="gap-2">
				<Save class="size-4" />
				{isSaving ? 'Saving...' : 'Save Project'}
			</Button>
		{/snippet}
	</AdminHeader>

	<!-- Content -->
	<div class="flex-1 p-6">
		<div class="w-full">
			<Tabs.Root value={activeTab} onValueChange={handleTabChange} class="w-full">
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
							<Tabs.Trigger
								value="location"
								disabled={!canAccessTab('location')}
								class="flex items-center gap-2 text-xs"
							>
								<MapPin class="size-4" />
								<span class="hidden lg:inline">Location &</span> Beneficiaries
								{#if !isTab2Valid && activeTab !== 'location'}
									<CircleAlert class="size-3 text-destructive" />
								{/if}
							</Tabs.Trigger>
							<Tabs.Trigger
								value="performance"
								disabled={!canAccessTab('performance')}
								class="flex items-center gap-2 text-xs"
							>
								<Target class="size-4" />
								<span class="hidden lg:inline">Performance</span> Targets
								{#if !isTab3Valid && activeTab !== 'performance'}
									<CircleAlert class="size-3 text-destructive" />
								{/if}
							</Tabs.Trigger>
							<Tabs.Trigger
								value="budget"
								disabled={!canAccessTab('budget')}
								class="flex items-center gap-2 text-xs"
							>
								<Banknote class="size-4" />
								<span class="hidden lg:inline">Budget &</span> Resources
								{#if !isTab4Valid && activeTab !== 'budget'}
									<CircleAlert class="size-3 text-destructive" />
								{/if}
							</Tabs.Trigger>
							<Tabs.Trigger
								value="monthly"
								disabled={!canAccessTab('monthly')}
								class="flex items-center gap-2 text-xs"
							>
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
						bind:targetStartDate
						bind:targetEndDate
						bind:durationInCalendarDays
						bind:totalBudget
						bind:employmentMale
						bind:employmentFemale
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

			<!-- Navigation Buttons -->
			<Card.Card class="mt-6 p-0">
				<Card.CardContent class="flex justify-between p-4">
					<Button variant="outline" onclick={previousTab} disabled={!canGoPrevious} class="gap-2">
						<ArrowLeft class="size-4" />
						Previous
					</Button>
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						Step {currentTabIndex + 1} of {tabOrder.length}
					</div>
					{#if isLastTab && canSave}
						<Button onclick={handleSave} disabled={isSaving} class="gap-2">
							<Save class="size-4" />
							{isSaving ? 'Saving...' : 'Save Project'}
						</Button>
					{:else}
						<Button
							variant="outline"
							onclick={nextTab}
							disabled={!canGoNext || !getCurrentTabValid()}
							class="gap-2"
						>
							Next
							<ArrowRight class="size-4" />
						</Button>
					{/if}
				</Card.CardContent>
			</Card.Card>
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
