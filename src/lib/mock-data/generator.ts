import { MUNICIPALITIES_DATA } from '$lib/config/location-data';
import { categories, projectTypes } from '$lib/config/project-categories';
import type {
	BudgetComponent,
	CategoryKey,
	FundingSource,
	MonthlyProgress,
	MonthlyTarget,
	PerformanceTarget,
	PriorityLevel,
	Project,
	ProjectSitio,
	ProjectStatus,
	Sitio
} from '$lib/types';

// ===== SEEDED RANDOM NUMBER GENERATOR =====
// For consistent but random-looking data generation

class SeededRandom {
	private seed: number;

	constructor(seed: number = 42) {
		this.seed = seed;
	}

	// Simple LCG (Linear Congruential Generator)
	next(): number {
		this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
		return this.seed / 0x7fffffff;
	}

	nextInt(min: number, max: number): number {
		return Math.floor(this.next() * (max - min + 1)) + min;
	}

	pick<T>(arr: T[]): T {
		return arr[this.nextInt(0, arr.length - 1)];
	}

	shuffle<T>(arr: T[]): T[] {
		const result = [...arr];
		for (let i = result.length - 1; i > 0; i--) {
			const j = this.nextInt(0, i);
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}
}

// ===== SITIO NAME GENERATORS =====

const SITIO_PREFIXES = [
	'Sitio',
	'Purok',
	'Barrio',
	'Zone',
	'Upper',
	'Lower',
	'New',
	'Old',
	'Central'
];

const SITIO_NAMES = [
	'Maligaya',
	'Masagana',
	'Pagasa',
	'Mabuhay',
	'Kalinaw',
	'Kalayaan',
	'Bagong Silang',
	'San Antonio',
	'San Jose',
	'San Miguel',
	'Santa Cruz',
	'Santo Niño',
	'Fatima',
	'Guadalupe',
	'Del Pilar',
	'Rizal',
	'Bonifacio',
	'Aguinaldo',
	'Luna',
	'Mabini',
	'Greenhill',
	'Highland',
	'Riverside',
	'Lakeview',
	'Mountain View',
	'Valley View',
	'Sunrise',
	'Sunset',
	'Golden',
	'Silver',
	'Diamond',
	'Emerald',
	'Pearl',
	'Coral',
	'Bamboo',
	'Narra',
	'Acacia',
	'Mahogany',
	'Ipil',
	'Molave'
];

const EMPLOYMENT_TYPES = ['Farming', 'Fishing', 'Trading', 'Construction', 'Services', 'Transport'];

const WATER_SOURCES = ['Deep Well', 'Spring', 'RWSA', 'Commercial', 'River'];
const TOILET_TYPES = ['Water-sealed', 'Antipolo', 'Open Pit', 'No Toilet'];
const CROPS = [
	'Rice',
	'Corn',
	'Vegetables',
	'Coconut',
	'Banana',
	'Rubber',
	'Coffee',
	'Cacao',
	'Abaca'
];
const GARDEN_COMMODITIES = [
	'Tomato',
	'Eggplant',
	'Squash',
	'String Beans',
	'Ampalaya',
	'Okra',
	'Pepper',
	'Ginger',
	'Malunggay'
];
const INFO_METHODS = ['Barangay Assembly', 'Text/Call', 'Social Media', 'House-to-House'];
const TRANSPORT_METHODS = ['Habal-habal', 'Tricycle', 'Walking', 'Private Vehicle'];

// ===== SITIO ADDITIONAL DATA =====

const ETHNICITIES = [
	'Blaan',
	'Tboli',
	'Maguindanaon',
	'Ilocano',
	'Cebuano',
	'Ilonggo',
	'Tagalog',
	'Bicolano',
	'Waray',
	'Maranao'
];

const RELIGIONS = [
	'Roman Catholic',
	'Islam',
	'Iglesia ni Cristo',
	'Protestant',
	'Evangelical',
	'Seventh-day Adventist',
	'Baptist',
	'Born Again Christian',
	'Indigenous Beliefs'
];

const FIRST_NAMES = [
	'Juan',
	'Maria',
	'Pedro',
	'Jose',
	'Ana',
	'Ricardo',
	'Elena',
	'Roberto',
	'Carmen',
	'Antonio',
	'Rosa',
	'Fernando',
	'Lourdes',
	'Manuel',
	'Gloria',
	'Eduardo',
	'Teresita',
	'Reynaldo',
	'Corazon',
	'Danilo'
];

const LAST_NAMES = [
	'Santos',
	'Reyes',
	'Cruz',
	'Garcia',
	'Bautista',
	'Mendoza',
	'Ramos',
	'Gonzales',
	'Dela Cruz',
	'Villanueva',
	'Fernandez',
	'Lopez',
	'Martinez',
	'Aquino',
	'Pascual',
	'Soriano',
	'Mercado',
	'Castillo',
	'Rivera',
	'Navarro'
];

const LOCAL_OFFICIAL_POSITIONS = [
	'Barangay Captain',
	'Barangay Kagawad',
	'SK Chairman',
	'Barangay Secretary',
	'Barangay Treasurer'
];

const RST_POSITIONS = [
	'RST Team Leader',
	'RST Assistant Team Leader',
	'RST Secretary',
	'RST Member',
	'RST Health Coordinator',
	'RST Education Coordinator',
	'RST Livelihood Coordinator'
];

const ISSUES_CONCERNS = [
	'Lack of potable water supply',
	'Poor road conditions',
	'Limited access to health services',
	'Inadequate school facilities',
	'High unemployment rate',
	'Lack of livelihood opportunities',
	'Poor drainage system causing flooding',
	'Limited electricity coverage',
	'Absence of proper waste management',
	'Lack of day care center',
	'No barangay health station',
	'Limited public transportation',
	'Poor internet connectivity',
	'Lack of farm-to-market roads',
	'Insufficient irrigation facilities',
	'High incidence of malnutrition',
	'Limited access to clean sanitation',
	'Absence of multi-purpose hall',
	'Lack of streetlights',
	'No proper evacuation center'
];

const PROPOSED_PPAS = [
	'Water System Level II Installation',
	'Farm-to-Market Road Concreting',
	'Barangay Health Station Construction',
	'School Building Rehabilitation',
	'Skills Training Program',
	'Livelihood Assistance Program',
	'Drainage System Construction',
	'Solar Street Lighting Installation',
	'Materials Recovery Facility Construction',
	'Day Care Center Construction',
	'Multi-Purpose Hall Construction',
	'Footbridge Construction',
	'Irrigation System Development',
	'Feeding Program Implementation',
	'Toilet Facility Construction',
	'Evacuation Center Construction',
	'Agricultural Equipment Distribution',
	'Medical Mission Program',
	'Educational Assistance Program',
	'Tree Planting Activity'
];

// ===== SITIO GENERATOR =====

export function generateSitios(count: number = 50, seed: number = 42): Sitio[] {
	const rng = new SeededRandom(seed);
	const sitios: Sitio[] = [];

	// Flatten municipality/barangay data for easier picking
	const locations = MUNICIPALITIES_DATA.flatMap((m) =>
		m.barangays.map((b) => ({ municipality: m.name, barangay: b }))
	);

	for (let i = 1; i <= count; i++) {
		const location = rng.pick(locations);
		const prefix = rng.pick(SITIO_PREFIXES);
		const name = rng.pick(SITIO_NAMES);
		const fullName = `${prefix} ${name}`;

		const households = rng.nextInt(30, 200);
		const avgHouseholdSize = rng.nextInt(4, 6);
		const population = households * avgHouseholdSize;

		const malePercent = 0.48 + rng.next() * 0.04; // 48-52%
		const male = Math.round(population * malePercent);
		const female = population - male;

		// Age distribution
		const age_0_14_percent = 0.28 + rng.next() * 0.1; // 28-38%
		const age_65_above_percent = 0.05 + rng.next() * 0.08; // 5-13%
		const age_0_14 = Math.round(population * age_0_14_percent);
		const age_65_above = Math.round(population * age_65_above_percent);
		const age_15_64 = population - age_0_14 - age_65_above;

		// Coordinates (South Cotabato general area)
		const lat = 6.0 + rng.next() * 0.8; // 6.0 - 6.8
		const lng = 124.5 + rng.next() * 0.6; // 124.5 - 125.1

		const sitio: Sitio = {
			id: i,
			name: fullName,
			municipality: location.municipality,
			barangay: location.barangay,
			province: 'South Cotabato',
			population,
			households,
			coordinates: {
				lat: Number(lat.toFixed(6)),
				lng: Number(lng.toFixed(6))
			},
			coding: `${String(rng.nextInt(100, 999))}-${String(rng.nextInt(10, 99))}`,
			demographics: {
				male,
				female,
				total: population,
				age_0_14,
				age_15_64,
				age_65_above
			},
			social_services: {
				registered_voters: Math.round(age_15_64 * (0.6 + rng.next() * 0.3)),
				philhealth_beneficiaries: Math.round(population * (0.3 + rng.next() * 0.4)),
				fourps_beneficiaries: Math.round(households * (0.1 + rng.next() * 0.3))
			},
			economic_condition: {
				employments: rng
					.shuffle(EMPLOYMENT_TYPES)
					.slice(0, rng.nextInt(2, 4))
					.map((type) => ({
						type,
						count: rng.nextInt(10, 80)
					})),
				income_brackets: [
					{
						bracket: 'Below ₱100',
						households: Math.round(households * (0.2 + rng.next() * 0.2))
					},
					{
						bracket: '₱100 - ₱300',
						households: Math.round(households * (0.3 + rng.next() * 0.2))
					},
					{
						bracket: '₱300 - ₱500',
						households: Math.round(households * (0.15 + rng.next() * 0.15))
					},
					{
						bracket: 'Above ₱500',
						households: Math.round(households * (0.05 + rng.next() * 0.1))
					}
				]
			},
			agriculture: {
				farmers_count: rng.nextInt(20, 100),
				farmer_associations: rng.nextInt(0, 3),
				farm_area_hectares: rng.nextInt(50, 500),
				top_crops: rng.shuffle(CROPS).slice(0, rng.nextInt(2, 4))
			},
			water_sanitation: {
				water_systems_count: rng.nextInt(1, 5),
				water_sources: rng
					.shuffle(WATER_SOURCES)
					.slice(0, rng.nextInt(1, 3))
					.map((source) => ({
						source,
						status: rng.pick(['Functional', 'Needs Repair', 'Non-functional'])
					})),
				households_without_toilet: Math.round(households * rng.next() * 0.15),
				toilet_facility_types: rng.shuffle(TOILET_TYPES).slice(0, rng.nextInt(2, 4)),
				waste_segregation_practice: rng.next() > 0.3
			},
			livestock_poultry: {
				pigs: rng.nextInt(20, 150),
				cows: rng.nextInt(0, 30),
				carabaos: rng.nextInt(5, 40),
				horses: rng.nextInt(0, 10),
				goats: rng.nextInt(10, 60),
				chickens: rng.nextInt(100, 500),
				ducks: rng.nextInt(20, 100)
			},
			food_security: {
				households_with_backyard_garden: Math.round(households * (0.4 + rng.next() * 0.4)),
				common_garden_commodities: rng.shuffle(GARDEN_COMMODITIES).slice(0, rng.nextInt(3, 6))
			},
			housing: {
				quality_types: [
					{
						type: 'Concrete/Semi-concrete',
						count: Math.round(households * (0.3 + rng.next() * 0.3))
					},
					{ type: 'Light Materials', count: Math.round(households * (0.3 + rng.next() * 0.2)) },
					{ type: 'Makeshift', count: Math.round(households * rng.next() * 0.2) }
				],
				ownership_types: [
					{ type: 'Owned', count: Math.round(households * (0.5 + rng.next() * 0.3)) },
					{ type: 'Rented', count: Math.round(households * (0.1 + rng.next() * 0.2)) },
					{ type: 'Rent-free', count: Math.round(households * rng.next() * 0.2) }
				]
			},
			domestic_animals: {
				dogs: rng.nextInt(30, 150),
				cats: rng.nextInt(20, 80),
				dogs_vaccinated: rng.nextInt(10, 100),
				cats_vaccinated: rng.nextInt(5, 50)
			},
			community_empowerment: {
				sectoral_organizations: rng.nextInt(1, 5),
				info_dissemination_methods: rng.shuffle(INFO_METHODS).slice(0, rng.nextInt(2, 4)),
				transportation_methods: rng.shuffle(TRANSPORT_METHODS).slice(0, rng.nextInt(2, 3))
			},
			utilities: {
				households_with_electricity: Math.round(households * (0.7 + rng.next() * 0.25)),
				alternative_electricity_sources: rng.next() > 0.5 ? ['Solar', 'Generator'] : ['Solar']
			},

			// Ethnicity and Religion
			ethnicities: rng.shuffle(ETHNICITIES).slice(0, rng.nextInt(1, 3)),
			religions: rng.shuffle(RELIGIONS).slice(0, rng.nextInt(1, 3)),

			// Local Officials (3-5 officials)
			local_officials: LOCAL_OFFICIAL_POSITIONS.slice(0, rng.nextInt(3, 5)).map((position) => ({
				name: `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`,
				position
			})),

			// RST Officials (3-5 officials)
			rst_officials: rng
				.shuffle(RST_POSITIONS)
				.slice(0, rng.nextInt(3, 5))
				.map((position) => ({
					name: `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`,
					position
				})),

			// Issues & Concerns (2-4 items)
			issues_concerns: rng.shuffle(ISSUES_CONCERNS).slice(0, rng.nextInt(2, 4)),

			// Proposed PPAs (2-4 items)
			proposed_ppas: rng.shuffle(PROPOSED_PPAS).slice(0, rng.nextInt(2, 4)),

			created_at: new Date(2024, rng.nextInt(0, 11), rng.nextInt(1, 28)).toISOString(),
			updated_at: new Date().toISOString()
		};

		sitios.push(sitio);
	}

	return sitios;
}

// ===== PROJECT GENERATOR =====

const PROJECT_TITLES: Record<CategoryKey, string[]> = {
	infrastructure: [
		'Road Improvement Project',
		'Water System Installation',
		'Barangay Health Station Construction',
		'School Building Repair',
		'Multi-Purpose Hall Construction',
		'Footbridge Construction',
		'Solar Street Lighting',
		'Drainage System Installation'
	],
	agriculture: [
		'Seedling Distribution Program',
		'Farm Equipment Support',
		'Irrigation System Development',
		'Livestock Dispersal Program',
		'Organic Farming Training',
		'Post-Harvest Facility Construction',
		'Communal Farm Development',
		'Agricultural Technology Transfer'
	],
	education: [
		'School Supplies Distribution',
		'Computer Laboratory Setup',
		'Scholarship Program',
		'Alternative Learning System',
		'Day Care Center Improvement',
		'Teachers Training Program',
		'Library Enhancement Project',
		'Educational Materials Provision'
	],
	health: [
		'Medical Mission Program',
		'Nutrition Program',
		'Immunization Drive',
		'Health Equipment Provision',
		'Senior Citizen Health Care',
		'Maternal and Child Health Care',
		'Mental Health Awareness',
		'Disease Prevention Campaign'
	],
	livelihood: [
		'Skills Training Program',
		'Micro-Enterprise Development',
		'Cooperative Formation',
		'Market Linkage Program',
		'Women Empowerment Project',
		'Youth Employment Program',
		'Handicraft Development',
		'Food Processing Training'
	],
	environment: [
		'Tree Planting Program',
		'Watershed Management',
		'Solid Waste Management',
		'Coastal Cleanup Drive',
		'River Rehabilitation',
		'Climate Change Adaptation',
		'Eco-Tourism Development',
		'Wildlife Conservation'
	]
};

const STATUSES: ProjectStatus[] = ['planning', 'in-progress', 'completed', 'suspended'];
const PRIORITIES: PriorityLevel[] = ['high', 'medium', 'low'];
const AGENCIES = [
	"Provincial Governor's Office",
	'Provincial Engineering Office',
	"Provincial Agriculturist's Office",
	'Provincial Health Office',
	'Provincial Social Welfare Office'
];

const CATCH_UP_PLANS = [
	'Deploy additional workforce to accelerate construction',
	'Extend working hours to 12-hour shifts',
	'Engage additional contractors for parallel work',
	'Prioritize critical path activities',
	'Request budget augmentation for expedited procurement',
	'Conduct weekend operations to recover lost time',
	'Fast-track material procurement through emergency purchase',
	'Mobilize provincial equipment pool for support',
	'Implement double-shifting for construction crews',
	'Coordinate with LGU for streamlined permit processing'
];

// Performance indicator templates by category
const PERFORMANCE_INDICATORS_BY_CATEGORY: Record<
	CategoryKey,
	Array<{
		type: string;
		name: string;
		unit: string;
		baseValue: number;
		scaleFactor: 'budget' | 'beneficiaries' | 'fixed';
	}>
> = {
	infrastructure: [
		{
			type: 'output',
			name: 'Length of Road Constructed',
			unit: 'kilometers',
			baseValue: 1,
			scaleFactor: 'budget'
		},
		{
			type: 'output',
			name: 'Buildings Constructed',
			unit: 'units',
			baseValue: 1,
			scaleFactor: 'fixed'
		},
		{
			type: 'output',
			name: 'Floor Area Completed',
			unit: 'sq. meters',
			baseValue: 100,
			scaleFactor: 'budget'
		},
		{
			type: 'outcome',
			name: 'Households Served',
			unit: 'households',
			baseValue: 50,
			scaleFactor: 'beneficiaries'
		}
	],
	agriculture: [
		{
			type: 'output',
			name: 'Seedlings Distributed',
			unit: 'seedlings',
			baseValue: 1000,
			scaleFactor: 'budget'
		},
		{
			type: 'output',
			name: 'Farm Equipment Provided',
			unit: 'units',
			baseValue: 10,
			scaleFactor: 'budget'
		},
		{
			type: 'output',
			name: 'Farmers Trained',
			unit: 'farmers',
			baseValue: 30,
			scaleFactor: 'beneficiaries'
		},
		{
			type: 'outcome',
			name: 'Hectares Covered',
			unit: 'hectares',
			baseValue: 50,
			scaleFactor: 'budget'
		}
	],
	education: [
		{
			type: 'output',
			name: 'Students Provided Supplies',
			unit: 'students',
			baseValue: 100,
			scaleFactor: 'beneficiaries'
		},
		{
			type: 'output',
			name: 'Classrooms Equipped',
			unit: 'classrooms',
			baseValue: 5,
			scaleFactor: 'budget'
		},
		{
			type: 'output',
			name: 'Teachers Trained',
			unit: 'teachers',
			baseValue: 20,
			scaleFactor: 'beneficiaries'
		},
		{
			type: 'outcome',
			name: 'Schools Benefited',
			unit: 'schools',
			baseValue: 3,
			scaleFactor: 'fixed'
		}
	],
	health: [
		{
			type: 'output',
			name: 'Patients Served',
			unit: 'patients',
			baseValue: 200,
			scaleFactor: 'beneficiaries'
		},
		{
			type: 'output',
			name: 'Medical Equipment Provided',
			unit: 'units',
			baseValue: 10,
			scaleFactor: 'budget'
		},
		{
			type: 'output',
			name: 'Health Workers Trained',
			unit: 'health workers',
			baseValue: 15,
			scaleFactor: 'beneficiaries'
		},
		{
			type: 'outcome',
			name: 'Barangays Covered',
			unit: 'barangays',
			baseValue: 5,
			scaleFactor: 'fixed'
		}
	],
	livelihood: [
		{
			type: 'output',
			name: 'Beneficiaries Trained',
			unit: 'beneficiaries',
			baseValue: 50,
			scaleFactor: 'beneficiaries'
		},
		{
			type: 'output',
			name: 'Starter Kits Distributed',
			unit: 'kits',
			baseValue: 30,
			scaleFactor: 'budget'
		},
		{
			type: 'output',
			name: 'Cooperatives Organized',
			unit: 'cooperatives',
			baseValue: 2,
			scaleFactor: 'fixed'
		},
		{
			type: 'outcome',
			name: 'Jobs Generated',
			unit: 'jobs',
			baseValue: 25,
			scaleFactor: 'beneficiaries'
		}
	],
	environment: [
		{
			type: 'output',
			name: 'Seedlings Planted',
			unit: 'seedlings',
			baseValue: 5000,
			scaleFactor: 'budget'
		},
		{
			type: 'output',
			name: 'Hectares Reforested',
			unit: 'hectares',
			baseValue: 10,
			scaleFactor: 'budget'
		},
		{
			type: 'output',
			name: 'Volunteers Mobilized',
			unit: 'volunteers',
			baseValue: 100,
			scaleFactor: 'beneficiaries'
		},
		{
			type: 'outcome',
			name: 'Communities Covered',
			unit: 'communities',
			baseValue: 3,
			scaleFactor: 'fixed'
		}
	]
};

function generatePerformanceTargets(
	projectId: number,
	categoryKey: CategoryKey,
	beneficiaries: number,
	budget: number,
	rng: SeededRandom
): PerformanceTarget[] {
	const indicators = PERFORMANCE_INDICATORS_BY_CATEGORY[categoryKey];
	const numTargets = rng.nextInt(2, 4);
	const selectedIndicators = rng.shuffle(indicators).slice(0, numTargets);

	return selectedIndicators.map((indicator, index) => {
		let targetValue: number;

		switch (indicator.scaleFactor) {
			case 'budget':
				// Scale based on budget (per million pesos)
				targetValue = Math.round(
					indicator.baseValue * (budget / 1000000) * (0.8 + rng.next() * 0.4)
				);
				break;
			case 'beneficiaries':
				// Scale based on beneficiaries count
				targetValue = Math.round(
					indicator.baseValue * (beneficiaries / 100) * (0.8 + rng.next() * 0.4)
				);
				break;
			case 'fixed':
				// Fixed value with slight variation
				targetValue = Math.round(indicator.baseValue * (0.8 + rng.next() * 0.4));
				break;
		}

		// Ensure minimum value of 1
		targetValue = Math.max(1, targetValue);

		return {
			id: projectId * 100 + index,
			project_id: projectId,
			indicator_type: indicator.type,
			indicator_name: indicator.name,
			target_value: targetValue,
			unit_of_measure: indicator.unit
		};
	});
}

function generateMonthlyProgress(
	projectId: number,
	totalBudget: number,
	startDate: Date,
	months: number,
	rng: SeededRandom
): MonthlyProgress[] {
	const progress: MonthlyProgress[] = [];
	let cumulativeBeneficiaries = 0;
	const monthlyBudget = Math.floor(totalBudget / months);

	for (let i = 0; i < months; i++) {
		const date = new Date(startDate);
		date.setMonth(date.getMonth() + i);
		const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

		const beneficiariesThisMonth = rng.nextInt(10, 50);
		cumulativeBeneficiaries += beneficiariesThisMonth;

		// Calculate actual progress and budget utilized
		const progressPercent = Math.min(
			100,
			Math.floor(((i + 1) / months) * 100) + rng.nextInt(-5, 5)
		);
		const budgetUtilized = Math.floor(monthlyBudget * (0.7 + rng.next() * 0.25));

		progress.push({
			id: projectId * 100 + i,
			project_id: projectId,
			month_year: monthYear,
			physical_progress_percentage: progressPercent,
			budget_utilized: budgetUtilized,
			achieved_outputs: {
				units_completed: rng.nextInt(1, 10),
				materials_delivered: rng.nextInt(50, 200),
				training_sessions: rng.nextInt(0, 3)
			},
			beneficiaries_reached: cumulativeBeneficiaries,
			issues_encountered: rng.next() > 0.7 ? 'Minor delays due to weather' : undefined,
			photo_documentation: [], // Empty array - photos are uploaded via Quick Update form
			status: rng.pick(['on-track', 'delayed', 'ahead'] as const),
			created_at: date.toISOString(),
			updated_at: date.toISOString()
		});
	}

	return progress;
}

function generateMonthlyTargets(
	totalBudget: number,
	startDate: Date,
	months: number
): MonthlyTarget[] {
	const targets: MonthlyTarget[] = [];
	const monthlyBudget = Math.floor(totalBudget / months);

	for (let i = 0; i < months; i++) {
		const date = new Date(startDate);
		date.setMonth(date.getMonth() + i);
		const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

		// Generate cumulative planned progress (should reach 100% by final month)
		const plannedProgress = Math.min(100, Math.floor(((i + 1) / months) * 100));

		targets.push({
			month_year: monthYear,
			planned_physical_progress: plannedProgress,
			planned_budget: monthlyBudget
		});
	}

	return targets;
}

function generateFundingSources(
	projectId: number,
	totalBudget: number,
	rng: SeededRandom
): FundingSource[] {
	const sources: FundingSource[] = [];
	let remaining = 100; // percentage

	const mainSourcePercent = 50 + rng.nextInt(0, 20);
	remaining -= mainSourcePercent;

	sources.push({
		id: projectId * 10,
		project_id: projectId,
		source_name: 'Provincial LDF',
		source_type: 'provincial',
		amount: Math.floor((totalBudget * mainSourcePercent) / 100),
		percentage: mainSourcePercent
	});

	if (rng.next() > 0.3 && remaining > 10) {
		const nationalPercent = rng.nextInt(10, Math.min(30, remaining));
		remaining -= nationalPercent;
		sources.push({
			id: projectId * 10 + 1,
			project_id: projectId,
			source_name: rng.pick(['DA Region XII', 'DSWD', 'DOH', 'DPWH']),
			source_type: 'national',
			amount: Math.floor((totalBudget * nationalPercent) / 100),
			percentage: nationalPercent
		});
	}

	if (remaining > 0) {
		sources.push({
			id: projectId * 10 + 2,
			project_id: projectId,
			source_name: 'LGU Counterpart',
			source_type: 'lgu_counterpart',
			amount: Math.floor((totalBudget * remaining) / 100),
			percentage: remaining
		});
	}

	return sources;
}

function generateBudgetComponents(
	projectId: number,
	totalBudget: number,
	categoryKey: CategoryKey,
	rng: SeededRandom
): BudgetComponent[] {
	const components: BudgetComponent[] = [];

	// Define budget component templates by category
	const componentsByCategory: Record<CategoryKey, string[]> = {
		infrastructure: [
			'Materials and Supplies',
			'Labor and Manpower',
			'Equipment Rental',
			'Transportation',
			'Engineering Services',
			'Contingency'
		],
		agriculture: [
			'Seeds and Seedlings',
			'Farm Equipment',
			'Training and Capacity Building',
			'Transportation',
			'Technical Assistance',
			'Contingency'
		],
		education: [
			'Learning Materials',
			'Equipment and Furniture',
			'Training and Workshops',
			'Transportation',
			'Administrative Costs',
			'Contingency'
		],
		health: [
			'Medical Supplies',
			'Equipment and Devices',
			'Health Personnel',
			'Transportation',
			'Training Programs',
			'Contingency'
		],
		livelihood: [
			'Starter Kits and Tools',
			'Training and Skills Development',
			'Marketing Support',
			'Transportation',
			'Monitoring and Evaluation',
			'Contingency'
		],
		environment: [
			'Seedlings and Plants',
			'Tools and Equipment',
			'Labor and Manpower',
			'Transportation',
			'Information Campaign',
			'Contingency'
		]
	};

	const availableComponents = componentsByCategory[categoryKey];
	const numComponents = rng.nextInt(4, 6);
	const selectedComponents = rng.shuffle(availableComponents).slice(0, numComponents);

	// Generate realistic percentage distribution
	let remaining = 100;
	const percentages: number[] = [];

	for (let i = 0; i < selectedComponents.length - 1; i++) {
		// Major components get 20-40%, minor ones get 5-15%
		const isMajor = i < 2;
		const minPercent = isMajor ? 20 : 5;
		const maxPercent = isMajor ? 40 : 15;
		const percent = Math.min(
			rng.nextInt(minPercent, maxPercent),
			remaining - (selectedComponents.length - i - 1) * 5
		);
		percentages.push(percent);
		remaining -= percent;
	}

	// Last component gets the remainder
	percentages.push(remaining);

	// Create budget components
	selectedComponents.forEach((componentName, index) => {
		const percentage = percentages[index];
		const amount = Math.floor((totalBudget * percentage) / 100);

		components.push({
			id: projectId * 100 + index,
			project_id: projectId,
			component_name: componentName,
			amount,
			percentage
		});
	});

	return components;
}

export function generateProjects(
	sitios: Sitio[],
	count: number = 20,
	seed: number = 42
): Project[] {
	const rng = new SeededRandom(seed);
	const projects: Project[] = [];

	if (sitios.length === 0) {
		return projects;
	}

	for (let i = 1; i <= count; i++) {
		const categoryKey = rng.pick(categories).key;
		const titles = PROJECT_TITLES[categoryKey];
		const title = rng.pick(titles);
		const projectType = projectTypes.find((pt) => pt.category_key === categoryKey);

		const status = rng.pick(STATUSES);
		const budget = rng.nextInt(100000, 5000000);
		const year = rng.pick([2024, 2025]);

		// Generate start and end dates
		const startMonth = rng.nextInt(0, 8);
		const startDate = new Date(year, startMonth, rng.nextInt(1, 28));
		const durationMonths = rng.nextInt(3, 12);

		// Assign random sitios to project (1-4 sitios)
		const numSitios = rng.nextInt(1, Math.min(4, sitios.length));
		const selectedSitios = rng.shuffle(sitios).slice(0, numSitios);

		const projectSitios: ProjectSitio[] = selectedSitios.map((sitio) => ({
			project_id: i,
			sitio_id: sitio.id,
			sitio_name: sitio.name,
			municipality: sitio.municipality,
			barangay: sitio.barangay,
			beneficiaries_target: rng.nextInt(50, 300),
			priority_level: rng.pick(PRIORITIES),
			focal_person: `Kgwd. ${rng.pick(['Juan', 'Maria', 'Pedro', 'Ana'])} ${rng.pick(['Santos', 'Reyes', 'Cruz', 'Garcia'])}`,
			focal_contact: `09${rng.nextInt(10, 99)}-${rng.nextInt(100, 999)}-${rng.nextInt(1000, 9999)}`
		}));

		const totalBeneficiaries = projectSitios.reduce((sum, ps) => sum + ps.beneficiaries_target, 0);

		// Generate progress data only for in-progress or completed projects
		const monthsElapsed =
			status === 'completed' ? durationMonths : status === 'in-progress' ? rng.nextInt(1, 6) : 0;

		// Contract duration in calendar days
		const contractDuration = `${durationMonths * 30} CD`;

		// Contract cost is slightly less than total budget
		const contractCost = Math.floor(budget * (0.85 + rng.next() * 0.1));

		// Issues and recommendations for some projects
		const hasIssues = rng.next() > 0.6;
		const issues = hasIssues
			? rng.pick([
					'Weather delays affecting construction timeline',
					'Material supply chain disruptions',
					'Pending local permits and clearances',
					'Budget realignment needed for additional scope',
					'Community coordination challenges'
				])
			: undefined;
		const recommendations = hasIssues
			? rng.pick([
					'Extend contract duration by 30 days',
					'Coordinate with local suppliers for materials',
					'Expedite permit processing through LGU',
					'Submit budget modification request',
					'Increase community engagement activities'
				])
			: undefined;

		// Catch-up plan for projects with issues
		const catch_up_plan = hasIssues ? rng.pick(CATCH_UP_PLANS) : undefined;

		const project: Project = {
			id: i,
			title: `${title} - ${selectedSitios[0].municipality}`,
			description: `${title} implementation covering ${selectedSitios.map((s) => s.name).join(', ')} in ${selectedSitios[0].municipality}.`,
			category_key: categoryKey,
			project_type_id: projectType?.id,
			status,
			start_date: startDate.toISOString().split('T')[0],
			contract_duration: contractDuration,
			total_budget: budget,
			contract_cost: contractCost,
			beneficiaries: totalBeneficiaries,
			project_year: year,
			issues,
			recommendations,
			catch_up_plan,
			project_sitios: projectSitios,
			monthly_progress:
				monthsElapsed > 0 ? generateMonthlyProgress(i, budget, startDate, monthsElapsed, rng) : [],
			monthly_targets: generateMonthlyTargets(budget, startDate, durationMonths),
			performance_targets: generatePerformanceTargets(
				i,
				categoryKey,
				totalBeneficiaries,
				budget,
				rng
			),
			funding_sources: generateFundingSources(i, budget, rng),
			budget_components: generateBudgetComponents(i, budget, categoryKey, rng),
			employment_generated: {
				male: rng.nextInt(5, 30),
				female: rng.nextInt(3, 20)
			},
			implementing_agency: rng.pick(AGENCIES),
			created_at: startDate.toISOString(),
			updated_at: new Date().toISOString()
		};

		projects.push(project);
	}

	return projects;
}

// ===== STORAGE KEYS =====
export const MOCK_DATA_INITIALIZED_KEY = 'sccdp_mock_data_initialized';
export const MOCK_SITIOS_KEY = 'sccdp_sitios';
export const MOCK_PROJECTS_KEY = 'sccdp_projects';

// ===== INITIALIZATION CHECK =====

export function isMockDataInitialized(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(MOCK_DATA_INITIALIZED_KEY) === 'true';
}

export function markMockDataInitialized(): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(MOCK_DATA_INITIALIZED_KEY, 'true');
}

export function initializeMockDataIfNeeded(): { sitios: Sitio[]; projects: Project[] } {
	if (typeof window === 'undefined') {
		// Server-side: generate fresh data for SSR
		const sitios = generateSitios(50);
		const projects = generateProjects(sitios, 20);
		return { sitios, projects };
	}

	// Check if already initialized
	if (isMockDataInitialized()) {
		// Load from localStorage
		const sitiosJson = localStorage.getItem(MOCK_SITIOS_KEY);
		const projectsJson = localStorage.getItem(MOCK_PROJECTS_KEY);

		const sitios = sitiosJson ? JSON.parse(sitiosJson) : [];
		const projects = projectsJson ? JSON.parse(projectsJson) : [];

		return { sitios, projects };
	}

	// Generate and save mock data
	console.log('Generating mock data for first time...');
	const sitios = generateSitios(50);
	const projects = generateProjects(sitios, 20);

	localStorage.setItem(MOCK_SITIOS_KEY, JSON.stringify(sitios));
	localStorage.setItem(MOCK_PROJECTS_KEY, JSON.stringify(projects));
	markMockDataInitialized();

	console.log(`Generated ${sitios.length} sitios and ${projects.length} projects`);

	return { sitios, projects };
}

// ===== RESET FUNCTION =====

export function resetMockData(): { sitios: Sitio[]; projects: Project[] } {
	if (typeof window === 'undefined') {
		return { sitios: [], projects: [] };
	}

	// Clear existing data
	localStorage.removeItem(MOCK_DATA_INITIALIZED_KEY);
	localStorage.removeItem(MOCK_SITIOS_KEY);
	localStorage.removeItem(MOCK_PROJECTS_KEY);

	// Regenerate with new seed based on current time
	const seed = Date.now() % 1000000;
	const sitios = generateSitios(50, seed);
	const projects = generateProjects(sitios, 20, seed);

	localStorage.setItem(MOCK_SITIOS_KEY, JSON.stringify(sitios));
	localStorage.setItem(MOCK_PROJECTS_KEY, JSON.stringify(projects));
	markMockDataInitialized();

	return { sitios, projects };
}
