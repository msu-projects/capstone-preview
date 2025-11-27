<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { Project, Sitio } from '$lib/types';
	import { Calendar, Download, MapPin, Pencil } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
		relatedProjects: Project[];
		isAdminView?: boolean;
	}

	const { sitio, relatedProjects, isAdminView = false }: Props = $props();
</script>

<!-- Hero Header -->
<header class="relative overflow-hidden bg-white">
	<!-- Background Pattern -->
	<div class="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-blue-50/30"></div>
	<div
		class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"
	></div>

	<!-- Accent Line -->
	<div
		class="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500"
	></div>

	<div class="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
			<!-- Left: Sitio Info -->
			<div class="flex-1 space-y-4">
				<!-- Location Badges -->
				<div class="flex flex-wrap items-center gap-2">
					<Badge variant="secondary" class="gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100">
						<MapPin class="size-3" />
						{sitio.municipality}
					</Badge>
					<Badge variant="secondary" class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
						{sitio.barangay}
					</Badge>
					{#if sitio.coding?.code}
						<Badge variant="outline" class="font-mono text-slate-500">
							Code: {sitio.coding.code}
						</Badge>
					{/if}
				</div>

				<!-- Title -->
				<div>
					<h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
						{sitio.name}
					</h1>
					<p class="mt-2 max-w-2xl text-lg text-slate-600">
						Community profile for {sitio.name}, Barangay {sitio.barangay}, {sitio.municipality}.
						{#if sitio.province}
							{sitio.province} Province.
						{/if}
					</p>
				</div>

				<!-- Quick Info -->
				<div class="flex flex-wrap items-center gap-4 text-sm text-slate-500">
					<span class="flex items-center gap-1.5">
						<Calendar class="size-4" />
						Last updated: {new Date(sitio.updated_at || sitio.created_at).toLocaleDateString(
							'en-US',
							{ month: 'short', day: 'numeric', year: 'numeric' }
						)}
					</span>
					{#if sitio.coordinates.lat && sitio.coordinates.lng}
						<span class="flex items-center gap-1.5">
							<MapPin class="size-4" />
							{sitio.coordinates.lat.toFixed(4)}°N, {sitio.coordinates.lng.toFixed(4)}°E
						</span>
					{/if}
				</div>
			</div>

			<!-- Right: Actions -->
			{#if isAdminView}
				<div class="flex shrink-0 gap-2">
					<Button variant="outline" size="sm" class="gap-2">
						<Download class="size-4" />
						Export
					</Button>
					<Button size="sm" class="gap-2" href="/admin/sitios/{sitio.id}/edit">
						<Pencil class="size-4" />
						Edit Sitio
					</Button>
				</div>
			{/if}
		</div>
	</div>
</header>
