import type { Project, Sitio } from '$lib/types';
import type { SitioYearlySnapshot } from '$lib/types/sitio-yearly';
import { createSnapshotFromSitio, safeValidateSnapshot } from '$lib/types/sitio-yearly';
import { calculateChanges, logAuditAction } from './audit';
import { getCategoryName } from './project-calculations';

const SITIOS_STORAGE_KEY = 'sccdp_sitios';
const PROJECTS_STORAGE_KEY = 'sccdp_projects';
const SITIO_YEARLY_STORAGE_KEY = 'sccdp_sitio_yearly';
const MOCK_SITIO_SNAPSHOTS_KEY = 'sccdp_sitio_snapshots'; // Centralized mock data storage
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ===== SITIOS STORAGE FUNCTIONS =====

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
		localStorage.setItem(SITIOS_STORAGE_KEY, json);
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
		const json = localStorage.getItem(SITIOS_STORAGE_KEY);
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
	localStorage.removeItem(SITIOS_STORAGE_KEY);
}

/**
 * Get current storage size in bytes for sitios
 * @returns Size in bytes
 */
export function getSitiosStorageSize(): number {
	const json = localStorage.getItem(SITIOS_STORAGE_KEY);
	return json ? json.length : 0;
}

/**
 * Get storage usage percentage for sitios
 * @returns Percentage (0-100)
 */
export function getSitiosStorageUsagePercentage(): number {
	const size = getSitiosStorageSize();
	return (size / MAX_STORAGE_SIZE) * 100;
}

/**
 * Check if sitios storage is approaching limit (80%+)
 * @returns true if storage is at or above 80% capacity
 */
export function isSitiosStorageNearLimit(): boolean {
	return getSitiosStorageUsagePercentage() >= 80;
}

/**
 * Add a new sitio to storage
 * @param sitio Sitio object to add
 * @returns true if successful, false otherwise
 */
export function addSitio(sitio: Sitio): boolean {
	const sitios = loadSitios();
	sitios.push(sitio);
	const success = saveSitios(sitios);
	if (success) {
		logAuditAction(
			'create',
			'sitio',
			sitio.id,
			sitio.name,
			`Created sitio in ${sitio.barangay}, ${sitio.municipality}`
		);
	}
	return success;
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

	const oldSitio = sitios[index];
	const sitioName = updates.name || oldSitio.name;

	// Calculate what fields changed
	const changes = calculateChanges(oldSitio, updates);

	sitios[index] = {
		...oldSitio,
		...updates,
		updated_at: new Date().toISOString()
	};

	const success = saveSitios(sitios);
	if (success) {
		const changedFields = changes.map((c) => c.field).join(', ');
		logAuditAction(
			'update',
			'sitio',
			id,
			sitioName,
			changedFields ? `Updated: ${changedFields}` : 'Updated sitio information',
			changes
		);
	}
	return success;
}

/**
 * Delete a sitio from storage
 * @param id Sitio ID to delete
 * @returns true if successful, false otherwise
 */
export function deleteSitio(id: number): boolean {
	const sitios = loadSitios();
	const sitioToDelete = sitios.find((s) => s.id === id);
	const filteredSitios = sitios.filter((s) => s.id !== id);

	if (filteredSitios.length === sitios.length) {
		console.error(`Sitio with id ${id} not found`);
		return false;
	}

	const success = saveSitios(filteredSitios);
	if (success && sitioToDelete) {
		// Clean up associated yearly snapshots to prevent orphaned data
		clearSitioYearlySnapshots(id);

		logAuditAction(
			'delete',
			'sitio',
			id,
			sitioToDelete.name,
			`Deleted sitio from ${sitioToDelete.municipality}`
		);
	}
	return success;
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

// ===== PROJECTS STORAGE FUNCTIONS =====

/**
 * Save projects to LocalStorage
 * @param projects Array of Project objects to save
 * @returns true if successful, false otherwise
 */
export function saveProjects(projects: Project[]): boolean {
	try {
		const json = JSON.stringify(projects);
		if (json.length > MAX_STORAGE_SIZE) {
			throw new Error('Data exceeds LocalStorage limit (5MB)');
		}
		localStorage.setItem(PROJECTS_STORAGE_KEY, json);
		return true;
	} catch (error) {
		console.error('Failed to save projects:', error);
		return false;
	}
}

/**
 * Load projects from LocalStorage
 * @returns Array of Project objects, empty array if none found or on error
 */
export function loadProjects(): Project[] {
	try {
		const json = localStorage.getItem(PROJECTS_STORAGE_KEY);
		return json ? JSON.parse(json) : [];
	} catch (error) {
		console.error('Failed to load projects:', error);
		return [];
	}
}

/**
 * Clear all projects from LocalStorage
 */
export function clearProjects(): void {
	localStorage.removeItem(PROJECTS_STORAGE_KEY);
}

/**
 * Get current storage size in bytes for projects
 * @returns Size in bytes
 */
export function getProjectsStorageSize(): number {
	const json = localStorage.getItem(PROJECTS_STORAGE_KEY);
	return json ? json.length : 0;
}

/**
 * Add a new project to storage
 * @param project Project object to add
 * @returns true if successful, false otherwise
 */
export function addProject(project: Project): boolean {
	const projects = loadProjects();
	projects.push(project);
	const success = saveProjects(projects);
	if (success) {
		logAuditAction(
			'create',
			'project',
			project.id,
			project.title,
			`Created project: ${getCategoryName(project.category_key)} - Budget: ₱${project.total_budget.toLocaleString()}`
		);
	}
	return success;
}

/**
 * Update an existing project in storage
 * @param id Project ID to update
 * @param updates Partial project data to update
 * @returns true if successful, false otherwise
 */
export function updateProject(id: number, updates: Partial<Project>): boolean {
	const projects = loadProjects();
	const index = projects.findIndex((p) => p.id === id);

	if (index === -1) {
		console.error(`Project with id ${id} not found`);
		return false;
	}

	const oldProject = projects[index];
	const projectTitle = updates.title || oldProject.title;

	// Calculate what fields changed
	const changes = calculateChanges(oldProject, updates);

	projects[index] = {
		...oldProject,
		...updates,
		updated_at: new Date().toISOString()
	};

	const success = saveProjects(projects);
	if (success) {
		const changedFields = changes.map((c) => c.field).join(', ');
		logAuditAction(
			'update',
			'project',
			id,
			projectTitle,
			changedFields ? `Updated: ${changedFields}` : 'Updated project information',
			changes
		);
	}
	return success;
}

/**
 * Delete a project from storage
 * @param id Project ID to delete
 * @returns true if successful, false otherwise
 */
export function deleteProject(id: number): boolean {
	const projects = loadProjects();
	const projectToDelete = projects.find((p) => p.id === id);
	const filteredProjects = projects.filter((p) => p.id !== id);

	if (filteredProjects.length === projects.length) {
		console.error(`Project with id ${id} not found`);
		return false;
	}

	const success = saveProjects(filteredProjects);
	if (success && projectToDelete) {
		logAuditAction(
			'delete',
			'project',
			id,
			projectToDelete.title,
			`Deleted project: ${getCategoryName(projectToDelete.category_key)}`
		);
	}
	return success;
}

/**
 * Get a single project by ID
 * @param id Project ID
 * @returns Project object or null if not found
 */
export function getProjectById(id: number): Project | null {
	const projects = loadProjects();
	return projects.find((p) => p.id === id) || null;
}

/**
 * Get the next available ID for a new project
 * Note: In production, this should consider both localStorage and mock data IDs
 * to avoid conflicts. For safety, we start at ID 1000 for user-created projects.
 * @returns Next available ID
 */
export function getNextProjectId(): number {
	const projects = loadProjects();

	// Start user-created projects at ID 1000 to avoid conflicts with mock data
	const MIN_USER_PROJECT_ID = 1000;

	if (projects.length === 0) {
		return MIN_USER_PROJECT_ID;
	}

	const maxId = Math.max(...projects.map((p) => p.id));
	return Math.max(maxId + 1, MIN_USER_PROJECT_ID);
}

// ===== SITIO YEARLY SNAPSHOTS STORAGE FUNCTIONS =====

/**
 * Get the storage key for a specific sitio's yearly data
 */
function getSitioYearlyKey(sitioId: number): string {
	return `${SITIO_YEARLY_STORAGE_KEY}_${sitioId}`;
}

/**
 * Load snapshots from the centralized mock data storage for a specific sitio
 * @param sitioId The sitio ID
 * @returns Array of snapshots for this sitio from mock data, or empty array
 */
function loadMockSnapshots(sitioId: number): SitioYearlySnapshot[] {
	try {
		const json = localStorage.getItem(MOCK_SITIO_SNAPSHOTS_KEY);
		if (!json) return [];

		const allSnapshots: Array<{ sitio_id: number; snapshots: SitioYearlySnapshot[] }> =
			JSON.parse(json);
		const sitioEntry = allSnapshots.find((entry) => entry.sitio_id === sitioId);
		return sitioEntry?.snapshots || [];
	} catch (error) {
		console.error(`Failed to load mock snapshots for sitio ${sitioId}:`, error);
		return [];
	}
}

/**
 * Load all yearly snapshots for a sitio
 * Checks both per-sitio storage and centralized mock data storage
 * @param sitioId The sitio ID
 * @returns Array of yearly snapshots sorted by year descending
 */
export function loadSitioYearlySnapshots(sitioId: number): SitioYearlySnapshot[] {
	try {
		// First, try to load from per-sitio storage (user-created snapshots)
		const perSitioJson = localStorage.getItem(getSitioYearlyKey(sitioId));
		const perSitioSnapshots: SitioYearlySnapshot[] = perSitioJson ? JSON.parse(perSitioJson) : [];

		// If we have per-sitio data, use it (user has saved their own snapshots)
		if (perSitioSnapshots.length > 0) {
			return perSitioSnapshots.sort((a, b) => b.year - a.year);
		}

		// Otherwise, fall back to centralized mock data storage
		const mockSnapshots = loadMockSnapshots(sitioId);
		return mockSnapshots.sort((a, b) => b.year - a.year);
	} catch (error) {
		console.error(`Failed to load yearly snapshots for sitio ${sitioId}:`, error);
		return [];
	}
}

/**
 * Save yearly snapshots for a sitio
 * @param sitioId The sitio ID
 * @param snapshots Array of yearly snapshots
 * @returns true if successful, false otherwise
 */
export function saveSitioYearlySnapshots(
	sitioId: number,
	snapshots: SitioYearlySnapshot[]
): boolean {
	try {
		const json = JSON.stringify(snapshots);
		localStorage.setItem(getSitioYearlyKey(sitioId), json);
		return true;
	} catch (error) {
		console.error(`Failed to save yearly snapshots for sitio ${sitioId}:`, error);
		return false;
	}
}

/**
 * Get a specific year's snapshot for a sitio
 * @param sitioId The sitio ID
 * @param year The year to get
 * @returns The snapshot or null if not found
 */
export function getSitioSnapshotByYear(sitioId: number, year: number): SitioYearlySnapshot | null {
	const snapshots = loadSitioYearlySnapshots(sitioId);
	return snapshots.find((s) => s.year === year) || null;
}

/**
 * Save or update a yearly snapshot for a sitio.
 * If a snapshot for the same year exists, it will be overwritten.
 * Validates snapshot data using Zod schema before saving.
 * @param sitioId The sitio ID
 * @param snapshot The snapshot to save
 * @param sitioName Optional sitio name for audit logging
 * @returns true if successful, false otherwise
 */
export function saveOrUpdateYearlySnapshot(
	sitioId: number,
	snapshot: SitioYearlySnapshot,
	sitioName?: string
): boolean {
	// Validate snapshot data
	const validation = safeValidateSnapshot(snapshot);
	if (!validation.success) {
		console.error(`Invalid snapshot data for sitio ${sitioId}:`, validation.error);
		return false;
	}

	const validatedSnapshot = validation.data;
	const snapshots = loadSitioYearlySnapshots(sitioId);
	const existingIndex = snapshots.findIndex((s) => s.year === validatedSnapshot.year);
	const isUpdate = existingIndex >= 0;

	if (isUpdate) {
		// Update existing snapshot for the same year
		snapshots[existingIndex] = {
			...validatedSnapshot,
			recorded_at: new Date().toISOString()
		};
	} else {
		// Add new snapshot
		snapshots.push(validatedSnapshot);
	}

	const success = saveSitioYearlySnapshots(sitioId, snapshots);
	if (success) {
		logAuditAction(
			isUpdate ? 'update' : 'create',
			'sitio',
			sitioId,
			sitioName || `Sitio #${sitioId}`,
			`${isUpdate ? 'Updated' : 'Created'} yearly snapshot for ${validatedSnapshot.year}`
		);
	}
	return success;
}

/**
 * Save current sitio data as a yearly snapshot
 * @param sitio The sitio to snapshot
 * @param year The year for the snapshot (defaults to current year)
 * @returns true if successful, false otherwise
 */
export function saveSitioAsYearlySnapshot(sitio: Sitio, year?: number): boolean {
	const snapshotYear = year ?? new Date().getFullYear();
	const snapshot = createSnapshotFromSitio(sitio, snapshotYear);
	return saveOrUpdateYearlySnapshot(sitio.id, snapshot, sitio.name);
}

/**
 * Get all available years for a sitio's snapshots
 * @param sitioId The sitio ID
 * @returns Array of years sorted descending
 */
export function getSitioAvailableYears(sitioId: number): number[] {
	const snapshots = loadSitioYearlySnapshots(sitioId);
	return snapshots.map((s) => s.year).sort((a, b) => b - a);
}

/**
 * Delete a specific year's snapshot
 * @param sitioId The sitio ID
 * @param year The year to delete
 * @param sitioName Optional sitio name for audit logging
 * @returns true if successful, false otherwise
 */
export function deleteYearlySnapshot(sitioId: number, year: number, sitioName?: string): boolean {
	const snapshots = loadSitioYearlySnapshots(sitioId);
	const filteredSnapshots = snapshots.filter((s) => s.year !== year);

	if (filteredSnapshots.length === snapshots.length) {
		console.error(`Snapshot for year ${year} not found for sitio ${sitioId}`);
		return false;
	}

	const success = saveSitioYearlySnapshots(sitioId, filteredSnapshots);
	if (success) {
		logAuditAction(
			'delete',
			'sitio',
			sitioId,
			sitioName || `Sitio #${sitioId}`,
			`Deleted yearly snapshot for ${year}`
		);
	}
	return success;
}

/**
 * Clear all yearly snapshots for a sitio
 * @param sitioId The sitio ID
 */
export function clearSitioYearlySnapshots(sitioId: number): void {
	localStorage.removeItem(getSitioYearlyKey(sitioId));
}

/**
 * Get the most recent snapshot for a sitio
 * @param sitioId The sitio ID
 * @returns The most recent snapshot or null if none exist
 */
export function getMostRecentSnapshot(sitioId: number): SitioYearlySnapshot | null {
	const snapshots = loadSitioYearlySnapshots(sitioId);
	return snapshots.length > 0 ? snapshots[0] : null;
}

/**
 * Get trend data for a metric across all years
 * @param sitioId The sitio ID
 * @param metricExtractor Function to extract the metric value from a snapshot
 * @returns Array of { year, value } sorted by year ascending
 */
export function getSitioMetricTrend(
	sitioId: number,
	metricExtractor: (snapshot: SitioYearlySnapshot) => number
): Array<{ year: number; value: number }> {
	const snapshots = loadSitioYearlySnapshots(sitioId);
	return snapshots
		.map((s) => ({
			year: s.year,
			value: metricExtractor(s)
		}))
		.sort((a, b) => a.year - b.year);
}
