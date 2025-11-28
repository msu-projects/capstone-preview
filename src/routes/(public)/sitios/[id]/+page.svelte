<script lang="ts">
	import { SitioProfileView } from '$lib/components/sitios/profile';
	import { Button } from '$lib/components/ui/button';
	import { loadSitios } from '$lib/utils/storage';
	import { ArrowLeft, MapPin } from '@lucide/svelte';

	const { data } = $props<{ data: { id: string } }>();
	const sitioId = parseInt(data?.id || '0');
	const sitio = $derived(loadSitios().find((s) => s.id === sitioId));
</script>

<svelte:head>
	<title
		>{sitio ? `${sitio.name} - Sitio Profile` : 'Sitio Details'} - South Cotabato Data Bank</title
	>
	{#if sitio}
		<meta
			name="description"
			content="View the community profile for {sitio.name}, {sitio.barangay}, {sitio.municipality} including demographics, infrastructure, and development indicators."
		/>
	{/if}
</svelte:head>

<div>
	{#if !sitio}
		<div class="flex min-h-[60vh] items-center justify-center">
			<div class="text-center">
				<div
					class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100"
				>
					<MapPin class="size-8 text-slate-400" />
				</div>
				<h1 class="mb-2 text-2xl font-bold text-slate-900">Sitio Not Found</h1>
				<p class="mb-6 text-slate-500">
					The sitio you're looking for doesn't exist or has been removed.
				</p>
				<Button href="/sitios">
					<ArrowLeft class="mr-2 size-4" />
					Back to Sitios
				</Button>
			</div>
		</div>
	{:else}
		<SitioProfileView {sitio} isAdminView={false} />
	{/if}
</div>
