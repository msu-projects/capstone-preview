<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import SitioForm from '$lib/components/admin/sitios/SitioForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { Sitio } from '$lib/types';
	import { loadSitios, saveSitios } from '$lib/utils/storage';
	import { ArrowLeft } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const sitioId = parseInt($page.params.id || '0');
	let sitio = $state<Sitio | null>(null);
	let notFound = $state(false);

	onMount(() => {
		loadSitio();
	});

	function loadSitio() {
		const sitios = loadSitios();
		const found = sitios.find((s) => s.id === sitioId);

		if (found) {
			sitio = found;
		} else {
			notFound = true;
		}
	}

	function handleSubmit(data: Sitio) {
		const sitios = loadSitios();
		const index = sitios.findIndex((s) => s.id === sitioId);

		if (index === -1) {
			alert('Sitio not found');
			return;
		}

		// Update the sitio
		sitios[index] = {
			...data,
			id: sitioId,
			created_at: sitios[index].created_at,
			updated_at: new Date().toISOString()
		};

		const success = saveSitios(sitios);

		if (success) {
			goto('/admin/sitios');
		} else {
			alert('Failed to update sitio. Storage may be full.');
		}
	}

	function handleCancel() {
		goto('/admin/sitios');
	}
</script>

{#if notFound}
	<div class="container mx-auto space-y-6 p-6">
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center py-12">
				<h2 class="mb-2 text-2xl font-bold">Sitio Not Found</h2>
				<p class="mb-4 text-muted-foreground">The sitio you're looking for doesn't exist.</p>
				<Button onclick={() => goto('/admin/sitios')}>
					<ArrowLeft class="mr-2 size-4" />
					Back to Sitios
				</Button>
			</Card.Content>
		</Card.Root>
	</div>
{:else if sitio}
	<div class="container mx-auto space-y-6 p-6">
		<!-- Header -->
		<div class="flex items-center gap-4">
			<button onclick={() => goto('/admin/sitios')} class="hover:opacity-70">
				<ArrowLeft class="size-6" />
			</button>
			<div>
				<h1 class="text-3xl font-bold">Edit Sitio</h1>
				<p class="text-muted-foreground">{sitio.name}, {sitio.barangay}, {sitio.municipality}</p>
			</div>
		</div>

		<!-- Form -->
		<SitioForm initialData={sitio} onSubmit={handleSubmit} onCancel={handleCancel} />
	</div>
{/if}
