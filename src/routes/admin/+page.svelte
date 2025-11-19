<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import * as Table from '$lib/components/ui/table';
	import { activities, chartData, projects, stats } from '$lib/mock-data';
	import type { ProjectStatus } from '$lib/types';
	import {
		Activity,
		ArrowRight,
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

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	function truncateText(text: string, maxLength: number): string {
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	}

	function getStatusBadgeVariant(status: ProjectStatus) {
		switch (status) {
			case 'planning':
				return 'secondary';
			case 'in-progress':
				return 'warning';
			case 'completed':
				return 'success';
			case 'suspended':
				return 'destructive';
			default:
				return 'default';
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
	const statusBreakdown = [
		{ label: 'Planning', count: stats.planning_projects, color: 'bg-secondary' },
		{ label: 'In Progress', count: stats.active_projects, color: 'bg-yellow-500' },
		{ label: 'Completed', count: stats.completed_projects, color: 'bg-green-500' },
		{ label: 'Suspended', count: stats.suspended_projects, color: 'bg-destructive' }
	];

	const topCategories = chartData.projectsByCategory.sort((a, b) => b.count - a.count).slice(0, 5);
	const maxCategoryCount = Math.max(...topCategories.map((c) => c.count));
</script>

<svelte:head>
	<title>Admin Dashboard - South Cotabato Data Bank</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<header class="border-b bg-card">
		<div class="flex items-center justify-between p-6">
			<h1 class="text-3xl font-bold">Dashboard</h1>
			<div class="flex gap-2">
				<Button variant="outline" size="sm">
					<Download class="mr-2" />
					Export Report
				</Button>
				<Button size="sm" href="/admin/projects/new">
					<Plus class="mr-2" />
					New Project
				</Button>
			</div>
		</div>
	</header>

	<!-- Content -->
	<div class="flex-1 space-y-6 p-6">
		<!-- Stats Grid -->
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
					<div class="rounded-full bg-blue-500/10 p-2">
						<Users class="size-5 text-blue-600" />
					</div>
				</Card.CardHeader>
				<Card.CardContent>
					<div class="text-3xl font-bold">{formatNumber(stats.total_beneficiaries)}</div>
					<p class="mt-1 text-xs text-green-600">
						<TrendingUp class="mr-1 inline size-3" />Across all projects
					</p>
				</Card.CardContent>
			</Card.Card>
		</div>

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
					<div class="rounded-md border">
						<Table.Table>
							<Table.TableHeader>
								<Table.TableRow>
									<Table.TableHead>Project</Table.TableHead>
									<Table.TableHead>Sitio</Table.TableHead>
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
										<Table.TableCell>{project.sitio_name}</Table.TableCell>
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
				</Card.CardContent>
			</Card.Card>

			<!-- Activity Feed -->
			<Card.Card class="shadow-sm">
				<Card.CardHeader>
					<Card.CardTitle class="text-xl font-semibold">Recent Activity</Card.CardTitle>
				</Card.CardHeader>
				<Card.CardContent>
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
				</Card.CardContent>
			</Card.Card>
		</div>

		<!-- Quick Stats -->
		<div class="grid gap-6 md:grid-cols-2">
			<!-- Projects by Status -->
			<Card.Card class="shadow-sm">
				<Card.CardHeader>
					<Card.CardTitle class="text-xl font-semibold">Projects by Status</Card.CardTitle>
				</Card.CardHeader>
				<Card.CardContent>
					<div class="space-y-3">
						{#each statusBreakdown as status}
							<div class="flex items-center justify-between border-b pb-3">
								<div class="flex items-center gap-3">
									<div class="size-3 rounded-full {status.color}"></div>
									<span class="text-sm">{status.label}</span>
								</div>
								<span class="text-lg font-semibold">{status.count}</span>
							</div>
						{/each}
					</div>
				</Card.CardContent>
			</Card.Card>

			<!-- Top Categories -->
			<Card.Card class="shadow-sm">
				<Card.CardHeader>
					<Card.CardTitle class="text-xl font-semibold">Top Categories</Card.CardTitle>
				</Card.CardHeader>
				<Card.CardContent>
					<div class="space-y-4">
						{#each topCategories as category}
							<div class="space-y-1">
								<div class="flex items-center justify-between text-sm">
									<span class="font-medium">{category.category}</span>
									<span class="text-muted-foreground">{category.count}</span>
								</div>
								<Progress value={(category.count / maxCategoryCount) * 100} />
							</div>
						{/each}
					</div>
				</Card.CardContent>
			</Card.Card>
		</div>
	</div>
</div>
