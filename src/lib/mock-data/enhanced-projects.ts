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
				sitio_name: csvSitiosData[93].name,
				municipality: csvSitiosData[93].municipality,
				barangay: csvSitiosData[93].barangay,
				beneficiaries_target: 110,
				priority_level: 'high',
				focal_person: 'Kgwd. Mario Santos',
				focal_contact: '0912-345-6789'
			},
			{
				project_id: 100,
				sitio_id: 20,
				sitio_name: csvSitiosData[19].name,
				municipality: csvSitiosData[19].municipality,
				barangay: csvSitiosData[19].barangay,
				beneficiaries_target: 90,
				priority_level: 'high',
				focal_person: 'Kgwd. Anna Reyes',
				focal_contact: '0923-456-7890'
			},
			{
				project_id: 100,
				sitio_id: 21,
				sitio_name: csvSitiosData[20].name,
				municipality: csvSitiosData[20].municipality,
				barangay: csvSitiosData[20].barangay,
				beneficiaries_target: 85,
				priority_level: 'medium',
				focal_person: 'Kgwd. Pedro Cruz',
				focal_contact: '0934-567-8901'
			},
			{
				project_id: 100,
				sitio_id: 95,
				sitio_name: csvSitiosData[94].name,
				municipality: csvSitiosData[94].municipality,
				barangay: csvSitiosData[94].barangay,
				beneficiaries_target: 95,
				priority_level: 'medium',
				focal_person: 'Kgwd. Linda Garcia',
				focal_contact: '0945-678-9012'
			},
			{
				project_id: 100,
				sitio_id: 22,
				sitio_name: csvSitiosData[21].name,
				municipality: csvSitiosData[21].municipality,
				barangay: csvSitiosData[21].barangay,
				beneficiaries_target: 70,
				priority_level: 'low',
				focal_person: 'Kgwd. Roberto Fernandez',
				focal_contact: '0956-789-0123'
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
		created_at: '2025-01-10',
		updated_at: '2025-11-11'
	},

	{
		id: 101,
		title: 'Multi-Sitio Water System Installation - Surallah Cluster',
		description:
			'Installation of Level II potable water systems serving 3 upland sitios in Surallah municipality.',
		category: 'Infrastructure',
		category_key: 'infrastructure',
		project_type_id: 5,
		project_type_name: 'Water Systems',
		sitio_id: 0,
		sitio_name: '',
		municipality: '',
		status: 'planning',
		start_date: '2025-04-01',
		end_date: '2025-12-31',
		budget: 5500000,
		beneficiaries: 680,
		completion_percentage: 8,
		project_year: 2025,
		project_sitios: [
			{
				project_id: 101,
				sitio_id: 58,
				sitio_name: csvSitiosData[57].name,
				municipality: csvSitiosData[57].municipality,
				barangay: csvSitiosData[57].barangay,
				beneficiaries_target: 250,
				priority_level: 'high',
				focal_person: 'Kgwd. Antonio Rivera',
				focal_contact: '0967-890-1234'
			},
			{
				project_id: 101,
				sitio_id: 59,
				sitio_name: csvSitiosData[58].name,
				municipality: csvSitiosData[58].municipality,
				barangay: csvSitiosData[58].barangay,
				beneficiaries_target: 215,
				priority_level: 'high',
				focal_person: 'Kgwd. Sofia Mercado',
				focal_contact: '0978-901-2345'
			},
			{
				project_id: 101,
				sitio_id: 60,
				sitio_name: csvSitiosData[59].name,
				municipality: csvSitiosData[59].municipality,
				barangay: csvSitiosData[59].barangay,
				beneficiaries_target: 215,
				priority_level: 'medium',
				focal_person: 'Kgwd. Benjamin Luz',
				focal_contact: '0989-012-3456'
			}
		],
		performance_targets: [
			{
				id: 1010,
				project_id: 101,
				indicator_type: 'water_systems',
				indicator_name: 'Number of Systems',
				target_value: 3,
				unit_of_measure: 'systems',
				monthly_breakdown: {
					'2025-04': 0,
					'2025-05': 0,
					'2025-06': 0,
					'2025-07': 1,
					'2025-08': 1,
					'2025-09': 0,
					'2025-10': 0,
					'2025-11': 0,
					'2025-12': 1
				}
			},
			{
				id: 1011,
				project_id: 101,
				indicator_type: 'households_served',
				indicator_name: 'Households Served',
				target_value: 145,
				unit_of_measure: 'households'
			},
			{
				id: 1012,
				project_id: 101,
				indicator_type: 'distribution_lines',
				indicator_name: 'Distribution Lines',
				target_value: 8500,
				unit_of_measure: 'meters'
			}
		],
		monthly_progress: [
			{
				id: 2010,
				project_id: 101,
				sitio_id: undefined,
				month_year: '2025-03',
				achieved_outputs: {
					water_systems: 0,
					households_served: 0,
					distribution_lines: 0
				},
				beneficiaries_reached: 0,
				issues_encountered: 'Engineering design and geological survey completed',
				photo_urls: [],
				status: 'on-track',
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		monthly_budget: [
			{
				id: 3010,
				project_id: 101,
				month_year: '2025-03',
				budget_released: 250000,
				actual_expenses: 195000,
				obligations: 200000,
				remaining_balance: 5305000,
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		funding_sources: [
			{
				id: 5010,
				project_id: 101,
				source_name: '20% LDF - Provincial Government',
				source_type: 'provincial',
				amount: 4500000,
				percentage: 81.8
			},
			{
				id: 5011,
				project_id: 101,
				source_name: 'LGU Surallah Counterpart',
				source_type: 'lgu_counterpart',
				amount: 1000000,
				percentage: 18.2
			}
		],
		budget_components: [
			{
				id: 6010,
				project_id: 101,
				component_name: 'Materials & Supplies (pipes, fittings)',
				amount: 2800000,
				percentage: 50.9
			},
			{
				id: 6011,
				project_id: 101,
				component_name: 'Labor & Services',
				amount: 1800000,
				percentage: 32.7
			},
			{
				id: 6012,
				project_id: 101,
				component_name: 'Equipment Rental',
				amount: 550000,
				percentage: 10.0
			},
			{
				id: 6013,
				project_id: 101,
				component_name: 'Engineering & Admin',
				amount: 275000,
				percentage: 5.0
			},
			{
				id: 6014,
				project_id: 101,
				component_name: 'Contingency (5%)',
				amount: 75000,
				percentage: 1.4
			}
		],
		project_manager_team: {
			project_manager: 'Engr. Carlos Martinez',
			agency: "Provincial Engineer's Office",
			technical_lead: 'Engr. Sophia Lim',
			lgu_counterpart: ['MEO - Surallah']
		},
		oversight_structure: {
			provincial_team: ['Provincial Engineer', 'PPDO Infrastructure Monitoring Team'],
			dilg_rep: 'LGOO Ricardo Tan',
			sectoral_rep: 'Water District Representative'
		},
		created_at: '2025-02-15',
		updated_at: '2025-11-11'
	},

	{
		id: 102,
		title: "Indigenous Peoples Educational Support - T'boli Region",
		description:
			'Comprehensive educational support program for IP communities including classroom construction, teacher training, and learning materials provision across 6 tribal sitios.',
		category: 'Education',
		category_key: 'education',
		project_type_id: 12,
		project_type_name: 'Education Support Program',
		sitio_id: 0,
		sitio_name: '',
		municipality: '',
		status: 'in-progress',
		start_date: '2025-02-01',
		end_date: '2025-11-30',
		budget: 3200000,
		beneficiaries: 890,
		completion_percentage: 42,
		project_year: 2025,
		project_sitios: [
			{
				project_id: 102,
				sitio_id: 96,
				sitio_name: csvSitiosData[95].name,
				municipality: csvSitiosData[95].municipality,
				barangay: csvSitiosData[95].barangay,
				beneficiaries_target: 185,
				priority_level: 'high',
				focal_person: 'Datu Miguel Kliwon',
				focal_contact: '0910-234-5678'
			},
			{
				project_id: 102,
				sitio_id: 23,
				sitio_name: csvSitiosData[22].name,
				municipality: csvSitiosData[22].municipality,
				barangay: csvSitiosData[22].barangay,
				beneficiaries_target: 165,
				priority_level: 'high',
				focal_person: 'Bai Teresa Klibaw',
				focal_contact: '0921-345-6789'
			},
			{
				project_id: 102,
				sitio_id: 97,
				sitio_name: csvSitiosData[96].name,
				municipality: csvSitiosData[96].municipality,
				barangay: csvSitiosData[96].barangay,
				beneficiaries_target: 142,
				priority_level: 'high',
				focal_person: 'Datu Ramon Tuan',
				focal_contact: '0932-456-7890'
			},
			{
				project_id: 102,
				sitio_id: 24,
				sitio_name: csvSitiosData[23].name,
				municipality: csvSitiosData[23].municipality,
				barangay: csvSitiosData[23].barangay,
				beneficiaries_target: 138,
				priority_level: 'medium',
				focal_person: 'Bai Maria Lambayan',
				focal_contact: '0943-567-8901'
			},
			{
				project_id: 102,
				sitio_id: 98,
				sitio_name: csvSitiosData[97].name,
				municipality: csvSitiosData[97].municipality,
				barangay: csvSitiosData[97].barangay,
				beneficiaries_target: 130,
				priority_level: 'medium',
				focal_person: 'Datu Jose Salip',
				focal_contact: '0954-678-9012'
			},
			{
				project_id: 102,
				sitio_id: 25,
				sitio_name: csvSitiosData[24].name,
				municipality: csvSitiosData[24].municipality,
				barangay: csvSitiosData[24].barangay,
				beneficiaries_target: 130,
				priority_level: 'low',
				focal_person: 'Bai Sita Salim',
				focal_contact: '0965-789-0123'
			}
		],
		performance_targets: [
			{
				id: 1020,
				project_id: 102,
				indicator_type: 'classrooms_built',
				indicator_name: 'Classrooms Constructed',
				target_value: 6,
				unit_of_measure: 'classrooms',
				monthly_breakdown: {
					'2025-02': 0,
					'2025-03': 0,
					'2025-04': 1,
					'2025-05': 1,
					'2025-06': 1,
					'2025-07': 1,
					'2025-08': 1,
					'2025-09': 0,
					'2025-10': 1,
					'2025-11': 0
				}
			},
			{
				id: 1021,
				project_id: 102,
				indicator_type: 'teachers_trained',
				indicator_name: 'Teachers Trained',
				target_value: 24,
				unit_of_measure: 'teachers',
				monthly_breakdown: {
					'2025-02': 0,
					'2025-03': 8,
					'2025-04': 0,
					'2025-05': 8,
					'2025-06': 0,
					'2025-07': 0,
					'2025-08': 8,
					'2025-09': 0,
					'2025-10': 0,
					'2025-11': 0
				}
			},
			{
				id: 1022,
				project_id: 102,
				indicator_type: 'students_enrolled',
				indicator_name: 'Students Enrolled',
				target_value: 890,
				unit_of_measure: 'students'
			},
			{
				id: 1023,
				project_id: 102,
				indicator_type: 'learning_materials',
				indicator_name: 'Learning Material Sets',
				target_value: 950,
				unit_of_measure: 'sets'
			}
		],
		monthly_progress: [
			{
				id: 2020,
				project_id: 102,
				sitio_id: undefined,
				month_year: '2025-02',
				achieved_outputs: {
					classrooms_built: 0,
					teachers_trained: 0,
					students_enrolled: 245,
					learning_materials: 260
				},
				beneficiaries_reached: 245,
				issues_encountered: 'Initial enrollment and assessment completed',
				photo_urls: [],
				status: 'on-track',
				created_at: '2025-02-28',
				updated_at: '2025-02-28'
			},
			{
				id: 2021,
				project_id: 102,
				sitio_id: undefined,
				month_year: '2025-03',
				achieved_outputs: {
					classrooms_built: 0,
					teachers_trained: 8,
					students_enrolled: 385,
					learning_materials: 420
				},
				beneficiaries_reached: 385,
				issues_encountered: 'Construction sites prepared, first training batch completed',
				photo_urls: [],
				status: 'on-track',
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		monthly_budget: [
			{
				id: 3020,
				project_id: 102,
				month_year: '2025-02',
				budget_released: 350000,
				actual_expenses: 285000,
				obligations: 320000,
				remaining_balance: 2915000,
				created_at: '2025-02-28',
				updated_at: '2025-02-28'
			},
			{
				id: 3021,
				project_id: 102,
				month_year: '2025-03',
				budget_released: 450000,
				actual_expenses: 425000,
				obligations: 440000,
				remaining_balance: 2490000,
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		funding_sources: [
			{
				id: 5020,
				project_id: 102,
				source_name: 'Provincial LDF',
				source_type: 'provincial',
				amount: 1800000,
				percentage: 56.25
			},
			{
				id: 5021,
				project_id: 102,
				source_name: 'DepEd - IPED Program',
				source_type: 'national',
				amount: 1000000,
				percentage: 31.25
			},
			{
				id: 5022,
				project_id: 102,
				source_name: 'NCIP Support Fund',
				source_type: 'national',
				amount: 400000,
				percentage: 12.5
			}
		],
		budget_components: [
			{
				id: 6020,
				project_id: 102,
				component_name: 'Classroom Construction',
				amount: 1800000,
				percentage: 56.25
			},
			{
				id: 6021,
				project_id: 102,
				component_name: 'Learning Materials & Books',
				amount: 600000,
				percentage: 18.75
			},
			{
				id: 6022,
				project_id: 102,
				component_name: 'Teacher Training & Development',
				amount: 450000,
				percentage: 14.06
			},
			{
				id: 6023,
				project_id: 102,
				component_name: 'Furniture & Equipment',
				amount: 250000,
				percentage: 7.81
			},
			{
				id: 6024,
				project_id: 102,
				component_name: 'Administrative & Contingency',
				amount: 100000,
				percentage: 3.13
			}
		],
		project_manager_team: {
			project_manager: 'Dr. Sarah Bonifacio',
			agency: 'DepEd - Division of South Cotabato',
			technical_lead: 'Ms. Jennifer Lumban',
			lgu_counterpart: ["MSWD - T'boli", 'MSWD - Lake Sebu']
		},
		oversight_structure: {
			provincial_team: ['Provincial Social Welfare Office', 'PPDO Education Team'],
			dilg_rep: 'LGOO Patricia Cruz',
			sectoral_rep: 'Tribal Chieftains Association - South Cotabato'
		},
		created_at: '2025-01-20',
		updated_at: '2025-11-11'
	},

	{
		id: 103,
		title: 'Community Health Mobile Clinic - Remote Barangays',
		description:
			'Deployment of mobile medical teams providing primary healthcare, immunization, and maternal care services to 8 remote barangays with limited health facility access.',
		category: 'Health',
		category_key: 'health',
		project_type_id: 15,
		project_type_name: 'Mobile Health Services',
		sitio_id: 0,
		sitio_name: '',
		municipality: '',
		status: 'in-progress',
		start_date: '2025-01-10',
		end_date: '2025-12-15',
		budget: 2800000,
		beneficiaries: 1250,
		completion_percentage: 28,
		project_year: 2025,
		project_sitios: [
			{
				project_id: 103,
				sitio_id: 65,
				sitio_name: csvSitiosData[64].name,
				municipality: csvSitiosData[64].municipality,
				barangay: csvSitiosData[64].barangay,
				beneficiaries_target: 185,
				priority_level: 'high',
				focal_person: 'BHW Maria Santos',
				focal_contact: '0908-123-4567'
			},
			{
				project_id: 103,
				sitio_id: 66,
				sitio_name: csvSitiosData[65].name,
				municipality: csvSitiosData[65].municipality,
				barangay: csvSitiosData[65].barangay,
				beneficiaries_target: 175,
				priority_level: 'high',
				focal_person: 'BHW Rosa Garcia',
				focal_contact: '0919-234-5678'
			},
			{
				project_id: 103,
				sitio_id: 67,
				sitio_name: csvSitiosData[66].name,
				municipality: csvSitiosData[66].municipality,
				barangay: csvSitiosData[66].barangay,
				beneficiaries_target: 162,
				priority_level: 'high',
				focal_person: 'BHW Lina Cruz',
				focal_contact: '0920-345-6789'
			},
			{
				project_id: 103,
				sitio_id: 68,
				sitio_name: csvSitiosData[67].name,
				municipality: csvSitiosData[67].municipality,
				barangay: csvSitiosData[67].barangay,
				beneficiaries_target: 158,
				priority_level: 'medium',
				focal_person: 'BHW Carmen Reyes',
				focal_contact: '0931-456-7890'
			},
			{
				project_id: 103,
				sitio_id: 69,
				sitio_name: csvSitiosData[68].name,
				municipality: csvSitiosData[68].municipality,
				barangay: csvSitiosData[68].barangay,
				beneficiaries_target: 145,
				priority_level: 'medium',
				focal_person: 'BHW Teresita Flores',
				focal_contact: '0942-567-8901'
			},
			{
				project_id: 103,
				sitio_id: 70,
				sitio_name: csvSitiosData[69].name,
				municipality: csvSitiosData[69].municipality,
				barangay: csvSitiosData[69].barangay,
				beneficiaries_target: 138,
				priority_level: 'medium',
				focal_person: 'BHW Antonio Mendoza',
				focal_contact: '0953-678-9012'
			},
			{
				project_id: 103,
				sitio_id: 71,
				sitio_name: csvSitiosData[70].name,
				municipality: csvSitiosData[70].municipality,
				barangay: csvSitiosData[70].barangay,
				beneficiaries_target: 152,
				priority_level: 'low',
				focal_person: 'BHW Elena Diaz',
				focal_contact: '0964-789-0123'
			},
			{
				project_id: 103,
				sitio_id: 72,
				sitio_name: csvSitiosData[71].name,
				municipality: csvSitiosData[71].municipality,
				barangay: csvSitiosData[71].barangay,
				beneficiaries_target: 135,
				priority_level: 'low',
				focal_person: 'BHW Pedro Ramos',
				focal_contact: '0975-890-1234'
			}
		],
		performance_targets: [
			{
				id: 1030,
				project_id: 103,
				indicator_type: 'patients_served',
				indicator_name: 'Patients Served',
				target_value: 3200,
				unit_of_measure: 'patients',
				monthly_breakdown: {
					'2025-01': 180,
					'2025-02': 220,
					'2025-03': 280,
					'2025-04': 320,
					'2025-05': 300,
					'2025-06': 290,
					'2025-07': 285,
					'2025-08': 295,
					'2025-09': 310,
					'2025-10': 320,
					'2025-11': 240,
					'2025-12': 160
				}
			},
			{
				id: 1031,
				project_id: 103,
				indicator_type: 'children_immunized',
				indicator_name: 'Children Immunized',
				target_value: 450,
				unit_of_measure: 'children'
			},
			{
				id: 1032,
				project_id: 103,
				indicator_type: 'prenatal_checkups',
				indicator_name: 'Prenatal Check-ups',
				target_value: 280,
				unit_of_measure: 'check-ups'
			},
			{
				id: 1033,
				project_id: 103,
				indicator_type: 'clinic_visits',
				indicator_name: 'Mobile Clinic Visits',
				target_value: 96,
				unit_of_measure: 'visits'
			}
		],
		monthly_progress: [
			{
				id: 2030,
				project_id: 103,
				sitio_id: undefined,
				month_year: '2025-01',
				achieved_outputs: {
					patients_served: 195,
					children_immunized: 32,
					prenatal_checkups: 18,
					clinic_visits: 8
				},
				beneficiaries_reached: 195,
				issues_encountered: 'Good start, exceeding January target',
				photo_urls: [],
				status: 'ahead',
				created_at: '2025-01-31',
				updated_at: '2025-01-31'
			},
			{
				id: 2031,
				project_id: 103,
				sitio_id: undefined,
				month_year: '2025-02',
				achieved_outputs: {
					patients_served: 228,
					children_immunized: 45,
					prenatal_checkups: 24,
					clinic_visits: 8
				},
				beneficiaries_reached: 423,
				issues_encountered: 'None',
				photo_urls: [],
				status: 'on-track',
				created_at: '2025-02-28',
				updated_at: '2025-02-28'
			},
			{
				id: 2032,
				project_id: 103,
				sitio_id: undefined,
				month_year: '2025-03',
				achieved_outputs: {
					patients_served: 265,
					children_immunized: 52,
					prenatal_checkups: 28,
					clinic_visits: 8
				},
				beneficiaries_reached: 688,
				issues_encountered: 'Road access difficult in Sitio Kipalbig due to landslide',
				photo_urls: [],
				status: 'delayed',
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		monthly_budget: [
			{
				id: 3030,
				project_id: 103,
				month_year: '2025-01',
				budget_released: 280000,
				actual_expenses: 245000,
				obligations: 260000,
				remaining_balance: 2555000,
				created_at: '2025-01-31',
				updated_at: '2025-01-31'
			},
			{
				id: 3031,
				project_id: 103,
				month_year: '2025-02',
				budget_released: 250000,
				actual_expenses: 235000,
				obligations: 245000,
				remaining_balance: 2320000,
				created_at: '2025-02-28',
				updated_at: '2025-02-28'
			},
			{
				id: 3032,
				project_id: 103,
				month_year: '2025-03',
				budget_released: 250000,
				actual_expenses: 242000,
				obligations: 248000,
				remaining_balance: 2078000,
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		issues: [
			{
				id: 4030,
				project_id: 103,
				sitio_id: 71,
				month_year: '2025-03',
				category: 'weather_climate',
				title: 'Landslide blocked access to Sitio Kipalbig',
				description:
					'Heavy rains caused landslide on access road, preventing mobile clinic from reaching sitio for scheduled visit.',
				affected_sitios: [71],
				deliverables_at_risk: ['March clinic visit to Sitio Kipalbig'],
				beneficiaries_impacted: 152,
				days_delay: 12,
				mitigation_actions:
					'Coordinated with MDRRMO for road clearing, scheduled make-up visit in early April',
				resources_needed: 'Alternative transportation or helicopter access if road remains blocked',
				revised_timeline: 'April 8-9, 2025',
				status: 'resolved',
				created_at: '2025-03-18',
				updated_at: '2025-03-28'
			}
		],
		funding_sources: [
			{
				id: 5030,
				project_id: 103,
				source_name: 'Provincial Health Fund',
				source_type: 'provincial',
				amount: 1800000,
				percentage: 64.29
			},
			{
				id: 5031,
				project_id: 103,
				source_name: 'DOH - GIDA Program',
				source_type: 'national',
				amount: 800000,
				percentage: 28.57
			},
			{
				id: 5032,
				project_id: 103,
				source_name: 'PhilHealth - Primary Care Benefit',
				source_type: 'national',
				amount: 200000,
				percentage: 7.14
			}
		],
		budget_components: [
			{
				id: 6030,
				project_id: 103,
				component_name: 'Medical Staff Salaries & Honoraria',
				amount: 1200000,
				percentage: 42.86
			},
			{
				id: 6031,
				project_id: 103,
				component_name: 'Medicines & Medical Supplies',
				amount: 800000,
				percentage: 28.57
			},
			{
				id: 6032,
				project_id: 103,
				component_name: 'Transportation & Fuel',
				amount: 450000,
				percentage: 16.07
			},
			{
				id: 6033,
				project_id: 103,
				component_name: 'Equipment & Maintenance',
				amount: 250000,
				percentage: 8.93
			},
			{
				id: 6034,
				project_id: 103,
				component_name: 'Administrative Costs',
				amount: 100000,
				percentage: 3.57
			}
		],
		project_manager_team: {
			project_manager: 'Dr. Antonio Flores',
			agency: 'Provincial Health Office',
			technical_lead: 'Dr. Maria Concepcion Torres',
			lgu_counterpart: ['MHO - Tampakan', 'MHO - Columbio']
		},
		oversight_structure: {
			provincial_team: ['Provincial Health Officer', 'PPDO Health Team'],
			dilg_rep: 'LGOO Fernando Santos',
			sectoral_rep: 'Barangay Health Workers Association - South Cotabato'
		},
		created_at: '2025-01-05',
		updated_at: '2025-11-11'
	},

	{
		id: 104,
		title: 'Farm-to-Market Road Rehabilitation - Banga-Norala Corridor',
		description:
			'Rehabilitation and concreting of 12.5 km farm-to-market road connecting agricultural communities in Banga and Norala municipalities, benefiting 7 barangays.',
		category: 'Infrastructure',
		category_key: 'infrastructure',
		project_type_id: 3,
		project_type_name: 'Road Infrastructure',
		sitio_id: 0,
		sitio_name: '',
		municipality: '',
		status: 'in-progress',
		start_date: '2024-11-01',
		end_date: '2025-08-31',
		budget: 18500000,
		beneficiaries: 2850,
		completion_percentage: 58,
		project_year: 2025,
		project_sitios: [
			{
				project_id: 104,
				sitio_id: 1,
				sitio_name: csvSitiosData[0].name,
				municipality: csvSitiosData[0].municipality,
				barangay: csvSitiosData[0].barangay,
				beneficiaries_target: 485,
				priority_level: 'high',
				focal_person: 'Kap. Ricardo Velasco',
				focal_contact: '0917-123-4567'
			},
			{
				project_id: 104,
				sitio_id: 2,
				sitio_name: csvSitiosData[1].name,
				municipality: csvSitiosData[1].municipality,
				barangay: csvSitiosData[1].barangay,
				beneficiaries_target: 425,
				priority_level: 'high',
				focal_person: 'Kap. Josefa Mercado',
				focal_contact: '0928-234-5678'
			},
			{
				project_id: 104,
				sitio_id: 3,
				sitio_name: csvSitiosData[2].name,
				municipality: csvSitiosData[2].municipality,
				barangay: csvSitiosData[2].barangay,
				beneficiaries_target: 395,
				priority_level: 'high',
				focal_person: 'Kap. Fernando Cruz',
				focal_contact: '0939-345-6789'
			},
			{
				project_id: 104,
				sitio_id: 34,
				sitio_name: csvSitiosData[33].name,
				municipality: csvSitiosData[33].municipality,
				barangay: csvSitiosData[33].barangay,
				beneficiaries_target: 450,
				priority_level: 'medium',
				focal_person: 'Kap. Gloria Ramos',
				focal_contact: '0940-456-7890'
			},
			{
				project_id: 104,
				sitio_id: 35,
				sitio_name: csvSitiosData[34].name,
				municipality: csvSitiosData[34].municipality,
				barangay: csvSitiosData[34].barangay,
				beneficiaries_target: 380,
				priority_level: 'medium',
				focal_person: 'Kap. Benjamin Luz',
				focal_contact: '0951-567-8901'
			},
			{
				project_id: 104,
				sitio_id: 36,
				sitio_name: csvSitiosData[35].name,
				municipality: csvSitiosData[35].municipality,
				barangay: csvSitiosData[35].barangay,
				beneficiaries_target: 365,
				priority_level: 'medium',
				focal_person: 'Kap. Teresa Gonzales',
				focal_contact: '0962-678-9012'
			},
			{
				project_id: 104,
				sitio_id: 37,
				sitio_name: csvSitiosData[36].name,
				municipality: csvSitiosData[36].municipality,
				barangay: csvSitiosData[36].barangay,
				beneficiaries_target: 350,
				priority_level: 'low',
				focal_person: 'Kap. Carlos Martinez',
				focal_contact: '0973-789-0123'
			}
		],
		performance_targets: [
			{
				id: 1040,
				project_id: 104,
				indicator_type: 'road_length',
				indicator_name: 'Road Length Completed',
				target_value: 12.5,
				unit_of_measure: 'kilometers',
				monthly_breakdown: {
					'2024-11': 0.8,
					'2024-12': 1.2,
					'2025-01': 1.5,
					'2025-02': 1.8,
					'2025-03': 1.6,
					'2025-04': 1.5,
					'2025-05': 1.4,
					'2025-06': 1.2,
					'2025-07': 1.0,
					'2025-08': 0.5
				}
			},
			{
				id: 1041,
				project_id: 104,
				indicator_type: 'bridges_repaired',
				indicator_name: 'Bridges Repaired',
				target_value: 3,
				unit_of_measure: 'bridges'
			},
			{
				id: 1042,
				project_id: 104,
				indicator_type: 'drainage_systems',
				indicator_name: 'Drainage Systems Installed',
				target_value: 45,
				unit_of_measure: 'units'
			}
		],
		monthly_progress: [
			{
				id: 2040,
				project_id: 104,
				sitio_id: undefined,
				month_year: '2025-01',
				achieved_outputs: {
					road_length: 1.6,
					bridges_repaired: 1,
					drainage_systems: 8
				},
				beneficiaries_reached: 1310,
				issues_encountered: 'Progress slightly ahead of schedule',
				photo_urls: [],
				status: 'ahead',
				created_at: '2025-01-31',
				updated_at: '2025-01-31'
			},
			{
				id: 2041,
				project_id: 104,
				sitio_id: undefined,
				month_year: '2025-02',
				achieved_outputs: {
					road_length: 1.7,
					bridges_repaired: 1,
					drainage_systems: 9
				},
				beneficiaries_reached: 1785,
				issues_encountered: 'Weather delays minimal, catching up',
				photo_urls: [],
				status: 'on-track',
				created_at: '2025-02-28',
				updated_at: '2025-02-28'
			},
			{
				id: 2042,
				project_id: 104,
				sitio_id: undefined,
				month_year: '2025-03',
				achieved_outputs: {
					road_length: 1.5,
					bridges_repaired: 0,
					drainage_systems: 7
				},
				beneficiaries_reached: 2285,
				issues_encountered: 'Heavy rains delayed concrete pouring for 8 days',
				photo_urls: [],
				status: 'delayed',
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		monthly_budget: [
			{
				id: 3040,
				project_id: 104,
				month_year: '2025-01',
				budget_released: 2200000,
				actual_expenses: 2050000,
				obligations: 2150000,
				remaining_balance: 9850000,
				created_at: '2025-01-31',
				updated_at: '2025-01-31'
			},
			{
				id: 3041,
				project_id: 104,
				month_year: '2025-02',
				budget_released: 2100000,
				actual_expenses: 1980000,
				obligations: 2050000,
				remaining_balance: 7870000,
				created_at: '2025-02-28',
				updated_at: '2025-02-28'
			},
			{
				id: 3042,
				project_id: 104,
				month_year: '2025-03',
				budget_released: 1900000,
				actual_expenses: 1825000,
				obligations: 1880000,
				remaining_balance: 6045000,
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		funding_sources: [
			{
				id: 5040,
				project_id: 104,
				source_name: 'Infrastructure Fund - Provincial',
				source_type: 'provincial',
				amount: 12000000,
				percentage: 64.86
			},
			{
				id: 5041,
				project_id: 104,
				source_name: 'DPWH - Bottom-Up Budgeting',
				source_type: 'national',
				amount: 4500000,
				percentage: 24.32
			},
			{
				id: 5042,
				project_id: 104,
				source_name: 'LGU Counterpart (Banga & Norala)',
				source_type: 'lgu_counterpart',
				amount: 2000000,
				percentage: 10.81
			}
		],
		budget_components: [
			{
				id: 6040,
				project_id: 104,
				component_name: 'Concrete & Aggregates',
				amount: 8500000,
				percentage: 45.95
			},
			{
				id: 6041,
				project_id: 104,
				component_name: 'Labor & Services',
				amount: 5200000,
				percentage: 28.11
			},
			{
				id: 6042,
				project_id: 104,
				component_name: 'Equipment Rental & Fuel',
				amount: 3000000,
				percentage: 16.22
			},
			{
				id: 6043,
				project_id: 104,
				component_name: 'Bridge & Drainage Works',
				amount: 1200000,
				percentage: 6.49
			},
			{
				id: 6044,
				project_id: 104,
				component_name: 'Engineering & Admin',
				amount: 600000,
				percentage: 3.24
			}
		],
		project_manager_team: {
			project_manager: 'Engr. Roberto Santos',
			agency: "Provincial Engineer's Office",
			technical_lead: 'Engr. Michelle Tan',
			lgu_counterpart: ['MEO - Banga', 'MEO - Norala']
		},
		oversight_structure: {
			provincial_team: ['Provincial Engineer', 'PPDO Infrastructure Team'],
			dilg_rep: 'LGOO Reynaldo Cruz',
			sectoral_rep: 'Farmers Cooperative Association - Banga-Norala'
		},
		created_at: '2024-10-15',
		updated_at: '2025-11-11'
	},

	{
		id: 105,
		title: "Livelihood Skills Training - Women's Empowerment Program",
		description:
			'Comprehensive livelihood and entrepreneurship training for women in 5 municipalities, including sewing, food processing, handicraft making, and business management.',
		category: 'Livelihood',
		category_key: 'livelihood',
		project_type_id: 18,
		project_type_name: 'Skills Development Program',
		sitio_id: 0,
		sitio_name: '',
		municipality: '',
		status: 'in-progress',
		start_date: '2025-02-15',
		end_date: '2025-10-31',
		budget: 2400000,
		beneficiaries: 620,
		completion_percentage: 35,
		project_year: 2025,
		project_sitios: [
			{
				project_id: 105,
				sitio_id: 40,
				sitio_name: csvSitiosData[39].name,
				municipality: csvSitiosData[39].municipality,
				barangay: csvSitiosData[39].barangay,
				beneficiaries_target: 145,
				priority_level: 'high',
				focal_person: 'Ms. Maricel Santos',
				focal_contact: '0918-234-5678'
			},
			{
				project_id: 105,
				sitio_id: 41,
				sitio_name: csvSitiosData[40].name,
				municipality: csvSitiosData[40].municipality,
				barangay: csvSitiosData[40].barangay,
				beneficiaries_target: 132,
				priority_level: 'high',
				focal_person: 'Ms. Jessica Cruz',
				focal_contact: '0929-345-6789'
			},
			{
				project_id: 105,
				sitio_id: 90,
				sitio_name: csvSitiosData[89].name,
				municipality: csvSitiosData[89].municipality,
				barangay: csvSitiosData[89].barangay,
				beneficiaries_target: 125,
				priority_level: 'medium',
				focal_person: 'Ms. Elena Reyes',
				focal_contact: '0930-456-7890'
			},
			{
				project_id: 105,
				sitio_id: 73,
				sitio_name: csvSitiosData[72].name,
				municipality: csvSitiosData[72].municipality,
				barangay: csvSitiosData[72].barangay,
				beneficiaries_target: 110,
				priority_level: 'medium',
				focal_person: 'Ms. Gloria Fernandez',
				focal_contact: '0941-567-8901'
			},
			{
				project_id: 105,
				sitio_id: 53,
				sitio_name: csvSitiosData[52].name,
				municipality: csvSitiosData[52].municipality,
				barangay: csvSitiosData[52].barangay,
				beneficiaries_target: 108,
				priority_level: 'low',
				focal_person: 'Ms. Teresa Ramos',
				focal_contact: '0952-678-9012'
			}
		],
		performance_targets: [
			{
				id: 1050,
				project_id: 105,
				indicator_type: 'women_trained',
				indicator_name: 'Women Trained',
				target_value: 620,
				unit_of_measure: 'women',
				monthly_breakdown: {
					'2025-02': 0,
					'2025-03': 85,
					'2025-04': 90,
					'2025-05': 95,
					'2025-06': 88,
					'2025-07': 82,
					'2025-08': 75,
					'2025-09': 65,
					'2025-10': 40
				}
			},
			{
				id: 1051,
				project_id: 105,
				indicator_type: 'starter_kits',
				indicator_name: 'Livelihood Starter Kits',
				target_value: 620,
				unit_of_measure: 'kits'
			},
			{
				id: 1052,
				project_id: 105,
				indicator_type: 'businesses_started',
				indicator_name: 'Businesses Established',
				target_value: 280,
				unit_of_measure: 'businesses'
			},
			{
				id: 1053,
				project_id: 105,
				indicator_type: 'training_modules',
				indicator_name: 'Training Modules Completed',
				target_value: 32,
				unit_of_measure: 'modules'
			}
		],
		monthly_progress: [
			{
				id: 2050,
				project_id: 105,
				sitio_id: undefined,
				month_year: '2025-02',
				achieved_outputs: {
					women_trained: 0,
					starter_kits: 0,
					businesses_started: 0,
					training_modules: 0
				},
				beneficiaries_reached: 0,
				issues_encountered: 'Orientation and venue preparation completed',
				photo_urls: [],
				status: 'on-track',
				created_at: '2025-02-28',
				updated_at: '2025-02-28'
			},
			{
				id: 2051,
				project_id: 105,
				sitio_id: undefined,
				month_year: '2025-03',
				achieved_outputs: {
					women_trained: 92,
					starter_kits: 92,
					businesses_started: 12,
					training_modules: 6
				},
				beneficiaries_reached: 92,
				issues_encountered: 'Excellent turnout, exceeded target',
				photo_urls: [],
				status: 'ahead',
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		monthly_budget: [
			{
				id: 3050,
				project_id: 105,
				month_year: '2025-02',
				budget_released: 180000,
				actual_expenses: 145000,
				obligations: 165000,
				remaining_balance: 2255000,
				created_at: '2025-02-28',
				updated_at: '2025-02-28'
			},
			{
				id: 3051,
				project_id: 105,
				month_year: '2025-03',
				budget_released: 320000,
				actual_expenses: 295000,
				obligations: 310000,
				remaining_balance: 1960000,
				created_at: '2025-11-11',
				updated_at: '2025-11-11'
			}
		],
		funding_sources: [
			{
				id: 5050,
				project_id: 105,
				source_name: 'Provincial Development Fund',
				source_type: 'provincial',
				amount: 1400000,
				percentage: 58.33
			},
			{
				id: 5051,
				project_id: 105,
				source_name: 'DSWD - SLP Program',
				source_type: 'national',
				amount: 800000,
				percentage: 33.33
			},
			{
				id: 5052,
				project_id: 105,
				source_name: 'Private Sector Partners',
				source_type: 'partner',
				amount: 200000,
				percentage: 8.33
			}
		],
		budget_components: [
			{
				id: 6050,
				project_id: 105,
				component_name: 'Livelihood Starter Kits',
				amount: 1100000,
				percentage: 45.83
			},
			{
				id: 6051,
				project_id: 105,
				component_name: 'Training & Facilitators',
				amount: 650000,
				percentage: 27.08
			},
			{
				id: 6052,
				project_id: 105,
				component_name: 'Venue & Equipment',
				amount: 380000,
				percentage: 15.83
			},
			{
				id: 6053,
				project_id: 105,
				component_name: 'Training Materials & Supplies',
				amount: 200000,
				percentage: 8.33
			},
			{
				id: 6054,
				project_id: 105,
				component_name: 'Administrative & Monitoring',
				amount: 70000,
				percentage: 2.92
			}
		],
		project_manager_team: {
			project_manager: 'Ms. Luisa Fernandez',
			agency: 'DSWD - Provincial Office',
			technical_lead: 'Ms. Catherine Morales',
			lgu_counterpart: ['MSWD - All participating municipalities']
		},
		oversight_structure: {
			provincial_team: ['Provincial Social Welfare Officer', 'PPDO Social Services Team'],
			dilg_rep: 'LGOO Patricia Navarro',
			sectoral_rep: "Provincial Women's Council"
		},
		created_at: '2025-02-01',
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
