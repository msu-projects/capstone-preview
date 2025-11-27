<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import type { Sitio } from '$lib/types';
	import { Briefcase, FileText, FolderKanban, Heart, Home, Users } from '@lucide/svelte';
	import SitioBreadcrumb from './SitioBreadcrumb.svelte';
	import SitioHeader from './SitioHeader.svelte';
	import DemographicsTab from './tabs/DemographicsTab.svelte';
	import EconomicLivelihoodsTab from './tabs/EconomicLivelihoodsTab.svelte';
	import InfrastructureHousingTab from './tabs/InfrastructureHousingTab.svelte';
	import OverviewTab from './tabs/OverviewTab.svelte';
	import RelatedProjectsTab from './tabs/RelatedProjectsTab.svelte';
	import SocialServicesTab from './tabs/SocialServicesTab.svelte';

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
	<main class="w-full px-4 py-8 sm:px-6 lg:px-8">
		<SitioHeader {sitio} />

		<!-- Tabs Component -->
		<Tabs bind:value={activeTab}>
			<TabsList class="mb-3 w-full justify-start overflow-x-auto">
				<TabsTrigger value="overview" class="gap-2">
					<FileText class="size-4" />
					Overview
				</TabsTrigger>
				<TabsTrigger value="demographics" class="gap-2">
					<Users class="size-4" />
					Demographics
				</TabsTrigger>
				<TabsTrigger value="economic" class="gap-2">
					<Briefcase class="size-4" />
					Economic & Livelihoods
				</TabsTrigger>
				<TabsTrigger value="infrastructure" class="gap-2">
					<Home class="size-4" />
					Infrastructure & Housing
				</TabsTrigger>
				<TabsTrigger value="services" class="gap-2">
					<Heart class="size-4" />
					Social Services
				</TabsTrigger>
				<TabsTrigger value="projects" class="gap-2">
					<FolderKanban class="size-4" />
					Related Projects
				</TabsTrigger>
			</TabsList>

			<TabsContent value="overview">
				<OverviewTab {sitio} />
			</TabsContent>

			<TabsContent value="demographics">
				<DemographicsTab {sitio} />
			</TabsContent>

			<TabsContent value="economic">
				<EconomicLivelihoodsTab {sitio} />
			</TabsContent>

			<TabsContent value="infrastructure">
				<InfrastructureHousingTab {sitio} />
			</TabsContent>

			<TabsContent value="services">
				<SocialServicesTab {sitio} />
			</TabsContent>

			<TabsContent value="projects">
				<RelatedProjectsTab {sitio} />
			</TabsContent>
		</Tabs>
	</main>
</div>
