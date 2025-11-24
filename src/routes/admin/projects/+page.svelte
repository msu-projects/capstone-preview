<script lang="ts">
	import DeleteProjectDialog from '$lib/components/admin/projects/DeleteProjectDialog.svelte';
	import ProjectsFilters from '$lib/components/admin/projects/ProjectsFilters.svelte';
	import ProjectsHeader from '$lib/components/admin/projects/ProjectsHeader.svelte';
	import ProjectsTable from '$lib/components/admin/projects/ProjectsTable.svelte';
	import { projects } from '$lib/mock-data';
	import { downloadProjectMonitoringPDF, downloadSingleProjectPDF } from '$lib/utils/pdf-generator';

	// State
	let searchQuery = $state('');
	let statusFilter = $state<string>('');
	let categoryFilter = $state<string>('');
	let currentPage = $state(1);
	let sortBy = $state<'title' | 'budget' | 'progress' | 'status' | 'updated'>('title');
	let sortOrder = $state<'asc' | 'desc'>('asc');
	const itemsPerPage = 10;
	let deleteDialogOpen = $state(false);
	let projectToDelete = $state<number | null>(null);

	// Get unique categories
	const categories = $derived([...new Set(projects.map((p) => p.category))]);

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

				// Fallback to legacy fields
				const legacyMatch =
					project.sitio_name.toLowerCase().includes(query) ||
					project.municipality.toLowerCase().includes(query);

				matchesSearch = titleMatch || sitioMatch || legacyMatch;
			}

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
				case 'updated':
					const dateA = new Date(a.updated_at).getTime();
					const dateB = new Date(b.updated_at).getTime();
					comparison = dateA - dateB;
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
</script>

<svelte:head>
	<title>Project Management - South Cotabato Data Bank</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<ProjectsHeader onExport={handleExport} />

	<!-- Content -->
	<div class="flex-1 space-y-6 p-6">
		<!-- Filters -->
		<ProjectsFilters
			bind:searchQuery
			bind:statusFilter
			bind:categoryFilter
			{categories}
			onReset={resetFilters}
		/>

		<!-- Table -->
		<ProjectsTable
			projects={paginatedProjects}
			bind:currentPage
			{itemsPerPage}
			{totalPages}
			{sortBy}
			{sortOrder}
			onToggleSort={toggleSort}
			onRefresh={handleRefresh}
			onDelete={handleDelete}
			onDownloadPDF={handleDownloadPDF}
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
