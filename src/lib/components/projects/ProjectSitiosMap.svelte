<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Project } from '$lib/types';
	import { MapPin } from '@lucide/svelte';

	interface Props {
		project: Project;
	}

	const { project }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: any;
	let L: any;

	onMount(async () => {
		// Import Leaflet dynamically (browser-only)
		L = await import('leaflet');

		// Import Leaflet CSS
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
		document.head.appendChild(link);

		// Get sitio coordinates
		const sitios = project.project_sitios || [];

		if (sitios.length === 0) {
			return;
		}

		// Calculate center point (average of all coordinates)
		// Note: We'll use default South Cotabato coordinates if sitios don't have coordinates yet
		const defaultLat = 6.3162;
		const defaultLng = 124.6926;

		let centerLat = defaultLat;
		let centerLng = defaultLng;
		let zoom = 11;

		// If sitios have coordinates, calculate the center
		const sitiosWithCoords = sitios.filter((s) => s.sitio_id); // In production, check for actual coordinates
		if (sitiosWithCoords.length > 0) {
			// For now, use default center (coordinates would come from actual sitio data in production)
			centerLat = defaultLat;
			centerLng = defaultLng;
		}

		// Initialize map
		map = L.map(mapContainer, {
			center: [centerLat, centerLng],
			zoom: zoom,
			zoomControl: true,
			scrollWheelZoom: false
		});

		// Add tile layer (OpenStreetMap)
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 18
		}).addTo(map);

		// Add markers for each sitio
		sitios.forEach((sitio, index) => {
			// Use approximate coordinates based on municipality
			// In production, these would come from the actual sitio data
			const lat = defaultLat + (Math.random() - 0.5) * 0.1;
			const lng = defaultLng + (Math.random() - 0.5) * 0.1;

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
				<div class="p-2">
					<h4 class="font-semibold text-sm text-slate-900 mb-1">${sitio.sitio_name}</h4>
					<p class="text-xs text-slate-600">${sitio.barangay}, ${sitio.municipality}</p>
					<div class="mt-2 pt-2 border-t border-slate-200">
						<p class="text-xs text-slate-500">Target Beneficiaries</p>
						<p class="text-sm font-medium text-slate-900">${sitio.beneficiaries_target.toLocaleString()}</p>
					</div>
				</div>
			`);
		});

		// Fit bounds to show all markers
		if (sitios.length > 1) {
			const bounds = sitios.map((sitio) => {
				const lat = defaultLat + (Math.random() - 0.5) * 0.1;
				const lng = defaultLng + (Math.random() - 0.5) * 0.1;
				return [lat, lng];
			});
			map.fitBounds(bounds, { padding: [30, 30] });
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="relative h-full w-full overflow-hidden rounded-lg">
	{#if project.project_sitios && project.project_sitios.length > 0}
		<div bind:this={mapContainer} class="h-full w-full"></div>
	{:else}
		<div class="flex h-full items-center justify-center bg-slate-50 text-slate-500">
			<div class="text-center">
				<MapPin class="mx-auto mb-2 size-8 text-slate-400" />
				<p class="text-sm">No sitios to display</p>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.custom-marker) {
		background: transparent;
		border: none;
	}

	:global(.leaflet-popup-content-wrapper) {
		border-radius: 0.5rem;
		padding: 0;
	}

	:global(.leaflet-popup-content) {
		margin: 0;
	}
</style>
