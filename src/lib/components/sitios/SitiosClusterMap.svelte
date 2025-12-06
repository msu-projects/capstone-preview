<script lang="ts">
	import type { Sitio } from '$lib/types';
	import { cn } from '$lib/utils';
	import type { Map as LeafletMap, Marker } from 'leaflet';
	import { onDestroy } from 'svelte';

	interface Props {
		sitios: Sitio[];
		height?: string;
		class?: string;
		currentTab?: string;
	}

	let { sitios, height = '400px', class: className, currentTab }: Props = $props();

	let mapContainer: HTMLDivElement | undefined = $state();
	let map: LeafletMap | null = null;
	let markers: Marker[] = [];
	let mapInitialized = $state(false);

	// Get valid sitios with coordinates
	const validSitios = $derived(
		sitios.filter(
			(s) =>
				s.coordinates &&
				typeof s.coordinates.lat === 'number' &&
				typeof s.coordinates.lng === 'number' &&
				!isNaN(s.coordinates.lat) &&
				!isNaN(s.coordinates.lng)
		)
	);

	// Update markers when sitios change - track validSitios.length and sitio IDs to detect changes
	$effect(() => {
		// Access validSitios to create dependency
		const sitioIds = validSitios.map((s) => s.id).join(',');
		const count = validSitios.length;

		if (map && mapInitialized) {
			// Use the tracked values to ensure reactivity
			void sitioIds;
			void count;
			updateMarkers();
		}
	});

	function updateMarkers() {
		if (!map) return;

		// Import Leaflet dynamically
		import('leaflet').then((L) => {
			// Clear existing markers
			for (const marker of markers) {
				marker.remove();
			}
			markers = [];

			if (validSitios.length === 0) return;

			// Custom marker icon (blue pin)
			const customIcon = L.icon({
				iconUrl:
					'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
				shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowSize: [41, 41]
			});

			// Add markers for each sitio
			const bounds: [number, number][] = [];

			for (const sitio of validSitios) {
				const { lat, lng } = sitio.coordinates;
				bounds.push([lat, lng]);

				const marker = L.marker([lat, lng], { icon: customIcon })
					.addTo(map!)
					.bindPopup(
						`<div class="min-w-[150px]">
							<strong class="text-sm">${sitio.name}</strong><br>
							<span class="text-xs text-gray-600">${sitio.barangay}, ${sitio.municipality}</span><br>
							<span class="text-xs">Pop: ${sitio.population.toLocaleString()} | HH: ${sitio.households.toLocaleString()}</span><br>
							<a href="/sitios/${sitio.id}" class="text-xs text-blue-600 hover:underline">View Profile →</a>
						</div>`
					);

				markers.push(marker);
			}

			// Fit map to bounds
			if (bounds.length > 0) {
				const latLngBounds = L.latLngBounds(bounds);
				map!.fitBounds(latLngBounds, { padding: [50, 50], maxZoom: 14 });
			}
		});
	}

	async function initializeMap() {
		if (!mapContainer || mapInitialized) return;

		// Dynamically import Leaflet to avoid SSR issues
		const L = await import('leaflet');

		// Import Leaflet CSS
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
		document.head.appendChild(link);

		// Default center (South Cotabato approximate center)
		const defaultCenter: [number, number] = [6.2, 124.85];
		const defaultZoom = 10;

		// Initialize map
		map = L.map(mapContainer).setView(defaultCenter, defaultZoom);

		// Add OpenStreetMap tile layer
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		// Add markers if sitios already loaded
		if (validSitios.length > 0) {
			updateMarkers();
		}

		mapInitialized = true;
	}

	// Initialize map only when tab becomes active
	$effect(() => {
		if (currentTab === 'map' && mapContainer && !mapInitialized) {
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				initializeMap();
			}, 50);
		}
	});

	onDestroy(() => {
		map?.remove();
	});
</script>

<div
	bind:this={mapContainer}
	style="height: {height}; width: 100%;"
	class={cn('rounded-lg border bg-slate-100 dark:bg-slate-800', className)}
>
	{#if validSitios.length === 0}
		<div class="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
			No sitios with coordinates to display
		</div>
	{/if}
</div>

<style>
	:global(.leaflet-container) {
		border-radius: 0.5rem;
	}

	:global(.leaflet-popup-content) {
		margin: 8px 12px;
	}
</style>
