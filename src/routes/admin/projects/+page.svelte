<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Progress } from '$lib/components/ui/progress';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { projects } from '$lib/mock-data';
	import type { ProjectStatus } from '$lib/types';
	import {
		ArrowDownUp,
		Download,
		Eye,
		Plus,
		RefreshCw,
		Search,
		SquarePen,
		Trash2,
		X
	} from '@lucide/svelte';

	// State
	let searchQuery = $state('');
	let statusFilter = $state<string>('');
	let categoryFilter = $state<string>('');
	let currentPage = $state(1);
	let sortBy = $state<'title' | 'budget' | 'progress' | 'status'>('title');
	let sortOrder = $state<'asc' | 'desc'>('asc');
	const itemsPerPage = 10;

	// Get unique categories
	const categories = $derived([...new Set(projects.map((p) => p.category))]);

	// Filter and sort projects
	const filteredProjects = $derived.by(() => {
		const filtered = projects.filter((project) => {
			const matchesSearch =
				!searchQuery ||
				project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.sitio_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.municipality.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesStatus = !statusFilter || project.status === statusFilter;
			const matchesCategory = !categoryFilter || project.category === categoryFilter;

			return matchesSearch && matchesStatus && matchesCategory;
		});

		// Sort projects
		return filtered.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case 'title':
					comparison = a.title.localeCompare(b.title);
					break;
				case 'budget':
					const budgetA = a.monitoring?.allotment?.total ?? a.budget;
					const budgetB = b.monitoring?.allotment?.total ?? b.budget;
					comparison = budgetA - budgetB;
					break;
				case 'progress':
					const progressA = a.monitoring?.physical?.actual ?? a.completion_percentage;
					const progressB = b.monitoring?.physical?.actual ?? b.completion_percentage;
					comparison = progressA - progressB;
					break;
				case 'status':
					comparison = a.status.localeCompare(b.status);
					break;
			}
			return sortOrder === 'asc' ? comparison : -comparison;
		});
	});

	// Paginate
	const paginatedProjects = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredProjects.slice(start, start + itemsPerPage);
	});

	const totalPages = $derived(Math.ceil(filteredProjects.length / itemsPerPage));

	// Helper functions
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 0
		}).format(amount);
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

	function truncateText(text: string, maxLength: number): string {
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	}

	function resetFilters() {
		searchQuery = '';
		statusFilter = '';
		categoryFilter = '';
		currentPage = 1;
	}

	function toggleSort(column: typeof sortBy) {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'asc';
		}
	}

	function handleDelete(id: number) {
		if (confirm('Are you sure you want to delete this project?')) {
			// In a real app, this would call an API
			console.log('Delete project:', id);
		}
	}

	function handleExport() {
		console.log('Export projects');
	}

	function handleRefresh() {
		console.log('Refresh table');
	}
</script>

<svelte:head>
	<title>Project Management - South Cotabato Data Bank</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<header class="border-b bg-card">
		<div class="flex items-center justify-between p-6">
			<div>
				<h1 class="text-3xl font-bold">Project Management</h1>
				<p class="text-muted-foreground">Manage and monitor all projects</p>
			</div>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={handleExport}>
					<Download class="mr-2" />
					Export
				</Button>
				<Button size="sm" href="/admin/projects/new">
					<Plus class="mr-2" />
					Add Project
				</Button>
			</div>
		</div>
	</header>

	<!-- Content -->
	<div class="flex-1 space-y-6 p-6">
		<!-- Filters -->
		<Card.Card class="shadow-sm">
			<Card.CardContent class="">
				<div class="flex flex-wrap gap-4">
					<!-- Search -->
					<div class="min-w-[300px] flex-1">
						<div class="relative">
							<Search
								class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								type="text"
								placeholder="Search projects..."
								bind:value={searchQuery}
								class="pl-9"
							/>
						</div>
					</div>

					<!-- Status Filter -->
					<div class="w-[180px]">
						<Select.Root type="single" bind:value={statusFilter}>
							<Select.Trigger class="w-full">
								{statusFilter ? getStatusLabel(statusFilter as ProjectStatus) : 'All Status'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="All Status">All Status</Select.Item>
								<Select.Item value="planning" label="Planning">Planning</Select.Item>
								<Select.Item value="in-progress" label="In Progress">In Progress</Select.Item>
								<Select.Item value="completed" label="Completed">Completed</Select.Item>
								<Select.Item value="suspended" label="Suspended">Suspended</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Category Filter -->
					<div class="w-[200px]">
						<Select.Root type="single" bind:value={categoryFilter}>
							<Select.Trigger class="w-full">
								{categoryFilter || 'All Categories'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="All Categories">All Categories</Select.Item>
								{#each categories as category (category)}
									<Select.Item value={category} label={category}>{category}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Clear Button -->
					<Button variant="ghost" size="sm" onclick={resetFilters}>
						<X class="mr-2 size-4" />
						Clear
					</Button>
				</div>
			</Card.CardContent>
		</Card.Card>

		<!-- Table -->
		<Card.Card class="shadow-sm">
			<Card.CardHeader>
				<div class="flex items-center justify-between">
					<Card.CardTitle class="text-xl font-semibold"
						>All Projects ({filteredProjects.length})</Card.CardTitle
					>
					<Button variant="ghost" size="icon" onclick={handleRefresh}>
						<RefreshCw class="size-4" />
					</Button>
				</div>
			</Card.CardHeader>
			<Card.CardContent class="">
				<div class="overflow-x-auto rounded-md border">
					<Table.Table>
						<Table.TableHeader>
							<Table.TableRow>
								<Table.TableHead class="w-[350px]">
									<button
										class="flex items-center gap-1 hover:text-foreground"
										onclick={() => toggleSort('title')}
									>
										Project
										<ArrowDownUp
											class="size-3 {sortBy === 'title' ? 'opacity-100' : 'opacity-30'}"
										/>
									</button>
								</Table.TableHead>
								<Table.TableHead class="w-[200px]">Location</Table.TableHead>
								<Table.TableHead class="w-[140px]">
									<button
										class="flex items-center gap-1 hover:text-foreground"
										onclick={() => toggleSort('budget')}
									>
										Budget
										<ArrowDownUp
											class="size-3 {sortBy === 'budget' ? 'opacity-100' : 'opacity-30'}"
										/>
									</button>
								</Table.TableHead>
								<Table.TableHead class="w-[120px]">
									<button
										class="flex items-center gap-1 hover:text-foreground"
										onclick={() => toggleSort('progress')}
									>
										Progress
										<ArrowDownUp
											class="size-3 {sortBy === 'progress' ? 'opacity-100' : 'opacity-30'}"
										/>
									</button>
								</Table.TableHead>
								<Table.TableHead class="w-[120px]">
									<button
										class="flex items-center gap-1 hover:text-foreground"
										onclick={() => toggleSort('status')}
									>
										Status
										<ArrowDownUp
											class="size-3 {sortBy === 'status' ? 'opacity-100' : 'opacity-30'}"
										/>
									</button>
								</Table.TableHead>
								<Table.TableHead class="w-[100px] text-right">Actions</Table.TableHead>
							</Table.TableRow>
						</Table.TableHeader>
						<Table.TableBody>
							{#if paginatedProjects.length === 0}
								<Table.TableRow>
									<Table.TableCell colspan={6} class="h-32 text-center">
										<div class="flex flex-col items-center justify-center gap-2">
											<p class="text-muted-foreground">No projects found</p>
										</div>
									</Table.TableCell>
								</Table.TableRow>
							{:else}
								{#each paginatedProjects as project (project.id)}
									{@const monitoring = project.monitoring}
									{@const allotment = monitoring?.allotment}
									{@const physical = monitoring?.physical}
									{@const statusSummary = monitoring?.statusSummary}
									<Table.TableRow class="cursor-pointer hover:bg-accent/10">
										<!-- Project Info -->
										<Table.TableCell>
											<div class="space-y-1">
												<div class="text-sm leading-tight font-medium">
													{truncateText(project.title, 80)}
												</div>
												<div class="text-xs text-muted-foreground">
													{project.category} • FY {project.project_year}
												</div>
											</div>
										</Table.TableCell>

										<!-- Location -->
										<Table.TableCell>
											<div class="space-y-1">
												<div class="text-sm">{project.municipality}</div>
												<div class="text-xs text-muted-foreground">
													{project.sitio_name}
												</div>
											</div>
										</Table.TableCell>

										<!-- Budget -->
										<Table.TableCell>
											<div class="text-sm font-medium">
												{formatCurrency(allotment?.total ?? project.budget)}
											</div>
										</Table.TableCell>

										<!-- Progress -->
										<Table.TableCell>
											<div class="flex items-center gap-2">
												<Progress
													value={Math.min(100, physical?.actual ?? project.completion_percentage)}
													class="w-full"
												/>
												<span class="min-w-10 text-xs text-muted-foreground">
													{(physical?.actual ?? project.completion_percentage).toFixed(0)}%
												</span>
											</div>
										</Table.TableCell>

										<!-- Status -->
										<Table.TableCell>
											<Badge variant={getStatusBadgeVariant(project.status)}>
												{getStatusLabel(project.status)}
											</Badge>
										</Table.TableCell>

										<!-- Actions -->
										<Table.TableCell class="text-right">
											<div class="flex justify-end gap-1">
												<Button variant="ghost" size="icon" href="/projects/{project.id}">
													<Eye class="size-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													href="/admin/projects/{project.id}/edit"
												>
													<SquarePen class="size-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onclick={() => handleDelete(project.id)}
												>
													<Trash2 class="size-4" />
												</Button>
											</div>
										</Table.TableCell>
									</Table.TableRow>
								{/each}
							{/if}
						</Table.TableBody>
					</Table.Table>
				</div>
			</Card.CardContent>

			<!-- Pagination -->
			{#if totalPages > 1}
				<Card.CardFooter class="flex justify-between">
					<div class="text-sm text-muted-foreground">
						Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(
							currentPage * itemsPerPage,
							filteredProjects.length
						)} of {filteredProjects.length} projects
					</div>
					<div class="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage === 1}
							onclick={() => (currentPage = Math.max(1, currentPage - 1))}
						>
							Previous
						</Button>
						<div class="flex items-center gap-1">
							{#each Array(totalPages) as _, i (i)}
								{#if i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
									<Button
										variant={currentPage === i + 1 ? 'default' : 'outline'}
										size="sm"
										onclick={() => (currentPage = i + 1)}
									>
										{i + 1}
									</Button>
								{:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
									<span class="px-2">...</span>
								{/if}
							{/each}
						</div>
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage === totalPages}
							onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
						>
							Next
						</Button>
					</div>
				</Card.CardFooter>
			{/if}
		</Card.Card>
	</div>
</div>
