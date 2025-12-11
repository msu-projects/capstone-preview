<script lang="ts">
	import AppBreadcrumb, { type BreadcrumbItem } from '$lib/components/AppBreadcrumb.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { projects } from '$lib/mock-data';
	import type { Project, Sitio } from '$lib/types';
	import type { SitioYearlySnapshot } from '$lib/types/sitio-yearly';
	import { applySitioSnapshot } from '$lib/types/sitio-yearly';
	import {
		getSitioAvailableYears,
		getSitioSnapshotByYear,
		loadSitioYearlySnapshots,
		saveSitioAsYearlySnapshot
	} from '$lib/utils/storage';
	import {
		Briefcase,
		FileText,
		FolderKanban,
		Heart,
		Home,
		Image,
		TrendingUp,
		Users
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import DemographicsSection from './sections/DemographicsSection.svelte';
	import EconomySection from './sections/EconomySection.svelte';
	import ImagesSection from './sections/ImagesSection.svelte';
	import InfrastructureSection from './sections/InfrastructureSection.svelte';
	import OverviewSection from './sections/OverviewSection.svelte';
	import ProjectsSection from './sections/ProjectsSection.svelte';
	import SocialServicesSection from './sections/SocialServicesSection.svelte';
	import YearlyTrendsSection from './sections/YearlyTrendsSection.svelte';
	import SitioProfileHeader from './SitioProfileHeader.svelte';

	interface Props {
		sitio: Sitio;
		isAdminView?: boolean;
	}

	const { sitio: originalSitio, isAdminView = false }: Props = $props();

	let activeTab = $state('overview');
	const currentYear = new Date().getFullYear();
	let selectedYear = $state(currentYear);

	// Load yearly snapshots for this sitio
	let yearlySnapshots = $state<SitioYearlySnapshot[]>(loadSitioYearlySnapshots(originalSitio.id));
	let availableYears = $state<number[]>(getSitioAvailableYears(originalSitio.id));

	// Check if current year is already saved
	const isCurrentYearSaved = $derived(availableYears.includes(currentYear));

	// Get the sitio data for the selected year (or original if current year)
	const sitio = $derived.by((): Sitio => {
		if (selectedYear === currentYear) {
			return originalSitio;
		}
		const snapshot = getSitioSnapshotByYear(originalSitio.id, selectedYear);
		if (snapshot) {
			return applySitioSnapshot(originalSitio, snapshot);
		}
		return originalSitio;
	});

	// Get the previous year's snapshot for trend comparison
	const previousYearSnapshot = $derived.by((): SitioYearlySnapshot | null => {
		const prevYear = selectedYear - 1;
		return yearlySnapshots.find((s) => s.year === prevYear) || null;
	});

	// Get related projects for this sitio, filtered by selected year
	// Only include projects that were active/completed in or before the selected year
	const relatedProjects = $derived<Project[]>(
		projects.filter((p) => {
			// Check if project is related to this sitio
			const isRelated = p.project_sitios?.some((ps) => ps.sitio_id === sitio.id) ?? false;
			if (!isRelated) return false;

			// Filter by year: only include projects that started in or before the selected year
			const projectYear = p.project_year || new Date(p.start_date).getFullYear();
			return projectYear <= selectedYear;
		})
	);

	// Handle year change
	function handleYearChange(year: number) {
		selectedYear = year;
	}

	// Handle save current year
	function handleSaveCurrentYear() {
		const success = saveSitioAsYearlySnapshot(originalSitio, currentYear);
		if (success) {
			// Refresh the data
			yearlySnapshots = loadSitioYearlySnapshots(originalSitio.id);
			availableYears = getSitioAvailableYears(originalSitio.id);
			toast.success(`${currentYear} data saved successfully`, {
				description: 'You can now view historical trends and comparisons.'
			});
		} else {
			toast.error('Failed to save data', {
				description: 'Please try again later.'
			});
		}
	}

	const tabs = [
		{ id: 'overview', label: 'Overview', icon: FileText },
		{ id: 'demographics', label: 'Demographics', icon: Users },
		{ id: 'economy', label: 'Economy & Livelihoods', icon: Briefcase },
		{ id: 'infrastructure', label: 'Infrastructure', icon: Home },
		{ id: 'services', label: 'Social Services', icon: Heart },
		{ id: 'images', label: 'Photos', icon: Image },
		{ id: 'trends', label: 'Trends', icon: TrendingUp },
		{ id: 'projects', label: 'Projects', icon: FolderKanban }
	];

	const breadcrumbItems: BreadcrumbItem[] = $derived([
		{ label: 'Sitios', href: isAdminView ? '/admin/sitios' : '/sitios' },
		{ label: 'List', href: isAdminView ? '/admin/sitios/list' : '/sitios/list' },
		{ label: sitio.name }
	]);
</script>

<div
	class="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900"
>
	<!-- Breadcrumb Navigation -->
	<AppBreadcrumb items={breadcrumbItems} {isAdminView} />

	<!-- Hero Header Section -->
	<SitioProfileHeader
		{sitio}
		{relatedProjects}
		{isAdminView}
		{availableYears}
		bind:selectedYear
		onYearChange={handleYearChange}
		onSaveCurrentYear={handleSaveCurrentYear}
		{isCurrentYearSaved}
	/>

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
							class="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
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
					<OverviewSection {sitio} {relatedProjects} previousSnapshot={previousYearSnapshot} />
				</Tabs.Content>

				<Tabs.Content
					value="demographics"
					class="animate-in duration-300 fade-in slide-in-from-bottom-2"
				>
					<DemographicsSection {sitio} previousSnapshot={previousYearSnapshot} />
				</Tabs.Content>

				<Tabs.Content
					value="economy"
					class="animate-in duration-300 fade-in slide-in-from-bottom-2"
				>
					<EconomySection {sitio} previousSnapshot={previousYearSnapshot} />
				</Tabs.Content>

				<Tabs.Content
					value="infrastructure"
					class="animate-in duration-300 fade-in slide-in-from-bottom-2"
				>
					<InfrastructureSection {sitio} previousSnapshot={previousYearSnapshot} />
				</Tabs.Content>

				<Tabs.Content
					value="services"
					class="animate-in duration-300 fade-in slide-in-from-bottom-2"
				>
					<SocialServicesSection {sitio} previousSnapshot={previousYearSnapshot} />
				</Tabs.Content>

				<Tabs.Content value="images" class="animate-in duration-300 fade-in slide-in-from-bottom-2">
					<ImagesSection {sitio} />
				</Tabs.Content>

				<Tabs.Content value="trends" class="animate-in duration-300 fade-in slide-in-from-bottom-2">
					<YearlyTrendsSection snapshots={yearlySnapshots} currentYear={selectedYear} />
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
