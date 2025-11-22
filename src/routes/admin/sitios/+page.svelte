<script lang="ts">
	import { goto } from '$app/navigation';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import type { Sitio } from '$lib/types';
	import { deleteSitio, loadSitios } from '$lib/utils/storage';
	import { MapPin, Pencil, Plus, Search, Trash2, Upload } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let sitios = $state<Sitio[]>([]);
	let filteredSitios = $state<Sitio[]>([]);
	let searchTerm = $state('');
	let deleteDialogOpen = $state(false);
	let sitioToDelete = $state<Sitio | null>(null);

	onMount(() => {
		loadData();
	});

	function loadData() {
		sitios = loadSitios();
		filterSitios();
	}

	function filterSitios() {
		if (!searchTerm) {
			filteredSitios = sitios;
			return;
		}

		const term = searchTerm.toLowerCase();
		filteredSitios = sitios.filter(
			(s) =>
				s.name.toLowerCase().includes(term) ||
				s.municipality.toLowerCase().includes(term) ||
				s.barangay.toLowerCase().includes(term)
		);
	}

	$effect(() => {
		searchTerm;
		filterSitios();
	});

	function handleEdit(sitio: Sitio) {
		goto(`/admin/sitios/${sitio.id}/edit`);
	}

	function confirmDelete(sitio: Sitio) {
		sitioToDelete = sitio;
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
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Sitios</h1>
			<p class="text-muted-foreground">Manage sitio data and demographics</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => goto('/admin/import')}>
				<Upload class="mr-2 size-4" />
				Import Data
			</Button>
			<Button onclick={() => goto('/admin/sitios/new')}>
				<Plus class="mr-2 size-4" />
				Add Sitio
			</Button>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
		<Card.Root>
			<Card.Content class="">
				<div class="flex items-center gap-2">
					<MapPin class="size-5 text-primary" />
					<div>
						<p class="text-2xl font-bold">{sitios.length}</p>
						<p class="text-sm text-muted-foreground">Total Sitios</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="">
				<div>
					<p class="text-2xl font-bold">
						{sitios.reduce((sum, s) => sum + (s.population || 0), 0).toLocaleString()}
					</p>
					<p class="text-sm text-muted-foreground">Total Population</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="">
				<div>
					<p class="text-2xl font-bold">
						{sitios.reduce((sum, s) => sum + (s.households || 0), 0).toLocaleString()}
					</p>
					<p class="text-sm text-muted-foreground">Total Households</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="">
				<div>
					<p class="text-2xl font-bold">
						{new Set(sitios.map((s) => s.municipality)).size}
					</p>
					<p class="text-sm text-muted-foreground">Municipalities</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Search and Filters -->
	<Card.Root>
		<Card.Content class="">
			<div class="flex items-center gap-4">
				<div class="relative flex-1">
					<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						bind:value={searchTerm}
						placeholder="Search by sitio, municipality, or barangay..."
						class="pl-10"
					/>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Sitios Table -->
	<Card.Root class="p-2">
		<Card.Content class="p-0">
			{#if filteredSitios.length > 0}
				<Table.Root class="">
					<Table.Header>
						<Table.Row>
							<Table.Head>Municipality</Table.Head>
							<Table.Head>Barangay</Table.Head>
							<Table.Head class="">Sitio</Table.Head>
							<Table.Head class="text-right">Population</Table.Head>
							<Table.Head class="text-right">Households</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filteredSitios as sitio}
							<Table.Row>
								<Table.Cell>{sitio.municipality}</Table.Cell>
								<Table.Cell>{sitio.barangay}</Table.Cell>
								<Table.Cell class="font-medium">{sitio.name}</Table.Cell>
								<Table.Cell class="text-right">
									{sitio.population?.toLocaleString() || '-'}
								</Table.Cell>
								<Table.Cell class="text-right">
									{sitio.households?.toLocaleString() || '-'}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button variant="ghost" size="sm" onclick={() => handleEdit(sitio)}>
											<Pencil class="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onclick={() => confirmDelete(sitio)}
											class="text-destructive hover:text-destructive"
										>
											<Trash2 class="size-4" />
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{:else}
				<div class="flex flex-col items-center justify-center py-12">
					<MapPin class="mb-4 size-12 text-muted-foreground" />
					<h3 class="mb-2 text-lg font-semibold">No sitios found</h3>
					<p class="mb-4 text-sm text-muted-foreground">
						{searchTerm
							? 'Try adjusting your search'
							: 'Get started by adding a new sitio or importing data'}
					</p>
					{#if !searchTerm}
						<div class="flex gap-2">
							<Button variant="outline" onclick={() => goto('/admin/import')}>
								<Upload class="mr-2 size-4" />
								Import Data
							</Button>
							<Button onclick={() => goto('/admin/sitios/new')}>
								<Plus class="mr-2 size-4" />
								Add Sitio
							</Button>
						</div>
					{/if}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
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
