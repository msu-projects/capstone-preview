<script lang="ts">
	import { goto } from '$app/navigation';
	import SitioForm from '$lib/components/admin/sitios/SitioForm.svelte';
	import type { Sitio } from '$lib/types';
	import { loadSitios, saveSitios } from '$lib/utils/storage';
	import { ArrowLeft } from '@lucide/svelte';

	function handleSubmit(data: Sitio) {
		const sitios = loadSitios();

		// Generate new ID
		const maxId = sitios.reduce((max, s) => Math.max(max, s.id), 0);
		const newSitio: Sitio = {
			...data,
			id: maxId + 1,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		sitios.push(newSitio);
		const success = saveSitios(sitios);

		if (success) {
			goto('/admin/sitios');
		} else {
			alert('Failed to save sitio. Storage may be full.');
		}
	}

	function handleCancel() {
		goto('/admin/sitios');
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<button onclick={() => goto('/admin/sitios')} class="hover:opacity-70">
			<ArrowLeft class="size-6" />
		</button>
		<div>
			<h1 class="text-3xl font-bold">Add New Sitio</h1>
			<p class="text-muted-foreground">Enter sitio data manually</p>
		</div>
	</div>

	<!-- Form -->
	<SitioForm onSubmit={handleSubmit} onCancel={handleCancel} />
</div>
