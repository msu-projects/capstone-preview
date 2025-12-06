<script lang="ts">
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import QuickUpdateForm from '$lib/components/admin/projects/QuickUpdateForm.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { refreshProjects } from '$lib/mock-data';
	import {
		applyQuickUpdateToProject,
		getQuickUpdateWarnings,
		projectToQuickUpdate,
		validateQuickUpdateData
	} from '$lib/utils/project-adapters';
	import { getCurrentMonth } from '$lib/utils/project-calculations';
	import { addProject, getProjectById, updateProject } from '$lib/utils/storage';
	import { AlertCircle, Clock, List, Save, X, Zap } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	const { data } = $props();

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

	// Check if monthly update already exists for current month
	const currentMonth = getCurrentMonth();
	const existingMonthlyUpdate = existingProject?.monthly_progress?.find(
		(mp) => mp.month_year === currentMonth
	);

	// Form state
	let isSaving = $state(false);
	let cancelDialogOpen = $state(false);
	let existingUpdateDialogOpen = $state(!!existingMonthlyUpdate);

	onMount(() => {
		if (!!existingMonthlyUpdate) {
			quickUpdateData.budgetDisbursed = String(
				Number(quickUpdateData.budgetDisbursed) - Number(quickUpdateData.monthlyDisbursement)
			);
		}
	});

	// Quick Update form data (initialized from existing project)
	let quickUpdateData = $state(projectToQuickUpdate(existingProject!));

	async function handleSave() {
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

		try {
			// Apply quick update to project
			const updatedProject = applyQuickUpdateToProject(quickUpdateData, existingProject!);

			// Save to localStorage
			// If project doesn't exist in localStorage (it's from mock data), add it first
			const existingInStorage = getProjectById(existingProject!.id);
			const saved = existingInStorage
				? updateProject(existingProject!.id, updatedProject)
				: addProject(updatedProject);

			if (!saved) {
				throw new Error('Failed to save project to localStorage');
			}

			console.log('Quick Update - Updated project:', updatedProject);

			isSaving = false;

			// Success toast with continuation options
			toast.success('Quick update saved successfully!', {
				duration: 5000
			});

			// Auto-redirect to list after delay if no action taken
			// window.location.href = '/admin/projects';
			history.back();
		} catch (error) {
			console.error('Error saving quick update:', error);
			isSaving = false;
			toast.error('Failed to save quick update. Please try again.');
		}
	}

	function handleCancel() {
		cancelDialogOpen = true;
	}

	function confirmCancel() {
		window.location.href = '/admin/projects';
	}

	function switchToFullEdit() {
		window.location.href = `/admin/projects/${existingProject?.id}/edit`;
	}

	function confirmEditExisting() {
		existingUpdateDialogOpen = false;
		// User confirmed they want to edit the existing update
		toast.info(
			'You are now editing the existing monthly update for ' + formatMonthYear(currentMonth)
		);
	}

	function cancelEditExisting() {
		// User doesn't want to edit, go back to project list
		window.location.href = '/admin/projects';
	}

	function formatMonthYear(monthYear: string): string {
		const [year, month] = monthYear.split('-');
		const date = new Date(parseInt(year), parseInt(month) - 1);
		return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Quick Edit - {existingProject?.title ?? 'Project'} - Admin</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<AdminHeader sticky title="Quick Edit" description={existingProject?.title}>
		{#snippet badges()}
			<Badge variant="outline" class="gap-1.5">
				<Clock class="size-3" />
				ID: {existingProject?.id}
			</Badge>
			<Badge variant="default" class="gap-1.5 bg-primary">
				<Zap class="size-3" />
				Quick Update
			</Badge>
		{/snippet}
		{#snippet actions()}
			<!-- Switch to Full Edit Button -->
			<Button variant="outline" onclick={switchToFullEdit} disabled={isSaving} class="gap-2">
				<List class="size-4" />
				Switch to Full Edit
			</Button>

			<Button variant="outline" onclick={handleCancel} disabled={isSaving} class="gap-2">
				<X class="size-4" />
				Cancel
			</Button>
			<Button onclick={handleSave} disabled={isSaving} class="gap-2">
				<Save class="size-4" />
				{isSaving ? 'Saving...' : 'Save Changes'}
			</Button>
		{/snippet}
	</AdminHeader>

	<!-- Content -->
	<div class="flex-1 p-6">
		<div class="w-full">
			<p class="mb-4 text-sm text-muted-foreground">
				Fields marked with <span class="text-destructive">*</span> are required.
			</p>
			<Card.Card class="p-0">
				<Card.CardContent class="p-6">
					<QuickUpdateForm
						bind:status={quickUpdateData.status}
						bind:physicalActual={quickUpdateData.physicalActual}
						bind:issues={quickUpdateData.issues}
						bind:recommendations={quickUpdateData.recommendations}
						bind:catchUpPlan={quickUpdateData.catchUpPlan}
						bind:maleEmployment={quickUpdateData.maleEmployment}
						bind:femaleEmployment={quickUpdateData.femaleEmployment}
						bind:totalBudget={quickUpdateData.totalBudget}
						bind:budgetDisbursed={quickUpdateData.budgetDisbursed}
						bind:monthlyDisbursement={quickUpdateData.monthlyDisbursement}
						targetDisbursementThisMonth={quickUpdateData.targetDisbursementThisMonth}
						bind:startDate={quickUpdateData.startDate}
						bind:contractDuration={quickUpdateData.contractDuration}
						bind:targetBeneficiaries={quickUpdateData.targetBeneficiaries}
						bind:currentBeneficiaries={quickUpdateData.currentBeneficiaries}
						bind:householdsReached={quickUpdateData.householdsReached}
						bind:plannedPercentage={quickUpdateData.plannedPercentage}
						bind:photoDocumentation={quickUpdateData.photoDocumentation}
						bind:cumulativeAchievedOutputs={quickUpdateData.cumulativeAchievedOutputs}
						bind:monthlyAchievedOutputs={quickUpdateData.monthlyAchievedOutputs}
						performanceTargets={quickUpdateData.performanceTargets}
						onSwitchToFull={switchToFullEdit}
					/>
				</Card.CardContent>
			</Card.Card>
		</div>
	</div>
</div>

<!-- Existing Monthly Update Warning Dialog -->
<AlertDialog.Root bind:open={existingUpdateDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title class="flex items-center gap-2">
				<AlertCircle class="size-5 text-warning" />
				Monthly Update Already Exists
			</AlertDialog.Title>
			<AlertDialog.Description class="space-y-3">
				<p>
					A monthly update for <strong>{formatMonthYear(currentMonth)}</strong> already exists for this
					project.
				</p>
				{#if existingMonthlyUpdate}
					<div class="rounded-md bg-muted p-3 text-sm">
						<div class="font-medium text-foreground">Current Update Details:</div>
						<ul class="mt-2 space-y-1 text-muted-foreground">
							<li>• Beneficiaries Reached: {existingMonthlyUpdate.beneficiaries_reached}</li>
							<li>• Status: {existingMonthlyUpdate.status}</li>
							<li>
								• Last Updated: {new Date(existingMonthlyUpdate.updated_at).toLocaleDateString(
									'en-US',
									{
										month: 'short',
										day: 'numeric',
										year: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									}
								)}
							</li>
						</ul>
					</div>
				{/if}
				<p class="text-foreground">
					Would you like to continue and edit this existing monthly update?
				</p>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={cancelEditExisting}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmEditExisting} class="bg-primary hover:bg-primary/90">
				Continue Editing
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

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
