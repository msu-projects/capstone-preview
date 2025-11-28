<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { Project, Sitio } from '$lib/types';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import { aggregateByMunicipality } from '$lib/utils/project-aggregation';
	import { Map as MapIcon, MapPin, Navigation } from '@lucide/svelte';
	import { onDestroy, onMount } from 'svelte';

	interface Props {
		projects: Project[];
		sitios?: Sitio[];
		filterLabel?: string;
	}

	const { projects, sitios = [], filterLabel = 'All Projects' }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: L.Map | undefined;
	let L: typeof import('leaflet') | undefined;

	// Aggregate by municipality
	const geoDist = $derived(aggregateByMunicipality(projects));

	// Get total projects with location data
	const projectsWithLocation = $derived(
		projects.filter((p) => p.project_sitios && p.project_sitios.length > 0).length
	);

	// Build location lookup from sitios
	const sitioCoordinates = $derived.by(() => {
		const lookup = new Map<string, { lat: number; lng: number }>();
		for (const sitio of sitios) {
			if (sitio.coordinates?.lat && sitio.coordinates?.lng) {
				const key = `${sitio.municipality}-${sitio.barangay}-${sitio.name}`;
				lookup.set(key, sitio.coordinates);
			}
		}
		return lookup;
	});

	onMount(async () => {
		// Import Leaflet dynamically (browser-only)
		L = await import('leaflet');

		// Import Leaflet CSS
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
		document.head.appendChild(link);

		// Default center (South Cotabato)
		const defaultLat = 6.3162;
		const defaultLng = 124.6926;

		// Initialize map
		map = L.map(mapContainer, {
			center: [defaultLat, defaultLng],
			zoom: 10,
			zoomControl: true,
			scrollWheelZoom: false
		});

		// Add tile layer (OpenStreetMap)
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 18
		}).addTo(map);

		// Add markers for projects
		const markers: L.Marker[] = [];

		for (const project of projects) {
			if (!project.project_sitios || project.project_sitios.length === 0) continue;

			for (const sitio of project.project_sitios) {
				// Try to find coordinates from sitios data
				const key = `${sitio.municipality}-${sitio.barangay}-${sitio.sitio_name}`;
				const coords = sitioCoordinates.get(key);

				// Use actual coords or generate approximate ones based on municipality
				const lat = coords?.lat ?? defaultLat + (Math.random() - 0.5) * 0.15;
				const lng = coords?.lng ?? defaultLng + (Math.random() - 0.5) * 0.15;

				const marker = L.marker([lat, lng], {
					icon: L.divIcon({
						className: 'custom-marker',
						html: `
							<div class="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
									<circle cx="12" cy="10" r="3"/>
								</svg>
							</div>
						`,
						iconSize: [32, 32],
						iconAnchor: [16, 32],
						popupAnchor: [0, -32]
					})
				}).addTo(map);

				// Add popup
				marker.bindPopup(`
					<div class="p-2 min-w-[200px]">
						<h4 class="font-semibold text-sm text-slate-900 mb-1">${project.title}</h4>
						<p class="text-xs text-slate-600 mb-2">${sitio.sitio_name}, ${sitio.barangay}</p>
						<div class="space-y-1 pt-2 border-t border-slate-200">
							<div class="flex justify-between text-xs">
								<span class="text-slate-500">Municipality</span>
								<span class="font-medium text-slate-700">${sitio.municipality}</span>
							</div>
							<div class="flex justify-between text-xs">
								<span class="text-slate-500">Budget</span>
								<span class="font-medium text-slate-700">₱${project.total_budget.toLocaleString()}</span>
							</div>
							<div class="flex justify-between text-xs">
								<span class="text-slate-500">Beneficiaries</span>
								<span class="font-medium text-slate-700">${sitio.beneficiaries_target.toLocaleString()}</span>
							</div>
						</div>
					</div>
				`);

				markers.push(marker);
			}
		}

		// Fit bounds to markers if any
		if (markers.length > 0) {
			const group = L.featureGroup(markers);
			map.fitBounds(group.getBounds().pad(0.1));
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="space-y-6">
	<!-- Map Header Stats -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">Total Projects</p>
						<p class="text-2xl font-bold text-slate-900">{projects.length}</p>
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
						<p class="text-sm text-slate-500">With Location</p>
						<p class="text-2xl font-bold text-slate-900">{projectsWithLocation}</p>
					</div>
					<div class="rounded-lg bg-emerald-50 p-2">
						<Navigation class="size-5 text-emerald-600" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-slate-500">Municipalities</p>
						<p class="text-2xl font-bold text-slate-900">{geoDist.totalMunicipalities}</p>
					</div>
					<div class="rounded-lg bg-amber-50 p-2">
						<MapIcon class="size-5 text-amber-600" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-purple-50 p-2">
						<MapIcon class="size-5 text-purple-600" />
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
						<MapIcon class="size-5 text-slate-500" />
						Project Locations
					</Card.Title>
					<Card.Description>
						{projectsWithLocation} projects mapped across {geoDist.totalMunicipalities} municipalities
					</Card.Description>
				</div>
				{#if projectsWithLocation < projects.length}
					<Badge variant="secondary" class="bg-amber-50 text-amber-700">
						{projects.length - projectsWithLocation} without location
					</Badge>
				{/if}
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			<div bind:this={mapContainer} class="h-[500px] w-full rounded-b-lg"></div>
		</Card.Content>
	</Card.Root>

	<!-- Municipality Summary Table -->
	{#if geoDist.byMunicipality.length > 0}
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<MapPin class="size-5 text-slate-500" />
					Projects by Municipality
				</Card.Title>
				<Card.Description>Distribution of projects across municipalities</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left">
								<th class="pb-3 font-medium text-slate-500">Municipality</th>
								<th class="pb-3 text-right font-medium text-slate-500">Projects</th>
								<th class="pb-3 text-right font-medium text-slate-500">Budget</th>
								<th class="pb-3 text-right font-medium text-slate-500">Beneficiaries</th>
							</tr>
						</thead>
						<tbody>
							{#each geoDist.byMunicipality as muni}
								<tr class="border-b border-slate-100 last:border-0">
									<td class="py-3 font-medium text-slate-900">{muni.municipality}</td>
									<td class="py-3 text-right text-slate-600">{muni.projectCount}</td>
									<td class="py-3 text-right font-medium text-slate-900">
										{formatCurrency(muni.totalBudget)}
									</td>
									<td class="py-3 text-right text-slate-600">
										{formatNumber(muni.beneficiaries)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Map Legend / Help -->
	<Card.Root class="border-0 bg-slate-50 py-0 shadow-sm ring-1 ring-slate-200/50">
		<Card.Content class="p-4">
			<div class="flex flex-wrap items-center gap-4 text-sm">
				<div class="flex items-center gap-2">
					<MapPin class="size-3 text-primary" />
					<span class="text-slate-600">Project Location</span>
				</div>
				<div class="text-slate-400">•</div>
				<span class="text-slate-600">Click on a marker to view project details</span>
				<div class="text-slate-400">•</div>
				<span class="text-slate-600">Use mouse wheel to zoom in/out</span>
			</div>
		</Card.Content>
	</Card.Root>
</div>
