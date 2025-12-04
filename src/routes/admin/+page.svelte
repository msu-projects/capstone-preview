<script lang="ts">
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import BudgetTab from '$lib/components/admin/dashboard/BudgetTab.svelte';
	import DashboardStats from '$lib/components/admin/dashboard/DashboardStats.svelte';
	import EmploymentTab from '$lib/components/admin/dashboard/EmploymentTab.svelte';
	import GeographicTab from '$lib/components/admin/dashboard/GeographicTab.svelte';
	import OverviewTab from '$lib/components/admin/dashboard/OverviewTab.svelte';
	import SitiosTab from '$lib/components/admin/dashboard/SitiosTab.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Tabs from '$lib/components/ui/tabs';
	import { categories } from '$lib/config/project-categories';
	import { chartData, projects, sitios, stats } from '$lib/mock-data';
	import type { AuditLog } from '$lib/types';
	import { loadAuditLogs } from '$lib/utils/audit';
	import toTitleCase from '$lib/utils/common';
	import { downloadProjectMonitoringPDF } from '$lib/utils/pdf-generator';
	import { ChartColumn, Download, ExternalLink, Plus } from '@lucide/svelte';
	import { onMount } from 'svelte';

	// Loading state for async data simulation
	let isLoading = $state(false);
	let activities = $state<AuditLog[]>([]);
	let activeTab = $state('overview');

	onMount(() => {
		// Load recent audit logs (most recent first, limited to 10)
		activities = loadAuditLogs().reverse().slice(0, 10);
	});

	const recentProjects = projects.slice(0, 5);

	// Chart color palette
	const chartColors = [
		'hsl(217, 91%, 60%)', // blue
		'hsl(142, 71%, 45%)', // green
		'hsl(48, 96%, 53%)', // yellow
		'hsl(280, 70%, 60%)', // purple
		'hsl(340, 82%, 52%)', // pink
		'hsl(195, 85%, 45%)', // cyan
		'hsl(25, 95%, 53%)', // orange
		'hsl(160, 65%, 50%)' // teal
	];

	// Chart data preparations
	// Status donut chart data
	const statusChartData = chartData.projectsByStatus.map((item) => ({
		label: item.status as string,
		value: item.count,
		color:
			item.status === 'Planning'
				? 'hsl(217, 64%, 44%)'
				: item.status === 'In Progress'
					? 'hsl(48, 96%, 53%)'
					: item.status === 'Completed'
						? 'hsl(142, 71%, 45%)'
						: 'hsl(0, 84%, 60%)'
	}));

	// Category bar chart data
	const categoryChartData = chartData.projectsByCategory
		.sort((a, b) => b.count - a.count)
		.slice(0, 8)
		.map((item, i) => ({
			label: toTitleCase(item.category as string),
			value: item.count,
			color: chartColors[i % chartColors.length]
		}));

	// Municipality bar chart data
	const municipalityChartData = chartData.projectsByMunicipality
		.sort((a, b) => b.count - a.count)
		.map((item, i) => ({
			label: item.municipality as string,
			value: item.count,
			color: chartColors[i % chartColors.length]
		}));

	// Monthly progress line chart data
	const monthlyProgressSeries = [
		{
			name: 'Completed Projects',
			data: chartData.monthlyProgress.map((item) => item.completed as number)
		}
	];
	const monthlyProgressCategories = chartData.monthlyProgress.map((item) => item.month as string);

	// Budget by category (derived)
	const budgetByCategory = categories.map((cat, i) => ({
		label: cat.name,
		value: projects
			.filter((p) => p.category_key === cat.key)
			.reduce((sum, p) => sum + p.total_budget, 0),
		color: chartColors[i % chartColors.length]
	}));
	const topBudgetCategories = budgetByCategory.sort((a, b) => b.value - a.value).slice(0, 5);

	// Employment data
	const totalMaleEmployment = projects.reduce(
		(sum, p) => sum + (p.employment_generated?.male || 0),
		0
	);
	const totalFemaleEmployment = projects.reduce(
		(sum, p) => sum + (p.employment_generated?.female || 0),
		0
	);
	const employmentChartData = [
		{ label: 'Male', value: totalMaleEmployment, color: 'hsl(217, 91%, 60%)' },
		{ label: 'Female', value: totalFemaleEmployment, color: 'hsl(340, 82%, 52%)' }
	];

	// Employment by category for stacked comparison
	const employmentByCategory = categories
		.map((cat) => {
			const catProjects = projects.filter((p) => p.category_key === cat.key);
			return {
				category: cat.name,
				male: catProjects.reduce((sum, p) => sum + (p.employment_generated?.male || 0), 0),
				female: catProjects.reduce((sum, p) => sum + (p.employment_generated?.female || 0), 0)
			};
		})
		.sort((a, b) => b.male + b.female - (a.male + a.female))
		.slice(0, 6);

	// ===== SITIO ANALYTICS =====
	// Total population and households across all sitios
	const totalPopulation = sitios.reduce((sum, s) => sum + (s.population || 0), 0);
	const totalHouseholds = sitios.reduce((sum, s) => sum + (s.households || 0), 0);

	// Sitios by municipality
	const sitiosByMunicipality = [...new Set(sitios.map((s) => s.municipality))]
		.map((mun, i) => ({
			label: mun,
			value: sitios.filter((s) => s.municipality === mun).length,
			color: chartColors[i % chartColors.length]
		}))
		.sort((a, b) => b.value - a.value);

	// Population by municipality
	const populationByMunicipality = [...new Set(sitios.map((s) => s.municipality))]
		.map((mun, i) => ({
			label: mun,
			value: sitios
				.filter((s) => s.municipality === mun)
				.reduce((sum, s) => sum + (s.population || 0), 0),
			color: chartColors[i % chartColors.length]
		}))
		.sort((a, b) => b.value - a.value);

	// Demographics aggregation (male vs female)
	const totalMalePopulation = sitios.reduce((sum, s) => sum + (s.demographics?.male || 0), 0);
	const totalFemalePopulation = sitios.reduce((sum, s) => sum + (s.demographics?.female || 0), 0);
	const demographicsChartData = [
		{ label: 'Male', value: totalMalePopulation, color: 'hsl(217, 91%, 60%)' },
		{ label: 'Female', value: totalFemalePopulation, color: 'hsl(340, 82%, 52%)' }
	];

	// Age distribution aggregation
	const ageDistribution = [
		{
			label: '0-14 years',
			value: sitios.reduce((sum, s) => sum + (s.demographics?.age_0_14 || 0), 0),
			color: 'hsl(142, 71%, 45%)'
		},
		{
			label: '15-64 years',
			value: sitios.reduce((sum, s) => sum + (s.demographics?.age_15_64 || 0), 0),
			color: 'hsl(217, 91%, 60%)'
		},
		{
			label: '65+ years',
			value: sitios.reduce((sum, s) => sum + (s.demographics?.age_65_above || 0), 0),
			color: 'hsl(280, 70%, 60%)'
		}
	];

	// Social services aggregation
	const totalVoters = sitios.reduce(
		(sum, s) => sum + (s.social_services?.registered_voters || 0),
		0
	);
	const totalPhilhealth = sitios.reduce(
		(sum, s) => sum + (s.social_services?.philhealth_beneficiaries || 0),
		0
	);
	const total4Ps = sitios.reduce(
		(sum, s) => sum + (s.social_services?.fourps_beneficiaries || 0),
		0
	);

	// Agriculture data
	const totalFarmers = sitios.reduce((sum, s) => sum + (s.agriculture?.farmers_count || 0), 0);
	const totalFarmArea = sitios.reduce(
		(sum, s) => sum + (s.agriculture?.farm_area_hectares || 0),
		0
	);

	function handleExportReport() {
		// Download PDF for all projects
		downloadProjectMonitoringPDF(projects, '3rd');
	}
</script>

<svelte:head>
	<title>Admin Dashboard - South Cotabato Data Bank</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<AdminHeader title="Dashboard" description="Overview of projects, sitios, and activities">
		{#snippet actions()}
			<Button variant="outline" size="sm" class="hidden" onclick={handleExportReport}>
				<Download class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Export Report</span>
			</Button>
			<Button size="sm" href="/admin/projects/new">
				<Plus class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">New Project</span>
			</Button>
		{/snippet}
	</AdminHeader>

	<!-- Content -->
	<div class="flex-1 space-y-6 p-6">
		<!-- Stats Grid -->
		<DashboardStats {stats} {isLoading} onTabChange={(tab) => (activeTab = tab)} />

		<!-- Charts Section with Tabs -->
		<Card.Card class="shadow-sm">
			<Card.CardHeader>
				<div class="flex items-center justify-between">
					<div>
						<Card.CardTitle class="text-xl font-semibold">Analytics Overview</Card.CardTitle>
						<Card.CardDescription>Comprehensive project and resource analytics</Card.CardDescription
						>
					</div>
					<div class="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							href={activeTab === 'sitios' ? '/sitios' : '/projects'}
						>
							<ExternalLink class="mr-2 size-4" />
							View More Info
						</Button>
						<div class="rounded-full bg-primary/10 p-2">
							<ChartColumn class="size-5 text-primary" />
						</div>
					</div>
				</div>
			</Card.CardHeader>
			<Card.CardContent>
				{#if isLoading}
					<div class="grid gap-6 lg:grid-cols-2">
						<Skeleton class="h-[300px] w-full rounded-lg" />
						<Skeleton class="h-[300px] w-full rounded-lg" />
					</div>
				{:else}
					<Tabs.Root bind:value={activeTab} class="w-full">
						<Tabs.List class="grid w-full grid-cols-5">
							<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
							<Tabs.Trigger value="sitios">Sitios</Tabs.Trigger>
							<Tabs.Trigger value="geographic">Geographic</Tabs.Trigger>
							<Tabs.Trigger value="budget">Budget</Tabs.Trigger>
							<Tabs.Trigger value="employment">Employment</Tabs.Trigger>
						</Tabs.List>

						<Tabs.Content value="overview" class="mt-6">
							<OverviewTab
								{statusChartData}
								{categoryChartData}
								{monthlyProgressSeries}
								{monthlyProgressCategories}
								totalProjects={stats.total_projects ?? 0}
								{recentProjects}
								{activities}
								{isLoading}
							/>
						</Tabs.Content>

						<Tabs.Content value="sitios" class="mt-6">
							<SitiosTab
								{totalPopulation}
								{totalHouseholds}
								{totalVoters}
								{totalFarmers}
								{totalFarmArea}
								{totalPhilhealth}
								{total4Ps}
								{demographicsChartData}
								{ageDistribution}
								{sitiosByMunicipality}
								{populationByMunicipality}
							/>
						</Tabs.Content>

						<Tabs.Content value="geographic" class="mt-6">
							<GeographicTab {municipalityChartData} />
						</Tabs.Content>

						<Tabs.Content value="budget" class="mt-6">
							<BudgetTab {topBudgetCategories} totalBudget={stats.total_budget} />
						</Tabs.Content>

						<Tabs.Content value="employment" class="mt-6">
							<EmploymentTab
								{employmentChartData}
								{employmentByCategory}
								totalEmployment={totalMaleEmployment + totalFemaleEmployment}
							/>
						</Tabs.Content>
					</Tabs.Root>
				{/if}
			</Card.CardContent>
		</Card.Card>
	</div>
</div>
