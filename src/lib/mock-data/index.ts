import type {
	Activity,
	ChartDataItem,
	Project,
	Sitio,
	Stats,
	User,
	Phase,
	Accountability,
	MonitoringDetails
} from '$lib/types';

// ===== HELPER FUNCTIONS =====

function createPhases(): Phase[] {
	return [
		{ id: 1, name: 'Planning', order: 1 },
		{ id: 2, name: 'Design', order: 2 },
		{ id: 3, name: 'Procurement', order: 3 },
		{ id: 4, name: 'Implementation', order: 4 },
		{ id: 5, name: 'Completion', order: 5 }
	];
}

function createAccountability(overrides: Partial<Accountability> = {}): Accountability {
	const base: Accountability = {
		project_manager: '',
		pm_agency: "Provincial Engineer's Office",
		technical_lead: '',
		contractor: '',
		oversight_committee: ['DILG', 'Provincial Planning'],
		escalation_contacts: {
			technical: 'peo@southcotabato.gov.ph',
			administrative: 'pgso@southcotabato.gov.ph'
		}
	};
	return { ...base, ...overrides };
}

function createMonitoringDetails(overrides: Partial<MonitoringDetails> = {}): MonitoringDetails {
	const base: MonitoringDetails = {
		fundSource: '20% LDF',
		fiscalYear: 2025,
		implementingUnit: "Provincial Governor's Office - CATCH-UP Program",
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
		allotment: { ...base.allotment, ...(overrides.allotment || {}) },
		expenditure: { ...base.expenditure, ...(overrides.expenditure || {}) },
		physical: { ...base.physical, ...(overrides.physical || {}) },
		employment: { ...base.employment, ...(overrides.employment || {}) },
		contract: { ...base.contract, ...(overrides.contract || {}) },
		statusSummary: { ...base.statusSummary, ...(overrides.statusSummary || {}) }
	};
}

// ===== SITIOS DATA =====

export const sitios: Sitio[] = [
	{
		id: 1,
		name: 'Sitio Bangkalang',
		barangay: 'Brgy. Edwards',
		municipality: 'Tboli',
		province: 'South Cotabato',
		coordinates: { lat: 6.1862, lng: 124.9251 },
		population: 510,
		households: 110,
		demographics: {
			employment_rate: 62,
			poverty_incidence: 44,
			farmers: 61,
			potable_water_access: 55,
			electricity_access: 78
		},
		projects_count: 5,
		created_at: '2024-01-15',
		updated_at: '2024-11-10'
	},
	{
		id: 2,
		name: 'Sitio Paraiso',
		barangay: 'El Nonok',
		municipality: 'Banga',
		province: 'South Cotabato',
		coordinates: { lat: 6.4045, lng: 124.7833 },
		population: 420,
		households: 90,
		demographics: {
			employment_rate: 59,
			poverty_incidence: 40,
			farmers: 54,
			potable_water_access: 70,
			electricity_access: 84
		},
		projects_count: 3,
		created_at: '2024-01-20',
		updated_at: '2024-10-28'
	},
	{
		id: 3,
		name: 'Bukay Pal Proper',
		barangay: 'Bukay Pal',
		municipality: 'Tantangan',
		province: 'South Cotabato',
		coordinates: { lat: 6.6189, lng: 124.7488 },
		population: 600,
		households: 125,
		demographics: {
			employment_rate: 66,
			poverty_incidence: 36,
			farmers: 49,
			potable_water_access: 82,
			electricity_access: 90
		},
		projects_count: 7,
		created_at: '2024-02-05',
		updated_at: '2024-11-12'
	}
];

// Generate additional sitios (total 25 for demo)
const sitioNames = [
	'Bagong Silang',
	'Malaya',
	'Masaya',
	'Pagasa',
	'Dahlia',
	'Sampaguita',
	'Rosal',
	'Ilang-Ilang'
];
const barangays = ['Zone 1', 'Poblacion', 'San Isidro', 'Santa Cruz', 'San Jose'];
const municipalities = ['Koronadal City', 'Polomolok', 'Tupi', 'Tantangan', 'Surallah', 'Banga'];

for (let i = 4; i <= 25; i++) {
	sitios.push({
		id: i,
		name: `Sitio ${sitioNames[i % 8]}${i}`,
		barangay: barangays[i % 5],
		municipality: municipalities[i % 6],
		province: 'South Cotabato',
		coordinates: {
			lat: 6.2 + Math.random() * 0.5,
			lng: 124.8 + Math.random() * 0.5
		},
		population: 300 + Math.floor(Math.random() * 300),
		households: 60 + Math.floor(Math.random() * 60),
		demographics: {
			employment_rate: 50 + Math.floor(Math.random() * 30),
			poverty_incidence: 30 + Math.floor(Math.random() * 30),
			farmers: 40 + Math.floor(Math.random() * 40),
			potable_water_access: 60 + Math.floor(Math.random() * 30),
			electricity_access: 70 + Math.floor(Math.random() * 25)
		},
		projects_count: Math.floor(Math.random() * 8),
		created_at: `2024-0${(i % 9) + 1}-${10 + (i % 20)}`,
		updated_at: `2024-${10 + (i % 2)}-${10 + (i % 20)}`
	});
}

// ===== PROJECTS DATA =====

export const projects: Project[] = [
	{
		id: 1,
		title: 'Construction of Potable Water System - Sitio Bangkalang',
		description:
			'Provision of a Level II potable water system serving the upland communities of Sitio Bangkalang, Barangay Edwards in Tboli.',
		category: 'Water and Sanitation',
		status: 'suspended',
		sitio_id: 1,
		sitio_name: 'Sitio Bangkalang',
		municipality: 'Tboli',
		budget: 3900000,
		start_date: '2024-06-10',
		end_date: '2025-01-30',
		completion_percentage: 92,
		beneficiaries: 510,
		implementing_agency: "Provincial Engineer's Office",
		project_year: 2024,
		timeline: [
			{
				date: '2024-06-10',
				status: 'planning',
				title: 'Mobilization',
				description: 'Project mobilized and right-of-way cleared.'
			},
			{
				date: '2024-08-05',
				status: 'in_progress',
				title: 'Pipe Laying',
				description: 'Main transmission and distribution lines 70% complete.'
			},
			{
				date: '2024-10-20',
				status: 'in_progress',
				title: 'Facility Installation',
				description: 'Reservoir and pumping station at 90% completion.'
			}
		],
		phases: createPhases(),
		milestones: [
			{
				id: 1,
				phase_id: 1,
				name: 'Site Mobilization',
				description: 'Clear site and establish facilities',
				baseline_start: '2024-06-10',
				baseline_end: '2024-06-20',
				planned_start: '2024-06-10',
				planned_end: '2024-06-20',
				actual_start: '2024-06-10',
				actual_end: '2024-06-20',
				status: 'completed',
				completion_percentage: 100,
				owner: 'Contractor',
				approver: "Provincial Engineer's Office",
				deliverables: ['Site cleared', 'Temporary facilities erected'],
				budget_allocation: 50000
			},
			{
				id: 2,
				phase_id: 3,
				name: 'Materials Procurement',
				description: 'Procure pipes, fittings, and equipment',
				baseline_start: '2024-06-15',
				baseline_end: '2024-07-15',
				planned_start: '2024-06-15',
				planned_end: '2024-07-15',
				actual_start: '2024-06-15',
				actual_end: '2024-07-18',
				status: 'completed',
				completion_percentage: 100,
				owner: 'Contractor',
				approver: "Provincial Engineer's Office",
				deliverables: ['Pipes delivered', 'Fittings available', 'Pumps on site'],
				budget_allocation: 1500000
			},
			{
				id: 3,
				phase_id: 4,
				name: 'Pipe Laying & Installation',
				description: 'Install transmission and distribution lines',
				baseline_start: '2024-07-20',
				baseline_end: '2024-09-30',
				planned_start: '2024-07-20',
				planned_end: '2024-09-30',
				actual_start: '2024-07-22',
				actual_end: '2024-10-05',
				status: 'completed',
				completion_percentage: 100,
				owner: 'Contractor',
				approver: "Provincial Engineer's Office",
				deliverables: ['5km transmission line', '8km distribution network'],
				budget_allocation: 1200000
			},
			{
				id: 4,
				phase_id: 4,
				name: 'Reservoir & Pump Installation',
				description: 'Complete water storage and pumping facilities',
				baseline_start: '2024-09-01',
				baseline_end: '2024-10-15',
				planned_start: '2024-09-01',
				planned_end: '2024-10-15',
				actual_start: '2024-09-03',
				actual_end: '2024-10-18',
				status: 'completed',
				completion_percentage: 100,
				owner: 'Contractor',
				approver: "Provincial Engineer's Office",
				deliverables: ['50m³ reservoir', 'Submersible pump installed'],
				budget_allocation: 900000
			},
			{
				id: 5,
				phase_id: 4,
				name: 'Electrical Connection & Energization',
				description: 'Secure power connection and energize system',
				baseline_start: '2024-10-01',
				baseline_end: '2024-10-30',
				planned_start: '2024-10-01',
				planned_end: '2024-11-30',
				actual_start: '2024-10-01',
				actual_end: null,
				status: 'delayed',
				completion_percentage: 92,
				owner: "Provincial Engineer's Office / SOCOTECO",
				approver: "Provincial Engineer's Office",
				deliverables: ['Electrical permit approved', 'Transformer installed', 'System energized'],
				budget_allocation: 200000,
				delay_ids: [1]
			},
			{
				id: 6,
				phase_id: 5,
				name: 'System Testing & Commissioning',
				description: 'Test system, flush lines, water quality check',
				baseline_start: '2024-11-01',
				baseline_end: '2024-11-15',
				planned_start: '2024-12-01',
				planned_end: '2024-12-15',
				actual_start: null,
				actual_end: null,
				status: 'not_started',
				completion_percentage: 0,
				owner: 'Contractor',
				approver: "Provincial Engineer's Office",
				deliverables: ['System pressure tested', 'Water quality certified'],
				budget_allocation: 50000
			}
		],
		delays: [
			{
				id: 1,
				milestone_id: 5,
				reported_date: '2024-10-20',
				reported_by: 'Engr. Maria Santos',
				title: 'Awaiting SOCOTECO electrical permit and transformer installation',
				delay_type: 'utility_coordination',
				root_cause: 'SOCOTECO transformer not in stock, electrical permit processing delayed',
				contributing_factors: [
					'Transformer supply chain delay',
					'Incomplete initial electrical documentation',
					'Regional SOCOTECO backlog'
				],
				preventable: true,
				responsible_party: 'SOCOTECO',
				accountability_type: 'external_agency',
				internal_contributing: 'Could have engaged SOCOTECO earlier in planning phase',
				duration_days_estimated: 45,
				duration_days_actual: null,
				schedule_impact_days: 45,
				cost_impact: 30000,
				critical_path_affected: true,
				beneficiary_impact: '510 households delayed water access for 45 additional days',
				severity: 'high',
				status: 'mitigating',
				resolution_target_date: '2024-11-30',
				resolution_actual_date: null,
				recovery_action_ids: [1, 2],
				lessons_learned: 'Engage utility companies during project planning phase, not during implementation',
				preventive_actions_future:
					'Add utility coordination checklist to all projects with electrical requirements'
			}
		],
		recovery_actions: [
			{
				id: 1,
				delay_id: 1,
				action: 'Weekly SOCOTECO coordination meetings',
				description:
					'Fast-track coordination with SOCOTECO regional office to expedite transformer delivery and permit approval',
				owner: "Provincial Engineer's Office",
				owner_contact: 'peo@southcotabato.gov.ph',
				supporting_parties: ['DILG Field Office', 'Provincial Planning'],
				planned_start: '2024-10-22',
				target_completion: '2024-11-15',
				actual_completion: null,
				status: 'in_progress',
				progress_percentage: 60,
				expected_time_recovery_days: 10,
				actual_time_recovery_days: null,
				effectiveness_rating: null,
				cost_estimate: 5000,
				cost_actual: null,
				notes: 'Meeting every Monday 2PM. Transformer now confirmed, expected delivery Nov 28',
				obstacles: 'Transformer still on regional backorder'
			},
			{
				id: 2,
				delay_id: 1,
				action: 'Deploy double work shifts for final commissioning',
				description:
					'Once energized, deploy additional workers for 2-shift operation to compress commissioning timeline',
				owner: 'Contractor',
				owner_contact: 'contractor@email.com',
				supporting_parties: ["Provincial Engineer's Office"],
				planned_start: '2024-12-01',
				target_completion: '2024-12-10',
				actual_completion: null,
				status: 'planned',
				progress_percentage: 0,
				expected_time_recovery_days: 5,
				actual_time_recovery_days: null,
				effectiveness_rating: null,
				cost_estimate: 25000,
				cost_actual: null,
				notes: 'Contingent on transformer installation',
				obstacles: null
			}
		],
		accountability: createAccountability({
			project_manager: 'Engr. Juan Dela Cruz',
			technical_lead: 'Engr. Maria Santos',
			contractor: 'ABC Construction Corporation'
		}),
		baseline: {
			approved_date: '2024-05-20',
			planned_start: '2024-06-10',
			planned_end: '2024-11-15',
			planned_duration_days: 158,
			budget: 3900000,
			milestones_count: 6
		},
		monitoring: createMonitoringDetails({
			location: 'Brgy. Edwards, Tboli',
			allotment: {
				allocated: 3900000,
				supplemental: 0,
				total: 3900000,
				released: 3900000
			},
			expenditure: {
				obligations: 3893332.08,
				contractCost: 3893332.08
			},
			physical: {
				plan: 93.41,
				actual: 91.82,
				slippage: -1.59
			},
			employment: {
				male: 20,
				female: 0
			},
			contract: {
				duration: '120 CD',
				delivery: '120 CD',
				extension: 'TE No.1: 30 CD; TE No.2: 30 CD'
			},
			statusSummary: {
				stage: 'Suspended (Awaiting Power Requirements)',
				issues:
					'Processing of electrical permit, SOCOTECO service connection, and transformer installation.',
				recommendations:
					'Fast-track coordination with SOCOTECO and expedite compliance submissions.'
			},
			catchUpPlan:
				'Resume mechanical works immediately once transformer is energized and deploy double work shifts to recover lost time.'
		}),
		created_at: '2024-05-20',
		updated_at: '2024-11-10'
	},
	{
		id: 2,
		title: 'Construction of Potable Water System - Sitio Paraiso',
		description:
			'Installation of a piped potable water supply for Sitio Paraiso to stabilize domestic water access for 90 households.',
		category: 'Water and Sanitation',
		status: 'completed',
		sitio_id: 2,
		sitio_name: 'Sitio Paraiso',
		municipality: 'Banga',
		budget: 2500000,
		start_date: '2024-06-24',
		end_date: '2024-11-15',
		completion_percentage: 100,
		beneficiaries: 420,
		implementing_agency: "Provincial Engineer's Office",
		project_year: 2024,
		timeline: [
			{
				date: '2024-06-24',
				status: 'planning',
				title: 'Site Survey',
				description: 'Hydro-geologic survey and detailed design completed.'
			},
			{
				date: '2024-08-12',
				status: 'in_progress',
				title: 'Civil Works',
				description: 'Reservoir and tap stands construction completed.'
			},
			{
				date: '2024-10-30',
				status: 'completed',
				title: 'Commissioning',
				description: 'System flushing and turnover to Brgy. LGU.'
			}
		],
		monitoring: createMonitoringDetails({
			location: 'Sitio Paraiso, Brgy. El Nonok, Banga',
			allotment: {
				allocated: 2500000,
				supplemental: 0,
				total: 2500000,
				released: 2500000
			},
			expenditure: {
				obligations: 2469245.91,
				contractCost: 2500000
			},
			physical: {
				plan: 100,
				actual: 100,
				slippage: 0
			},
			employment: {
				male: 10,
				female: 0
			},
			contract: {
				duration: '95 CD',
				delivery: '95 CD',
				extension: 'None'
			},
			statusSummary: {
				stage: 'Completed',
				issues: 'None. Project completed within contract time.',
				recommendations: 'Proceed with post-project sustainability monitoring.'
			},
			catchUpPlan: 'N/A - Project closed and turned over to the barangay.'
		}),
		created_at: '2024-05-15',
		updated_at: '2024-11-05'
	},
	{
		id: 3,
		title: 'Construction of 3-CL School Building - Bukay Pal Elementary',
		description:
			'Construction of a three-classroom school building with gender-sensitive sanitation facilities at Bukay Pal Elementary School.',
		category: 'Education',
		status: 'in-progress',
		sitio_id: 3,
		sitio_name: 'Bukay Pal Proper',
		municipality: 'Tantangan',
		budget: 4000000,
		start_date: '2024-07-01',
		end_date: '2025-02-28',
		completion_percentage: 58,
		beneficiaries: 600,
		implementing_agency: 'DepEd - South Cotabato',
		project_year: 2024,
		timeline: [
			{
				date: '2024-07-01',
				status: 'planning',
				title: 'Site Preparation',
				description: 'Old classrooms demolished and site cleared.'
			},
			{
				date: '2024-09-15',
				status: 'in_progress',
				title: 'Structural Works',
				description: 'Foundations and columns at 50% completion.'
			},
			{
				date: '2024-11-05',
				status: 'in_progress',
				title: 'Superstructure',
				description: 'Masonry works and roofing ongoing.'
			}
		],
		monitoring: createMonitoringDetails({
			location: 'Bukay Pal Elementary School, Tantangan',
			allotment: {
				allocated: 4000000,
				supplemental: 0,
				total: 4000000,
				released: 4000000
			},
			expenditure: {
				obligations: 4000000,
				contractCost: 4000000
			},
			physical: {
				plan: 60,
				actual: 55,
				slippage: -5
			},
			employment: {
				male: 32,
				female: 8
			},
			contract: {
				duration: '150 CD',
				delivery: '150 CD',
				extension: 'For approval (requesting 15 CD)'
			},
			statusSummary: {
				stage: 'Ongoing',
				issues: 'Delayed procurement of roofing materials and adverse weather conditions.',
				recommendations:
					'Allow partial turnover and authorize overtime work once materials arrive.'
			},
			catchUpPlan:
				'Implement staggered shifts for finishing works and pre-procure fixtures to stay on track for Q1 2025 completion.'
		}),
		created_at: '2024-06-10',
		updated_at: '2024-11-12'
	},
	{
		id: 4,
		title: 'Community Learning Center Construction',
		description:
			'Construction of multi-purpose learning center for skills training and adult education programs.',
		category: 'Education',
		status: 'planning',
		sitio_id: 1,
		sitio_name: 'Sitio Bangkalang',
		municipality: 'Tboli',
		budget: 980000,
		start_date: '2025-01-15',
		end_date: '2025-06-30',
		completion_percentage: 5,
		beneficiaries: 450,
		implementing_agency: 'DepEd - South Cotabato',
		project_year: 2025,
		timeline: [
			{
				date: '2024-11-01',
				status: 'planning',
				title: 'Project Design',
				description: 'Architectural and engineering design phase'
			}
		],
		monitoring: createMonitoringDetails({
			location: 'Sitio Bangkalang, Tboli',
			allotment: {
				allocated: 980000,
				supplemental: 200000,
				total: 1180000,
				released: 500000
			},
			expenditure: {
				obligations: 245000,
				contractCost: 0
			},
			physical: {
				plan: 10,
				actual: 5,
				slippage: -5
			},
			employment: {
				male: 5,
				female: 3
			},
			contract: {
				duration: '180 CD',
				delivery: '180 CD',
				extension: 'Not yet applicable'
			},
			statusSummary: {
				stage: 'In Detailed Engineering',
				issues: 'Awaiting approval of supplemental budget and building permits.',
				recommendations:
					'Coordinate with LGU engineering office for expedited permit processing.'
			},
			catchUpPlan:
				'Front-load procurement for structural materials so works can begin immediately after permit release.'
		}),
		created_at: '2024-10-20',
		updated_at: '2024-11-15'
	},
	{
		id: 5,
		title: 'Livelihood Support - Vegetable Production',
		description:
			'Distribution of vegetable seedlings, tools, and training for 50 farmer-beneficiaries.',
		category: 'Livelihood',
		status: 'in-progress',
		sitio_id: 2,
		sitio_name: 'Sitio Paraiso',
		municipality: 'Banga',
		budget: 250000,
		start_date: '2024-08-01',
		end_date: '2024-12-31',
		completion_percentage: 70,
		beneficiaries: 50,
		implementing_agency: 'DA - Region XII',
		project_year: 2024,
		timeline: [
			{
				date: '2024-08-01',
				status: 'planning',
				title: 'Beneficiary Selection',
				description: 'Identification and validation of farmer-beneficiaries'
			},
			{
				date: '2024-09-10',
				status: 'in_progress',
				title: 'Training and Distribution',
				description: 'Ongoing training and seedling distribution'
			}
		],
		monitoring: createMonitoringDetails({
			location: 'Sitio Paraiso Cluster, Banga',
			allotment: {
				allocated: 250000,
				supplemental: 100000,
				total: 350000,
				released: 320000
			},
			expenditure: {
				obligations: 280000,
				contractCost: 0
			},
			physical: {
				plan: 75,
				actual: 70,
				slippage: -5
			},
			employment: {
				male: 8,
				female: 12
			},
			contract: {
				duration: '120 CD',
				delivery: '120 CD',
				extension: 'None'
			},
			statusSummary: {
				stage: 'Implementation',
				issues: 'Some beneficiaries requested replacement seedlings due to pest infestation.',
				recommendations: 'Deploy municipal agriculturist to provide pest management clinics.'
			},
			catchUpPlan:
				'Batch 2 distribution scheduled earlier and integrate pest management refresher to maintain yields.'
		}),
		created_at: '2024-07-15',
		updated_at: '2024-11-12'
	}
];

// Generate additional projects (total 20 for demo)
const categories = [
	'Water and Sanitation',
	'Infrastructure',
	'Energy Access',
	'Education',
	'Livelihood',
	'Health',
	'Housing'
];
const statuses: ('planning' | 'in-progress' | 'completed' | 'suspended')[] = [
	'planning',
	'in-progress',
	'completed'
];
const agencies = [
	'DILG - South Cotabato',
	'DPWH - South Cotabato',
	'DOE - Region XII',
	'DepEd - South Cotabato',
	'DA - Region XII',
	'DOH - Region XII'
];

for (let i = 6; i <= 20; i++) {
	const status = statuses[i % 3];
	const sitio = sitios[(i - 1) % sitios.length];
	const baseAllocation = 200000 + Math.floor(Math.random() * 1000000);
	const supplemental = Math.floor(baseAllocation * (Math.random() * 0.15));
	const totalBudget = baseAllocation + supplemental;
	const released = totalBudget * (0.65 + Math.random() * 0.3);
	const obligations = released * (0.7 + Math.random() * 0.25);
	const contractCost = totalBudget * (0.8 + Math.random() * 0.15);
	const plan =
		status === 'completed'
			? 100
			: status === 'in-progress'
				? 70 + Math.random() * 20
				: 30 + Math.random() * 20;
	const actual =
		status === 'completed' ? 100 : Math.max(0, Math.min(100, plan + (Math.random() * 8 - 4)));
	const slippage = Number((actual - plan).toFixed(2));
	const maleEmployment = 8 + Math.floor(Math.random() * 20);
	const femaleEmployment = 3 + Math.floor(Math.random() * 12);
	const durationCd = 90 + Math.floor(Math.random() * 120);
	const extensionText =
		status === 'completed' ? 'None' : Math.random() > 0.7 ? 'Requesting 15 CD' : 'None';
	const stageMap = {
		planning: 'Planning',
		'in-progress': 'Implementation',
		completed: 'Completed',
		suspended: 'Suspended'
	};

	projects.push({
		id: i,
		title: `${categories[i % 7]} Project ${i} - ${sitio.name}`,
		description: `Community development project focused on ${categories[i % 7].toLowerCase()} improvement in ${sitio.name}.`,
		category: categories[i % 7],
		status: status,
		sitio_id: sitio.id,
		sitio_name: sitio.name,
		municipality: sitio.municipality,
		budget: totalBudget,
		start_date: `2024-0${(i % 9) + 1}-01`,
		end_date: `2024-${10 + (i % 3)}-30`,
		completion_percentage: Math.round(actual),
		beneficiaries: sitio.population,
		implementing_agency: agencies[i % agencies.length],
		project_year: 2024,
		timeline: [
			{
				date: `2024-0${(i % 9) + 1}-01`,
				status: 'planning',
				title: 'Planning Phase',
				description: 'Project planning and preparation'
			}
		],
		monitoring: createMonitoringDetails({
			location: `${sitio.barangay}, ${sitio.municipality}`,
			fiscalYear: 2024,
			allotment: {
				allocated: baseAllocation,
				supplemental: supplemental,
				total: totalBudget,
				released: Number(released.toFixed(2))
			},
			expenditure: {
				obligations: Number(obligations.toFixed(2)),
				contractCost: Number(contractCost.toFixed(2))
			},
			physical: {
				plan: Number(plan.toFixed(2)),
				actual: Number(actual.toFixed(2)),
				slippage: slippage
			},
			employment: {
				male: maleEmployment,
				female: femaleEmployment
			},
			contract: {
				duration: `${durationCd} CD`,
				delivery: `${durationCd} CD`,
				extension: extensionText
			},
			statusSummary: {
				stage: stageMap[status],
				issues:
					status === 'completed'
						? 'Closed with final inspections cleared.'
						: 'Monitoring weather-related delays and supply scheduling.',
				recommendations:
					status === 'completed'
						? 'Sustain completed outputs through LGU O&M.'
						: 'Accelerate procurement and authorize overtime work if needed.'
			},
			catchUpPlan:
				status === 'completed'
					? 'N/A'
					: 'Conduct weekly joint monitoring and deploy surge teams to critical activities.'
		}),
		created_at: `2024-0${(i % 9) + 1}-01`,
		updated_at: `2024-${10 + (i % 2)}-15`
	});
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
	projectsByCategory: categories.map((cat) => ({
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
	return projects.filter((p) => p.sitio_id === sitioId);
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
