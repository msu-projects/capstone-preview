import {
	createIssueFromPredefined,
	createPPAFromPredefined,
	predefinedIssues,
	predefinedPPAs
} from '$lib/config/issue-ppa-mappings';
import { MUNICIPALITIES_DATA } from '$lib/config/location-data';
import { categories, getProjectTypeById, projectTypes } from '$lib/config/project-categories';
import {
	getNeedLevelFromScore,
	type BudgetComponent,
	type CategoryKey,
	type FundingSource,
	type MonthlyProgress,
	type MonthlyTarget,
	type PerformanceTarget,
	type Project,
	type ProjectSitio,
	type ProjectStatus,
	type Sitio,
	type SitioIssue,
	type SitioPPA
} from '$lib/types';
import type { SitioYearlySnapshot } from '$lib/types/sitio-yearly';

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

const SITIO_PREFIXES = ['Sitio', 'Barrio', 'Zone', 'Upper', 'Lower', 'New', 'Old', 'Central'];

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
const LIVESTOCK_POULTRY = ['Pigs', 'Cows', 'Carabaos', 'Horses', 'Goats', 'Chickens', 'Ducks'];
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
			livestock_poultry: rng.shuffle(LIVESTOCK_POULTRY).slice(0, rng.nextInt(2, 5)),
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

			// Issues & Concerns (2-4 items) - structured
			// First, pick random issues
			...(() => {
				const selectedIssues = rng
					.shuffle(predefinedIssues)
					.slice(0, rng.nextInt(2, 4))
					.map((issue) => createIssueFromPredefined(issue.id))
					.filter((i): i is SitioIssue => i !== null);

				// Collect all suggested PPA IDs from the selected issues
				const suggestedPPAIds = new Set<string>();
				for (const issue of selectedIssues) {
					const predefined = predefinedIssues.find((pi) => pi.id === issue.id);
					if (predefined) {
						for (const ppaId of predefined.suggestedPPAIds) {
							suggestedPPAIds.add(ppaId);
						}
					}
				}

				// Convert to array and pick related PPAs
				const relatedPPAIds = Array.from(suggestedPPAIds);
				let selectedPPAs: SitioPPA[] = [];

				if (relatedPPAIds.length > 0) {
					// Pick PPAs that are related to the issues (prioritize related ones)
					const numPPAs = Math.min(rng.nextInt(2, 4), relatedPPAIds.length);
					selectedPPAs = rng
						.shuffle(relatedPPAIds)
						.slice(0, numPPAs)
						.map((ppaId) => createPPAFromPredefined(ppaId))
						.filter((p): p is SitioPPA => p !== null);
				}

				// If we don't have enough PPAs, add some random ones
				if (selectedPPAs.length < 2) {
					const additionalPPAs = rng
						.shuffle(predefinedPPAs.filter((ppa) => !relatedPPAIds.includes(ppa.id)))
						.slice(0, 2 - selectedPPAs.length)
						.map((ppa) => createPPAFromPredefined(ppa.id))
						.filter((p): p is SitioPPA => p !== null);
					selectedPPAs = [...selectedPPAs, ...additionalPPAs];
				}

				return {
					issues_concerns: selectedIssues,
					proposed_ppas: selectedPPAs
				};
			})(),

			created_at: new Date(2024, rng.nextInt(0, 11), rng.nextInt(1, 28)).toISOString(),
			updated_at: new Date().toISOString(),

			// Need Score (1-10, randomly generated)
			...(() => {
				const needScore = rng.nextInt(1, 10);
				return {
					need_score: needScore,
					need_level: getNeedLevelFromScore(needScore)
				};
			})()
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

import { IMPLEMENTING_AGENCIES } from '$lib/config/agencies';

const STATUSES: ProjectStatus[] = ['planning', 'in-progress', 'completed', 'suspended'];

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

/**
 * Generate performance targets based on project type's default_indicators
 * Uses the actual indicators defined in project-categories.ts for consistency
 */
function generatePerformanceTargets(
	projectId: number,
	projectTypeId: number | undefined,
	beneficiaries: number,
	budget: number,
	rng: SeededRandom
): PerformanceTarget[] {
	// Get project type and its default indicators
	const projectType = projectTypeId ? getProjectTypeById(projectTypeId) : undefined;
	const defaultIndicators = projectType?.default_indicators || [];

	// If no indicators defined, return empty array
	if (defaultIndicators.length === 0) {
		return [];
	}

	return defaultIndicators.map((indicator, index) => {
		let targetValue: number;

		// Determine scale factor based on unit type
		const unit = indicator.unit.toLowerCase();
		if (
			unit.includes('php') ||
			unit.includes('peso') ||
			unit.includes('kilometer') ||
			unit.includes('hectare') ||
			unit.includes('meter') ||
			unit.includes('ton')
		) {
			// Scale based on budget (per million pesos)
			const baseValue = getBaseValueForIndicator(indicator.id, budget, beneficiaries);
			targetValue = Math.round(baseValue * (budget / 1000000) * (0.8 + rng.next() * 0.4));
		} else if (unit.includes('percentage') || unit.includes('rate') || unit.includes('stages')) {
			// Percentage-based indicators (fixed scale)
			targetValue = Math.round(70 + rng.next() * 25); // 70-95%
		} else {
			// Count-based indicators (people, items, sessions, etc.) - scale by beneficiaries
			const baseValue = getBaseValueForIndicator(indicator.id, budget, beneficiaries);
			targetValue = Math.round(baseValue * (beneficiaries / 100) * (0.8 + rng.next() * 0.4));
		}

		// Ensure minimum value of 1
		targetValue = Math.max(1, targetValue);

		return {
			id: projectId * 100 + index,
			project_id: projectId,
			indicator_type: indicator.id,
			indicator_name: indicator.name,
			target_value: targetValue,
			unit_of_measure: indicator.unit
		};
	});
}

/**
 * Get a reasonable base value for different indicator types
 */
function getBaseValueForIndicator(
	indicatorId: string,
	budget: number,
	beneficiaries: number
): number {
	// Base values for common indicator types
	const baseValues: Record<string, number> = {
		// Infrastructure
		classrooms_built: 2,
		square_meters: 100,
		facilities_built: 1,
		cubicles: 4,
		health_stations: 1,
		floor_area: 80,
		road_length: 1,
		road_width: 6,
		water_systems: 1,
		households_served: 50,
		distribution_lines: 500,
		centers_built: 1,
		bridges_built: 1,
		bridge_length: 20,
		lights_installed: 10,
		coverage_area: 2,

		// Agriculture
		seedlings_distributed: 1000,
		hectares_covered: 10,
		farmers_benefited: 30,
		training_sessions: 5,
		equipment_units: 10,
		irrigation_systems: 1,
		hectares_irrigated: 15,
		livestock_heads: 20,
		hectares_planted: 10,
		centers_established: 1,
		farmers_trained: 30,
		storage_capacity: 50,

		// Education
		students_fed: 100,
		feeding_days: 120,
		meals_served: 12000,
		materials_distributed: 100,
		students_benefited: 100,
		teachers_trained: 20,
		labs_installed: 1,
		computers_provided: 20,
		learners_enrolled: 50,
		scholars: 25,
		total_grants: 250000,

		// Health
		consultations: 200,
		patients_served: 150,
		mission_days: 5,
		vaccines_administered: 200,
		children_immunized: 150,
		children_fed: 80,
		service_trips: 10,
		medicine_packs: 100,
		beneficiaries: 100,
		workers_trained: 15,

		// Livelihood
		trainees: 50,
		training_hours: 40,
		enterprises_supported: 10,
		total_capital_support: 500000,
		cooperatives_formed: 2,
		members: 50,
		equipment_sets: 20,
		market_linkages: 5,
		producers_linked: 30,

		// Environment
		trees_planted: 5000,
		hectares_reforested: 10,
		facilities_installed: 2,
		hectares_rehabilitated: 5,
		mangroves_planted: 2000,
		watersheds_managed: 1,
		hectares_protected: 50,
		water_sources_developed: 2,
		households_benefited: 50
	};

	return baseValues[indicatorId] || 10; // Default to 10 if not found
}

// Common issues encountered by category
const ISSUES_BY_CATEGORY: Record<CategoryKey, string[]> = {
	infrastructure: [
		'Weather delays due to heavy rainfall',
		'Material supply chain disruption',
		'Equipment breakdown requiring repairs',
		'Pending right-of-way clearance',
		'Labor shortage in the area',
		'Soil condition issues requiring additional work',
		'Delayed delivery of construction materials'
	],
	agriculture: [
		'Pest infestation affecting seedlings',
		'Drought conditions limiting planting',
		'Delayed delivery of farm inputs',
		'Low farmer turnout for training',
		'Transportation issues for equipment delivery',
		'Soil testing delays'
	],
	education: [
		'School schedule conflicts',
		'Delayed procurement of materials',
		'Limited classroom availability',
		'Teacher availability constraints',
		'Transportation issues for remote areas'
	],
	health: [
		'Medical supply shortage',
		'Limited health personnel availability',
		'Weather affecting outreach activities',
		'Vaccine storage issues',
		'Low community turnout',
		'Equipment calibration delays'
	],
	livelihood: [
		'Low participant turnout',
		'Delayed delivery of starter kits',
		'Venue availability issues',
		'Resource person scheduling conflicts',
		'Market linkage challenges'
	],
	environment: [
		'Unfavorable weather for planting',
		'Seedling mortality due to drought',
		'Low volunteer participation',
		'Site accessibility issues',
		'Delayed delivery of planting materials'
	]
};

/**
 * Generate a realistic updated_at date for projects
 * Non-completed projects have a chance to be "stale" (not updated recently)
 * This creates data for the StaleProjectsCard dashboard component
 */
function generateUpdatedAt(status: ProjectStatus, rng: SeededRandom): Date {
	const now = new Date();

	// Completed projects are always recently updated (within last 7 days)
	if (status === 'completed') {
		const daysAgo = rng.nextInt(0, 7);
		return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
	}

	// For non-completed projects, create a distribution of stale and fresh projects
	const staleChance = rng.next();

	if (staleChance < 0.3) {
		// 30% chance: Recently updated (0-29 days) - not stale
		const daysAgo = rng.nextInt(0, 29);
		return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
	} else if (staleChance < 0.5) {
		// 20% chance: Moderate staleness (30-60 days)
		const daysAgo = rng.nextInt(30, 60);
		return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
	} else if (staleChance < 0.7) {
		// 20% chance: Warning level staleness (61-90 days)
		const daysAgo = rng.nextInt(61, 90);
		return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
	} else {
		// 30% chance: Critical staleness (91-180 days)
		const daysAgo = rng.nextInt(91, 180);
		return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
	}
}

// S-curve progress calculation for more realistic project progression
function calculateSCurveProgress(
	monthIndex: number,
	totalMonths: number,
	rng: SeededRandom
): number {
	// S-curve formula: slower start, faster middle, slower end
	const t = (monthIndex + 1) / totalMonths;

	// Sigmoid-like S-curve
	const sCurveValue = 1 / (1 + Math.exp(-10 * (t - 0.5)));

	// Normalize to 0-100 range with some variance
	const baseProgress = sCurveValue * 100;
	const variance = rng.nextInt(-5, 5);

	return Math.max(0, Math.min(100, Math.round(baseProgress + variance)));
}

/**
 * Generate monthly progress data using performance targets for achieved outputs
 * All indicators are treated as accumulative (cumulative over time)
 */
function generateMonthlyProgress(
	projectId: number,
	totalBudget: number,
	startDate: Date,
	months: number,
	rng: SeededRandom,
	categoryKey: CategoryKey,
	performanceTargets: PerformanceTarget[]
): MonthlyProgress[] {
	const progress: MonthlyProgress[] = [];
	let cumulativeBeneficiaries = 0;
	let cumulativeBudget = 0;

	// Get category-specific issues for realistic reporting
	const categoryIssues = ISSUES_BY_CATEGORY[categoryKey];

	// Track cumulative values for all performance indicators (all accumulative)
	const cumulativeOutputs: Record<string, number> = {};
	performanceTargets.forEach((target) => {
		cumulativeOutputs[target.indicator_type] = 0;
	});

	// Project health factor (some projects perform better than others)
	const projectHealthFactor = 0.7 + rng.next() * 0.5; // 0.7 to 1.2

	for (let i = 0; i < months; i++) {
		const date = new Date(startDate);
		date.setMonth(date.getMonth() + i);
		const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

		// Calculate progress using S-curve for realistic progression
		const rawProgress = calculateSCurveProgress(i, months, rng);
		const adjustedProgress = Math.round(rawProgress * projectHealthFactor);
		const progressPercent = Math.max(0, Math.min(100, adjustedProgress));

		// Budget utilization correlates with physical progress
		// Typically budget runs slightly ahead of physical progress
		const budgetProgressRatio = progressPercent / 100;
		const budgetVariance = 0.95 + rng.next() * 0.15; // 0.95 to 1.10
		const targetBudgetUtilization = Math.min(
			totalBudget,
			totalBudget * budgetProgressRatio * budgetVariance
		);
		cumulativeBudget = Math.round(Math.max(cumulativeBudget, targetBudgetUtilization));

		// Beneficiaries increase progressively with some variance
		const monthlyBeneficiaryBase = Math.round((progressPercent / 100) * rng.nextInt(20, 60));
		cumulativeBeneficiaries += monthlyBeneficiaryBase;

		// Generate achieved outputs based on performance targets
		// All indicators are accumulative - values grow toward target_value with progress
		const achievedOutputs: Record<string, number> = {};
		performanceTargets.forEach((target) => {
			// Calculate achieved value based on progress percentage toward target
			const targetValue = Math.round(
				target.target_value * (progressPercent / 100) * (0.85 + rng.next() * 0.3)
			);
			// Ensure cumulative value never decreases
			cumulativeOutputs[target.indicator_type] = Math.max(
				cumulativeOutputs[target.indicator_type],
				targetValue
			);
			achievedOutputs[target.indicator_type] = cumulativeOutputs[target.indicator_type];
		});

		// Calculate expected progress based on linear timeline
		const expectedProgress = ((i + 1) / months) * 100;
		const progressVariance = progressPercent - expectedProgress;

		// Determine status based on variance
		let status: 'on-track' | 'delayed' | 'ahead';
		if (progressVariance >= 8) {
			status = 'ahead';
		} else if (progressVariance <= -12) {
			status = 'delayed';
		} else {
			status = 'on-track';
		}

		// Issues are more likely when delayed or at certain project phases
		const issueChance = status === 'delayed' ? 0.7 : i === 0 || i === months - 1 ? 0.4 : 0.25;
		const hasIssue = rng.next() < issueChance;

		// Generate detailed issue description based on status
		let issues: string | undefined;
		let recommendations: string | undefined;
		let catch_up_plan: string | undefined;

		if (hasIssue) {
			const baseIssue = rng.pick(categoryIssues);
			if (status === 'delayed') {
				issues = `${baseIssue}. Implementing catch-up measures to address delays.`;
				recommendations = rng.pick([
					'Extend contract duration by 30 days',
					'Coordinate with local suppliers for materials',
					'Expedite permit processing through LGU',
					'Submit budget modification request',
					'Increase community engagement activities'
				]);
				catch_up_plan = rng.pick(CATCH_UP_PLANS);
			} else {
				issues = baseIssue;
			}
		} else if (status === 'ahead' && rng.next() > 0.7) {
			issues = 'No significant issues. Project progressing ahead of schedule.';
		}

		progress.push({
			id: projectId * 100 + i,
			project_id: projectId,
			month_year: monthYear,
			physical_progress_percentage: progressPercent,
			budget_utilized: cumulativeBudget,
			achieved_outputs: achievedOutputs,
			beneficiaries_reached: cumulativeBeneficiaries,
			issues,
			recommendations,
			catch_up_plan,
			photo_documentation: [], // Empty array - photos are uploaded via Quick Update form
			status,
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
	const monthlyBudgetIncrement = Math.floor(totalBudget / months);

	for (let i = 0; i < months; i++) {
		const date = new Date(startDate);
		date.setMonth(date.getMonth() + i);
		const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

		// Generate cumulative planned progress (should reach 100% by final month)
		const plannedProgress = Math.min(100, Math.floor(((i + 1) / months) * 100));

		// Cumulative planned budget (increases each month towards total)
		const cumulativePlannedBudget = monthlyBudgetIncrement * (i + 1);

		targets.push({
			month_year: monthYear,
			planned_physical_progress: plannedProgress,
			planned_budget: cumulativePlannedBudget
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

		// Generate performance targets first so they can be used for monthly progress
		const performanceTargets = generatePerformanceTargets(
			i,
			projectType?.id,
			totalBeneficiaries,
			budget,
			rng
		);

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
			project_sitios: projectSitios,
			monthly_progress:
				monthsElapsed > 0
					? generateMonthlyProgress(
							i,
							budget,
							startDate,
							monthsElapsed,
							rng,
							categoryKey,
							performanceTargets
						)
					: [],
			monthly_targets: generateMonthlyTargets(budget, startDate, durationMonths),
			performance_targets: performanceTargets,
			funding_sources: generateFundingSources(i, budget, rng),
			budget_components: generateBudgetComponents(i, budget, categoryKey, rng),
			employment_generated: {
				male: rng.nextInt(5, 30),
				female: rng.nextInt(3, 20)
			},
			implementing_agencies: (() => {
				const numAgencies = rng.nextInt(1, 3);
				const shuffled = rng.shuffle([...IMPLEMENTING_AGENCIES]);
				return shuffled.slice(0, numAgencies);
			})(),
			created_at: startDate.toISOString(),
			updated_at: generateUpdatedAt(status, rng).toISOString()
		};

		projects.push(project);
	}

	return projects;
}

// ===== YEARLY SNAPSHOT GENERATOR =====

/**
 * Generate yearly snapshots for a sitio with realistic year-over-year changes.
 * Creates historical data showing growth/decline patterns.
 * Need scores gradually improve as years progress (simulating project impact).
 */
export function generateSitioYearlySnapshots(
	sitio: Sitio,
	years: number[] = [2020, 2021, 2022, 2023, 2024, 2025],
	seed: number = 42
): SitioYearlySnapshot[] {
	const rng = new SeededRandom(seed + sitio.id); // Use sitio ID for consistent but unique data
	const snapshots: SitioYearlySnapshot[] = [];

	// Start with a base population (current sitio data represents the most recent year)
	let currentPopulation = sitio.population;
	let currentHouseholds = sitio.households;

	// Calculate backwards to show historical growth
	const latestYear = Math.max(...years);
	const yearsFromLatest = latestYear - Math.min(...years);
	const annualGrowthRate = 0.02 + rng.next() * 0.02; // 2-4% annual growth

	// Calculate starting population (working backwards from current)
	const startingPopulation = Math.round(
		currentPopulation / Math.pow(1 + annualGrowthRate, yearsFromLatest)
	);
	const startingHouseholds = Math.round(
		currentHouseholds / Math.pow(1 + annualGrowthRate, yearsFromLatest)
	);

	let previousPopulation = startingPopulation;
	let previousHouseholds = startingHouseholds;

	for (const year of years.sort((a, b) => a - b)) {
		// Calculate growth for this year
		const yearGrowth = annualGrowthRate * (0.8 + rng.next() * 0.4); // Vary growth rate
		const population =
			year === latestYear ? currentPopulation : Math.round(previousPopulation * (1 + yearGrowth));
		const households =
			year === latestYear ? currentHouseholds : Math.round(previousHouseholds * (1 + yearGrowth));

		// Demographics (maintain similar ratios but with some variation)
		const malePercent = 0.48 + rng.next() * 0.04; // 48-52%
		const male = Math.round(population * malePercent);
		const female = population - male;

		// Age distribution (slightly shifting over time)
		const age_0_14_percent = 0.28 + rng.next() * 0.08; // 28-36%
		const age_65_above_percent = 0.06 + rng.next() * 0.06; // 6-12%
		const age_0_14 = Math.round(population * age_0_14_percent);
		const age_65_above = Math.round(population * age_65_above_percent);
		const age_15_64 = population - age_0_14 - age_65_above;

		// Social services (improving coverage over time)
		const yearProgress = (year - Math.min(...years)) / yearsFromLatest;
		const voterRatio = 0.55 + yearProgress * 0.1; // Improving voter registration
		const philhealthRatio = 0.3 + yearProgress * 0.2; // Improving PhilHealth coverage
		const fourpsRatio = 0.15 + yearProgress * 0.05; // Slightly improving 4Ps coverage

		const social_services = {
			registered_voters: Math.round(age_15_64 * voterRatio * (0.9 + rng.next() * 0.2)),
			philhealth_beneficiaries: Math.round(population * philhealthRatio * (0.9 + rng.next() * 0.2)),
			fourps_beneficiaries: Math.round(households * fourpsRatio * (0.9 + rng.next() * 0.2))
		};

		// Economic condition (similar structure, varying counts)
		const economic_condition = sitio.economic_condition
			? {
					employments: sitio.economic_condition.employments.map((emp) => ({
						type: emp.type,
						count: Math.round(
							emp.count * (population / currentPopulation) * (0.9 + rng.next() * 0.2)
						)
					})),
					income_brackets: sitio.economic_condition.income_brackets.map((bracket) => ({
						bracket: bracket.bracket,
						households: Math.round(
							bracket.households * (households / currentHouseholds) * (0.9 + rng.next() * 0.2)
						)
					}))
				}
			: undefined;

		// Agriculture (gradually changing)
		const agriculture = sitio.agriculture
			? {
					farmers_count: Math.round(
						sitio.agriculture.farmers_count *
							(population / currentPopulation) *
							(0.85 + rng.next() * 0.3)
					),
					farmer_associations: sitio.agriculture.farmer_associations,
					farm_area_hectares: Math.round(
						sitio.agriculture.farm_area_hectares * (0.95 + rng.next() * 0.1)
					),
					top_crops: sitio.agriculture.top_crops
				}
			: undefined;

		// Water and sanitation (improving over time)
		const water_sanitation = sitio.water_sanitation
			? {
					water_systems_count: Math.max(
						1,
						sitio.water_sanitation.water_systems_count - Math.floor((latestYear - year) / 3)
					), // Gradual increase
					water_sources: sitio.water_sanitation.water_sources,
					households_without_toilet: Math.round(
						sitio.water_sanitation.households_without_toilet *
							(households / currentHouseholds) *
							(1.2 - yearProgress * 0.3) // Improving sanitation
					),
					toilet_facility_types: sitio.water_sanitation.toilet_facility_types,
					waste_segregation_practice:
						yearProgress > 0.6 ? sitio.water_sanitation.waste_segregation_practice : null
				}
			: undefined;

		// Livestock and poultry (same types)
		const livestock_poultry = sitio.livestock_poultry;

		// Food security (improving over time)
		const food_security = sitio.food_security
			? {
					households_with_backyard_garden: Math.round(
						sitio.food_security.households_with_backyard_garden *
							(households / currentHouseholds) *
							(0.8 + yearProgress * 0.4) // Growing trend
					),
					common_garden_commodities: sitio.food_security.common_garden_commodities
				}
			: undefined;

		// Housing (gradually improving quality)
		const housing = sitio.housing
			? {
					quality_types: sitio.housing.quality_types.map((type, idx) => {
						const baseCount = type.count * (households / currentHouseholds);
						// Concrete/semi-concrete increases, makeshift decreases over time
						const trend = idx === 0 ? 1 + yearProgress * 0.2 : 1 - yearProgress * 0.15;
						return {
							type: type.type,
							count: Math.round(baseCount * trend * (0.9 + rng.next() * 0.2))
						};
					}),
					ownership_types: sitio.housing.ownership_types.map((type) => ({
						type: type.type,
						count: Math.round(
							type.count * (households / currentHouseholds) * (0.9 + rng.next() * 0.2)
						)
					}))
				}
			: undefined;

		// Domestic animals (varies with population)
		const domestic_animals = sitio.domestic_animals
			? {
					dogs: Math.round(
						sitio.domestic_animals.dogs *
							(population / currentPopulation) *
							(0.9 + rng.next() * 0.2)
					),
					cats: Math.round(
						sitio.domestic_animals.cats *
							(population / currentPopulation) *
							(0.9 + rng.next() * 0.2)
					),
					dogs_vaccinated: Math.round(
						sitio.domestic_animals.dogs_vaccinated *
							(population / currentPopulation) *
							(0.7 + yearProgress * 0.5) // Improving vaccination
					),
					cats_vaccinated: Math.round(
						sitio.domestic_animals.cats_vaccinated *
							(population / currentPopulation) *
							(0.7 + yearProgress * 0.5)
					)
				}
			: undefined;

		// Community empowerment (same methods)
		const community_empowerment = sitio.community_empowerment
			? {
					sectoral_organizations: Math.max(
						1,
						sitio.community_empowerment.sectoral_organizations - Math.floor((latestYear - year) / 4)
					), // Gradual increase
					info_dissemination_methods: sitio.community_empowerment.info_dissemination_methods,
					transportation_methods: sitio.community_empowerment.transportation_methods
				}
			: undefined;

		// Utilities (improving coverage)
		const utilities = sitio.utilities
			? {
					households_with_electricity: Math.round(
						sitio.utilities.households_with_electricity *
							(households / currentHouseholds) *
							(0.7 + yearProgress * 0.3) // Improving coverage
					),
					alternative_electricity_sources: sitio.utilities.alternative_electricity_sources
				}
			: undefined;

		// Record date for this year (set to end of year)
		const recorded_at = new Date(year, 11, 31).toISOString();

		// Need score improves over time as projects address issues
		// Start higher (more needs), gradually decrease (needs being addressed)
		const baseNeedScore = sitio.need_score;
		const improvement = Math.floor(yearProgress * 3); // Up to 3 point improvement over the years
		const need_score = Math.max(
			1,
			Math.min(
				10,
				baseNeedScore +
					(yearsFromLatest > 0 ? Math.floor((latestYear - year) / 2) : 0) -
					rng.nextInt(0, 1)
			)
		);
		const need_level = getNeedLevelFromScore(need_score);

		// Ethnicities and religions (generally stable, occasional additions)
		const ethnicities = sitio.ethnicities ? [...sitio.ethnicities] : undefined;
		const religions = sitio.religions ? [...sitio.religions] : undefined;

		// Local officials (term-based, might change)
		// Simulate potential changes in officials (every ~3 years there might be changes)
		const local_officials = sitio.local_officials?.map((official) => ({
			...official,
			name:
				year < latestYear && rng.next() > 0.7
					? `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`
					: official.name
		}));

		// RST officials (similar term-based changes)
		const rst_officials = sitio.rst_officials?.map((official) => ({
			...official,
			name:
				year < latestYear && rng.next() > 0.8
					? `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`
					: official.name
		}));

		// Issues and PPAs - may change slightly over time as some get addressed
		// Earlier years might have more/different issues
		const issues_concerns = sitio.issues_concerns?.map((issue) => ({
			...issue,
			linkedPPAIds: issue.linkedPPAIds ? [...issue.linkedPPAIds] : undefined
		}));

		const proposed_ppas = sitio.proposed_ppas?.map((ppa) => ({
			...ppa,
			linkedIssueIds: ppa.linkedIssueIds ? [...ppa.linkedIssueIds] : undefined
		}));

		snapshots.push({
			year,
			sitio_id: sitio.id,
			recorded_at,
			population,
			households,
			demographics: {
				male,
				female,
				total: population,
				age_0_14,
				age_15_64,
				age_65_above
			},
			need_score,
			need_level,
			social_services,
			economic_condition,
			agriculture,
			water_sanitation,
			livestock_poultry,
			food_security,
			housing,
			domestic_animals,
			community_empowerment,
			utilities,
			ethnicities,
			religions,
			local_officials,
			rst_officials,
			issues_concerns,
			proposed_ppas
		});

		previousPopulation = population;
		previousHouseholds = households;
	}

	return snapshots;
}

/**
 * Generate yearly snapshots for all sitios
 */
export function generateAllSitioSnapshots(
	sitios: Sitio[],
	years: number[] = [2020, 2021, 2022, 2023, 2024, 2025],
	seed: number = 42
): Map<number, SitioYearlySnapshot[]> {
	const snapshotsMap = new Map<number, SitioYearlySnapshot[]>();

	for (const sitio of sitios) {
		const snapshots = generateSitioYearlySnapshots(sitio, years, seed);
		snapshotsMap.set(sitio.id, snapshots);
	}

	return snapshotsMap;
}

// ===== STORAGE KEYS ====="
export const STORAGE_VERSION = 1; // Increment when types change to clear outdated data
export const STORAGE_VERSION_KEY = 'sccdp_storage_version';
export const MOCK_DATA_INITIALIZED_KEY = 'sccdp_mock_data_initialized';
export const MOCK_SITIOS_KEY = 'sccdp_sitios';
export const MOCK_PROJECTS_KEY = 'sccdp_projects';
export const MOCK_SITIO_SNAPSHOTS_KEY = 'sccdp_sitio_snapshots';

// ===== STORAGE VERSION CHECK =====

function isStorageOutdated(): boolean {
	if (typeof window === 'undefined') return false;
	const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
	return storedVersion !== String(STORAGE_VERSION);
}

function clearAllStorage(): void {
	if (typeof window === 'undefined') return;
	const keysToRemove: string[] = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key?.startsWith('sccdp_')) {
			keysToRemove.push(key);
		}
	}
	keysToRemove.forEach((key) => localStorage.removeItem(key));
}

function setStorageVersion(): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
}

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

	// Check if storage is outdated - if so, clear everything
	if (isStorageOutdated()) {
		clearAllStorage();
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
	const sitios = generateSitios(100);
	const projects = generateProjects(sitios, 50);

	// Generate yearly snapshots for all sitios
	const snapshotsMap = generateAllSitioSnapshots(sitios);
	const snapshotsArray = Array.from(snapshotsMap.entries()).map(([sitio_id, snapshots]) => ({
		sitio_id,
		snapshots
	}));

	localStorage.setItem(MOCK_SITIOS_KEY, JSON.stringify(sitios));
	localStorage.setItem(MOCK_PROJECTS_KEY, JSON.stringify(projects));
	localStorage.setItem(MOCK_SITIO_SNAPSHOTS_KEY, JSON.stringify(snapshotsArray));
	markMockDataInitialized();
	setStorageVersion();

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
	localStorage.removeItem(MOCK_SITIO_SNAPSHOTS_KEY);

	// Regenerate with new seed based on current time
	const seed = Date.now() % 1000000;
	const sitios = generateSitios(150, seed);
	const projects = generateProjects(sitios, 50, seed);

	// Generate yearly snapshots for all sitios
	const snapshotsMap = generateAllSitioSnapshots(sitios, undefined, seed);
	const snapshotsArray = Array.from(snapshotsMap.entries()).map(([sitio_id, snapshots]) => ({
		sitio_id,
		snapshots
	}));

	localStorage.setItem(MOCK_SITIOS_KEY, JSON.stringify(sitios));
	localStorage.setItem(MOCK_PROJECTS_KEY, JSON.stringify(projects));
	localStorage.setItem(MOCK_SITIO_SNAPSHOTS_KEY, JSON.stringify(snapshotsArray));
	markMockDataInitialized();

	return { sitios, projects };
}

// ===== SNAPSHOT LOADING FUNCTIONS =====

/**
 * Load all yearly snapshots from storage
 */
export function loadAllSnapshots(): Map<number, SitioYearlySnapshot[]> | null {
	if (typeof window === 'undefined') return null;

	const snapshotsJson = localStorage.getItem(MOCK_SITIO_SNAPSHOTS_KEY);
	if (!snapshotsJson) return null;

	try {
		const snapshotsArray: Array<{ sitio_id: number; snapshots: SitioYearlySnapshot[] }> =
			JSON.parse(snapshotsJson);
		const snapshotsMap = new Map<number, SitioYearlySnapshot[]>();

		for (const entry of snapshotsArray) {
			snapshotsMap.set(entry.sitio_id, entry.snapshots);
		}

		return snapshotsMap;
	} catch (error) {
		console.error('Error loading snapshots:', error);
		return null;
	}
}

/**
 * Load snapshots for a specific sitio
 */
export function loadSitioSnapshots(sitioId: number): SitioYearlySnapshot[] | null {
	const allSnapshots = loadAllSnapshots();
	if (!allSnapshots) return null;

	return allSnapshots.get(sitioId) || null;
}

/**
 * Load snapshot for a specific sitio and year
 */
export function loadSitioSnapshotByYear(sitioId: number, year: number): SitioYearlySnapshot | null {
	const snapshots = loadSitioSnapshots(sitioId);
	if (!snapshots) return null;

	return snapshots.find((s) => s.year === year) || null;
}

/**
 * Get available years for a sitio's snapshots
 */
export function getAvailableYears(sitioId: number): number[] {
	const snapshots = loadSitioSnapshots(sitioId);
	if (!snapshots) return [];

	return snapshots.map((s) => s.year).sort((a, b) => a - b);
}
