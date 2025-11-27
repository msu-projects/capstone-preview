<script lang="ts">
	import type { MonthlyReport, Project } from '$lib/types';
	import { transformToMonthlyReports } from '$lib/utils/project-adapters';
	import BreadCrumb from './BreadCrumb.svelte';
	import FinancialsTab from './FinancialsTab.svelte';
	import LocationsTab from './LocationsTab.svelte';
	import MonitoringReportDialog from './MonitoringReportDialog.svelte';
	import MonitoringTab from './MonitoringTab.svelte';
	import OverviewTab from './OverviewTab.svelte';
	import ProjectHeader from './ProjectHeader.svelte';
	import TabNavigation from './TabNavigation.svelte';

	interface Props {
		project: Project;
		isAdminView?: boolean;
	}

	const { project, isAdminView = false }: Props = $props();

	let activeTab = $state('overview');
	let selectedReport = $state<MonthlyReport | null>(null);
	let dialogOpen = $state(false);

	// Transform project's monthly_progress + monthly_targets into display format
	const monthlyMonitoring = $derived(
		transformToMonthlyReports(project.monthly_progress, project.monthly_targets)
	);

	function handleReportClick(report: MonthlyReport) {
		selectedReport = report;
		dialogOpen = true;
	}
</script>

<div class="min-h-screen bg-slate-50 pb-12 font-sans text-slate-900">
	<BreadCrumb {project} {isAdminView} />
	<!-- Main Content Area -->
	<main class="w-full px-4 py-6 sm:px-6 lg:px-8">
		<ProjectHeader {project} />
		<TabNavigation {activeTab} onTabChange={(tab) => (activeTab = tab)} />

		<!-- Tab Content -->
		<div class="animate-in duration-300 fade-in slide-in-from-bottom-2">
			{#if activeTab === 'overview'}
				<OverviewTab {project} />
			{:else if activeTab === 'financials'}
				<FinancialsTab {project} />
			{:else if activeTab === 'locations'}
				<LocationsTab {project} />
			{:else if activeTab === 'monitoring'}
				<MonitoringTab {monthlyMonitoring} onReportClick={handleReportClick} />
			{/if}
		</div>
	</main>
</div>

<MonitoringReportDialog bind:open={dialogOpen} {selectedReport} />
