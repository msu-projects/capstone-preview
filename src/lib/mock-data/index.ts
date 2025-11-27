import type {
	Activity,
	ChartDataItem,
	MonitoringDetails,
	Project,
	Sitio,
	Stats,
	User
} from '$lib/types';
import { loadProjects, loadSitios, saveSitios } from '$lib/utils/storage';
import { csvSitiosData } from './csv-sitios';
import { enhancedProjects } from './enhanced-projects';

// ===== HELPER FUNCTIONS =====

function createMonitoringDetails(overrides: Partial<MonitoringDetails> = {}): MonitoringDetails {
	const base: MonitoringDetails = {
		fundSource: '20% LDF',
		fiscalYear: 2025,
		implementingUnit: "Provincial Governor's Office - CATCH-UP Program", // Always PGO-CATCH-UP
		location: '',
		allotment: {
			allocated: 0,
			supplemental: 0,
			total: 0,
			released: 0
		},
		expenditure: {
			obligations: 0,
			contractCost: 0
		},
		physical: {
			plan: 0,
			actual: 0,
			slippage: 0
		},
		employment: {
			male: 0,
			female: 0
		},
		contract: {
			duration: 'N/A',
			delivery: 'N/A',
			extension: 'None'
		},
		statusSummary: {
			stage: 'Planning',
			issues: 'No major issues reported.',
			recommendations: 'Maintain current work program.'
		},
		catchUpPlan: 'N/A'
	};

	return {
		...base,
		...overrides,
		// Always ensure implementingUnit is set to default
		implementingUnit: "Provincial Governor's Office - CATCH-UP Program",
		allotment: { ...base.allotment, ...(overrides.allotment || {}) },
		expenditure: { ...base.expenditure, ...(overrides.expenditure || {}) },
		physical: { ...base.physical, ...(overrides.physical || {}) },
		employment: { ...base.employment, ...(overrides.employment || {}) },
		contract: { ...base.contract, ...(overrides.contract || {}) },
		statusSummary: { ...base.statusSummary, ...(overrides.statusSummary || {}) }
	};
}

// ===== SITIOS DATA =====

// Initialize LocalStorage with CSV data if empty (runs only in browser)
function initializeSitios(): Sitio[] {
	if (typeof window === 'undefined') {
		// Server-side: return CSV data
		return csvSitiosData;
	}

	try {
		const storedSitios = loadSitios();
		if (storedSitios.length === 0) {
			// First load: initialize with CSV data
			saveSitios(csvSitiosData);
			return csvSitiosData;
		}
		return storedSitios;
	} catch (error) {
		console.error('Failed to initialize sitios from storage:', error);
		return csvSitiosData;
	}
}

// Export sitios with LocalStorage integration
export const sitios: Sitio[] = initializeSitios();

// Export function to refresh sitios from storage (useful after imports)
export function refreshSitios(): Sitio[] {
	if (typeof window === 'undefined') {
		return csvSitiosData;
	}
	return loadSitios();
}

// ===== PROJECTS DATA =====

// Use enhanced projects with comprehensive multi-sitio tracking
// Add monitoring data to enhanced projects for PDF generation
const enhancedProjectsWithMonitoring = enhancedProjects.map((project) => {
	// Add monitoring data based on project status and budget
	const allocated = project.budget;
	const supplemental = Math.floor(allocated * 0.1);
	const total = allocated + supplemental;
	const released = Math.floor(total * 0.85);
	const obligations = Math.floor(released * 0.9);
	const contractCost = Math.floor(total * 0.95);

	const plan = project.completion_percentage + 5;
	const actual = project.completion_percentage;
	const slippage = Number((actual - plan).toFixed(2));

	const maleEmployment = 8 + Math.floor(Math.random() * 15);
	const femaleEmployment = 5 + Math.floor(Math.random() * 10);

	return {
		...project,
		employment_generated: {
			male: maleEmployment,
			female: femaleEmployment
		},
		monitoring: createMonitoringDetails({
			location: `${project.municipality}`,
			fiscalYear: project.project_year,
			allotment: {
				allocated,
				supplemental,
				total,
				released
			},
			expenditure: {
				obligations,
				contractCost
			},
			physical: {
				plan,
				actual,
				slippage
			},
			employment: {
				male: maleEmployment,
				female: femaleEmployment
			},
			contract: {
				duration: '120 CD',
				delivery: '120 CD',
				extension: project.status === 'suspended' ? 'Pending approval' : 'None'
			},
			statusSummary: {
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
			},
			catchUpPlan:
				project.status === 'suspended'
					? 'Deploy double shifts upon resumption to recover lost time.'
					: project.status === 'in-progress'
						? 'Maintain current pace and monitor progress weekly.'
						: 'N/A'
		})
	};
});

/**
 * Initialize projects by merging mock data with localStorage projects
 */
function initializeProjects(): Project[] {
	if (typeof window === 'undefined') {
		// Server-side: return default mock data
		return enhancedProjectsWithMonitoring;
	}

	try {
		const storedProjects = loadProjects();

		// Merge: localStorage projects take precedence (by ID)
		// Start with mock data
		const mockProjectsMap = new Map<number, Project>(
			enhancedProjectsWithMonitoring.map((p) => [p.id, p])
		);

		// Override with localStorage projects (or add new ones)
		// Ensure monitoring details exist for stored projects
		storedProjects.forEach((storedProject) => {
			const projectWithMonitoring: Project = {
				...storedProject,
				// Add monitoring details if not present
				monitoring:
					storedProject.monitoring ||
					createMonitoringDetails({
						location: storedProject.municipality || '',
						fiscalYear: storedProject.project_year,
						allotment: {
							allocated: storedProject.budget,
							supplemental: 0,
							total: storedProject.budget,
							released: 0
						}
					})
			};
			mockProjectsMap.set(storedProject.id, projectWithMonitoring);
		});

		// Convert back to array and sort by ID
		return Array.from(mockProjectsMap.values()).sort((a, b) => a.id - b.id);
	} catch (error) {
		console.error('Failed to initialize projects from storage:', error);
		return enhancedProjectsWithMonitoring;
	}
}

// Export projects with LocalStorage integration
export const projects: Project[] = initializeProjects();

// Export function to refresh projects from storage (useful after creating new projects)
export function refreshProjects(): Project[] {
	if (typeof window === 'undefined') {
		return enhancedProjectsWithMonitoring;
	}

	const storedProjects = loadProjects();
	const mockProjectsMap = new Map<number, Project>(
		enhancedProjectsWithMonitoring.map((p) => [p.id, p])
	);
	storedProjects.forEach((storedProject) => {
		const projectWithMonitoring: Project = {
			...storedProject,
			monitoring:
				storedProject.monitoring ||
				createMonitoringDetails({
					location: storedProject.municipality || '',
					fiscalYear: storedProject.project_year,
					allotment: {
						allocated: storedProject.budget,
						supplemental: 0,
						total: storedProject.budget,
						released: 0
					}
				})
		};
		mockProjectsMap.set(storedProject.id, projectWithMonitoring);
	});
	return Array.from(mockProjectsMap.values()).sort((a, b) => a.id - b.id);
}

// ===== USERS DATA =====

export const users: User[] = [
	{
		id: 1,
		name: 'Juan Dela Cruz',
		email: 'juan.delacruz@southcotabato.gov.ph',
		role: 'Admin',
		department: 'DILG',
		status: 'active',
		last_login: '2024-11-15 09:30:00',
		created_at: '2024-01-10'
	},
	{
		id: 2,
		name: 'Maria Santos',
		email: 'maria.santos@southcotabato.gov.ph',
		role: 'Editor',
		department: 'DPWH',
		status: 'active',
		last_login: '2024-11-14 14:20:00',
		created_at: '2024-01-15'
	},
	{
		id: 3,
		name: 'Pedro Reyes',
		email: 'pedro.reyes@southcotabato.gov.ph',
		role: 'Viewer',
		department: 'DepEd',
		status: 'active',
		last_login: '2024-11-13 11:00:00',
		created_at: '2024-02-01'
	},
	{
		id: 4,
		name: 'Ana Garcia',
		email: 'ana.garcia@southcotabato.gov.ph',
		role: 'Editor',
		department: 'DA',
		status: 'active',
		last_login: '2024-11-12 08:45:00',
		created_at: '2024-02-10'
	}
];

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
	projectsByMunicipality: [...new Set(projects.map((p) => p.municipality))].map(
		(mun) =>
			({
				municipality: mun,
				count: projects.filter((p) => p.municipality === mun).length
			}) as ChartDataItem
	),
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
		// Check legacy sitio_id field
		if (p.sitio_id === sitioId) return true;
		// Check new project_sitios array for multi-sitio projects
		if (p.project_sitios && p.project_sitios.some((ps) => ps.sitio_id === sitioId)) return true;
		return false;
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
		if (filters.municipality && project.municipality !== filters.municipality) return false;
		if (filters.year && project.project_year !== filters.year) return false;
		if (filters.search) {
			const searchTerm = filters.search.toLowerCase();
			const searchableText =
				`${project.title} ${project.description} ${project.sitio_name}`.toLowerCase();
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
