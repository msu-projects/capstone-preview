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
		// Legacy fields (deprecated - for backward compatibility only)
		sitio_id: 0,
		sitio_name: '',
		municipality: '',
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
		performance_targets: [
			{
				id: 1001,
				project_id: 100,
				indicator_type: 'seedlings_distributed',
				indicator_name: 'Number of Seedlings',
				target_value: 25000,
				unit_of_measure: 'seedlings',
				monthly_breakdown: {
					'2025-01': 0,
					'2025-02': 5000,
					'2025-03': 8000,
					'2025-04': 7000,
					'2025-05': 3000,
					'2025-06': 2000
				}
			},
			{
				id: 1002,
				project_id: 100,
				indicator_type: 'hectares_covered',
				indicator_name: 'Hectares Covered',
				target_value: 45,
				unit_of_measure: 'hectares',
				monthly_breakdown: {
					'2025-01': 0,
					'2025-02': 8,
					'2025-03': 12,
					'2025-04': 13,
					'2025-05': 7,
					'2025-06': 5
				}
			},
			{
				id: 1003,
				project_id: 100,
				indicator_type: 'farmers_benefited',
				indicator_name: 'Farmer Beneficiaries',
				target_value: 120,
				unit_of_measure: 'farmers',
				monthly_breakdown: {
					'2025-01': 0,
					'2025-02': 25,
					'2025-03': 30,
					'2025-04': 30,
					'2025-05': 20,
					'2025-06': 15
				}
			},
			{
				id: 1004,
				project_id: 100,
				indicator_type: 'training_sessions',
				indicator_name: 'Training Sessions',
				target_value: 10,
				unit_of_measure: 'sessions',
				monthly_breakdown: {
					'2025-01': 0,
					'2025-02': 2,
					'2025-03': 3,
					'2025-04': 2,
					'2025-05': 2,
					'2025-06': 1
				}
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
		issues: [
			{
				id: 4001,
				project_id: 100,
				sitio_id: 22,
				month_year: '2025-03',
				category: 'weather_climate',
				title: 'Heavy rainfall delayed seedling distribution in Sitio Pagasa',
				description:
					'Continuous heavy rains made access roads impassable for 5 days, delaying scheduled distribution.',
				affected_sitios: [22],
				deliverables_at_risk: ['March seedling distribution target'],
				beneficiaries_impacted: 70,
				days_delay: 5,
				mitigation_actions:
					'Rescheduled distribution to early April, coordinated with barangay for road clearing',
				resources_needed: 'Additional transportation support for catch-up distribution',
				revised_timeline: 'April 5-7, 2025',
				status: 'mitigating',
				created_at: '2025-03-15',
				updated_at: '2025-03-20'
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
