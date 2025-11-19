<script lang="ts">
	import AccountabilityTab from '$lib/components/admin/projects/AccountabilityTab.svelte';
	import BaselineTab from '$lib/components/admin/projects/BaselineTab.svelte';
	import BasicInfoTab from '$lib/components/admin/projects/BasicInfoTab.svelte';
	import MilestonesTab from '$lib/components/admin/projects/MilestonesTab.svelte';
	import MonitoringTab from '$lib/components/admin/projects/MonitoringTab.svelte';
	import ProjectFormHeader from '$lib/components/admin/projects/ProjectFormHeader.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { projects, sitios } from '$lib/mock-data';
	import type { Project, ProjectStatus } from '$lib/types';
	import { getLocalTimeZone, parseDate, today, type DateValue } from '@internationalized/date';
	import {
		Building2,
		Calendar as CalendarIcon,
		CircleAlert,
		CircleCheck,
		DollarSign,
		Users
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	const { data } = $props();
	const isNewProject = data.id === 'new';
	const existingProject = isNewProject ? null : projects.find((p) => p.id === Number(data.id));

	// Form state
	let isSaving = $state(false);
	let activeTab = $state('basic');

	// Basic Information
	let title = $state(existingProject?.title ?? '');
	let description = $state(existingProject?.description ?? '');
	let category = $state(existingProject?.category ?? '');
	let selectedSitio = $state<string>(existingProject?.sitio_id.toString() ?? '');
	let status = $state<ProjectStatus>(existingProject?.status ?? 'planning');
	let startDate = $state<DateValue | undefined>(
		existingProject?.start_date ? parseDate(existingProject.start_date) : today(getLocalTimeZone())
	);
	let endDate = $state<DateValue | undefined>(
		existingProject?.end_date ? parseDate(existingProject.end_date) : undefined
	);
	let budget = $state(existingProject?.budget?.toString() ?? '');
	let beneficiaries = $state(existingProject?.beneficiaries?.toString() ?? '');
	let implementingAgency = $state(existingProject?.implementing_agency ?? '');
	let projectYear = $state(
		existingProject?.project_year?.toString() ?? new Date().getFullYear().toString()
	);
	let completionPercentage = $state(existingProject?.completion_percentage?.toString() ?? '0');

	// Monitoring Details
	let fundSource = $state(existingProject?.monitoring?.fundSource ?? '');
	let fiscalYear = $state(
		existingProject?.monitoring?.fiscalYear?.toString() ?? new Date().getFullYear().toString()
	);
	let implementingUnit = $state(existingProject?.monitoring?.implementingUnit ?? '');
	let location = $state(existingProject?.monitoring?.location ?? '');

	// Popover states for date pickers
	let startDateOpen = $state(false);
	let endDateOpen = $state(false);
	let baselineApprovedOpen = $state(false);
	let baselinePlannedStartOpen = $state(false);
	let baselinePlannedEndOpen = $state(false);

	// Financial
	let allocatedBudget = $state(
		existingProject?.monitoring?.allotment?.allocated?.toString() ??
			existingProject?.budget?.toString() ??
			''
	);
	let supplementalBudget = $state(
		existingProject?.monitoring?.allotment?.supplemental?.toString() ?? '0'
	);
	let releasedAmount = $state(existingProject?.monitoring?.allotment?.released?.toString() ?? '0');
	let obligations = $state(
		existingProject?.monitoring?.expenditure?.obligations?.toString() ?? '0'
	);
	let contractCost = $state(
		existingProject?.monitoring?.expenditure?.contractCost?.toString() ?? '0'
	);

	// Physical Progress
	let physicalPlan = $state(existingProject?.monitoring?.physical?.plan?.toString() ?? '100');
	let physicalActual = $state(
		existingProject?.monitoring?.physical?.actual?.toString() ??
			existingProject?.completion_percentage?.toString() ??
			'0'
	);
	let physicalSlippage = $state(existingProject?.monitoring?.physical?.slippage?.toString() ?? '0');

	// Employment
	let maleEmployment = $state(existingProject?.monitoring?.employment?.male?.toString() ?? '0');
	let femaleEmployment = $state(existingProject?.monitoring?.employment?.female?.toString() ?? '0');

	// Contract
	let contractDuration = $state(existingProject?.monitoring?.contract?.duration ?? '');
	let contractDelivery = $state(existingProject?.monitoring?.contract?.delivery ?? '');
	let contractExtension = $state(existingProject?.monitoring?.contract?.extension ?? '');

	// Status Summary
	let statusStage = $state(existingProject?.monitoring?.statusSummary?.stage ?? '');
	let statusIssues = $state(existingProject?.monitoring?.statusSummary?.issues ?? '');
	let statusRecommendations = $state(
		existingProject?.monitoring?.statusSummary?.recommendations ?? ''
	);
	let catchUpPlan = $state(existingProject?.monitoring?.catchUpPlan ?? '');

	// Accountability
	let projectManager = $state(existingProject?.accountability?.project_manager ?? '');
	let pmAgency = $state(existingProject?.accountability?.pm_agency ?? '');
	let technicalLead = $state(existingProject?.accountability?.technical_lead ?? '');
	let contractor = $state(existingProject?.accountability?.contractor ?? '');
	let oversightCommittee = $state<string[]>(
		existingProject?.accountability?.oversight_committee ?? []
	);
	let newCommitteeMember = $state('');
	let technicalContact = $state(
		existingProject?.accountability?.escalation_contacts?.technical ?? ''
	);
	let administrativeContact = $state(
		existingProject?.accountability?.escalation_contacts?.administrative ?? ''
	);

	// Baseline
	let baselineApproved = $state<DateValue | undefined>(
		existingProject?.baseline?.approved_date
			? parseDate(existingProject.baseline.approved_date)
			: undefined
	);
	let baselinePlannedStart = $state<DateValue | undefined>(
		existingProject?.baseline?.planned_start
			? parseDate(existingProject.baseline.planned_start)
			: existingProject?.start_date
				? parseDate(existingProject.start_date)
				: undefined
	);
	let baselinePlannedEnd = $state<DateValue | undefined>(
		existingProject?.baseline?.planned_end
			? parseDate(existingProject.baseline.planned_end)
			: existingProject?.end_date
				? parseDate(existingProject.end_date)
				: undefined
	);
	let baselineDuration = $state(existingProject?.baseline?.planned_duration_days?.toString() ?? '');
	let baselineBudget = $state(
		existingProject?.baseline?.budget?.toString() ?? existingProject?.budget?.toString() ?? ''
	);
	let baselineMilestones = $state(existingProject?.baseline?.milestones_count?.toString() ?? '0');

	// Milestones
	let milestones = $state(existingProject?.milestones ?? []);
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
				budget: Number(baselineBudget),
				milestones_count: Number(baselineMilestones)
			}
		};

		console.log('Saving project:', projectData);

		isSaving = false;
		toast.success(isNewProject ? 'Project created successfully!' : 'Project updated successfully!');

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
	<title>{isNewProject ? 'Create New Project' : `Edit ${existingProject?.title}`} - Admin</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<ProjectFormHeader
		{isNewProject}
		existingProject={existingProject ?? null}
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
						bind:startDateOpen
						bind:endDateOpen
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
						bind:baselineApproved
						bind:baselinePlannedStart
						bind:baselinePlannedEnd
						bind:baselineDuration
						bind:baselineBudget
						bind:baselineMilestones
						bind:baselineApprovedOpen
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
