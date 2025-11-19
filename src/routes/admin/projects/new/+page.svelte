<script lang="ts">
	import AccountabilityTab from '$lib/components/admin/projects/AccountabilityTab.svelte';
	import BaselineTab from '$lib/components/admin/projects/BaselineTab.svelte';
	import BasicInfoTab from '$lib/components/admin/projects/BasicInfoTab.svelte';
	import MilestonesTab from '$lib/components/admin/projects/MilestonesTab.svelte';
	import MonitoringTab from '$lib/components/admin/projects/MonitoringTab.svelte';
	import ProjectFormHeader from '$lib/components/admin/projects/ProjectFormHeader.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { sitios } from '$lib/mock-data';
	import type { Project, ProjectStatus } from '$lib/types';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import {
		Building2,
		Calendar as CalendarIcon,
		CircleAlert,
		CircleCheck,
		DollarSign,
		Users
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	const isNewProject = true;

	// Form state
	let isSaving = $state(false);
	let activeTab = $state('basic');

	// Basic Information
	let title = $state('');
	let description = $state('');
	let category = $state('');
	let selectedSitio = $state<string>('');
	let status = $state<ProjectStatus>('planning');
	let startDate = $state<DateValue | undefined>(today(getLocalTimeZone()));
	let endDate = $state<DateValue | undefined>(undefined);
	let budget = $state('');
	let beneficiaries = $state('');
	let implementingAgency = $state('');
	let projectYear = $state(new Date().getFullYear().toString());
	let completionPercentage = $state('0');

	// Monitoring Details
	let fundSource = $state('');
	let fiscalYear = $state(new Date().getFullYear().toString());
	let implementingUnit = $state('');
	let location = $state('');

	// Popover states for date pickers
	let startDateOpen = $state(false);
	let endDateOpen = $state(false);
	let baselineApprovedOpen = $state(false);
	let baselinePlannedStartOpen = $state(false);
	let baselinePlannedEndOpen = $state(false);

	// Financial
	let allocatedBudget = $state('');
	let supplementalBudget = $state('0');
	let releasedAmount = $state('0');
	let obligations = $state('0');
	let contractCost = $state('0');

	// Physical Progress
	let physicalPlan = $state('100');
	let physicalActual = $state('0');
	let physicalSlippage = $state('0');

	// Employment
	let maleEmployment = $state('0');
	let femaleEmployment = $state('0');

	// Contract
	let contractDuration = $state('');
	let contractDelivery = $state('');
	let contractExtension = $state('');

	// Status Summary
	let statusStage = $state('');
	let statusIssues = $state('');
	let statusRecommendations = $state('');
	let catchUpPlan = $state('');

	// Accountability
	let projectManager = $state('');
	let pmAgency = $state('');
	let technicalLead = $state('');
	let contractor = $state('');
	let oversightCommittee = $state<string[]>([]);
	let newCommitteeMember = $state('');
	let technicalContact = $state('');
	let administrativeContact = $state('');

	// Baseline
	let baselineApproved = $state<DateValue | undefined>(undefined);
	let baselinePlannedStart = $state<DateValue | undefined>(undefined);
	let baselinePlannedEnd = $state<DateValue | undefined>(undefined);
	let baselineDuration = $state('');
	let baselineBudget = $state('');

	// Milestones
	let milestones = $state([]);
	let showMilestoneForm = $state(false);

	// Derived values
	const selectedSitioData = $derived(sitios.find((s) => s.id === Number(selectedSitio)));

	const categories = [
		'Infrastructure',
		'Agriculture',
		'Education',
		'Health',
		'Water & Sanitation',
		'Livelihood',
		'Environment',
		'Social Services',
		'Other'
	];

	// Validation
	const isBasicInfoValid = $derived(
		title.trim() !== '' &&
			description.trim() !== '' &&
			category !== '' &&
			selectedSitio !== '' &&
			startDate !== undefined &&
			endDate !== undefined &&
			budget !== '' &&
			beneficiaries !== '' &&
			implementingAgency !== ''
	);

	const canSave = $derived(isBasicInfoValid);

	// Functions
	async function handleSave() {
		if (!canSave) {
			toast.error('Please fill in all required fields');
			return;
		}

		isSaving = true;

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		const projectData: Partial<Project> = {
			title,
			description,
			category,
			sitio_id: Number(selectedSitio),
			sitio_name: selectedSitioData?.name ?? '',
			municipality: selectedSitioData?.municipality ?? '',
			status,
			start_date: startDate?.toString() ?? '',
			end_date: endDate?.toString() ?? '',
			budget: Number(budget),
			beneficiaries: Number(beneficiaries),
			implementing_agency: implementingAgency,
			project_year: Number(projectYear),
			completion_percentage: Number(completionPercentage),
			monitoring: {
				fundSource,
				fiscalYear: Number(fiscalYear),
				implementingUnit,
				location,
				allotment: {
					allocated: Number(allocatedBudget),
					supplemental: Number(supplementalBudget),
					total: Number(allocatedBudget || 0) + Number(supplementalBudget || 0),
					released: Number(releasedAmount)
				},
				expenditure: {
					obligations: Number(obligations),
					contractCost: Number(contractCost)
				},
				physical: {
					plan: Number(physicalPlan),
					actual: Number(physicalActual),
					slippage: Number(physicalSlippage)
				},
				employment: {
					male: Number(maleEmployment),
					female: Number(femaleEmployment)
				},
				contract: {
					duration: contractDuration,
					delivery: contractDelivery,
					extension: contractExtension
				},
				statusSummary: {
					stage: statusStage,
					issues: statusIssues,
					recommendations: statusRecommendations
				},
				catchUpPlan
			},
			accountability: {
				project_manager: projectManager,
				pm_agency: pmAgency,
				technical_lead: technicalLead,
				contractor,
				oversight_committee: oversightCommittee,
				escalation_contacts: {
					technical: technicalContact,
					administrative: administrativeContact
				}
			},
			baseline: {
				approved_date: baselineApproved?.toString() ?? '',
				planned_start: baselinePlannedStart?.toString() ?? '',
				planned_end: baselinePlannedEnd?.toString() ?? '',
				planned_duration_days: Number(baselineDuration),
				budget: Number(baselineBudget)
			}
		};

		console.log('Saving project:', projectData);

		isSaving = false;
		toast.success('Project created successfully!');

		// Redirect after save
		setTimeout(() => {
			window.location.href = '/admin/projects';
		}, 1000);
	}

	function handleCancel() {
		if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
			window.location.href = '/admin/projects';
		}
	}

	// Auto-calculate slippage
	$effect(() => {
		const plan = Number(physicalPlan || 0);
		const actual = Number(physicalActual || 0);
		const calculatedSlippage = actual - plan;
		physicalSlippage = calculatedSlippage.toString();
	});

	// Sync completion percentage with physical actual
	$effect(() => {
		completionPercentage = physicalActual;
	});
</script>

<svelte:head>
	<title>Create New Project - Admin</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<ProjectFormHeader
		{isNewProject}
		existingProject={null}
		{canSave}
		{isSaving}
		onSave={handleSave}
		onCancel={handleCancel}
	/>

	<!-- Content -->
	<div class="flex-1 p-6">
		<div class="mx-auto max-w-6xl">
			<Tabs.Root bind:value={activeTab} class="w-full">
				<!-- Tabs List -->
				<Card.Card class="mb-6">
					<Card.CardContent class="">
						<Tabs.List class="grid w-full grid-cols-2 lg:grid-cols-5">
							<Tabs.Trigger value="basic" class="flex items-center gap-2">
								<Building2 class="size-4" />
								Basic Info
								{#if !isBasicInfoValid && activeTab !== 'basic'}
									<CircleAlert class="size-3 text-destructive" />
								{/if}
							</Tabs.Trigger>
							<Tabs.Trigger value="monitoring" class="flex items-center gap-2">
								<DollarSign class="size-4" />
								Monitoring
							</Tabs.Trigger>
							<Tabs.Trigger value="accountability" class="flex items-center gap-2">
								<Users class="size-4" />
								Accountability
							</Tabs.Trigger>
							<Tabs.Trigger value="baseline" class="flex items-center gap-2">
								<CalendarIcon class="size-4" />
								Baseline
							</Tabs.Trigger>
							<Tabs.Trigger value="milestones" class="flex items-center gap-2">
								<CircleCheck class="size-4" />
								Milestones
							</Tabs.Trigger>
						</Tabs.List>
					</Card.CardContent>
				</Card.Card>

				<!-- Basic Information Tab -->
				<Tabs.Content value="basic">
					<BasicInfoTab
						bind:title
						bind:description
						bind:category
						bind:selectedSitio
						bind:status
						bind:startDate
						bind:endDate
						bind:budget
						bind:beneficiaries
						bind:implementingAgency
						bind:projectYear
						bind:completionPercentage
						bind:baselineApproved
						bind:startDateOpen
						bind:endDateOpen
						bind:baselineApprovedOpen
					/>
				</Tabs.Content>
				<!-- Monitoring Tab -->
				<Tabs.Content value="monitoring">
					<MonitoringTab
						bind:fundSource
						bind:fiscalYear
						bind:implementingUnit
						bind:location
						bind:allocatedBudget
						bind:supplementalBudget
						bind:releasedAmount
						bind:obligations
						bind:contractCost
						bind:physicalPlan
						bind:physicalActual
						bind:physicalSlippage
						bind:maleEmployment
						bind:femaleEmployment
						bind:contractDuration
						bind:contractDelivery
						bind:contractExtension
						bind:statusStage
						bind:statusIssues
						bind:statusRecommendations
						bind:catchUpPlan
					/>
				</Tabs.Content>
				<!-- Accountability Tab -->
				<Tabs.Content value="accountability">
					<AccountabilityTab
						bind:projectManager
						bind:pmAgency
						bind:technicalLead
						bind:contractor
						bind:oversightCommittee
						bind:newCommitteeMember
						bind:technicalContact
						bind:administrativeContact
					/>
				</Tabs.Content>

				<!-- Baseline Tab -->
				<Tabs.Content value="baseline">
					<BaselineTab
						bind:baselinePlannedStart
						bind:baselinePlannedEnd
						bind:baselineDuration
						bind:baselineBudget
						bind:baselinePlannedStartOpen
						bind:baselinePlannedEndOpen
					/>
				</Tabs.Content>

				<!-- Milestones Tab -->
				<Tabs.Content value="milestones">
					<MilestonesTab bind:milestones bind:showMilestoneForm />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>
</div>

<style>
	:global(input[readonly]) {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
