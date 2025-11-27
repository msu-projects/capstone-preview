import type { Project } from '$lib/types';
import { csvSitiosData } from './csv-sitios';

/**
 * Enhanced Mock Projects with Multi-Sitio Support
 * Based on the Improved Project Tracking System v2
 * References actual sitio data from CSV import
 */

export const enhancedProjects: Project[] = [
	{
		id: 100,
		title: 'Seedling Distribution Program - Lake Sebu Cluster',
		description:
			'Distribution of high-value vegetable seedlings to upland communities in Lake Sebu and Tboli municipalities, covering 5 vulnerable sitios.',
		category: 'Agriculture',
		category_key: 'agriculture',
		project_type_id: 9,
		project_type_name: 'Seedling Distribution Program',
		status: 'in-progress',
		start_date: '2025-01-15',
		end_date: '2025-06-30',
		budget: 850000,
		beneficiaries: 450, // Total across all sitios
		completion_percentage: 35,
		project_year: 2025,
		// NEW ENHANCED FIELDS
		project_sitios: [
			{
				project_id: 100,
				sitio_id: 94,
				sitio_name: csvSitiosData[0].name,
				municipality: csvSitiosData[0].municipality,
				barangay: csvSitiosData[0].barangay,
				beneficiaries_target: 110,
				priority_level: 'high',
				focal_person: 'Kgwd. Mario Santos',
				focal_contact: '0912-345-6789'
			}
		],
		monthly_progress: [
			{
				id: 2001,
				project_id: 100,
				sitio_id: undefined, // Project-level progress
				month_year: '2025-01',
				achieved_outputs: {
					seedlings_distributed: 0,
					hectares_covered: 0,
					farmers_benefited: 0,
					training_sessions: 0
				},
				beneficiaries_reached: 0,
				issues_encountered: 'Initial planning and beneficiary validation completed',
				photo_urls: [],
				status: 'on-track',
				created_at: '2025-01-31',
				updated_at: '2025-01-31'
			},
			{
				id: 2002,
				project_id: 100,
				sitio_id: undefined,
				month_year: '2025-02',
				achieved_outputs: {
					seedlings_distributed: 5200,
					hectares_covered: 8.5,
					farmers_benefited: 27,
					training_sessions: 2
				},
				beneficiaries_reached: 27,
				issues_encountered: 'None - on schedule',
				photo_urls: [],
				status: 'ahead',
				created_at: '2025-02-28',
				updated_at: '2025-02-28'
			},
			{
				id: 2003,
				project_id: 100,
				sitio_id: undefined,
				month_year: '2025-03',
				achieved_outputs: {
					seedlings_distributed: 7500,
					hectares_covered: 11,
					farmers_benefited: 28,
					training_sessions: 3
				},
				beneficiaries_reached: 55,
				issues_encountered: 'Heavy rains delayed distribution in Sitio Pagasa by 5 days',
				photo_urls: [],
				status: 'delayed',
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		monthly_budget: [
			{
				id: 3001,
				project_id: 100,
				month_year: '2025-01',
				budget_released: 100000,
				actual_expenses: 45000,
				obligations: 50000,
				remaining_balance: 805000,
				created_at: '2025-01-31',
				updated_at: '2025-01-31'
			},
			{
				id: 3002,
				project_id: 100,
				month_year: '2025-02',
				budget_released: 200000,
				actual_expenses: 185000,
				obligations: 195000,
				remaining_balance: 615000,
				created_at: '2025-02-28',
				updated_at: '2025-02-28'
			},
			{
				id: 3003,
				project_id: 100,
				month_year: '2025-03',
				budget_released: 180000,
				actual_expenses: 165000,
				obligations: 170000,
				remaining_balance: 450000,
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		funding_sources: [
			{
				id: 5001,
				project_id: 100,
				source_name: 'Provincial LDF',
				source_type: 'provincial',
				amount: 500000,
				percentage: 58.8
			},
			{
				id: 5002,
				project_id: 100,
				source_name: 'DA Region XII - HVCDP',
				source_type: 'national',
				amount: 250000,
				percentage: 29.4
			},
			{
				id: 5003,
				project_id: 100,
				source_name: 'LGU Counterpart (Lake Sebu & Tboli)',
				source_type: 'lgu_counterpart',
				amount: 100000,
				percentage: 11.8
			}
		],
		budget_components: [
			{
				id: 6001,
				project_id: 100,
				component_name: 'Seedlings & Planting Materials',
				amount: 450000,
				percentage: 52.9
			},
			{
				id: 6002,
				project_id: 100,
				component_name: 'Training & Capacity Building',
				amount: 180000,
				percentage: 21.2
			},
			{
				id: 6003,
				project_id: 100,
				component_name: 'Transportation & Logistics',
				amount: 120000,
				percentage: 14.1
			},
			{
				id: 6004,
				project_id: 100,
				component_name: 'Tools & Equipment Distribution',
				amount: 70000,
				percentage: 8.2
			},
			{
				id: 6005,
				project_id: 100,
				component_name: 'Administrative Costs',
				amount: 30000,
				percentage: 3.6
			}
		],
		release_schedule: [
			{
				id: 7001,
				project_id: 100,
				month_year: '2025-01',
				planned_release: 100000,
				actual_release: 100000,
				milestone_tied: 'Project mobilization and beneficiary validation'
			},
			{
				id: 7002,
				project_id: 100,
				month_year: '2025-02',
				planned_release: 200000,
				actual_release: 200000,
				milestone_tied: 'First batch seedling procurement and distribution'
			},
			{
				id: 7003,
				project_id: 100,
				month_year: '2025-03',
				planned_release: 180000,
				actual_release: 180000,
				milestone_tied: 'Second batch distribution and training'
			},
			{
				id: 7004,
				project_id: 100,
				month_year: '2025-04',
				planned_release: 180000,
				milestone_tied: 'Third batch distribution'
			},
			{
				id: 7005,
				project_id: 100,
				month_year: '2025-05',
				planned_release: 120000,
				milestone_tied: 'Final distribution and monitoring'
			},
			{
				id: 7006,
				project_id: 100,
				month_year: '2025-06',
				planned_release: 70000,
				milestone_tied: 'Project completion and evaluation'
			}
		],
		project_manager_team: {
			project_manager: 'Agri. Techn. Maria Gonzales',
			agency: "Provincial Agriculturist's Office",
			technical_lead: 'Dr. Ramon Torres',
			lgu_counterpart: ['MAO - Lake Sebu', 'MAO - Tboli']
		},
		sitio_coordinators: [
			{
				sitio_id: 94,
				barangay_captain: 'Kap. Jose Delgado',
				sitio_leader: 'Datu Ramon Klibaw',
				volunteer_coordinator: 'Bai Maria Santos',
				contact_numbers: ['0912-345-6789', '0923-456-7890']
			},
			{
				sitio_id: 20,
				barangay_captain: 'Kap. Anna Reyes',
				sitio_leader: 'Kgwd. Pedro Manalo',
				volunteer_coordinator: 'Linda Cruz',
				contact_numbers: ['0923-456-7890', '0934-567-8901']
			},
			{
				sitio_id: 21,
				barangay_captain: 'Kap. Roberto Garcia',
				sitio_leader: 'Kgwd. Carmen Diaz',
				volunteer_coordinator: 'Juan Mercado',
				contact_numbers: ['0934-567-8901', '0945-678-9012']
			}
		],
		oversight_structure: {
			provincial_team: ['Provincial Agriculturist', 'PPDO Monitoring Team'],
			dilg_rep: 'LGOO Maria Santos',
			sectoral_rep: 'Federation of Farmers Associations - South Cotabato'
		},
		employment_generated: {
			male: 18,
			female: 12
		},
		created_at: '2025-01-10',
		updated_at: '2025-11-11'
	}
];

/**
 * Helper function to get enhanced projects
 */
export function getEnhancedProjects(): Project[] {
	return enhancedProjects;
}

/**
 * Helper function to get enhanced project by ID
 */
export function getEnhancedProjectById(id: number): Project | undefined {
	return enhancedProjects.find((p) => p.id === id);
}

/**
 * Helper function to get projects by category
 */
export function getEnhancedProjectsByCategory(categoryKey: string): Project[] {
	return enhancedProjects.filter((p) => p.category_key === categoryKey);
}
