<script lang="ts">
	import CategoryProjectSelectionTab from '$lib/components/admin/projects/CategoryProjectSelectionTab.svelte';
	import LocationBeneficiariesTab from '$lib/components/admin/projects/LocationBeneficiariesTab.svelte';
	import PerformanceTargetsTab from '$lib/components/admin/projects/PerformanceTargetsTab.svelte';
	import AccountabilityPartnersTab from '$lib/components/admin/projects/AccountabilityPartnersTab.svelte';
	import BudgetResourcesTab from '$lib/components/admin/projects/BudgetResourcesTab.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import type {
		CategoryKey,
		ProjectSitio,
		PerformanceTarget,
		FundingSource,
		BudgetComponent
	} from '$lib/types';
	import type { DateValue } from '@internationalized/date';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import {
		FolderOpen,
		MapPin,
		Target,
		Users,
		DollarSign,
		CircleAlert,
		Save,
		X,
		ArrowLeft,
		ArrowRight
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

	// Tab 2: Location & Beneficiaries
	let projectSitios = $state<Omit<ProjectSitio, 'project_id'>[]>([]);
	let showSitioSelection = $state(true);

	// Tab 3: Performance Targets
	let performanceTargets = $state<Omit<PerformanceTarget, 'id' | 'project_id'>[]>([]);
	let targetStartDate = $state<DateValue | undefined>(today(getLocalTimeZone()));
	let targetEndDate = $state<DateValue | undefined>(undefined);
	let totalBudget = $state('');
	let directBeneficiariesMale = $state('');
	let directBeneficiariesFemale = $state('');
	let indirectBeneficiaries = $state('');
	let employmentGenerated = $state('');

	// Tab 4: Accountability & Partners
	let projectManager = $state('');
	let pmAgency = $state('');
	let technicalLead = $state('');
	let implementationPartners = $state<string[]>([]);
	let lguCounterparts = $state<string[]>([]);
	let provincialTeam = $state<string[]>([]);
	let dilgRep = $state('');
	let sectoralRep = $state('');
	let sitioCoordinators = $state<Array<{
		sitio_id: number;
		sitio_name: string;
		barangay_captain: string;
		sitio_leader: string;
		volunteer_coordinator: string;
		contact_numbers: string;
	}>>([]);

	// Auto-generate sitio coordinators when sitios are added
	$effect(() => {
		sitioCoordinators = projectSitios.map((ps) => ({
			sitio_id: ps.sitio_id,
			sitio_name: ps.sitio_name,
			barangay_captain: '',
			sitio_leader: '',
			volunteer_coordinator: '',
			contact_numbers: ''
		}));
	});

	// Tab 5: Budget & Resources
	let totalProjectBudget = $state('');
	let fundingSources = $state<Omit<FundingSource, 'id' | 'project_id'>[]>([]);
	let budgetComponents = $state<Omit<BudgetComponent, 'id' | 'project_id'>[]>([]);

	// Validation
	const isTab1Valid = $derived(
		title.trim() !== '' &&
			description.trim() !== '' &&
			selectedCategory !== '' &&
			selectedProjectType !== undefined
	);

	const isTab2Valid = $derived(projectSitios.length > 0);

	const isTab3Valid = $derived(
		performanceTargets.length > 0 &&
			targetStartDate !== undefined &&
			targetEndDate !== undefined &&
			totalBudget !== ''
	);

	const isTab4Valid = $derived(projectManager.trim() !== '' && pmAgency.trim() !== '');

	const isTab5Valid = $derived(
		totalProjectBudget !== '' && fundingSources.length > 0 && budgetComponents.length > 0
	);

	const canSave = $derived(
		isTab1Valid && isTab2Valid && isTab3Valid && isTab4Valid && isTab5Valid
	);

	// Tab navigation
	const tabOrder = ['category', 'location', 'performance', 'accountability', 'budget'];
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
		if (!canSave) {
			toast.error('Please complete all required fields in all tabs');
			return;
		}

		isSaving = true;

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		const projectData = {
			// Tab 1
			title,
			description,
			category_key: selectedCategory,
			project_type_id: selectedProjectType,
			// Tab 2
			project_sitios: projectSitios,
			total_beneficiaries: projectSitios.reduce((sum, ps) => sum + ps.beneficiaries_target, 0),
			// Tab 3
			performance_targets: performanceTargets,
			start_date: targetStartDate?.toString(),
			end_date: targetEndDate?.toString(),
			direct_beneficiaries_male: Number(directBeneficiariesMale),
			direct_beneficiaries_female: Number(directBeneficiariesFemale),
			indirect_beneficiaries: Number(indirectBeneficiaries),
			employment_generated: Number(employmentGenerated),
			// Tab 4
			project_manager_team: {
				project_manager: projectManager,
				agency: pmAgency,
				technical_lead: technicalLead,
				implementation_partners: implementationPartners,
				lgu_counterpart: lguCounterparts
			},
			sitio_coordinators: sitioCoordinators,
			oversight_structure: {
				provincial_team: provincialTeam,
				dilg_rep: dilgRep,
				sectoral_rep: sectoralRep
			},
			// Tab 5
			budget: Number(totalProjectBudget),
			funding_sources: fundingSources,
			budget_components: budgetComponents
		};

		console.log('Saving enhanced project:', projectData);

		isSaving = false;
		toast.success('Project created successfully!');

		// Redirect after save
		setTimeout(() => {
			window.location.href = '/admin/projects';
		}, 1000);
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
	<div class="sticky top-0 z-10 border-b border-border bg-background shadow-sm">
		<div class="flex items-center justify-between p-4">
			<div>
				<h1 class="text-2xl font-bold">Create New Project</h1>
				<p class="text-sm text-muted-foreground">
					Enhanced multi-sitio project tracking system
				</p>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="outline" onclick={handleCancel} disabled={isSaving} class="gap-2">
					<X class="size-4" />
					Cancel
				</Button>
				<Button onclick={handleSave} disabled={!canSave || isSaving} class="gap-2">
					<Save class="size-4" />
					{isSaving ? 'Saving...' : 'Save Project'}
				</Button>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 p-6">
		<div class="mx-auto max-w-6xl">
			<Tabs.Root bind:value={activeTab} class="w-full">
				<!-- Tabs List -->
				<Card.Card class="mb-6">
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
							<Tabs.Trigger value="accountability" class="flex items-center gap-2 text-xs">
								<Users class="size-4" />
								<span class="hidden lg:inline">Accountability &</span> Partners
								{#if !isTab4Valid && activeTab !== 'accountability'}
									<CircleAlert class="size-3 text-destructive" />
								{/if}
							</Tabs.Trigger>
							<Tabs.Trigger value="budget" class="flex items-center gap-2 text-xs">
								<DollarSign class="size-4" />
								<span class="hidden lg:inline">Budget &</span> Resources
								{#if !isTab5Valid && activeTab !== 'budget'}
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
						bind:totalBudget
						bind:directBeneficiariesMale
						bind:directBeneficiariesFemale
						bind:indirectBeneficiaries
						bind:employmentGenerated
					/>
				</Tabs.Content>

				<Tabs.Content value="accountability">
					<AccountabilityPartnersTab
						bind:projectManager
						bind:pmAgency
						bind:technicalLead
						bind:implementationPartners
					bind:lguCounterparts
					bind:provincialTeam
					bind:dilgRep
					bind:sectoralRep
					{sitioCoordinators}
					/>
				</Tabs.Content>

				<Tabs.Content value="budget">
					<BudgetResourcesTab
						bind:totalProjectBudget
						bind:fundingSources
						bind:budgetComponents
					/>
				</Tabs.Content>
			</Tabs.Root>

			<!-- Navigation Buttons -->
			<Card.Card class="mt-6">
				<Card.CardContent class="flex justify-between p-4">
					<Button
						variant="outline"
						onclick={previousTab}
						disabled={!canGoPrevious}
						class="gap-2"
					>
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
