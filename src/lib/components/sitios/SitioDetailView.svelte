<script lang="ts">
	import type { Sitio } from '$lib/types';
	import SitioBreadcrumb from './SitioBreadcrumb.svelte';
	import SitioHeader from './SitioHeader.svelte';
	import SitioTabNavigation from './SitioTabNavigation.svelte';
	import OverviewTab from './tabs/OverviewTab.svelte';
	import DemographicsTab from './tabs/DemographicsTab.svelte';
	import EconomicLivelihoodsTab from './tabs/EconomicLivelihoodsTab.svelte';
	import InfrastructureHousingTab from './tabs/InfrastructureHousingTab.svelte';
	import SocialServicesTab from './tabs/SocialServicesTab.svelte';
	import RelatedProjectsTab from './tabs/RelatedProjectsTab.svelte';

	interface Props {
		sitio: Sitio;
		isAdminView?: boolean;
	}

	const { sitio, isAdminView = false }: Props = $props();

	let activeTab = $state('overview');
</script>

<div class="min-h-screen bg-slate-50 pb-12 font-sans text-slate-900">
	<SitioBreadcrumb {sitio} {isAdminView} />

	<!-- Main Content Area -->
	<main class="w-full px-4 py-6 sm:px-6 lg:px-8">
		<SitioHeader {sitio} />
		<SitioTabNavigation {activeTab} onTabChange={(tab) => (activeTab = tab)} />

		<!-- Tab Content -->
		<div class="animate-in duration-300 fade-in slide-in-from-bottom-2">
			{#if activeTab === 'overview'}
				<OverviewTab {sitio} />
			{:else if activeTab === 'demographics'}
				<DemographicsTab {sitio} />
			{:else if activeTab === 'economic'}
				<EconomicLivelihoodsTab {sitio} />
			{:else if activeTab === 'infrastructure'}
				<InfrastructureHousingTab {sitio} />
			{:else if activeTab === 'services'}
				<SocialServicesTab {sitio} />
			{:else if activeTab === 'projects'}
				<RelatedProjectsTab {sitio} />
			{/if}
		</div>
	</main>
</div>
