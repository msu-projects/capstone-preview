<script lang="ts">
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import ActivityFeed from '$lib/components/admin/dashboard/ActivityFeed.svelte';
	import DashboardStats from '$lib/components/admin/dashboard/DashboardStats.svelte';
	import RecentProjectsTable from '$lib/components/admin/dashboard/RecentProjectsTable.svelte';
	import StaleProjectsCard from '$lib/components/admin/dashboard/StaleProjectsCard.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import LineChart from '$lib/components/charts/LineChart.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { chartData, projects, stats } from '$lib/mock-data';
	import { authStore } from '$lib/stores/auth.svelte';
	import { loadAuditLogs } from '$lib/utils/audit';
	import { downloadProjectMonitoringPDF } from '$lib/utils/pdf-generator';
	import { ArrowRight, ChartColumn, Download, ExternalLink, Plus } from '@lucide/svelte';

	// Loading state for async data simulation
	let isLoading = $state(false);

	// Sitios recording progress - target of 500 sitios
	const targetSitios = 500;
	const sitiosProgress = Math.round((stats.total_sitios / targetSitios) * 100);

	// Recent projects - sorted by updated_at descending
	const recentProjects = [...projects]
		.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
		.slice(0, 5);

	// Recent activities from audit logs
	const recentActivities = loadAuditLogs().reverse().slice(0, 10);

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

	// Monthly progress line chart data
	const monthlyProgressSeries = [
		{
			name: 'Completed Projects',
			data: chartData.monthlyProgress.map((item) => item.completed as number)
		}
	];
	const monthlyProgressCategories = chartData.monthlyProgress.map((item) => item.month as string);

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
			{#if authStore.canPerform('projects', 'write')}
				<Button size="sm" href="/admin/projects/new">
					<Plus class="size-4 sm:mr-2" />
					<span class="hidden sm:inline">New Project</span>
				</Button>
			{/if}
		{/snippet}
	</AdminHeader>

	<!-- Content -->
	<div class="flex-1 space-y-6 p-6">
		<!-- Stats Grid -->
		<DashboardStats {stats} {isLoading} />

		<!-- Analytics Overview -->
		<Card.Card class="shadow-sm">
			<Card.CardHeader>
				<div class="flex items-center justify-between">
					<div>
						<Card.CardTitle class="text-xl font-semibold">Analytics Overview</Card.CardTitle>
						<Card.CardDescription
							>Project status, progress, and sitio recording</Card.CardDescription
						>
					</div>
					<div class="flex items-center gap-2">
						<Button variant="outline" size="sm" href="/admin/projects">
							<ExternalLink class="mr-2 size-4" />
							View All Projects
						</Button>
						<div class="rounded-full bg-primary/10 p-2">
							<ChartColumn class="size-5 text-primary" />
						</div>
					</div>
				</div>
			</Card.CardHeader>
			<Card.CardContent>
				{#if isLoading}
					<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<Skeleton class="h-80 w-full rounded-lg" />
						<Skeleton class="h-80 w-full rounded-lg" />
						<Skeleton class="h-80 w-full rounded-lg" />
					</div>
				{:else}
					<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<!-- Projects by Status -->
						<div class="flex h-80 flex-col rounded-lg border bg-card p-4">
							<h3 class="mb-4 text-lg font-semibold">Projects by Status</h3>
							<div class="flex flex-1 items-center justify-center">
								<DonutChart
									data={statusChartData}
									height={220}
									showLegend={true}
									centerValue={String(stats.total_projects)}
									centerLabel="Total"
								/>
							</div>
						</div>

						<!-- Monthly Project Completions -->
						<div class="flex h-80 flex-col rounded-lg border bg-card p-4">
							<h3 class="mb-4 text-lg font-semibold">Monthly Completions</h3>
							<div class="flex-1">
								<LineChart
									series={[{ ...monthlyProgressSeries[0], color: 'hsl(142, 71%, 45%)' }]}
									categories={monthlyProgressCategories}
									height={240}
								/>
							</div>
						</div>

						<!-- Sitios Recording Progress -->
						<div class="flex h-80 flex-col rounded-lg border bg-card p-4">
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-lg font-semibold">Sitios Recorded</h3>
								<a
									href="/admin/sitios"
									class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
								>
									View All
									<ArrowRight class="size-4" />
								</a>
							</div>
							<div class="flex flex-1 flex-col items-center justify-center gap-4">
								<!-- Circular Progress Indicator -->
								<div class="relative flex size-40 items-center justify-center">
									<svg class="size-full -rotate-90" viewBox="0 0 100 100">
										<!-- Background circle -->
										<circle
											cx="50"
											cy="50"
											r="42"
											fill="none"
											stroke="currentColor"
											class="text-muted/30"
											stroke-width="8"
										/>
										<!-- Progress circle -->
										<circle
											cx="50"
											cy="50"
											r="42"
											fill="none"
											stroke="hsl(217, 91%, 60%)"
											stroke-width="8"
											stroke-linecap="round"
											stroke-dasharray="{(sitiosProgress / 100) * 264} 264"
											class="transition-all duration-500"
										/>
									</svg>
									<div class="absolute flex flex-col items-center justify-center">
										<span class="text-3xl font-bold">{sitiosProgress}%</span>
										<span class="text-xs text-muted-foreground">Complete</span>
									</div>
								</div>

								<!-- Stats below circle -->
								<div class="flex w-full items-center justify-center gap-6 text-center">
									<div>
										<p class="text-2xl font-bold text-primary">{stats.total_sitios}</p>
										<p class="text-xs text-muted-foreground">Recorded</p>
									</div>
									<div class="h-8 w-px bg-border"></div>
									<div>
										<p class="text-2xl font-bold">{targetSitios}</p>
										<p class="text-xs text-muted-foreground">Target</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</Card.CardContent>
		</Card.Card>

		<!-- Projects Needing Update -->
		<StaleProjectsCard {projects} {isLoading} staleDays={30} />

		<!-- Recent Projects & Activity -->
		<div class="grid gap-6 lg:grid-cols-3">
			<RecentProjectsTable projects={recentProjects} {isLoading} />
			<ActivityFeed activities={recentActivities} {isLoading} />
		</div>
	</div>
</div>
