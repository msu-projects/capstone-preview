import type { CategoryKey, SitioIssue, SitioPPA } from '$lib/types';

/**
 * Issue & PPA Mappings Configuration
 *
 * This file defines the relationships between:
 * - Community Issues/Concerns
 * - Proposed PPAs (Programs, Projects, and Activities)
 * - Project Types (from project-categories.ts)
 *
 * Each issue can suggest related PPAs, and each PPA can link to a specific project type.
 */

// ===== PREDEFINED ISSUES =====

export interface PredefinedIssue {
	id: string;
	name: string;
	category: CategoryKey;
	suggestedPPAIds: string[];
	keywords: string[];
}

export const predefinedIssues: PredefinedIssue[] = [
	// INFRASTRUCTURE
	{
		id: 'issue_water_supply',
		name: 'Lack of potable water supply',
		category: 'infrastructure',
		suggestedPPAIds: ['ppa_water_system', 'ppa_clean_water'],
		keywords: ['water', 'potable', 'supply', 'drinking']
	},
	{
		id: 'issue_poor_roads',
		name: 'Poor road conditions',
		category: 'infrastructure',
		suggestedPPAIds: ['ppa_road_concreting', 'ppa_fmr'],
		keywords: ['road', 'highway', 'pavement', 'access']
	},
	{
		id: 'issue_drainage',
		name: 'Poor drainage system causing flooding',
		category: 'infrastructure',
		suggestedPPAIds: ['ppa_drainage'],
		keywords: ['drainage', 'flood', 'flooding', 'water logging']
	},
	{
		id: 'issue_no_streetlights',
		name: 'Lack of streetlights',
		category: 'infrastructure',
		suggestedPPAIds: ['ppa_solar_streetlights'],
		keywords: ['streetlight', 'lighting', 'dark', 'night safety']
	},
	{
		id: 'issue_no_evacuation_center',
		name: 'No proper evacuation center',
		category: 'infrastructure',
		suggestedPPAIds: ['ppa_evacuation_center', 'ppa_multipurpose_hall'],
		keywords: ['evacuation', 'disaster', 'shelter', 'emergency']
	},
	{
		id: 'issue_no_health_station',
		name: 'No barangay health station',
		category: 'infrastructure',
		suggestedPPAIds: ['ppa_health_station'],
		keywords: ['health station', 'clinic', 'medical facility']
	},
	{
		id: 'issue_limited_electricity',
		name: 'Limited electricity coverage',
		category: 'infrastructure',
		suggestedPPAIds: ['ppa_solar_streetlights'],
		keywords: ['electricity', 'power', 'electric']
	},

	// HEALTH
	{
		id: 'issue_health_access',
		name: 'Limited access to health services',
		category: 'health',
		suggestedPPAIds: ['ppa_medical_mission', 'ppa_health_station'],
		keywords: ['health', 'medical', 'doctor', 'nurse', 'hospital']
	},
	{
		id: 'issue_malnutrition',
		name: 'High incidence of malnutrition',
		category: 'health',
		suggestedPPAIds: ['ppa_feeding_program', 'ppa_nutrition_program'],
		keywords: ['malnutrition', 'nutrition', 'underweight', 'stunting']
	},
	{
		id: 'issue_sanitation',
		name: 'Limited access to clean sanitation',
		category: 'health',
		suggestedPPAIds: ['ppa_toilet_facility', 'ppa_sanitation'],
		keywords: ['sanitation', 'toilet', 'hygiene', 'sewage']
	},

	// EDUCATION
	{
		id: 'issue_school_facilities',
		name: 'Inadequate school facilities',
		category: 'education',
		suggestedPPAIds: ['ppa_school_building', 'ppa_classroom'],
		keywords: ['school', 'classroom', 'building', 'facility']
	},
	{
		id: 'issue_no_daycare',
		name: 'Lack of day care center',
		category: 'education',
		suggestedPPAIds: ['ppa_daycare'],
		keywords: ['day care', 'daycare', 'preschool', 'children']
	},

	// LIVELIHOOD
	{
		id: 'issue_unemployment',
		name: 'High unemployment rate',
		category: 'livelihood',
		suggestedPPAIds: ['ppa_skills_training', 'ppa_livelihood'],
		keywords: ['unemployment', 'jobless', 'no work', 'employment']
	},
	{
		id: 'issue_livelihood_opportunities',
		name: 'Lack of livelihood opportunities',
		category: 'livelihood',
		suggestedPPAIds: ['ppa_livelihood', 'ppa_skills_training', 'ppa_microenterprise'],
		keywords: ['livelihood', 'income', 'business', 'opportunity']
	},

	// AGRICULTURE
	{
		id: 'issue_fmr',
		name: 'Lack of farm-to-market roads',
		category: 'agriculture',
		suggestedPPAIds: ['ppa_fmr'],
		keywords: ['farm-to-market', 'farm road', 'access road', 'agricultural road']
	},
	{
		id: 'issue_irrigation',
		name: 'Insufficient irrigation facilities',
		category: 'agriculture',
		suggestedPPAIds: ['ppa_irrigation'],
		keywords: ['irrigation', 'water', 'farm water', 'canal']
	},

	// ENVIRONMENT
	{
		id: 'issue_waste_management',
		name: 'Absence of proper waste management',
		category: 'environment',
		suggestedPPAIds: ['ppa_mrf', 'ppa_waste_management'],
		keywords: ['waste', 'garbage', 'trash', 'segregation']
	},
	{
		id: 'issue_no_multipurpose_hall',
		name: 'Absence of multi-purpose hall',
		category: 'infrastructure',
		suggestedPPAIds: ['ppa_multipurpose_hall'],
		keywords: ['multipurpose', 'hall', 'community center', 'meeting place']
	},
	{
		id: 'issue_poor_internet',
		name: 'Poor internet connectivity',
		category: 'infrastructure',
		suggestedPPAIds: [],
		keywords: ['internet', 'connectivity', 'signal', 'network']
	},
	{
		id: 'issue_transportation',
		name: 'Limited public transportation',
		category: 'infrastructure',
		suggestedPPAIds: ['ppa_footbridge'],
		keywords: ['transportation', 'transport', 'commute', 'travel']
	}
];

// ===== PREDEFINED PPAs =====

export interface PredefinedPPA {
	id: string;
	name: string;
	category: CategoryKey;
	projectTypeId: number; // Links to projectTypes from project-categories.ts
	addressesIssueIds: string[];
	keywords: string[];
}

export const predefinedPPAs: PredefinedPPA[] = [
	// INFRASTRUCTURE (Project Type IDs: 1-8)
	{
		id: 'ppa_water_system',
		name: 'Water System Level II Installation',
		category: 'infrastructure',
		projectTypeId: 5, // Water Systems
		addressesIssueIds: ['issue_water_supply', 'issue_sanitation'],
		keywords: ['water system', 'level II', 'water supply', 'potable']
	},
	{
		id: 'ppa_road_concreting',
		name: 'Road Concreting/Improvement',
		category: 'infrastructure',
		projectTypeId: 4, // Farm-to-Market Roads
		addressesIssueIds: ['issue_poor_roads'],
		keywords: ['road', 'concrete', 'pavement', 'improvement']
	},
	{
		id: 'ppa_fmr',
		name: 'Farm-to-Market Road Construction',
		category: 'infrastructure',
		projectTypeId: 4, // Farm-to-Market Roads
		addressesIssueIds: ['issue_fmr', 'issue_poor_roads'],
		keywords: ['farm-to-market', 'FMR', 'agricultural road']
	},
	{
		id: 'ppa_health_station',
		name: 'Barangay Health Station Construction',
		category: 'infrastructure',
		projectTypeId: 3, // Barangay Health Stations
		addressesIssueIds: ['issue_no_health_station', 'issue_health_access'],
		keywords: ['health station', 'BHS', 'clinic']
	},
	{
		id: 'ppa_solar_streetlights',
		name: 'Solar Street Lighting Installation',
		category: 'infrastructure',
		projectTypeId: 8, // Solar Street Lighting
		addressesIssueIds: ['issue_no_streetlights', 'issue_limited_electricity'],
		keywords: ['solar', 'streetlight', 'lighting']
	},
	{
		id: 'ppa_drainage',
		name: 'Drainage System Construction',
		category: 'infrastructure',
		projectTypeId: 5, // Water Systems (closest match)
		addressesIssueIds: ['issue_drainage'],
		keywords: ['drainage', 'flood control', 'canal']
	},
	{
		id: 'ppa_footbridge',
		name: 'Footbridge Construction',
		category: 'infrastructure',
		projectTypeId: 7, // Footbridges
		addressesIssueIds: ['issue_transportation', 'issue_poor_roads'],
		keywords: ['footbridge', 'bridge', 'crossing']
	},
	{
		id: 'ppa_multipurpose_hall',
		name: 'Multi-Purpose Hall Construction',
		category: 'infrastructure',
		projectTypeId: 6, // Community Centers
		addressesIssueIds: ['issue_no_multipurpose_hall', 'issue_no_evacuation_center'],
		keywords: ['multipurpose', 'hall', 'community center']
	},
	{
		id: 'ppa_evacuation_center',
		name: 'Evacuation Center Construction',
		category: 'infrastructure',
		projectTypeId: 6, // Community Centers
		addressesIssueIds: ['issue_no_evacuation_center'],
		keywords: ['evacuation', 'disaster', 'shelter']
	},
	{
		id: 'ppa_toilet_facility',
		name: 'Toilet Facility Construction',
		category: 'infrastructure',
		projectTypeId: 2, // Public Restrooms/Sanitation Facilities
		addressesIssueIds: ['issue_sanitation'],
		keywords: ['toilet', 'sanitation', 'restroom']
	},
	{
		id: 'ppa_sanitation',
		name: 'Sanitation Facilities Construction',
		category: 'infrastructure',
		projectTypeId: 2, // Public Restrooms/Sanitation Facilities
		addressesIssueIds: ['issue_sanitation'],
		keywords: ['sanitation', 'toilet', 'hygiene']
	},
	{
		id: 'ppa_classroom',
		name: 'Classroom Construction/Rehabilitation',
		category: 'infrastructure',
		projectTypeId: 1, // Building Classrooms
		addressesIssueIds: ['issue_school_facilities'],
		keywords: ['classroom', 'school building']
	},

	// AGRICULTURE (Project Type IDs: 9-15)
	{
		id: 'ppa_irrigation',
		name: 'Irrigation System Development',
		category: 'agriculture',
		projectTypeId: 11, // Irrigation Systems
		addressesIssueIds: ['issue_irrigation'],
		keywords: ['irrigation', 'farm water', 'canal']
	},
	{
		id: 'ppa_agri_equipment',
		name: 'Agricultural Equipment Distribution',
		category: 'agriculture',
		projectTypeId: 10, // Farm Equipment Support
		addressesIssueIds: ['issue_livelihood_opportunities'],
		keywords: ['equipment', 'farm tools', 'machinery']
	},
	{
		id: 'ppa_seedling',
		name: 'Seedling Distribution Program',
		category: 'agriculture',
		projectTypeId: 9, // Seedling Distribution Program
		addressesIssueIds: [],
		keywords: ['seedling', 'seeds', 'planting materials']
	},

	// EDUCATION (Project Type IDs: 16-21)
	{
		id: 'ppa_school_building',
		name: 'School Building Rehabilitation',
		category: 'education',
		projectTypeId: 1, // Building Classrooms
		addressesIssueIds: ['issue_school_facilities'],
		keywords: ['school', 'building', 'rehabilitation']
	},
	{
		id: 'ppa_daycare',
		name: 'Day Care Center Construction',
		category: 'education',
		projectTypeId: 16, // School Feeding Program (closest - education infrastructure)
		addressesIssueIds: ['issue_no_daycare'],
		keywords: ['daycare', 'day care', 'preschool']
	},
	{
		id: 'ppa_educational_assistance',
		name: 'Educational Assistance Program',
		category: 'education',
		projectTypeId: 21, // Scholarship Programs
		addressesIssueIds: ['issue_school_facilities'],
		keywords: ['scholarship', 'educational assistance', 'tuition']
	},
	{
		id: 'ppa_feeding_program',
		name: 'Feeding Program Implementation',
		category: 'education',
		projectTypeId: 16, // School Feeding Program
		addressesIssueIds: ['issue_malnutrition'],
		keywords: ['feeding', 'nutrition', 'school meals']
	},

	// HEALTH (Project Type IDs: 22-27)
	{
		id: 'ppa_medical_mission',
		name: 'Medical Mission Program',
		category: 'health',
		projectTypeId: 22, // Medical Missions
		addressesIssueIds: ['issue_health_access'],
		keywords: ['medical mission', 'health services', 'checkup']
	},
	{
		id: 'ppa_nutrition_program',
		name: 'Nutrition Program Implementation',
		category: 'health',
		projectTypeId: 24, // Nutrition Programs
		addressesIssueIds: ['issue_malnutrition'],
		keywords: ['nutrition', 'supplementary feeding', 'vitamin']
	},

	// LIVELIHOOD (Project Type IDs: 28-32)
	{
		id: 'ppa_skills_training',
		name: 'Skills Training Program',
		category: 'livelihood',
		projectTypeId: 28, // Skills Training Programs
		addressesIssueIds: ['issue_unemployment', 'issue_livelihood_opportunities'],
		keywords: ['skills', 'training', 'TESDA', 'vocational']
	},
	{
		id: 'ppa_livelihood',
		name: 'Livelihood Assistance Program',
		category: 'livelihood',
		projectTypeId: 29, // Microenterprise Development
		addressesIssueIds: ['issue_unemployment', 'issue_livelihood_opportunities'],
		keywords: ['livelihood', 'capital', 'business', 'assistance']
	},
	{
		id: 'ppa_microenterprise',
		name: 'Microenterprise Development Support',
		category: 'livelihood',
		projectTypeId: 29, // Microenterprise Development
		addressesIssueIds: ['issue_livelihood_opportunities'],
		keywords: ['microenterprise', 'small business', 'entrepreneur']
	},

	// ENVIRONMENT (Project Type IDs: 33-37)
	{
		id: 'ppa_mrf',
		name: 'Materials Recovery Facility Construction',
		category: 'environment',
		projectTypeId: 34, // Waste Management Systems
		addressesIssueIds: ['issue_waste_management'],
		keywords: ['MRF', 'materials recovery', 'recycling']
	},
	{
		id: 'ppa_waste_management',
		name: 'Waste Management System Implementation',
		category: 'environment',
		projectTypeId: 34, // Waste Management Systems
		addressesIssueIds: ['issue_waste_management'],
		keywords: ['waste', 'garbage', 'segregation']
	},
	{
		id: 'ppa_tree_planting',
		name: 'Tree Planting Activity',
		category: 'environment',
		projectTypeId: 33, // Tree Planting/Reforestation
		addressesIssueIds: [],
		keywords: ['tree planting', 'reforestation', 'seedlings']
	},
	{
		id: 'ppa_clean_water',
		name: 'Clean Water Project',
		category: 'environment',
		projectTypeId: 37, // Clean Water Projects
		addressesIssueIds: ['issue_water_supply'],
		keywords: ['clean water', 'water purification', 'safe water']
	}
];

// ===== HELPER FUNCTIONS =====

/**
 * Get all predefined issues organized by category
 */
export function getIssuesByCategory(): Record<CategoryKey, PredefinedIssue[]> {
	const result = {} as Record<CategoryKey, PredefinedIssue[]>;
	const categories: CategoryKey[] = [
		'infrastructure',
		'agriculture',
		'education',
		'health',
		'livelihood',
		'environment'
	];

	for (const cat of categories) {
		result[cat] = predefinedIssues.filter((issue) => issue.category === cat);
	}

	return result;
}

/**
 * Get all predefined PPAs organized by category
 */
export function getPPAsByCategory(): Record<CategoryKey, PredefinedPPA[]> {
	const result = {} as Record<CategoryKey, PredefinedPPA[]>;
	const categories: CategoryKey[] = [
		'infrastructure',
		'agriculture',
		'education',
		'health',
		'livelihood',
		'environment'
	];

	for (const cat of categories) {
		result[cat] = predefinedPPAs.filter((ppa) => ppa.category === cat);
	}

	return result;
}

/**
 * Get suggested PPAs for a given issue
 */
export function getSuggestedPPAsForIssue(issueId: string): PredefinedPPA[] {
	const issue = predefinedIssues.find((i) => i.id === issueId);
	if (!issue) return [];

	return predefinedPPAs.filter((ppa) => issue.suggestedPPAIds.includes(ppa.id));
}

/**
 * Get issues that a PPA addresses
 */
export function getIssuesForPPA(ppaId: string): PredefinedIssue[] {
	const ppa = predefinedPPAs.find((p) => p.id === ppaId);
	if (!ppa) return [];

	return predefinedIssues.filter((issue) => ppa.addressesIssueIds.includes(issue.id));
}

/**
 * Get predefined issue by ID
 */
export function getPredefinedIssue(id: string): PredefinedIssue | undefined {
	return predefinedIssues.find((issue) => issue.id === id);
}

/**
 * Get predefined PPA by ID
 */
export function getPredefinedPPA(id: string): PredefinedPPA | undefined {
	return predefinedPPAs.find((ppa) => ppa.id === id);
}

/**
 * Convert a SitioIssue to display format with linked PPAs info
 */
export function getIssueDisplayInfo(issue: SitioIssue): {
	issue: SitioIssue;
	suggestedPPAs: PredefinedPPA[];
	predefinedData?: PredefinedIssue;
} {
	const predefinedData = getPredefinedIssue(issue.id);
	const suggestedPPAs = predefinedData ? getSuggestedPPAsForIssue(issue.id) : [];

	return {
		issue,
		suggestedPPAs,
		predefinedData
	};
}

/**
 * Convert a SitioPPA to display format with linked issues info
 */
export function getPPADisplayInfo(ppa: SitioPPA): {
	ppa: SitioPPA;
	addressesIssues: PredefinedIssue[];
	predefinedData?: PredefinedPPA;
} {
	const predefinedData = getPredefinedPPA(ppa.id);
	const addressesIssues = predefinedData ? getIssuesForPPA(ppa.id) : [];

	return {
		ppa,
		addressesIssues,
		predefinedData
	};
}

/**
 * Create a SitioIssue from a predefined issue
 */
export function createIssueFromPredefined(predefinedId: string): SitioIssue | null {
	const predefined = getPredefinedIssue(predefinedId);
	if (!predefined) return null;

	return {
		id: predefined.id,
		name: predefined.name,
		category: predefined.category,
		isCustom: false,
		linkedPPAIds: predefined.suggestedPPAIds
	};
}

/**
 * Create a SitioPPA from a predefined PPA
 */
export function createPPAFromPredefined(predefinedId: string): SitioPPA | null {
	const predefined = getPredefinedPPA(predefinedId);
	if (!predefined) return null;

	return {
		id: predefined.id,
		name: predefined.name,
		category: predefined.category,
		isCustom: false,
		linkedIssueIds: predefined.addressesIssueIds,
		projectTypeId: predefined.projectTypeId
	};
}

/**
 * Create a custom SitioIssue
 */
export function createCustomIssue(name: string, category: CategoryKey): SitioIssue {
	return {
		id: `custom_issue_${Date.now()}`,
		name,
		category,
		isCustom: true,
		linkedPPAIds: []
	};
}

/**
 * Create a custom SitioPPA
 */
export function createCustomPPA(
	name: string,
	category: CategoryKey,
	projectTypeId?: number
): SitioPPA {
	return {
		id: `custom_ppa_${Date.now()}`,
		name,
		category,
		isCustom: true,
		linkedIssueIds: [],
		projectTypeId
	};
}

/**
 * Get issues as options for combobox (grouped by category)
 */
export function getIssueOptions(): Array<{ value: string; label: string; category: CategoryKey }> {
	return predefinedIssues.map((issue) => ({
		value: issue.id,
		label: issue.name,
		category: issue.category
	}));
}

/**
 * Get PPAs as options for combobox (grouped by category)
 */
export function getPPAOptions(): Array<{
	value: string;
	label: string;
	category: CategoryKey;
	projectTypeId: number;
}> {
	return predefinedPPAs.map((ppa) => ({
		value: ppa.id,
		label: ppa.name,
		category: ppa.category,
		projectTypeId: ppa.projectTypeId
	}));
}

// ===== CATEGORY STYLING =====

export const categoryColors: Record<CategoryKey, { bg: string; text: string; border: string }> = {
	infrastructure: {
		bg: 'bg-blue-100 dark:bg-blue-900/30',
		text: 'text-blue-700 dark:text-blue-300',
		border: 'border-blue-300 dark:border-blue-700'
	},
	agriculture: {
		bg: 'bg-green-100 dark:bg-green-900/30',
		text: 'text-green-700 dark:text-green-300',
		border: 'border-green-300 dark:border-green-700'
	},
	education: {
		bg: 'bg-purple-100 dark:bg-purple-900/30',
		text: 'text-purple-700 dark:text-purple-300',
		border: 'border-purple-300 dark:border-purple-700'
	},
	health: {
		bg: 'bg-red-100 dark:bg-red-900/30',
		text: 'text-red-700 dark:text-red-300',
		border: 'border-red-300 dark:border-red-700'
	},
	livelihood: {
		bg: 'bg-amber-100 dark:bg-amber-900/30',
		text: 'text-amber-700 dark:text-amber-300',
		border: 'border-amber-300 dark:border-amber-700'
	},
	environment: {
		bg: 'bg-teal-100 dark:bg-teal-900/30',
		text: 'text-teal-700 dark:text-teal-300',
		border: 'border-teal-300 dark:border-teal-700'
	}
};

export const categoryLabels: Record<CategoryKey, string> = {
	infrastructure: 'Infrastructure',
	agriculture: 'Agriculture',
	education: 'Education',
	health: 'Health',
	livelihood: 'Livelihood',
	environment: 'Environment'
};
