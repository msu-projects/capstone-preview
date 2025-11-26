<script lang="ts">
	import type { Project } from '$lib/types';
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
	let selectedReport = $state<any>(null);
	let dialogOpen = $state(false);

	// Mock monthly monitoring data (this should come from the project in production)
	const monthlyMonitoring = [
		{
			month: 'Jan 2024',
			plan_physical: 5,
			actual_physical: 5,
			plan_financial: 1875000,
			actual_financial: 1875000,
			status: 'On Track',
			remarks:
				'Mobilization of equipment and initial clearing operations commenced. Site office established.',
			issues:
				'Minor delay in equipment mobilization due to permit approval process at the municipal level.',
			recommendations:
				'Coordinate early with LGU for faster permit processing for future equipment deployment.',
			catch_up_plan: 'No major catch-up needed; extend work hours slightly to finalize clearing.',
			images: 2
		},
		{
			month: 'Feb 2024',
			plan_physical: 15,
			actual_physical: 14,
			plan_financial: 1250000,
			actual_financial: 1200000,
			status: 'Slight Delay',
			remarks:
				'Subgrade preparation underway. Slight delay due to unseasonal rains affecting the lower section.',
			issues: 'Unseasonal heavy rains caused softness in the subgrade at Station 0+200.',
			recommendations: 'Install temporary drainage canals immediately to divert runoff water.',
			catch_up_plan:
				'Deploy additional compactors once weather clears to speed up subgrade preparation.',
			images: 3
		},
		{
			month: 'Mar 2024',
			plan_physical: 30,
			actual_physical: 28,
			plan_financial: 2000000,
			actual_financial: 1500000,
			status: 'Delayed',
			remarks:
				'Installation of Box Culvert #1. Delay persists due to supply chain issues with cement delivery.',
			issues: 'Critical shortage of cement supply from the main contractor supplier.',
			recommendations:
				'Source cement from alternative suppliers in the neighboring province to avoid work stoppage.',
			catch_up_plan: 'Schedule double shifts for concreting works as soon as materials arrive.',
			images: 1
		},
		{
			month: 'Apr 2024',
			plan_physical: 45,
			actual_physical: 45.5,
			plan_financial: 2500000,
			actual_financial: 2800000,
			status: 'On Track',
			remarks:
				'Catch-up plan implemented. Concreting of Station 0+000 to 0+500 completed. Slope protection started.',
			issues: 'Minor slope erosion observed near the box culvert site.',
			recommendations: 'Reinforce slope protection with grouted riprap immediately.',
			catch_up_plan:
				'Successfully implemented previous catch-up plan; project is back on schedule.',
			images: 4
		}
	];

	function handleReportClick(report: any) {
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
