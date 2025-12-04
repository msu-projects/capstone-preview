<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import DeleteProjectDialog from '$lib/components/admin/projects/DeleteProjectDialog.svelte';
	import ProjectsFilters from '$lib/components/admin/projects/ProjectsFilters.svelte';
	import ProjectsTable from '$lib/components/admin/projects/ProjectsTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { categories } from '$lib/config/project-categories';
	import { projects } from '$lib/mock-data';
	import { downloadProjectMonitoringPDF, downloadSingleProjectPDF } from '$lib/utils/pdf-generator';
	import { getCategoryName, getCompletionPercentage } from '$lib/utils/project-calculations';
	import { Download, Plus } from '@lucide/svelte';
	import { onMount, tick, untrack } from 'svelte';

	// State
	let searchQuery = $state('');
	let statusFilter = $state<string>('');
	let categoryFilter = $state<string>('');
	let currentPage = $state(1);
	let sortBy = $state<'title' | 'budget' | 'progress' | 'status' | 'updated'>('updated');
	let sortOrder = $state<'asc' | 'desc'>('desc');
	const itemsPerPage = 10;
	let deleteDialogOpen = $state(false);
	let projectToDelete = $state<number | null>(null);

	// Get unique categories from config
	const categoryOptions = categories.map((c) => c.name);

	// Initialize filters from URL query params
	function initFromUrl() {
		const params = $page.url.searchParams;
		searchQuery = params.get('search') || '';
		statusFilter = params.get('status') || '';
		categoryFilter = params.get('category') || '';
		currentPage = parseInt(params.get('page') || '1', 10);
		const urlSortBy = params.get('sortBy');
		if (urlSortBy && ['title', 'budget', 'progress', 'status', 'updated'].includes(urlSortBy)) {
			sortBy = urlSortBy as typeof sortBy;
		}
		const urlSortOrder = params.get('sortOrder');
		if (urlSortOrder && ['asc', 'desc'].includes(urlSortOrder)) {
			sortOrder = urlSortOrder as 'asc' | 'desc';
		}
	}

	// Sync filters to URL
	function syncToUrl() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (statusFilter) params.set('status', statusFilter);
		if (categoryFilter) params.set('category', categoryFilter);
		if (currentPage > 1) params.set('page', currentPage.toString());
		if (sortBy !== 'updated') params.set('sortBy', sortBy);
		if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

		const queryString = params.toString();
		const newUrl = queryString ? `?${queryString}` : $page.url.pathname;

		tick().then(() => {
			replaceState(newUrl, {});
		});
	}

	// Sync URL when filters change
	$effect(() => {
		// Track all filter values
		searchQuery;
		statusFilter;
		categoryFilter;
		currentPage;
		sortBy;
		sortOrder;
		// Only sync after initial mount
		untrack(() => {
			syncToUrl();
		});
	});

	onMount(() => {
		initFromUrl();
	});

	// Filter and sort projects
	const filteredProjects = $derived.by(() => {
		const filtered = projects.filter((project) => {
			let matchesSearch = !searchQuery;

			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const titleMatch = project.title.toLowerCase().includes(query);

				// Search through project_sitios if available
				const sitioMatch = project.project_sitios
					? project.project_sitios.some(
							(s) =>
								s.sitio_name.toLowerCase().includes(query) ||
								s.municipality.toLowerCase().includes(query) ||
								s.barangay.toLowerCase().includes(query)
						)
					: false;

				matchesSearch = titleMatch || sitioMatch;
			}

			const matchesStatus = !statusFilter || project.status === statusFilter;
			const matchesCategory =
				!categoryFilter || getCategoryName(project.category_key) === categoryFilter;

			return matchesSearch && matchesStatus && matchesCategory;
		});

		// Sort projects
		return filtered.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case 'updated':
					const dateA = new Date(a.updated_at).getTime();
					const dateB = new Date(b.updated_at).getTime();
					comparison = dateA - dateB;
					break;
				case 'title':
					comparison = a.title.localeCompare(b.title);
					break;
				case 'budget':
					comparison = a.total_budget - b.total_budget;
					break;
				case 'progress':
					const progressA = getCompletionPercentage(a);
					const progressB = getCompletionPercentage(b);
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

	// Event handlers
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
		projectToDelete = id;
		deleteDialogOpen = true;
	}

	function confirmDelete() {
		if (projectToDelete !== null) {
			// In a real app, this would call an API
			console.log('Delete project:', projectToDelete);
			projectToDelete = null;
		}
		deleteDialogOpen = false;
	}

	function handleExport() {
		// Download PDF for all filtered projects
		const projectsToExport = filteredProjects.length > 0 ? filteredProjects : projects;
		downloadProjectMonitoringPDF(projectsToExport, '3rd');
	}

	function handleRefresh() {
		console.log('Refresh table');
	}

	function handleDownloadPDF(projectId: number) {
		const project = projects.find((p) => p.id === projectId);
		if (project) {
			const fileName = `${project.title.replace(/[^a-z0-9]/gi, '_')}_Report.pdf`;
			downloadSingleProjectPDF(project, fileName);
		}
	}

	function handleQuickEdit(projectId: number) {
		// Navigate to quick edit - could open a dialog/drawer in the future
		window.location.href = `/admin/projects/${projectId}/quick-edit`;
	}
</script>

<svelte:head>
	<title>Project Management - South Cotabato Data Bank</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<AdminHeader title="Project Management" description="Manage and monitor all projects">
		{#snippet actions()}
			<Button variant="outline" size="sm" onclick={handleExport}>
				<Download class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Export</span>
			</Button>
			<Button size="sm" href="/admin/projects/new">
				<Plus class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Add Project</span>
			</Button>
		{/snippet}
	</AdminHeader>

	<!-- Content -->
	<div class="flex-1 space-y-6 p-6">
		<!-- Filters -->
		<ProjectsFilters
			bind:searchQuery
			bind:statusFilter
			bind:categoryFilter
			categories={categoryOptions}
			onReset={resetFilters}
		/>

		<!-- Table -->
		<ProjectsTable
			projects={paginatedProjects}
			totalProjects={filteredProjects.length}
			bind:currentPage
			{itemsPerPage}
			{totalPages}
			{sortBy}
			{sortOrder}
			onToggleSort={toggleSort}
			onRefresh={handleRefresh}
			onDelete={handleDelete}
			onDownloadPDF={handleDownloadPDF}
			onQuickEdit={handleQuickEdit}
			onPageChange={(page) => (currentPage = page)}
		/>
	</div>
</div>

<!-- Delete Confirmation Dialog -->
<DeleteProjectDialog
	bind:open={deleteDialogOpen}
	onConfirm={confirmDelete}
	onCancel={() => (deleteDialogOpen = false)}
/>
