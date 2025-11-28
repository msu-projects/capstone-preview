<script lang="ts">
	import SitiosClusterMap from '$lib/components/sitios/SitiosClusterMap.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { Sitio } from '$lib/types';
	import { Map, MapPin, Navigation } from '@lucide/svelte';

	interface Props {
		sitios: Sitio[];
		filterLabel?: string;
	}

	const { sitios, filterLabel = 'All Sitios' }: Props = $props();

	// Count sitios with valid coordinates
	const sitiosWithCoords = $derived(
		sitios.filter(
			(s) =>
				s.coordinates &&
				typeof s.coordinates.lat === 'number' &&
				typeof s.coordinates.lng === 'number' &&
				!isNaN(s.coordinates.lat) &&
				!isNaN(s.coordinates.lng)
		).length
	);
</script>

<div class="space-y-6">
	<!-- Map Header Stats -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">Total Sitios</p>
						<p class="text-2xl font-bold text-slate-900">{sitios.length}</p>
					</div>
					<div class="rounded-lg bg-blue-50 p-2">
						<MapPin class="size-5 text-blue-600" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">With Coordinates</p>
						<p class="text-2xl font-bold text-slate-900">{sitiosWithCoords}</p>
					</div>
					<div class="rounded-lg bg-emerald-50 p-2">
						<Navigation class="size-5 text-emerald-600" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 sm:col-span-2">
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-purple-50 p-2">
						<Map class="size-5 text-purple-600" />
					</div>
					<div>
						<p class="text-sm text-slate-500">Viewing</p>
						<p class="font-semibold text-slate-900">{filterLabel}</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Map Container -->
	<Card.Root class="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200/50">
		<Card.Header class="border-b bg-slate-50/50 pb-3">
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="flex items-center gap-2 text-base">
						<Map class="size-5 text-slate-500" />
						Geographic Distribution
					</Card.Title>
					<Card.Description>
						{sitiosWithCoords} sitios mapped out of {sitios.length} total
					</Card.Description>
				</div>
				{#if sitiosWithCoords < sitios.length}
					<Badge variant="secondary" class="bg-amber-50 text-amber-700">
						{sitios.length - sitiosWithCoords} without coordinates
					</Badge>
				{/if}
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			<SitiosClusterMap {sitios} height="500px" class="rounded-b-lg" />
		</Card.Content>
	</Card.Root>

	<!-- Map Legend / Help -->
	<Card.Root class="border-0 bg-slate-50 shadow-sm ring-1 ring-slate-200/50">
		<Card.Content class="p-4">
			<div class="flex flex-wrap items-center gap-4 text-sm">
				<div class="flex items-center gap-2">
					<div class="h-6 w-4 rounded-sm bg-blue-500"></div>
					<span class="text-slate-600">Sitio Location</span>
				</div>
				<div class="text-slate-400">•</div>
				<span class="text-slate-600">Click on a marker to view sitio details</span>
				<div class="text-slate-400">•</div>
				<span class="text-slate-600">Use mouse wheel to zoom in/out</span>
			</div>
		</Card.Content>
	</Card.Root>
</div>
