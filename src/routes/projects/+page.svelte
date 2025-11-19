<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Progress } from '$lib/components/ui/progress';
	import * as Select from '$lib/components/ui/select';
	import { projects } from '$lib/mock-data';
	import type { ProjectStatus } from '$lib/types';
	import { Eye, Search, X } from '@lucide/svelte';

	// State
	let searchQuery = $state('');
	let statusFilter = $state<string>('');
	let categoryFilter = $state<string>('');
	let currentPage = $state(1);
	const itemsPerPage = 12;

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

	function resetFilters() {
		searchQuery = '';
		statusFilter = '';
		categoryFilter = '';
		currentPage = 1;
	}
</script>

<svelte:head>
	<title>Projects - South Cotabato Data Bank</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<header class="border-b bg-card">
		<div class="p-6">
			<h1 class="mb-2 text-3xl font-bold">Development Projects</h1>
			<p class="text-muted-foreground">Browse all development projects across South Cotabato</p>
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

		<!-- Results Count -->
		<div class="text-sm text-muted-foreground">
			Showing {paginatedProjects.length} of {filteredProjects.length} projects
		</div>

		<!-- Projects Grid -->
		{#if paginatedProjects.length === 0}
			<Card.Card class="shadow-sm">
				<Card.CardContent class="py-12 text-center">
					<p class="text-muted-foreground">No projects found matching your criteria</p>
				</Card.CardContent>
			</Card.Card>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each paginatedProjects as project (project.id)}
					{@const monitoring = project.monitoring}
					{@const physical = monitoring?.physical}
					<Card.Card class="group overflow-hidden transition-shadow hover:shadow-lg">
						<Card.CardHeader class="space-y-2">
							<div class="flex items-start justify-between gap-2">
								<Badge variant={getStatusBadgeVariant(project.status)}>
									{getStatusLabel(project.status)}
								</Badge>
								<Badge variant="outline" class="text-xs">
									{project.category}
								</Badge>
							</div>
							<Card.CardTitle class="line-clamp-2 text-lg leading-tight group-hover:text-primary">
								{project.title}
							</Card.CardTitle>
						</Card.CardHeader>

						<Card.CardContent class="space-y-4">
							<p class="line-clamp-3 text-sm text-muted-foreground">
								{project.description}
							</p>

							<div class="space-y-2 text-sm">
								<div class="flex justify-between">
									<span class="text-muted-foreground">Location</span>
									<span class="font-medium">{project.municipality}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Budget</span>
									<span class="font-medium">{formatCurrency(project.budget)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Beneficiaries</span>
									<span class="font-medium">{project.beneficiaries.toLocaleString()} people</span>
								</div>
							</div>

							<div>
								<div class="mb-2 flex items-center justify-between text-sm">
									<span class="text-muted-foreground">Progress</span>
									<span class="font-medium">
										{(physical?.actual ?? project.completion_percentage).toFixed(0)}%
									</span>
								</div>
								<Progress
									value={Math.min(100, physical?.actual ?? project.completion_percentage)}
									class="h-2"
								/>
							</div>
						</Card.CardContent>

						<Card.CardFooter>
							<Button href="/projects/{project.id}" variant="outline" class="w-full">
								<Eye class="mr-2 size-4" />
								View Details
							</Button>
						</Card.CardFooter>
					</Card.Card>
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex justify-center gap-2">
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
		{/if}
	</div>
</div>
