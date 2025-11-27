<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import { projects } from '$lib/mock-data';
	import type { Project, Sitio } from '$lib/types';
	import {
		Briefcase,
		ChevronRight,
		FileText,
		FolderKanban,
		Heart,
		Home,
		Users
	} from '@lucide/svelte';
	import DemographicsSection from './sections/DemographicsSection.svelte';
	import EconomySection from './sections/EconomySection.svelte';
	import InfrastructureSection from './sections/InfrastructureSection.svelte';
	import OverviewSection from './sections/OverviewSection.svelte';
	import ProjectsSection from './sections/ProjectsSection.svelte';
	import SocialServicesSection from './sections/SocialServicesSection.svelte';
	import SitioProfileHeader from './SitioProfileHeader.svelte';

	interface Props {
		sitio: Sitio;
		isAdminView?: boolean;
	}

	const { sitio, isAdminView = false }: Props = $props();

	let activeTab = $state('overview');

	// Get related projects for this sitio
	const relatedProjects = $derived<Project[]>(
		projects.filter((p) => {
			if (p.sitio_id === sitio.id) return true;
			if (p.project_sitios?.some((ps) => ps.sitio_id === sitio.id)) return true;
			return false;
		})
	);

	const tabs = [
		{ id: 'overview', label: 'Overview', icon: FileText },
		{ id: 'demographics', label: 'Demographics', icon: Users },
		{ id: 'economy', label: 'Economy & Livelihoods', icon: Briefcase },
		{ id: 'infrastructure', label: 'Infrastructure', icon: Home },
		{ id: 'services', label: 'Social Services', icon: Heart },
		{ id: 'projects', label: 'Projects', icon: FolderKanban }
	];
</script>

<div class="min-h-screen bg-linear-to-b from-slate-50 to-white">
	<!-- Breadcrumb Navigation -->
	<div class="border-b bg-white/80 backdrop-blur-sm">
		<div class="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
			<nav class="flex items-center gap-2 text-sm">
				<a
					href={isAdminView ? '/admin' : '/'}
					class="text-slate-500 transition-colors hover:text-slate-700"
				>
					{isAdminView ? 'Admin' : 'Home'}
				</a>
				<ChevronRight class="size-4 text-slate-400" />
				<a
					href={isAdminView ? '/admin/sitios' : '/sitios'}
					class="text-slate-500 transition-colors hover:text-slate-700"
				>
					Sitios
				</a>
				<ChevronRight class="size-4 text-slate-400" />
				<span class="font-medium text-slate-900">{sitio.name}</span>
			</nav>
		</div>
	</div>

	<!-- Hero Header Section -->
	<SitioProfileHeader {sitio} {relatedProjects} {isAdminView} />

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
		<!-- Tab Navigation -->
		<Tabs.Root bind:value={activeTab}>
			<div
				class="sticky top-0 z-50 -mx-4 bg-linear-to-b from-slate-50 to-transparent px-4 pt-6 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
			>
				<Tabs.List
					class="inline-flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200/50"
				>
					{#each tabs as tab}
						<Tabs.Trigger
							value={tab.id}
							class="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
						>
							<tab.icon class="size-4" />
							<span class="hidden sm:inline">{tab.label}</span>
						</Tabs.Trigger>
					{/each}
				</Tabs.List>
			</div>

			<!-- Tab Content -->
			<div class="mt-6">
				<Tabs.Content
					value="overview"
					class="animate-in duration-300 fade-in slide-in-from-bottom-2"
				>
					<OverviewSection {sitio} {relatedProjects} />
				</Tabs.Content>

				<Tabs.Content
					value="demographics"
					class="animate-in duration-300 fade-in slide-in-from-bottom-2"
				>
					<DemographicsSection {sitio} />
				</Tabs.Content>

				<Tabs.Content
					value="economy"
					class="animate-in duration-300 fade-in slide-in-from-bottom-2"
				>
					<EconomySection {sitio} />
				</Tabs.Content>

				<Tabs.Content
					value="infrastructure"
					class="animate-in duration-300 fade-in slide-in-from-bottom-2"
				>
					<InfrastructureSection {sitio} />
				</Tabs.Content>

				<Tabs.Content
					value="services"
					class="animate-in duration-300 fade-in slide-in-from-bottom-2"
				>
					<SocialServicesSection {sitio} />
				</Tabs.Content>

				<Tabs.Content
					value="projects"
					class="animate-in duration-300 fade-in slide-in-from-bottom-2"
				>
					<ProjectsSection {sitio} {relatedProjects} {isAdminView} />
				</Tabs.Content>
			</div>
		</Tabs.Root>
	</main>
</div>
