/**
 * Project Categories Configuration
 * Based on the Improved Project Tracking System v2
 *
 * NOTE: These are default values. Admins can customize via the Configuration page.
 * Use the getter functions (e.g., getCategories(), getProjectTypes()) to get values with overrides.
 */

import type { Category, CategoryKey, ProjectType } from '$lib/types';
import {
	CONFIG_STORAGE_KEYS,
	getConfigWithOverrides,
	hasConfigOverride,
	resetConfigToDefault,
	saveConfigOverride,
	type ProjectCategoriesConfig,
	type ProjectTypesConfig
} from '$lib/utils/config-storage';

// ============================================
// DEFAULT CATEGORIES
// ============================================

const DEFAULT_CATEGORIES: Category[] = [
	{
		id: 1,
		key: 'infrastructure',
		name: 'Infrastructure',
		description: 'Construction and infrastructure development projects',
		icon: 'building-2'
	},
	{
		id: 2,
		key: 'agriculture',
		name: 'Agriculture',
		description: 'Agricultural development and support programs',
		icon: 'sprout'
	},
	{
		id: 3,
		key: 'education',
		name: 'Education',
		description: 'Educational programs and school support',
		icon: 'graduation-cap'
	},
	{
		id: 4,
		key: 'health',
		name: 'Health',
		description: 'Health services and medical programs',
		icon: 'heart-pulse'
	},
	{
		id: 5,
		key: 'livelihood',
		name: 'Livelihood',
		description: 'Livelihood and economic development programs',
		icon: 'briefcase'
	},
	{
		id: 6,
		key: 'environment',
		name: 'Environment',
		description: 'Environmental conservation and sustainability projects',
		icon: 'leaf'
	}
];

// ============================================
// DEFAULT PROJECT TYPES
// ============================================

const DEFAULT_PROJECT_TYPES: ProjectType[] = [
	// INFRASTRUCTURE
	{
		id: 1,
		category_key: 'infrastructure',
		name: 'Building Classrooms',
		description: 'Construction of school classrooms',
		default_indicators: [
			{
				id: 'classrooms_built',
				name: 'Number of Classrooms',
				unit: 'classrooms',
				description: 'Total number of classrooms to build'
			},
			{
				id: 'square_meters',
				name: 'Floor Area',
				unit: 'sq. meters',
				description: 'Total floor area of construction'
			},
			{
				id: 'completion_stages',
				name: 'Completion Stages',
				unit: 'stages',
				description: 'Foundation, Structure, Finishing, Turnover'
			}
		]
	},
	{
		id: 2,
		category_key: 'infrastructure',
		name: 'Public Restrooms/Sanitation Facilities',
		description: 'Construction of public sanitation facilities',
		default_indicators: [
			{
				id: 'facilities_built',
				name: 'Number of Facilities',
				unit: 'facilities',
				description: 'Total number of facilities to construct'
			},
			{
				id: 'cubicles',
				name: 'Toilet Cubicles',
				unit: 'cubicles',
				description: 'Total number of toilet cubicles'
			}
		]
	},
	{
		id: 3,
		category_key: 'infrastructure',
		name: 'Barangay Health Stations',
		description: 'Construction of barangay health stations',
		default_indicators: [
			{
				id: 'health_stations',
				name: 'Number of Health Stations',
				unit: 'stations',
				description: 'Total health stations to build'
			},
			{
				id: 'floor_area',
				name: 'Floor Area',
				unit: 'sq. meters',
				description: 'Total floor area'
			}
		]
	},
	{
		id: 4,
		category_key: 'infrastructure',
		name: 'Farm-to-Market Roads',
		description: 'Construction and improvement of farm-to-market roads',
		default_indicators: [
			{
				id: 'road_length',
				name: 'Road Length',
				unit: 'kilometers',
				description: 'Total length of road to construct/improve'
			},
			{
				id: 'road_width',
				name: 'Road Width',
				unit: 'meters',
				description: 'Average width of road'
			}
		]
	},
	{
		id: 5,
		category_key: 'infrastructure',
		name: 'Water Systems',
		description: 'Installation of water supply systems',
		default_indicators: [
			{
				id: 'water_systems',
				name: 'Number of Systems',
				unit: 'systems',
				description: 'Total water systems to install'
			},
			{
				id: 'households_served',
				name: 'Households Served',
				unit: 'households',
				description: 'Number of households with water access'
			},
			{
				id: 'distribution_lines',
				name: 'Distribution Lines',
				unit: 'meters',
				description: 'Length of water distribution lines'
			}
		]
	},
	{
		id: 6,
		category_key: 'infrastructure',
		name: 'Community Centers',
		description: 'Construction of multi-purpose community centers',
		default_indicators: [
			{
				id: 'centers_built',
				name: 'Number of Centers',
				unit: 'centers',
				description: 'Total community centers to build'
			},
			{
				id: 'floor_area',
				name: 'Floor Area',
				unit: 'sq. meters',
				description: 'Total floor area'
			}
		]
	},
	{
		id: 7,
		category_key: 'infrastructure',
		name: 'Footbridges',
		description: 'Construction of footbridges',
		default_indicators: [
			{
				id: 'bridges_built',
				name: 'Number of Footbridges',
				unit: 'bridges',
				description: 'Total footbridges to construct'
			},
			{
				id: 'bridge_length',
				name: 'Bridge Length',
				unit: 'meters',
				description: 'Total length of bridges'
			}
		]
	},
	{
		id: 8,
		category_key: 'infrastructure',
		name: 'Solar Street Lighting',
		description: 'Installation of solar-powered street lights',
		default_indicators: [
			{
				id: 'lights_installed',
				name: 'Number of Lights',
				unit: 'lights',
				description: 'Total solar street lights to install'
			},
			{
				id: 'coverage_area',
				name: 'Coverage Area',
				unit: 'hectares',
				description: 'Area covered by lighting'
			}
		]
	},

	// AGRICULTURE
	{
		id: 9,
		category_key: 'agriculture',
		name: 'Seedling Distribution Program',
		description: 'Distribution of agricultural seedlings to farmers',
		default_indicators: [
			{
				id: 'seedlings_distributed',
				name: 'Number of Seedlings',
				unit: 'seedlings',
				description: 'Total seedlings to distribute'
			},
			{
				id: 'hectares_covered',
				name: 'Hectares Covered',
				unit: 'hectares',
				description: 'Total area to be planted'
			},
			{
				id: 'farmers_benefited',
				name: 'Farmer Beneficiaries',
				unit: 'farmers',
				description: 'Number of farmers to receive seedlings'
			},
			{
				id: 'training_sessions',
				name: 'Training Sessions',
				unit: 'sessions',
				description: 'Number of training sessions conducted'
			}
		]
	},
	{
		id: 10,
		category_key: 'agriculture',
		name: 'Farm Equipment Support',
		description: 'Provision of farm equipment and tools',
		default_indicators: [
			{
				id: 'equipment_units',
				name: 'Equipment Units',
				unit: 'units',
				description: 'Number of equipment/tools to provide'
			},
			{
				id: 'farmers_benefited',
				name: 'Farmer Beneficiaries',
				unit: 'farmers',
				description: 'Number of farmers to benefit'
			}
		]
	},
	{
		id: 11,
		category_key: 'agriculture',
		name: 'Irrigation Systems',
		description: 'Installation of irrigation infrastructure',
		default_indicators: [
			{
				id: 'irrigation_systems',
				name: 'Number of Systems',
				unit: 'systems',
				description: 'Total irrigation systems to install'
			},
			{
				id: 'hectares_irrigated',
				name: 'Hectares Irrigated',
				unit: 'hectares',
				description: 'Total farmland to be irrigated'
			},
			{
				id: 'farmers_benefited',
				name: 'Farmer Beneficiaries',
				unit: 'farmers',
				description: 'Number of farmers to benefit'
			}
		]
	},
	{
		id: 12,
		category_key: 'agriculture',
		name: 'Livestock Dispersal',
		description: 'Distribution of livestock to farmers',
		default_indicators: [
			{
				id: 'livestock_heads',
				name: 'Livestock Heads',
				unit: 'heads',
				description: 'Number of livestock to distribute'
			},
			{
				id: 'farmers_benefited',
				name: 'Farmer Beneficiaries',
				unit: 'farmers',
				description: 'Number of farmers to receive livestock'
			},
			{
				id: 'training_sessions',
				name: 'Training Sessions',
				unit: 'sessions',
				description: 'Livestock management training sessions'
			}
		]
	},
	{
		id: 13,
		category_key: 'agriculture',
		name: 'High-Value Crop Production',
		description: 'Support for high-value crop farming',
		default_indicators: [
			{
				id: 'hectares_planted',
				name: 'Hectares Planted',
				unit: 'hectares',
				description: 'Total area for high-value crops'
			},
			{
				id: 'farmers_benefited',
				name: 'Farmer Beneficiaries',
				unit: 'farmers',
				description: 'Number of farmers involved'
			},
			{
				id: 'expected_yield_increase',
				name: 'Expected Yield Increase',
				unit: 'percentage',
				description: 'Expected increase in farm yield'
			}
		]
	},
	{
		id: 14,
		category_key: 'agriculture',
		name: 'Agricultural Training Centers',
		description: 'Establishment of agricultural training facilities',
		default_indicators: [
			{
				id: 'centers_established',
				name: 'Training Centers',
				unit: 'centers',
				description: 'Number of training centers to establish'
			},
			{
				id: 'farmers_trained',
				name: 'Farmers Trained',
				unit: 'farmers',
				description: 'Total farmers to receive training'
			}
		]
	},
	{
		id: 15,
		category_key: 'agriculture',
		name: 'Post-Harvest Facilities',
		description: 'Construction of post-harvest processing facilities',
		default_indicators: [
			{
				id: 'facilities_built',
				name: 'Number of Facilities',
				unit: 'facilities',
				description: 'Total facilities to construct'
			},
			{
				id: 'storage_capacity',
				name: 'Storage Capacity',
				unit: 'metric tons',
				description: 'Total storage capacity'
			}
		]
	},

	// EDUCATION
	{
		id: 16,
		category_key: 'education',
		name: 'School Feeding Program',
		description: 'Nutrition program for school children',
		default_indicators: [
			{
				id: 'students_fed',
				name: 'Students to Feed',
				unit: 'students',
				description: 'Number of students to benefit'
			},
			{
				id: 'feeding_days',
				name: 'Feeding Days',
				unit: 'days',
				description: 'Total number of feeding days'
			},
			{
				id: 'meals_served',
				name: 'Total Meals',
				unit: 'meals',
				description: 'Total meals to serve'
			}
		]
	},
	{
		id: 17,
		category_key: 'education',
		name: 'Learning Materials Distribution',
		description: 'Distribution of educational materials',
		default_indicators: [
			{
				id: 'materials_distributed',
				name: 'Learning Materials',
				unit: 'sets',
				description: 'Number of learning material sets'
			},
			{
				id: 'students_benefited',
				name: 'Student Beneficiaries',
				unit: 'students',
				description: 'Number of students to receive materials'
			}
		]
	},
	{
		id: 18,
		category_key: 'education',
		name: 'Teacher Training',
		description: 'Professional development for teachers',
		default_indicators: [
			{
				id: 'teachers_trained',
				name: 'Teachers Trained',
				unit: 'teachers',
				description: 'Number of teachers to train'
			},
			{
				id: 'training_sessions',
				name: 'Training Sessions',
				unit: 'sessions',
				description: 'Number of training sessions'
			}
		]
	},
	{
		id: 19,
		category_key: 'education',
		name: 'Computer Laboratory Setup',
		description: 'Installation of computer laboratories in schools',
		default_indicators: [
			{
				id: 'labs_installed',
				name: 'Computer Labs',
				unit: 'labs',
				description: 'Number of computer labs to setup'
			},
			{
				id: 'computers_provided',
				name: 'Computer Units',
				unit: 'units',
				description: 'Total computer units to provide'
			},
			{
				id: 'students_benefited',
				name: 'Student Beneficiaries',
				unit: 'students',
				description: 'Number of students to benefit'
			}
		]
	},
	{
		id: 20,
		category_key: 'education',
		name: 'Alternative Learning System (ALS)',
		description: 'Alternative education for out-of-school youth',
		default_indicators: [
			{
				id: 'learners_enrolled',
				name: 'ALS Learners',
				unit: 'learners',
				description: 'Number of ALS learners to enroll'
			},
			{
				id: 'completion_rate',
				name: 'Target Completion Rate',
				unit: 'percentage',
				description: 'Expected completion rate'
			}
		]
	},
	{
		id: 21,
		category_key: 'education',
		name: 'Scholarship Programs',
		description: 'Educational scholarships for students',
		default_indicators: [
			{
				id: 'scholars',
				name: 'Scholarship Slots',
				unit: 'scholars',
				description: 'Number of scholarship slots'
			},
			{
				id: 'total_grants',
				name: 'Total Grant Amount',
				unit: 'PHP',
				description: 'Total scholarship grant amount'
			}
		]
	},

	// HEALTH
	{
		id: 22,
		category_key: 'health',
		name: 'Medical Missions',
		description: 'Free medical consultations and services',
		default_indicators: [
			{
				id: 'consultations',
				name: 'Medical Consultations',
				unit: 'consultations',
				description: 'Number of consultations to provide'
			},
			{
				id: 'patients_served',
				name: 'Patients Served',
				unit: 'patients',
				description: 'Total patients to serve'
			},
			{
				id: 'mission_days',
				name: 'Mission Days',
				unit: 'days',
				description: 'Number of mission days'
			}
		]
	},
	{
		id: 23,
		category_key: 'health',
		name: 'Immunization Programs',
		description: 'Vaccination and immunization campaigns',
		default_indicators: [
			{
				id: 'vaccines_administered',
				name: 'Vaccines to Administer',
				unit: 'doses',
				description: 'Number of vaccine doses'
			},
			{
				id: 'children_immunized',
				name: 'Children Immunized',
				unit: 'children',
				description: 'Number of children to immunize'
			}
		]
	},
	{
		id: 24,
		category_key: 'health',
		name: 'Nutrition Programs',
		description: 'Community nutrition and feeding programs',
		default_indicators: [
			{
				id: 'children_fed',
				name: 'Children to Feed',
				unit: 'children',
				description: 'Number of children in nutrition program'
			},
			{
				id: 'feeding_days',
				name: 'Feeding Days',
				unit: 'days',
				description: 'Total feeding days'
			},
			{
				id: 'weight_improvement',
				name: 'Target Weight Improvement',
				unit: 'percentage',
				description: 'Expected improvement in child weight'
			}
		]
	},
	{
		id: 25,
		category_key: 'health',
		name: 'Mobile Health Services',
		description: 'Mobile health clinic services',
		default_indicators: [
			{
				id: 'service_trips',
				name: 'Service Trips',
				unit: 'trips',
				description: 'Number of mobile clinic trips'
			},
			{
				id: 'patients_served',
				name: 'Patients Served',
				unit: 'patients',
				description: 'Total patients to serve'
			}
		]
	},
	{
		id: 26,
		category_key: 'health',
		name: 'Medicine Distribution',
		description: 'Free medicine distribution program',
		default_indicators: [
			{
				id: 'medicine_packs',
				name: 'Medicine Packs',
				unit: 'packs',
				description: 'Number of medicine packs to distribute'
			},
			{
				id: 'beneficiaries',
				name: 'Beneficiaries',
				unit: 'individuals',
				description: 'Number of individuals to benefit'
			}
		]
	},
	{
		id: 27,
		category_key: 'health',
		name: 'Health Worker Training',
		description: 'Training for barangay health workers',
		default_indicators: [
			{
				id: 'workers_trained',
				name: 'Health Workers Trained',
				unit: 'workers',
				description: 'Number of health workers to train'
			},
			{
				id: 'training_sessions',
				name: 'Training Sessions',
				unit: 'sessions',
				description: 'Number of training sessions'
			}
		]
	},

	// LIVELIHOOD
	{
		id: 28,
		category_key: 'livelihood',
		name: 'Skills Training Programs',
		description: 'Vocational and skills development training',
		default_indicators: [
			{
				id: 'trainees',
				name: 'Trainees',
				unit: 'individuals',
				description: 'Number of individuals to train'
			},
			{
				id: 'training_hours',
				name: 'Training Hours',
				unit: 'hours',
				description: 'Total training hours'
			},
			{
				id: 'certification_rate',
				name: 'Target Certification Rate',
				unit: 'percentage',
				description: 'Expected certification rate'
			}
		]
	},
	{
		id: 29,
		category_key: 'livelihood',
		name: 'Microenterprise Development',
		description: 'Support for small business development',
		default_indicators: [
			{
				id: 'enterprises_supported',
				name: 'Microenterprises',
				unit: 'enterprises',
				description: 'Number of enterprises to support'
			},
			{
				id: 'beneficiaries',
				name: 'Beneficiaries',
				unit: 'individuals',
				description: 'Number of individuals to benefit'
			},
			{
				id: 'total_capital_support',
				name: 'Total Capital Support',
				unit: 'PHP',
				description: 'Total capital assistance to provide'
			}
		]
	},
	{
		id: 30,
		category_key: 'livelihood',
		name: 'Cooperative Formation',
		description: 'Establishment and support of cooperatives',
		default_indicators: [
			{
				id: 'cooperatives_formed',
				name: 'Cooperatives',
				unit: 'cooperatives',
				description: 'Number of cooperatives to form'
			},
			{
				id: 'members',
				name: 'Cooperative Members',
				unit: 'members',
				description: 'Total cooperative membership'
			}
		]
	},
	{
		id: 31,
		category_key: 'livelihood',
		name: 'Equipment/Tools Distribution',
		description: 'Distribution of livelihood equipment and tools',
		default_indicators: [
			{
				id: 'equipment_sets',
				name: 'Equipment Sets',
				unit: 'sets',
				description: 'Number of equipment sets to distribute'
			},
			{
				id: 'beneficiaries',
				name: 'Beneficiaries',
				unit: 'individuals',
				description: 'Number of individuals to benefit'
			}
		]
	},
	{
		id: 32,
		category_key: 'livelihood',
		name: 'Market Linkage Programs',
		description: 'Connecting producers to markets',
		default_indicators: [
			{
				id: 'market_linkages',
				name: 'Market Linkages Established',
				unit: 'linkages',
				description: 'Number of market connections to establish'
			},
			{
				id: 'producers_linked',
				name: 'Producers Linked',
				unit: 'producers',
				description: 'Number of producers to connect to markets'
			}
		]
	},

	// ENVIRONMENT
	{
		id: 33,
		category_key: 'environment',
		name: 'Tree Planting/Reforestation',
		description: 'Tree planting and forest rehabilitation',
		default_indicators: [
			{
				id: 'trees_planted',
				name: 'Trees to Plant',
				unit: 'trees',
				description: 'Number of trees to plant'
			},
			{
				id: 'hectares_reforested',
				name: 'Hectares Reforested',
				unit: 'hectares',
				description: 'Total area to reforest'
			},
			{
				id: 'survival_rate',
				name: 'Target Survival Rate',
				unit: 'percentage',
				description: 'Expected tree survival rate'
			}
		]
	},
	{
		id: 34,
		category_key: 'environment',
		name: 'Waste Management Systems',
		description: 'Installation of waste management infrastructure',
		default_indicators: [
			{
				id: 'facilities_installed',
				name: 'Waste Facilities',
				unit: 'facilities',
				description: 'Number of waste facilities to install'
			},
			{
				id: 'households_served',
				name: 'Households Served',
				unit: 'households',
				description: 'Number of households with waste service'
			}
		]
	},
	{
		id: 35,
		category_key: 'environment',
		name: 'Coastal Rehabilitation',
		description: 'Coastal and marine ecosystem rehabilitation',
		default_indicators: [
			{
				id: 'hectares_rehabilitated',
				name: 'Coastal Area Rehabilitated',
				unit: 'hectares',
				description: 'Total coastal area to rehabilitate'
			},
			{
				id: 'mangroves_planted',
				name: 'Mangroves Planted',
				unit: 'seedlings',
				description: 'Number of mangrove seedlings'
			}
		]
	},
	{
		id: 36,
		category_key: 'environment',
		name: 'Watershed Management',
		description: 'Watershed protection and management',
		default_indicators: [
			{
				id: 'watersheds_managed',
				name: 'Watersheds',
				unit: 'watersheds',
				description: 'Number of watersheds to manage'
			},
			{
				id: 'hectares_protected',
				name: 'Hectares Protected',
				unit: 'hectares',
				description: 'Total watershed area to protect'
			}
		]
	},
	{
		id: 37,
		category_key: 'environment',
		name: 'Clean Water Projects',
		description: 'Water source protection and development',
		default_indicators: [
			{
				id: 'water_sources_developed',
				name: 'Water Sources',
				unit: 'sources',
				description: 'Number of water sources to develop/protect'
			},
			{
				id: 'households_benefited',
				name: 'Households Benefited',
				unit: 'households',
				description: 'Number of households to benefit'
			}
		]
	}
];

// ============================================
// GETTER FUNCTIONS (with localStorage override support)
// ============================================

function getCategoriesConfig(): ProjectCategoriesConfig {
	const defaultConfig: ProjectCategoriesConfig = { categories: DEFAULT_CATEGORIES };
	return getConfigWithOverrides(CONFIG_STORAGE_KEYS.PROJECT_CATEGORIES, defaultConfig);
}

function getProjectTypesConfig(): ProjectTypesConfig {
	const defaultConfig: ProjectTypesConfig = { projectTypes: DEFAULT_PROJECT_TYPES };
	return getConfigWithOverrides(CONFIG_STORAGE_KEYS.PROJECT_TYPES, defaultConfig);
}

/**
 * Get all project categories
 */
export function getCategories(): Category[] {
	return getCategoriesConfig().categories as Category[];
}

/**
 * Get all project types
 */
export function getProjectTypes(): ProjectType[] {
	return getProjectTypesConfig().projectTypes as ProjectType[];
}

/**
 * Get category by key
 */
export function getCategoryByKey(key: CategoryKey): Category | undefined {
	return getCategories().find((c) => c.key === key);
}

/**
 * Get project types by category
 */
export function getProjectTypesByCategory(categoryKey: CategoryKey): ProjectType[] {
	return getProjectTypes().filter((pt) => pt.category_key === categoryKey);
}

/**
 * Get project type by id
 */
export function getProjectTypeById(id: number): ProjectType | undefined {
	return getProjectTypes().find((pt) => pt.id === id);
}

/**
 * Get all category keys
 */
export function getCategoryKeys(): CategoryKey[] {
	return getCategories().map((c) => c.key);
}

/**
 * Get the next available project type ID
 */
export function getNextProjectTypeId(): number {
	const types = getProjectTypes();
	return types.length > 0 ? Math.max(...types.map((t) => t.id)) + 1 : 1;
}

/**
 * Get the next available category ID
 */
export function getNextCategoryId(): number {
	const cats = getCategories();
	return cats.length > 0 ? Math.max(...cats.map((c) => c.id)) + 1 : 1;
}

// ============================================
// FULL CONFIG ACCESS (for admin config page)
// ============================================

export function getProjectCategoriesFullConfig(): ProjectCategoriesConfig {
	return getCategoriesConfig();
}

export function getProjectTypesFullConfig(): ProjectTypesConfig {
	return getProjectTypesConfig();
}

export function getDefaultCategoriesConfig(): ProjectCategoriesConfig {
	return { categories: [...DEFAULT_CATEGORIES] };
}

export function getDefaultProjectTypesConfig(): ProjectTypesConfig {
	return { projectTypes: [...DEFAULT_PROJECT_TYPES] };
}

export function saveCategoriesConfig(
	config: ProjectCategoriesConfig,
	changeDescription?: string
): boolean {
	return saveConfigOverride(
		CONFIG_STORAGE_KEYS.PROJECT_CATEGORIES,
		config,
		'project-categories',
		changeDescription
	);
}

export function saveProjectTypesConfig(
	config: ProjectTypesConfig,
	changeDescription?: string
): boolean {
	return saveConfigOverride(
		CONFIG_STORAGE_KEYS.PROJECT_TYPES,
		config,
		'project-types',
		changeDescription
	);
}

export function resetCategoriesConfig(): boolean {
	return resetConfigToDefault(CONFIG_STORAGE_KEYS.PROJECT_CATEGORIES, 'project-categories');
}

export function resetProjectTypesConfig(): boolean {
	return resetConfigToDefault(CONFIG_STORAGE_KEYS.PROJECT_TYPES, 'project-types');
}

export function hasCategoriesOverride(): boolean {
	return hasConfigOverride(CONFIG_STORAGE_KEYS.PROJECT_CATEGORIES);
}

export function hasProjectTypesOverride(): boolean {
	return hasConfigOverride(CONFIG_STORAGE_KEYS.PROJECT_TYPES);
}

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================

/** @deprecated Use getCategories() instead */
export const categories = DEFAULT_CATEGORIES;

/** @deprecated Use getProjectTypes() instead */
export const projectTypes = DEFAULT_PROJECT_TYPES;
