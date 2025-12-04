<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import SitiosTable from '$lib/components/admin/sitios/SitiosTable.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import type { Sitio } from '$lib/types';
	import { deleteSitio, loadSitios } from '$lib/utils/storage';
	import { Plus, Search, Upload } from '@lucide/svelte';
	import { onMount, tick } from 'svelte';

	let sitios = $state<Sitio[]>([]);
	let searchTerm = $state('');
	let selectedMunicipality = $state<string>('all');
	let selectedBarangay = $state<string>('all');
	let currentPage = $state(1);
	let sortBy = $state<'name' | 'municipality' | 'barangay' | 'population' | 'households'>(
		'households'
	);
	let sortOrder = $state<'asc' | 'desc'>('asc');
	const itemsPerPage = 10;
	let deleteDialogOpen = $state(false);
	let sitioToDelete = $state<Sitio | null>(null);
	let initialized = $state(false);

	// Derived values for filter options
	let uniqueMunicipalities = $derived(
		Array.from(new Set(sitios.map((s) => s.municipality))).sort()
	);
	let uniqueBarangays = $derived(
		Array.from(
			new Set(
				sitios
					.filter((s) => selectedMunicipality === 'all' || s.municipality === selectedMunicipality)
					.map((s) => s.barangay)
			)
		).sort()
	);

	// Initialize filters from URL query params
	function initFromUrl() {
		const params = page.url.searchParams;
		searchTerm = params.get('search') || '';
		selectedMunicipality = params.get('municipality') || 'all';
		selectedBarangay = params.get('barangay') || 'all';
		currentPage = parseInt(params.get('page') || '1', 10);
		const urlSortBy = params.get('sortBy');
		if (
			urlSortBy &&
			['name', 'municipality', 'barangay', 'population', 'households'].includes(urlSortBy)
		) {
			sortBy = urlSortBy as typeof sortBy;
		}
		const urlSortOrder = params.get('sortOrder');
		if (urlSortOrder && ['asc', 'desc'].includes(urlSortOrder)) {
			sortOrder = urlSortOrder as 'asc' | 'desc';
		}
		initialized = true;
	}

	// Sync filters to URL
	function syncToUrl() {
		const params = new URLSearchParams();
		if (searchTerm) params.set('search', searchTerm);
		if (selectedMunicipality !== 'all') params.set('municipality', selectedMunicipality);
		if (selectedBarangay !== 'all') params.set('barangay', selectedBarangay);
		if (currentPage > 1) params.set('page', currentPage.toString());
		if (sortBy !== 'households') params.set('sortBy', sortBy);
		if (sortOrder !== 'asc') params.set('sortOrder', sortOrder);

		const queryString = params.toString();
		const newUrl = queryString ? `?${queryString}` : page.url.pathname;

		tick().then(() => {
			replaceState(newUrl, {});
		});
	}

	// Sync URL when filters change
	$effect(() => {
		// Track all filter values
		searchTerm;
		selectedMunicipality;
		selectedBarangay;
		currentPage;
		sortBy;
		sortOrder;
		// Only sync after initial mount

		syncToUrl();
	});

	onMount(() => {
		loadData();
		initFromUrl();
	});

	function loadData() {
		sitios = loadSitios();
	}

	// Filter and sort sitios
	const filteredSitios = $derived.by(() => {
		const filtered = sitios.filter((s) => {
			// Municipality filter
			if (selectedMunicipality !== 'all' && s.municipality !== selectedMunicipality) {
				return false;
			}

			// Barangay filter
			if (selectedBarangay !== 'all' && s.barangay !== selectedBarangay) {
				return false;
			}

			// Search term filter
			if (searchTerm) {
				const term = searchTerm.toLowerCase();
				return (
					s.name.toLowerCase().includes(term) ||
					s.municipality.toLowerCase().includes(term) ||
					s.barangay.toLowerCase().includes(term)
				);
			}

			return true;
		});

		// Sort sitios
		return filtered.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'municipality':
					comparison = a.municipality.localeCompare(b.municipality);
					break;
				case 'barangay':
					comparison = a.barangay.localeCompare(b.barangay);
					break;
				case 'population':
					comparison = (a.population || 0) - (b.population || 0);
					break;
				case 'households':
					comparison = (a.households || 0) - (b.households || 0);
					break;
			}
			return sortOrder === 'asc' ? comparison : -comparison;
		});
	});

	// Paginate
	const paginatedSitios = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredSitios.slice(start, start + itemsPerPage);
	});

	const totalPages = $derived(Math.ceil(filteredSitios.length / itemsPerPage));

	// Reset barangay filter when municipality changes
	$effect(() => {
		selectedMunicipality;
		if (selectedBarangay !== 'all') {
			const barangayExists = sitios.some(
				(s) =>
					s.barangay === selectedBarangay &&
					(selectedMunicipality === 'all' || s.municipality === selectedMunicipality)
			);
			if (!barangayExists) {
				selectedBarangay = 'all';
			}
		}
	});

	function toggleSort(column: typeof sortBy) {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'asc';
		}
	}

	function handleEdit(sitioId: number) {
		goto(`/admin/sitios/${sitioId}/edit`);
	}

	function confirmDelete(sitioId: number) {
		const sitio = sitios.find((s) => s.id === sitioId);
		sitioToDelete = sitio || null;
		deleteDialogOpen = true;
	}

	function handleDelete() {
		if (sitioToDelete) {
			const success = deleteSitio(sitioToDelete.id);
			if (success) {
				loadData();
			} else {
				alert('Failed to delete sitio');
			}
		}
		deleteDialogOpen = false;
		sitioToDelete = null;
	}

	function handleDownloadPDF(sitioId: number) {
		const sitio = sitios.find((s) => s.id === sitioId);
		if (sitio) {
			console.log('Download PDF for sitio:', sitio.name);
			// TODO: Implement PDF download functionality
			alert(`PDF download for ${sitio.name} will be implemented soon.`);
		}
	}

	function handleRefresh() {
		loadData();
	}
</script>

<svelte:head>
	<title>Sitio Management</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<AdminHeader title="Sitios" description="Manage sitio data and demographics">
		{#snippet actions()}
			<Button variant="outline" onclick={() => goto('/admin/import')} size="sm">
				<Upload class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Import Data</span>
			</Button>
			<Button onclick={() => goto('/admin/sitios/new')} size="sm">
				<Plus class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Add Sitio</span>
			</Button>
		{/snippet}
	</AdminHeader>

	<!-- Content -->
	<div class="flex-1 space-y-6 p-6">
		<!-- Search and Filters -->
		<Card.Root>
			<Card.Content class="">
				<div class="flex flex-col gap-4 md:flex-row md:items-center">
					<div class="relative flex-1">
						<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							bind:value={searchTerm}
							placeholder="Search by sitio, municipality, or barangay..."
							class="pl-10"
						/>
					</div>
					<div class="flex flex-col gap-2 sm:flex-row">
						<Select.Root type="single" bind:value={selectedMunicipality}>
							<Select.Trigger class="w-full sm:w-[200px]">
								{selectedMunicipality === 'all' ? 'All Municipalities' : selectedMunicipality}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="all">All Municipalities</Select.Item>
								{#each uniqueMunicipalities as municipality}
									<Select.Item value={municipality}>{municipality}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						<Select.Root type="single" bind:value={selectedBarangay}>
							<Select.Trigger class="w-full sm:w-[200px]">
								{selectedBarangay === 'all' ? 'All Barangays' : selectedBarangay}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="all">All Barangays</Select.Item>
								{#each uniqueBarangays as barangay}
									<Select.Item value={barangay}>{barangay}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Sitios Table -->
		<SitiosTable
			sitios={paginatedSitios}
			totalSitios={filteredSitios.length}
			bind:currentPage
			{itemsPerPage}
			{totalPages}
			{sortBy}
			{sortOrder}
			onToggleSort={toggleSort}
			onRefresh={handleRefresh}
			onDelete={confirmDelete}
			onDownloadPDF={handleDownloadPDF}
			onEdit={handleEdit}
			onPageChange={(page) => (currentPage = page)}
		/>
	</div>
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Sitio</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete "{sitioToDelete?.name}"? This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleDelete} class="text-destructive-foreground bg-destructive">
				Delete
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
