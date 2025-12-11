<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import AppBreadcrumb from '$lib/components/AppBreadcrumb.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Progress } from '$lib/components/ui/progress';
	import * as Select from '$lib/components/ui/select';
	import { categories } from '$lib/config/project-categories';
	import { getStatusBadgeVariant, getStatusLabel } from '$lib/config/status-config';
	import type { CategoryKey, Project, ProjectStatus } from '$lib/types';
	import { formatCurrency } from '$lib/utils/formatters';
	import { getCategoryName, getCompletionPercentage } from '$lib/utils/project-calculations';
	import { loadProjects } from '$lib/utils/storage';
	import { ArrowLeft, Eye, FolderKanban, Search, X } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let projects = $state<Project[]>([]);
	let isLoading = $state(true);

	// State - initialize from URL query params
	let searchQuery = $state($page.url.searchParams.get('search') || '');
	let statusFilter = $state<string>($page.url.searchParams.get('status') || '');
	let categoryFilter = $state<CategoryKey | ''>(
		($page.url.searchParams.get('category') as CategoryKey) || ''
	);
	let sortBy = $state<string>($page.url.searchParams.get('sort') || 'name');
	let currentPage = $state(Number($page.url.searchParams.get('page')) || 1);
	const itemsPerPage = 12;

	onMount(() => {
		projects = loadProjects();
		isLoading = false;
	});

	// Update URL when filters change
	function updateUrl() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (statusFilter) params.set('status', statusFilter);
		if (categoryFilter) params.set('category', categoryFilter);
		if (sortBy !== 'name') params.set('sort', sortBy);
		if (currentPage > 1) params.set('page', currentPage.toString());

		const newUrl = params.toString() ? `?${params.toString()}` : '/projects/list';
		goto(newUrl, { replaceState: true, noScroll: true });
	}

	// Sync URL whenever filters change
	$effect(() => {
		// Track dependencies
		searchQuery;
		statusFilter;
		categoryFilter;
		sortBy;
		currentPage;
		// Update URL
		updateUrl();
	});

	// Get unique categories from config
	const categoryOptions = categories.map((c) => ({ key: c.key, name: c.name }));

	// Filter projects
	const filteredProjects = $derived.by(() => {
		let filtered = projects.filter((project) => {
			const matchesSearch =
				!searchQuery ||
				project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(project.project_sitios?.some(
					(s) =>
						s.sitio_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						s.municipality.toLowerCase().includes(searchQuery.toLowerCase())
				) ??
					false);

			const matchesStatus = !statusFilter || project.status === statusFilter;
			const matchesCategory = !categoryFilter || project.category_key === categoryFilter;

			return matchesSearch && matchesStatus && matchesCategory;
		});

		// Sort the filtered results
		return filtered.sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.title.localeCompare(b.title);
				case 'budget-high':
					return b.project_cost - a.project_cost;
				case 'budget-low':
					return a.project_cost - b.project_cost;
				case 'beneficiaries-high':
					return b.beneficiaries - a.beneficiaries;
				case 'beneficiaries-low':
					return a.beneficiaries - b.beneficiaries;
				case 'progress-high':
					return getCompletionPercentage(b) - getCompletionPercentage(a);
				case 'progress-low':
					return getCompletionPercentage(a) - getCompletionPercentage(b);
				case 'date-newest':
					return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
				case 'date-oldest':
					return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
				default:
					return 0;
			}
		});
	});

	// Paginate
	const paginatedProjects = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredProjects.slice(start, start + itemsPerPage);
	});

	const totalPages = $derived(Math.ceil(filteredProjects.length / itemsPerPage));

	function resetFilters() {
		searchQuery = '';
		statusFilter = '';
		categoryFilter = '';
		sortBy = 'name';
		currentPage = 1;
	}

	function handleSortChange(value: string | undefined) {
		sortBy = value || 'name';
		currentPage = 1;
	}
</script>

<svelte:head>
	<title>Project List - South Cotabato Data Bank</title>
	<meta name="description" content="Browse all development projects across South Cotabato" />
</svelte:head>

<div class="min-h-screen bg-muted/30 dark:bg-slate-950">
	<!-- Breadcrumb -->
	<AppBreadcrumb
		items={[{ label: 'Projects Dashboard', href: '/projects' }, { label: 'All Projects' }]}
	/>

	<!-- Header -->
	<header class="border-b bg-card">
		<div class="container mx-auto px-4 py-6">
			<div class="flex items-center gap-4">
				<Button href="/projects" variant="ghost" size="icon" class="shrink-0">
					<ArrowLeft class="size-5" />
				</Button>
				<div class="flex-1">
					<h1 class="mb-2 text-3xl font-bold">Development Projects</h1>
					<p class="text-muted-foreground">Browse all development projects across South Cotabato</p>
				</div>
			</div>
		</div>
	</header>

	<!-- Content -->
	<div class="container mx-auto flex-1 space-y-6 px-4 py-6">
		<!-- Filters -->
		<Card.Root class="border-0 shadow-sm">
			<Card.Content class="">
				<div class="flex flex-wrap gap-4">
					<!-- Search -->
					<div class="min-w-20 flex-1">
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
								<Select.Item value="preparation" label="Preparation">Preparation</Select.Item>
								<Select.Item value="ongoing" label="On Going">On Going</Select.Item>
								<Select.Item value="completed" label="Completed">Completed</Select.Item>
								<Select.Item value="delayed" label="Delayed">Delayed</Select.Item>
								<Select.Item value="non-completion" label="Non-completion"
									>Non-completion</Select.Item
								>
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Category Filter -->
					<div class="w-[200px]">
						<Select.Root type="single" bind:value={categoryFilter}>
							<Select.Trigger class="w-full">
								{categoryFilter ? getCategoryName(categoryFilter as CategoryKey) : 'All Categories'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="All Categories">All Categories</Select.Item>
								{#each categoryOptions as category (category.key)}
									<Select.Item value={category.key} label={category.name}
										>{category.name}</Select.Item
									>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Sort Filter -->
					<div class="min-w-60">
						<Select.Root type="single" value={sortBy} onValueChange={handleSortChange}>
							<Select.Trigger class="w-full">
								{#if sortBy === 'name'}
									Sort: Name (A-Z)
								{:else if sortBy === 'budget-high'}
									Sort: Budget (High-Low)
								{:else if sortBy === 'budget-low'}
									Sort: Budget (Low-High)
								{:else if sortBy === 'beneficiaries-high'}
									Sort: Beneficiaries (High-Low)
								{:else if sortBy === 'beneficiaries-low'}
									Sort: Beneficiaries (Low-High)
								{:else if sortBy === 'progress-high'}
									Sort: Progress (High-Low)
								{:else if sortBy === 'progress-low'}
									Sort: Progress (Low-High)
								{:else if sortBy === 'date-newest'}
									Sort: Date (Newest)
								{:else if sortBy === 'date-oldest'}
									Sort: Date (Oldest)
								{/if}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="name">Name (A-Z)</Select.Item>
								<Select.Item value="budget-high">Budget (High-Low)</Select.Item>
								<Select.Item value="budget-low">Budget (Low-High)</Select.Item>
								<Select.Item value="beneficiaries-high">Beneficiaries (High-Low)</Select.Item>
								<Select.Item value="beneficiaries-low">Beneficiaries (Low-High)</Select.Item>
								<Select.Item value="progress-high">Progress (High-Low)</Select.Item>
								<Select.Item value="progress-low">Progress (Low-High)</Select.Item>
								<Select.Item value="date-newest">Date (Newest)</Select.Item>
								<Select.Item value="date-oldest">Date (Oldest)</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Clear Button -->
					<Button variant="ghost" size="sm" onclick={resetFilters}>
						<X class="mr-2 size-4" />
						Clear
					</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Results Count -->
		<div class="text-sm text-muted-foreground">
			Showing {paginatedProjects.length} of {filteredProjects.length} projects
		</div>

		<!-- Loading State -->
		{#if isLoading}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each Array(6) as _}
					<Card.Root class="overflow-hidden">
						<Card.Header class="space-y-2">
							<div class="flex items-start justify-between gap-2">
								<div class="h-5 w-20 animate-pulse rounded bg-slate-200"></div>
								<div class="h-5 w-24 animate-pulse rounded bg-slate-200"></div>
							</div>
							<div class="h-6 w-full animate-pulse rounded bg-slate-200"></div>
						</Card.Header>
						<Card.Content class="space-y-4">
							<div class="h-16 w-full animate-pulse rounded bg-slate-200"></div>
							<div class="space-y-2">
								<div class="h-4 w-full animate-pulse rounded bg-slate-200"></div>
								<div class="h-4 w-3/4 animate-pulse rounded bg-slate-200"></div>
							</div>
							<div class="h-2 w-full animate-pulse rounded bg-slate-200"></div>
						</Card.Content>
						<Card.Footer>
							<div class="h-9 w-full animate-pulse rounded bg-slate-200"></div>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>
		{:else if paginatedProjects.length === 0}
			<!-- Empty State -->
			<Card.Root class="border-0 py-16 text-center shadow-sm">
				<Card.Content>
					<div
						class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100"
					>
						<FolderKanban class="size-8 text-slate-400" />
					</div>
					<h3 class="text-lg font-semibold text-slate-900">No Projects Found</h3>
					<p class="mt-2 text-muted-foreground">No projects match your search criteria</p>
					<Button onclick={resetFilters} class="mt-4">Clear Filters</Button>
				</Card.Content>
			</Card.Root>
		{:else}
			<!-- Projects Grid -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each paginatedProjects as project (project.id)}
					{@const completionPct = getCompletionPercentage(project)}
					<Card.Root
						class="group overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-lg"
					>
						<Card.Header class="space-y-2">
							<div class="flex items-start justify-between gap-2">
								<Badge variant={getStatusBadgeVariant(project.status)}>
									{getStatusLabel(project.status)}
								</Badge>
								<Badge variant="outline" class="text-xs">
									{getCategoryName(project.category_key)}
								</Badge>
							</div>
							<Card.Title class="line-clamp-2 text-lg leading-tight group-hover:text-primary">
								{project.title}
							</Card.Title>
						</Card.Header>

						<Card.Content class="space-y-4">
							<p class="line-clamp-3 text-sm text-muted-foreground">
								{project.description}
							</p>

							<div class="space-y-2 text-sm">
								<div class="flex justify-between">
									<span class="text-muted-foreground">Location</span>
									<span class="font-medium">
										{#if project.project_sitios && project.project_sitios.length > 0}
											{project.project_sitios[0].municipality}
											{#if project.project_sitios.length > 1}
												+{project.project_sitios.length - 1} more
											{/if}
										{:else}
											N/A
										{/if}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Budget</span>
									<span class="font-medium">{formatCurrency(project.project_cost)}</span>
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
										{completionPct.toFixed(0)}%
									</span>
								</div>
								<Progress value={Math.min(100, completionPct)} class="h-2" />
							</div>
						</Card.Content>

						<Card.Footer>
							<Button href="/projects/{project.id}" variant="outline" class="w-full">
								<Eye class="mr-2 size-4" />
								View Details
							</Button>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>

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
		{/if}
	</div>
</div>
