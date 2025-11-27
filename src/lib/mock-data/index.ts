import type {
	Activity,
	AllotmentDetails,
	ChartDataItem,
	ContractDetails,
	ExpenditureDetails,
	Project,
	Sitio,
	Stats,
	StatusSummary,
	User
} from '$lib/types';
import { loadProjects, loadSitios, saveProjects, saveSitios } from '$lib/utils/storage';
import {
	generateProjects,
	generateSitios,
	initializeMockDataIfNeeded,
	isMockDataInitialized,
	MOCK_DATA_INITIALIZED_KEY,
	MOCK_PROJECTS_KEY,
	MOCK_SITIOS_KEY,
	resetMockData
} from './generator';

// Re-export generator functions for external use
export {
	generateProjects,
	generateSitios,
	isMockDataInitialized,
	MOCK_DATA_INITIALIZED_KEY,
	MOCK_PROJECTS_KEY,
	MOCK_SITIOS_KEY,
	resetMockData
};

// ===== SITIOS DATA =====

// Initialize LocalStorage with generated mock data if empty (runs only in browser)
function initializeSitios(): Sitio[] {
	if (typeof window === 'undefined') {
		// Server-side: generate fresh data for SSR
		return generateSitios(50);
	}

	try {
		// First check if we have data in the main storage
		const storedSitios = loadSitios();
		if (storedSitios.length > 0) {
			return storedSitios;
		}

		// Check/initialize mock data
		const { sitios: generatedSitios } = initializeMockDataIfNeeded();

		// Also save to main storage for compatibility
		if (generatedSitios.length > 0) {
			saveSitios(generatedSitios);
		}

		return generatedSitios;
	} catch (error) {
		console.error('Failed to initialize sitios from storage:', error);
		return generateSitios(50);
	}
}

// Export sitios with LocalStorage integration
export const sitios: Sitio[] = initializeSitios();

// Export function to refresh sitios from storage (useful after imports)
export function refreshSitios(): Sitio[] {
	if (typeof window === 'undefined') {
		return generateSitios(50);
	}
	return loadSitios();
}

// ===== PROJECTS DATA =====

/**
 * Add financial and status details to a project for display/PDF generation
 */
function enrichProjectData(project: Project): Project {
	const allocated = project.budget;
	const supplemental = Math.floor(allocated * 0.1);
	const total = allocated + supplemental;
	const released = Math.floor(total * 0.85);
	const obligations = Math.floor(released * 0.9);
	const contractCost = Math.floor(total * 0.95);

	const maleEmployment = project.employment_generated?.male ?? 8 + Math.floor(Math.random() * 15);
	const femaleEmployment =
		project.employment_generated?.female ?? 5 + Math.floor(Math.random() * 10);

	const allotment: AllotmentDetails = {
		allocated,
		supplemental,
		total,
		released
	};

	const expenditure: ExpenditureDetails = {
		obligations,
		contract_cost: contractCost
	};

	const contract: ContractDetails = {
		duration: '120 CD',
		delivery: '120 CD',
		extension: project.status === 'suspended' ? 'Pending approval' : undefined
	};

	const statusSummary: StatusSummary = {
		stage:
			project.status === 'completed'
				? 'Completed'
				: project.status === 'in-progress'
					? 'Implementation'
					: project.status === 'suspended'
						? 'Suspended'
						: 'Planning',
		issues:
			project.status === 'suspended'
				? 'Project temporarily halted due to weather conditions.'
				: project.status === 'in-progress'
					? 'Ongoing, minor delays in material delivery.'
					: 'None',
		recommendations:
			project.status === 'suspended'
				? 'Resume works once weather improves and deploy catch-up teams.'
				: project.status === 'in-progress'
					? 'Coordinate with suppliers to expedite material delivery.'
					: 'Proceed as planned.'
	};

	const catchUpPlan =
		project.status === 'suspended'
			? 'Deploy double shifts upon resumption to recover lost time.'
			: project.status === 'in-progress'
				? 'Maintain current pace and monitor progress weekly.'
				: undefined;

	return {
		...project,
		allotment,
		expenditure,
		contract,
		status_summary: statusSummary,
		catch_up_plan: catchUpPlan,
		employment_generated: {
			male: maleEmployment,
			female: femaleEmployment
		}
	};
}

/**
 * Initialize projects from localStorage or generate new mock data
 */
function initializeProjects(): Project[] {
	if (typeof window === 'undefined') {
		// Server-side: generate fresh data for SSR
		const generatedSitios = generateSitios(50);
		const generatedProjects = generateProjects(generatedSitios, 20);
		return generatedProjects.map(enrichProjectData);
	}

	try {
		// First check if we have data in the main storage
		const storedProjects = loadProjects();
		if (storedProjects.length > 0) {
			return storedProjects.map(enrichProjectData);
		}

		// Check/initialize mock data
		const { projects: generatedProjects } = initializeMockDataIfNeeded();

		// Add financial/status details and save to main storage
		const enrichedProjects = generatedProjects.map(enrichProjectData);

		if (enrichedProjects.length > 0) {
			saveProjects(enrichedProjects);
		}

		return enrichedProjects;
	} catch (error) {
		console.error('Failed to initialize projects from storage:', error);
		const generatedSitios = generateSitios(50);
		const generatedProjects = generateProjects(generatedSitios, 20);
		return generatedProjects.map(enrichProjectData);
	}
}

// Export projects with LocalStorage integration
export const projects: Project[] = initializeProjects();

// Export function to refresh projects from storage (useful after creating new projects)
export function refreshProjects(): Project[] {
	if (typeof window === 'undefined') {
		const generatedSitios = generateSitios(50);
		const generatedProjects = generateProjects(generatedSitios, 20);
		return generatedProjects.map(enrichProjectData);
	}

	const storedProjects = loadProjects();
	return storedProjects.map(enrichProjectData);
}

// ===== USERS DATA =====
// Note: User management is now handled by src/lib/utils/user-storage.ts
// This export is kept for backward compatibility but uses the new storage
import { loadUsers } from '$lib/utils/user-storage';
export const users: User[] = loadUsers();

// ===== ACTIVITY LOG =====

export const activities: Activity[] = [
	{
		id: 1,
		user: 'Juan Dela Cruz',
		action: 'Created new project',
		target: 'Water System Installation - Sitio Maligaya',
		timestamp: '2024-11-19T09:30:00Z',
		icon: 'plus-circle'
	},
	{
		id: 2,
		user: 'Maria Santos',
		action: 'Updated project status',
		target: 'Farm-to-Market Road Construction',
		timestamp: '2024-11-19T08:20:00Z',
		icon: 'edit'
	},
	{
		id: 3,
		user: 'Pedro Reyes',
		action: 'Added new sitio',
		target: 'Sitio Greenhill',
		timestamp: '2024-11-18T11:00:00Z',
		icon: 'map-pin'
	},
	{
		id: 4,
		user: 'Ana Garcia',
		action: 'Uploaded project documents',
		target: 'Solar Street Lighting Project',
		timestamp: '2024-11-17T16:30:00Z',
		icon: 'upload'
	},
	{
		id: 5,
		user: 'Juan Dela Cruz',
		action: 'Generated report',
		target: 'Q3 2024 Progress Report',
		timestamp: '2024-11-16T10:15:00Z',
		icon: 'file-text'
	}
];

// ===== STATISTICS =====

export const stats: Stats = {
	total_sitios: sitios.length,
	total_projects: projects.length,
	active_projects: projects.filter((p) => p.status === 'in-progress').length,
	completed_projects: projects.filter((p) => p.status === 'completed').length,
	planning_projects: projects.filter((p) => p.status === 'planning').length,
	suspended_projects: projects.filter((p) => p.status === 'suspended').length,
	total_beneficiaries: projects.reduce((sum, p) => sum + p.beneficiaries, 0),
	total_budget: projects.reduce((sum, p) => sum + p.budget, 0),
	average_completion: Math.round(
		projects.reduce((sum, p) => sum + p.completion_percentage, 0) / projects.length
	),
	municipalities: [...new Set(sitios.map((s) => s.municipality))].length
};

// ===== CHART DATA =====

export const chartData = {
	projectsByCategory: [...new Set(projects.map((p) => p.category))].map((cat) => ({
		category: cat,
		count: projects.filter((p) => p.category === cat).length
	})) as ChartDataItem[],
	projectsByStatus: [
		{ status: 'Planning', count: stats.planning_projects },
		{ status: 'In Progress', count: stats.active_projects },
		{ status: 'Completed', count: stats.completed_projects },
		{ status: 'Suspended', count: stats.suspended_projects }
	] as ChartDataItem[],
	projectsByMunicipality: (() => {
		const allMunicipalities = projects.flatMap(
			(p) => p.project_sitios?.map((s) => s.municipality) || []
		);
		const uniqueMunicipalities = [...new Set(allMunicipalities)];
		return uniqueMunicipalities.map(
			(mun) =>
				({
					municipality: mun,
					count: projects.filter((p) => p.project_sitios?.some((s) => s.municipality === mun))
						.length
				}) as ChartDataItem
		);
	})(),
	monthlyProgress: [
		{ month: 'Jan', completed: 2 },
		{ month: 'Feb', completed: 3 },
		{ month: 'Mar', completed: 4 },
		{ month: 'Apr', completed: 3 },
		{ month: 'May', completed: 5 },
		{ month: 'Jun', completed: 4 },
		{ month: 'Jul', completed: 6 },
		{ month: 'Aug', completed: 5 },
		{ month: 'Sep', completed: 4 },
		{ month: 'Oct', completed: 7 },
		{ month: 'Nov', completed: 3 }
	] as ChartDataItem[]
};

// ===== HELPER FUNCTIONS =====

export function getSitioById(id: number): Sitio | undefined {
	return sitios.find((s) => s.id === id);
}

export function getProjectById(id: number): Project | undefined {
	return projects.find((p) => p.id === id);
}

export function getProjectsBySitio(sitioId: number): Project[] {
	return projects.filter((p) => {
		// Check project_sitios array for multi-sitio projects
		return p.project_sitios?.some((ps) => ps.sitio_id === sitioId) ?? false;
	});
}

export function getProjectsByStatus(status: string): Project[] {
	return projects.filter((p) => p.status === status);
}

export interface ProjectFilters {
	category?: string;
	status?: string;
	municipality?: string;
	year?: number;
	search?: string;
}

export function filterProjects(filters: ProjectFilters): Project[] {
	return projects.filter((project) => {
		if (filters.category && project.category !== filters.category) return false;
		if (filters.status && project.status !== filters.status) return false;
		if (filters.municipality) {
			const hasMatchingMunicipality = project.project_sitios?.some(
				(s) => s.municipality === filters.municipality
			);
			if (!hasMatchingMunicipality) return false;
		}
		if (filters.year && project.project_year !== filters.year) return false;
		if (filters.search) {
			const searchTerm = filters.search.toLowerCase();
			const sitioNames = project.project_sitios?.map((s) => s.sitio_name).join(' ') || '';
			const searchableText = `${project.title} ${project.description} ${sitioNames}`.toLowerCase();
			if (!searchableText.includes(searchTerm)) return false;
		}
		return true;
	});
}

export interface SitioFilters {
	municipality?: string;
	barangay?: string;
	search?: string;
}

export function filterSitios(filters: SitioFilters): Sitio[] {
	return sitios.filter((sitio) => {
		if (filters.municipality && sitio.municipality !== filters.municipality) return false;
		if (filters.barangay && sitio.barangay !== filters.barangay) return false;
		if (filters.search) {
			const searchTerm = filters.search.toLowerCase();
			const searchableText = `${sitio.name} ${sitio.barangay} ${sitio.municipality}`.toLowerCase();
			if (!searchableText.includes(searchTerm)) return false;
		}
		return true;
	});
}
