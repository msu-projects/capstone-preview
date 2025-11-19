<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { projects } from '$lib/mock-data';
	import { Download, Edit, Eye, Plus, RefreshCw, Search, Trash2, X } from '@lucide/svelte';

	// State
	let searchQuery = $state('');
	let statusFilter = $state<string>('');
	let categoryFilter = $state<string>('');
	let currentPage = $state(1);
	const itemsPerPage = 10;

	// Get unique categories
	const categories = $derived([...new Set(projects.map((p) => p.category))]);

	// Filter projects
	const filteredProjects = $derived.by(() => {
		return projects.filter((project) => {
			const matchesSearch =
				!searchQuery ||
				project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.sitio_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.municipality.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesStatus = !statusFilter || project.status === statusFilter;
			const matchesCategory = !categoryFilter || project.category === categoryFilter;

			return matchesSearch && matchesStatus && matchesCategory;
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

	function getStatusBadgeVariant(
		status: string
	): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'completed':
				return 'default';
			case 'in-progress':
				return 'secondary';
			case 'suspended':
				return 'destructive';
			case 'planning':
				return 'outline';
			default:
				return 'outline';
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'in-progress':
				return 'In Progress';
			case 'completed':
				return 'Completed';
			case 'suspended':
				return 'Suspended';
			case 'planning':
				return 'Planning';
			default:
				return status;
		}
	}

	function truncateText(text: string, maxLength: number): string {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + '...';
	}

	function resetFilters() {
		searchQuery = '';
		statusFilter = '';
		categoryFilter = '';
		currentPage = 1;
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

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Project Management</h1>
			<p class="text-muted-foreground">Manage and monitor all projects</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" size="sm" onclick={handleExport}>
				<Download class="mr-2 h-4 w-4" />
				Export
			</Button>
			<Button size="sm" href="/admin/projects/new">
				<Plus class="mr-2 h-4 w-4" />
				Add Project
			</Button>
		</div>
	</div>

	<!-- Filters -->
	<Card>
		<CardContent class="pt-6">
			<div class="flex flex-wrap gap-4">
				<!-- Search -->
				<div class="min-w-[300px] flex-1">
					<div class="relative">
						<Search
							class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
					<select
						bind:value={statusFilter}
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">All Status</option>
						<option value="planning">Planning</option>
						<option value="in-progress">In Progress</option>
						<option value="completed">Completed</option>
						<option value="suspended">Suspended</option>
					</select>
				</div>

				<!-- Category Filter -->
				<div class="w-[200px]">
					<select
						bind:value={categoryFilter}
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">All Categories</option>
						{#each categories as category (category)}
							<option value={category}>{category}</option>
						{/each}
					</select>
				</div>

				<!-- Clear Button -->
				<Button variant="ghost" size="sm" onclick={resetFilters}>
					<X class="mr-2 h-4 w-4" />
					Clear
				</Button>
			</div>
		</CardContent>
	</Card>

	<!-- Table -->
	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<CardTitle>All Projects ({filteredProjects.length})</CardTitle>
				<Button variant="ghost" size="icon" onclick={handleRefresh}>
					<RefreshCw class="h-4 w-4" />
				</Button>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead class="w-[300px]">Project</TableHead>
							<TableHead class="w-[200px]">Location</TableHead>
							<TableHead class="w-[180px]">Financial</TableHead>
							<TableHead class="w-[150px]">Progress</TableHead>
							<TableHead class="w-[180px]">Status</TableHead>
							<TableHead class="w-[120px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#if paginatedProjects.length === 0}
							<TableRow>
								<TableCell colspan={6} class="h-32 text-center">
									<div class="flex flex-col items-center justify-center gap-2">
										<p class="text-muted-foreground">No projects found</p>
									</div>
								</TableCell>
							</TableRow>
						{:else}
							{#each paginatedProjects as project (project.id)}
								{@const monitoring = project.monitoring}
								{@const allotment = monitoring?.allotment}
								{@const physical = monitoring?.physical}
								{@const statusSummary = monitoring?.statusSummary}
								<TableRow>
									<!-- Project Info -->
									<TableCell>
										<div class="space-y-1">
											<div class="text-sm leading-tight font-semibold">
												{truncateText(project.title, 70)}
											</div>
											<div class="text-xs text-muted-foreground">
												{project.implementing_agency}
											</div>
											<div class="text-xs text-muted-foreground">
												{project.category} • FY {project.project_year}
											</div>
										</div>
									</TableCell>

									<!-- Location -->
									<TableCell>
										<div class="space-y-1">
											<div class="text-sm">{project.municipality}</div>
											<div class="text-xs text-muted-foreground">
												Sitio: {project.sitio_name}
											</div>
											<div class="text-xs text-muted-foreground">
												Beneficiaries: {project.beneficiaries.toLocaleString()}
											</div>
										</div>
									</TableCell>

									<!-- Financial -->
									<TableCell>
										<div class="space-y-1">
											<div class="text-sm font-medium">
												{formatCurrency(allotment?.total ?? project.budget)}
											</div>
											<div class="text-xs text-muted-foreground">
												Released: {formatCurrency(allotment?.released ?? 0)}
											</div>
											{#if allotment?.total}
												{@const utilization = Math.min(
													100,
													((monitoring?.expenditure?.obligations ?? 0) / allotment.total) * 100
												)}
												<div class="text-xs text-muted-foreground">
													Utilization: {utilization.toFixed(1)}%
												</div>
											{/if}
										</div>
									</TableCell>

									<!-- Progress -->
									<TableCell>
										<div class="space-y-2">
											<div class="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
												<div
													class="h-full bg-primary transition-all"
													style="width: {Math.min(
														100,
														physical?.actual ?? project.completion_percentage
													)}%"
												></div>
											</div>
											<div class="flex justify-between text-xs text-muted-foreground">
												<span>
													Actual: {(physical?.actual ?? project.completion_percentage).toFixed(0)}%
												</span>
											</div>
											{#if physical?.slippage}
												<div class="text-xs" class:text-destructive={physical.slippage < 0}>
													Slippage: {physical.slippage.toFixed(1)}%
												</div>
											{/if}
										</div>
									</TableCell>

									<!-- Status -->
									<TableCell>
										<div class="space-y-2">
											<Badge variant={getStatusBadgeVariant(project.status)}>
												{getStatusLabel(project.status)}
											</Badge>
											{#if statusSummary?.stage}
												<div class="text-xs font-medium">{statusSummary.stage}</div>
											{/if}
											{#if statusSummary?.issues}
												<div class="line-clamp-2 text-xs text-muted-foreground">
													{statusSummary.issues}
												</div>
											{/if}
										</div>
									</TableCell>

									<!-- Actions -->
									<TableCell class="text-right">
										<div class="flex justify-end gap-1">
											<Button variant="ghost" size="icon" href="/projects/{project.id}">
												<Eye class="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="icon" href="/admin/projects/{project.id}/edit">
												<Edit class="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="icon" onclick={() => handleDelete(project.id)}>
												<Trash2 class="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							{/each}
						{/if}
					</TableBody>
				</Table>
			</div>
		</CardContent>

		<!-- Pagination -->
		{#if totalPages > 1}
			<CardFooter class="flex justify-between">
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
			</CardFooter>
		{/if}
	</Card>
</div>
