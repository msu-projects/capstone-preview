<script lang="ts">
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import LineChart from '$lib/components/charts/LineChart.svelte';
	import SitioList from '$lib/components/projects/SitioList.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs';
	import { activities, chartData, projects, stats } from '$lib/mock-data';
	import type { ProjectStatus } from '$lib/types';
	import toTitleCase from '$lib/utils/common';
	import { downloadProjectMonitoringPDF } from '$lib/utils/pdf-generator';
	import {
		Activity,
		ArrowRight,
		Banknote,
		BarChart3,
		CircleCheckBig,
		CirclePlus,
		Download,
		FileText,
		MapPin,
		Plus,
		SquarePen,
		TrendingUp,
		Upload,
		Users,
		type IconProps
	} from '@lucide/svelte';
	import type { Component } from 'svelte';
	import { onMount } from 'svelte';

	// Loading state for async data simulation
	let isLoading = $state(false);

	onMount(() => {
		// Simulate loading for future API integration
		// const timer = setTimeout(() => {
		// 	isLoading = false;
		// }, 800);
		// return () => clearTimeout(timer);
	});

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	function formatCurrency(num: number): string {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			notation: 'compact',
			maximumFractionDigits: 1
		}).format(num);
	}

	function truncateText(text: string, maxLength: number): string {
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	}

	function getStatusBadgeVariant(status: ProjectStatus) {
		switch (status) {
			case 'planning':
				return 'secondary' as const;
			case 'in-progress':
				return 'outline' as const;
			case 'completed':
				return 'default' as const;
			case 'suspended':
				return 'destructive' as const;
			default:
				return 'default' as const;
		}
	}

	function getStatusLabel(status: ProjectStatus): string {
		switch (status) {
			case 'planning':
				return 'Planning';
			case 'in-progress':
				return 'In Progress';
			case 'completed':
				return 'Completed';
			case 'suspended':
				return 'Suspended';
			default:
				return status;
		}
	}

	function formatActivityTime(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 60) return `${diffMins} minutes ago`;
		if (diffHours < 24) return `${diffHours} hours ago`;
		return `${diffDays} days ago`;
	}

	function getActivityIcon(iconName: string): Component<IconProps> {
		const iconMap: Record<string, Component<IconProps>> = {
			'plus-circle': CirclePlus,
			edit: SquarePen,
			'map-pin': MapPin,
			upload: Upload,
			'file-text': FileText
		};
		return iconMap[iconName] || Activity;
	}

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
				? 'hsl(var(--muted-foreground))'
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
	const budgetByCategory = [...new Set(projects.map((p) => p.category))].map((cat, i) => ({
		label: cat,
		value: projects.filter((p) => p.category === cat).reduce((sum, p) => sum + p.budget, 0),
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
	const employmentByCategory = [...new Set(projects.map((p) => p.category))]
		.map((cat) => {
			const catProjects = projects.filter((p) => p.category === cat);
			return {
				category: cat,
				male: catProjects.reduce((sum, p) => sum + (p.employment_generated?.male || 0), 0),
				female: catProjects.reduce((sum, p) => sum + (p.employment_generated?.female || 0), 0)
			};
		})
		.sort((a, b) => b.male + b.female - (a.male + a.female))
		.slice(0, 6);

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
			<Button variant="outline" size="sm" onclick={handleExportReport}>
				<Download class="mr-2" />
				Export Report
			</Button>
			<Button size="sm" href="/admin/projects/new">
				<Plus class="mr-2" />
				New Project
			</Button>
		{/snippet}
	</AdminHeader>

	<!-- Content -->
	<div class="flex-1 space-y-6 p-6">
		<!-- Stats Grid -->
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
			{#if isLoading}
				{#each Array(5) as _}
					<Card.Card class="shadow-sm">
						<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton class="h-4 w-24" />
							<Skeleton class="size-9 rounded-full" />
						</Card.CardHeader>
						<Card.CardContent>
							<Skeleton class="mb-2 h-8 w-20" />
							<Skeleton class="h-3 w-28" />
						</Card.CardContent>
					</Card.Card>
				{/each}
			{:else}
				<Card.Card class="shadow-sm">
					<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.CardTitle class="text-sm font-medium text-muted-foreground"
							>Total Sitios</Card.CardTitle
						>
						<div class="rounded-full bg-blue-500/10 p-2">
							<MapPin class="size-5 text-blue-600" />
						</div>
					</Card.CardHeader>
					<Card.CardContent>
						<div class="text-3xl font-bold">{formatNumber(stats.total_sitios)}</div>
						<p class="mt-1 text-xs text-green-600">
							<TrendingUp class="mr-1 inline size-3" />5 added this month
						</p>
					</Card.CardContent>
				</Card.Card>

				<Card.Card class="shadow-sm">
					<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.CardTitle class="text-sm font-medium text-muted-foreground"
							>Active Projects</Card.CardTitle
						>
						<div class="rounded-full bg-yellow-500/10 p-2">
							<Activity class="size-5 text-yellow-600" />
						</div>
					</Card.CardHeader>
					<Card.CardContent>
						<div class="text-3xl font-bold">{formatNumber(stats.active_projects)}</div>
						<p class="mt-1 text-xs text-green-600">
							<TrendingUp class="mr-1 inline size-3" />In progress
						</p>
					</Card.CardContent>
				</Card.Card>

				<Card.Card class="shadow-sm">
					<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.CardTitle class="text-sm font-medium text-muted-foreground"
							>Completed Projects</Card.CardTitle
						>
						<div class="rounded-full bg-green-500/10 p-2">
							<CircleCheckBig class="size-5 text-green-600" />
						</div>
					</Card.CardHeader>
					<Card.CardContent>
						<div class="text-3xl font-bold">{formatNumber(stats.completed_projects)}</div>
						<p class="mt-1 text-xs text-green-600">
							<TrendingUp class="mr-1 inline size-3" />This year
						</p>
					</Card.CardContent>
				</Card.Card>

				<Card.Card class="shadow-sm">
					<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.CardTitle class="text-sm font-medium text-muted-foreground"
							>Total Beneficiaries</Card.CardTitle
						>
						<div class="rounded-full bg-purple-500/10 p-2">
							<Users class="size-5 text-purple-600" />
						</div>
					</Card.CardHeader>
					<Card.CardContent>
						<div class="text-3xl font-bold">{formatNumber(stats.total_beneficiaries)}</div>
						<p class="mt-1 text-xs text-green-600">
							<TrendingUp class="mr-1 inline size-3" />Across all projects
						</p>
					</Card.CardContent>
				</Card.Card>

				<Card.Card class="shadow-sm">
					<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.CardTitle class="text-sm font-medium text-muted-foreground"
							>Total Budget</Card.CardTitle
						>
						<div class="rounded-full bg-emerald-500/10 p-2">
							<Banknote class="size-5 text-emerald-600" />
						</div>
					</Card.CardHeader>
					<Card.CardContent>
						<div class="text-3xl font-bold">{formatCurrency(stats.total_budget)}</div>
						<p class="mt-1 text-xs text-muted-foreground">Allocated funds</p>
					</Card.CardContent>
				</Card.Card>
			{/if}
		</div>

		<!-- Charts Section with Tabs -->
		<Card.Card class="shadow-sm">
			<Card.CardHeader>
				<div class="flex items-center justify-between">
					<div>
						<Card.CardTitle class="text-xl font-semibold">Analytics Overview</Card.CardTitle>
						<Card.CardDescription>Comprehensive project and resource analytics</Card.CardDescription
						>
					</div>
					<div class="rounded-full bg-primary/10 p-2">
						<BarChart3 class="size-5 text-primary" />
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
					<Tabs.Root value="overview" class="w-full">
						<Tabs.List class="grid w-full grid-cols-4">
							<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
							<Tabs.Trigger value="geographic">Geographic</Tabs.Trigger>
							<Tabs.Trigger value="budget">Budget</Tabs.Trigger>
							<Tabs.Trigger value="employment">Employment</Tabs.Trigger>
						</Tabs.List>

						<Tabs.Content value="overview" class="mt-6">
							<div class="grid gap-6 lg:grid-cols-2">
								<!-- Projects by Status Donut -->
								<div class="rounded-lg border bg-card p-4">
									<h3 class="mb-4 text-lg font-semibold">Projects by Status</h3>
									<DonutChart
										data={statusChartData}
										centerLabel="Total Projects"
										centerValue={(stats.total_projects ?? 0).toString()}
										height={280}
									/>
								</div>

								<!-- Monthly Progress Line Chart -->
								<div class="rounded-lg border bg-card p-4">
									<h3 class="mb-4 text-lg font-semibold">Monthly Project Completions</h3>
									<LineChart
										series={monthlyProgressSeries}
										categories={monthlyProgressCategories}
										height={280}
										title="Projects Completed"
									/>
								</div>
							</div>

							<!-- Categories Bar Chart - Full Width -->
							<div class="mt-6 rounded-lg border bg-card p-4">
								<h3 class="mb-4 text-lg font-semibold">Projects by Category</h3>
								<BarChart
									data={categoryChartData}
									orientation="horizontal"
									height={320}
									title="Projects"
								/>
							</div>
						</Tabs.Content>

						<Tabs.Content value="geographic" class="mt-6">
							<div class="rounded-lg border bg-card p-4">
								<h3 class="mb-4 text-lg font-semibold">Projects by Municipality</h3>
								<BarChart
									data={municipalityChartData}
									orientation="vertical"
									height={350}
									title="Projects"
								/>
							</div>
						</Tabs.Content>

						<Tabs.Content value="budget" class="mt-6">
							<div class="grid gap-6 lg:grid-cols-2">
								<!-- Budget by Category Donut -->
								<div class="rounded-lg border bg-card p-4">
									<h3 class="mb-4 text-lg font-semibold">Budget Allocation by Category</h3>
									<DonutChart
										data={topBudgetCategories}
										centerLabel="Total Budget"
										centerValue={formatCurrency(stats.total_budget)}
										height={300}
									/>
								</div>

								<!-- Budget Details Table -->
								<div class="rounded-lg border bg-card p-4">
									<h3 class="mb-4 text-lg font-semibold">Top Categories by Budget</h3>
									<div class="space-y-4">
										{#each topBudgetCategories as cat}
											<div class="space-y-2">
												<div class="flex items-center justify-between text-sm">
													<div class="flex items-center gap-2">
														<div
															class="size-3 rounded-full"
															style="background-color: {cat.color}"
														></div>
														<span class="font-medium">{cat.label}</span>
													</div>
													<span class="font-semibold">{formatCurrency(cat.value)}</span>
												</div>
												<Progress value={(cat.value / stats.total_budget) * 100} class="h-2" />
											</div>
										{/each}
									</div>
								</div>
							</div>
						</Tabs.Content>

						<Tabs.Content value="employment" class="mt-6">
							<div class="grid gap-6 lg:grid-cols-2">
								<!-- Employment Distribution Donut -->
								<div class="rounded-lg border bg-card p-4">
									<h3 class="mb-4 text-lg font-semibold">Employment Distribution</h3>
									<DonutChart
										data={employmentChartData}
										centerLabel="Total Employed"
										centerValue={formatNumber(totalMaleEmployment + totalFemaleEmployment)}
										height={280}
									/>
								</div>

								<!-- Employment by Category -->
								<div class="rounded-lg border bg-card p-4">
									<h3 class="mb-4 text-lg font-semibold">Employment by Category</h3>
									<div class="space-y-4">
										{#each employmentByCategory as cat}
											<div class="space-y-2">
												<div class="flex items-center justify-between text-sm">
													<span class="font-medium">{cat.category}</span>
													<span class="text-muted-foreground">{cat.male + cat.female} total</span>
												</div>
												<div class="flex h-3 overflow-hidden rounded-full bg-muted">
													<div
														class="bg-blue-500"
														style="width: {(cat.male / (cat.male + cat.female)) * 100}%"
														title="Male: {cat.male}"
													></div>
													<div
														class="bg-pink-500"
														style="width: {(cat.female / (cat.male + cat.female)) * 100}%"
														title="Female: {cat.female}"
													></div>
												</div>
												<div class="flex justify-between text-xs text-muted-foreground">
													<span>Male: {cat.male}</span>
													<span>Female: {cat.female}</span>
												</div>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</Tabs.Content>
					</Tabs.Root>
				{/if}
			</Card.CardContent>
		</Card.Card>

		<!-- Main Grid -->
		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Recent Projects -->
			<Card.Card class="shadow-sm lg:col-span-2">
				<Card.CardHeader class="flex flex-row items-center justify-between">
					<Card.CardTitle class="text-xl font-semibold">Recent Projects</Card.CardTitle>
					<a
						href="/admin/projects"
						class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
					>
						View All
						<ArrowRight class="size-4" />
					</a>
				</Card.CardHeader>
				<Card.CardContent>
					{#if isLoading}
						<div class="space-y-3">
							{#each Array(5) as _}
								<div class="flex items-center gap-4">
									<Skeleton class="h-12 flex-1" />
									<Skeleton class="h-12 w-24" />
									<Skeleton class="h-6 w-20" />
									<Skeleton class="h-4 w-32" />
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-md border">
							<Table.Table>
								<Table.TableHeader>
									<Table.TableRow>
										<Table.TableHead>Project</Table.TableHead>
										<Table.TableHead>Location</Table.TableHead>
										<Table.TableHead>Status</Table.TableHead>
										<Table.TableHead>Progress</Table.TableHead>
									</Table.TableRow>
								</Table.TableHeader>
								<Table.TableBody>
									{#each recentProjects as project}
										<Table.TableRow class="cursor-pointer hover:bg-accent/10">
											<Table.TableCell>
												<div class="font-medium">{truncateText(project.title, 40)}</div>
												<div class="text-xs text-muted-foreground">{project.category}</div>
											</Table.TableCell>
											<Table.TableCell>
												{#if project.project_sitios && project.project_sitios.length > 0}
													<SitioList sitios={project.project_sitios} maxVisible={1} />
												{:else}
													<div class="text-sm text-muted-foreground">No sitios</div>
												{/if}
											</Table.TableCell>
											<Table.TableCell>
												<Badge variant={getStatusBadgeVariant(project.status)}>
													{getStatusLabel(project.status)}
												</Badge>
											</Table.TableCell>
											<Table.TableCell>
												<div class="flex items-center gap-2">
													<Progress value={project.completion_percentage} class="w-full" />
													<span class="min-w-12 text-xs text-muted-foreground">
														{project.completion_percentage}%
													</span>
												</div>
											</Table.TableCell>
										</Table.TableRow>
									{/each}
								</Table.TableBody>
							</Table.Table>
						</div>
					{/if}
				</Card.CardContent>
			</Card.Card>

			<!-- Activity Feed -->
			<Card.Card class="shadow-sm">
				<Card.CardHeader>
					<Card.CardTitle class="text-xl font-semibold">Recent Activity</Card.CardTitle>
				</Card.CardHeader>
				<Card.CardContent>
					{#if isLoading}
						<div class="space-y-6">
							{#each Array(5) as _}
								<div class="flex gap-3">
									<Skeleton class="size-10 rounded-full" />
									<div class="flex-1 space-y-2">
										<Skeleton class="h-4 w-24" />
										<Skeleton class="h-3 w-full" />
										<Skeleton class="h-3 w-16" />
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="space-y-6">
							{#each activities as activity}
								{@const ActivityIcon = getActivityIcon(activity.icon)}
								<div class="flex gap-3">
									<div
										class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card"
									>
										<ActivityIcon class="size-4" />
									</div>
									<div class="flex-1 space-y-1">
										<p class="text-sm font-semibold">{activity.user}</p>
										<p class="text-sm text-muted-foreground">
											{activity.action}: {activity.target}
										</p>
										<p class="text-xs text-muted-foreground">
											{formatActivityTime(activity.timestamp)}
										</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</Card.CardContent>
			</Card.Card>
		</div>
	</div>
</div>
