import type { Sitio } from '$lib/types';

const STORAGE_KEY = 'sccdp_sitios';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Save sitios to LocalStorage
 * @param sitios Array of Sitio objects to save
 * @returns true if successful, false otherwise
 */
export function saveSitios(sitios: Sitio[]): boolean {
	try {
		const json = JSON.stringify(sitios);
		if (json.length > MAX_STORAGE_SIZE) {
			throw new Error('Data exceeds LocalStorage limit (5MB)');
		}
		localStorage.setItem(STORAGE_KEY, json);
		return true;
	} catch (error) {
		console.error('Failed to save sitios:', error);
		return false;
	}
}

/**
 * Load sitios from LocalStorage
 * @returns Array of Sitio objects, empty array if none found or on error
 */
export function loadSitios(): Sitio[] {
	try {
		const json = localStorage.getItem(STORAGE_KEY);
		return json ? JSON.parse(json) : [];
	} catch (error) {
		console.error('Failed to load sitios:', error);
		return [];
	}
}

/**
 * Clear all sitios from LocalStorage
 */
export function clearSitios(): void {
	localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get current storage size in bytes
 * @returns Size in bytes
 */
export function getStorageSize(): number {
	const json = localStorage.getItem(STORAGE_KEY);
	return json ? json.length : 0;
}

/**
 * Get storage usage percentage
 * @returns Percentage (0-100)
 */
export function getStorageUsagePercentage(): number {
	const size = getStorageSize();
	return (size / MAX_STORAGE_SIZE) * 100;
}

/**
 * Check if storage is approaching limit (80%+)
 * @returns true if storage is at or above 80% capacity
 */
export function isStorageNearLimit(): boolean {
	return getStorageUsagePercentage() >= 80;
}

/**
 * Add a new sitio to storage
 * @param sitio Sitio object to add
 * @returns true if successful, false otherwise
 */
export function addSitio(sitio: Sitio): boolean {
	const sitios = loadSitios();
	sitios.push(sitio);
	return saveSitios(sitios);
}

/**
 * Update an existing sitio in storage
 * @param id Sitio ID to update
 * @param updates Partial sitio data to update
 * @returns true if successful, false otherwise
 */
export function updateSitio(id: number, updates: Partial<Sitio>): boolean {
	const sitios = loadSitios();
	const index = sitios.findIndex((s) => s.id === id);

	if (index === -1) {
		console.error(`Sitio with id ${id} not found`);
		return false;
	}

	sitios[index] = {
		...sitios[index],
		...updates,
		updated_at: new Date().toISOString()
	};

	return saveSitios(sitios);
}

/**
 * Delete a sitio from storage
 * @param id Sitio ID to delete
 * @returns true if successful, false otherwise
 */
export function deleteSitio(id: number): boolean {
	const sitios = loadSitios();
	const filteredSitios = sitios.filter((s) => s.id !== id);

	if (filteredSitios.length === sitios.length) {
		console.error(`Sitio with id ${id} not found`);
		return false;
	}

	return saveSitios(filteredSitios);
}

/**
 * Get a single sitio by ID
 * @param id Sitio ID
 * @returns Sitio object or null if not found
 */
export function getSitioById(id: number): Sitio | null {
	const sitios = loadSitios();
	return sitios.find((s) => s.id === id) || null;
}

/**
 * Get the next available ID for a new sitio
 * @returns Next available ID
 */
export function getNextSitioId(): number {
	const sitios = loadSitios();
	if (sitios.length === 0) return 1;
	return Math.max(...sitios.map((s) => s.id)) + 1;
}
