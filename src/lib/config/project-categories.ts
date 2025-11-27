import type { Category, CategoryKey, ProjectType } from '$lib/types';

/**
 * Project Categories Configuration
 * Based on the Improved Project Tracking System v2
 */
export const categories: Category[] = [
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

/**
 * Project Types by Category
 * Each category has specific project types
 */
export const projectTypes: ProjectType[] = [
	// INFRASTRUCTURE
	{
		id: 1,
		category_key: 'infrastructure',
		name: 'Building Classrooms',
		description: 'Construction of school classrooms'
	},
	{
		id: 2,
		category_key: 'infrastructure',
		name: 'Public Restrooms/Sanitation Facilities',
		description: 'Construction of public sanitation facilities'
	},
	{
		id: 3,
		category_key: 'infrastructure',
		name: 'Barangay Health Stations',
		description: 'Construction of barangay health stations'
	},
	{
		id: 4,
		category_key: 'infrastructure',
		name: 'Farm-to-Market Roads',
		description: 'Construction and improvement of farm-to-market roads'
	},
	{
		id: 5,
		category_key: 'infrastructure',
		name: 'Water Systems',
		description: 'Installation of water supply systems'
	},
	{
		id: 6,
		category_key: 'infrastructure',
		name: 'Community Centers',
		description: 'Construction of multi-purpose community centers'
	},
	{
		id: 7,
		category_key: 'infrastructure',
		name: 'Footbridges',
		description: 'Construction of footbridges'
	},
	{
		id: 8,
		category_key: 'infrastructure',
		name: 'Solar Street Lighting',
		description: 'Installation of solar-powered street lights'
	},

	// AGRICULTURE
	{
		id: 9,
		category_key: 'agriculture',
		name: 'Seedling Distribution Program',
		description: 'Distribution of agricultural seedlings to farmers'
	},
	{
		id: 10,
		category_key: 'agriculture',
		name: 'Farm Equipment Support',
		description: 'Provision of farm equipment and tools'
	},
	{
		id: 11,
		category_key: 'agriculture',
		name: 'Irrigation Systems',
		description: 'Installation of irrigation infrastructure'
	},
	{
		id: 12,
		category_key: 'agriculture',
		name: 'Livestock Dispersal',
		description: 'Distribution of livestock to farmers'
	},
	{
		id: 13,
		category_key: 'agriculture',
		name: 'High-Value Crop Production',
		description: 'Support for high-value crop farming'
	},
	{
		id: 14,
		category_key: 'agriculture',
		name: 'Agricultural Training Centers',
		description: 'Establishment of agricultural training facilities'
	},
	{
		id: 15,
		category_key: 'agriculture',
		name: 'Post-Harvest Facilities',
		description: 'Construction of post-harvest processing facilities'
	},

	// EDUCATION
	{
		id: 16,
		category_key: 'education',
		name: 'School Feeding Program',
		description: 'Nutrition program for school children'
	},
	{
		id: 17,
		category_key: 'education',
		name: 'Learning Materials Distribution',
		description: 'Distribution of educational materials'
	},
	{
		id: 18,
		category_key: 'education',
		name: 'Teacher Training',
		description: 'Professional development for teachers'
	},
	{
		id: 19,
		category_key: 'education',
		name: 'Computer Laboratory Setup',
		description: 'Installation of computer laboratories in schools'
	},
	{
		id: 20,
		category_key: 'education',
		name: 'Alternative Learning System (ALS)',
		description: 'Alternative education for out-of-school youth'
	},
	{
		id: 21,
		category_key: 'education',
		name: 'Scholarship Programs',
		description: 'Educational scholarships for students'
	},

	// HEALTH
	{
		id: 22,
		category_key: 'health',
		name: 'Medical Missions',
		description: 'Free medical consultations and services'
	},
	{
		id: 23,
		category_key: 'health',
		name: 'Immunization Programs',
		description: 'Vaccination and immunization campaigns'
	},
	{
		id: 24,
		category_key: 'health',
		name: 'Nutrition Programs',
		description: 'Community nutrition and feeding programs'
	},
	{
		id: 25,
		category_key: 'health',
		name: 'Mobile Health Services',
		description: 'Mobile health clinic services'
	},
	{
		id: 26,
		category_key: 'health',
		name: 'Medicine Distribution',
		description: 'Free medicine distribution program'
	},
	{
		id: 27,
		category_key: 'health',
		name: 'Health Worker Training',
		description: 'Training for barangay health workers'
	},

	// LIVELIHOOD
	{
		id: 28,
		category_key: 'livelihood',
		name: 'Skills Training Programs',
		description: 'Vocational and skills development training'
	},
	{
		id: 29,
		category_key: 'livelihood',
		name: 'Microenterprise Development',
		description: 'Support for small business development'
	},
	{
		id: 30,
		category_key: 'livelihood',
		name: 'Cooperative Formation',
		description: 'Establishment and support of cooperatives'
	},
	{
		id: 31,
		category_key: 'livelihood',
		name: 'Equipment/Tools Distribution',
		description: 'Distribution of livelihood equipment and tools'
	},
	{
		id: 32,
		category_key: 'livelihood',
		name: 'Market Linkage Programs',
		description: 'Connecting producers to markets'
	},

	// ENVIRONMENT
	{
		id: 33,
		category_key: 'environment',
		name: 'Tree Planting/Reforestation',
		description: 'Tree planting and forest rehabilitation'
	},
	{
		id: 34,
		category_key: 'environment',
		name: 'Waste Management Systems',
		description: 'Installation of waste management infrastructure'
	},
	{
		id: 35,
		category_key: 'environment',
		name: 'Coastal Rehabilitation',
		description: 'Coastal and marine ecosystem rehabilitation'
	},
	{
		id: 36,
		category_key: 'environment',
		name: 'Watershed Management',
		description: 'Watershed protection and management'
	},
	{
		id: 37,
		category_key: 'environment',
		name: 'Clean Water Projects',
		description: 'Water source protection and development'
	}
];

/**
 * Helper function to get category by key
 */
export function getCategoryByKey(key: CategoryKey): Category | undefined {
	return categories.find((c) => c.key === key);
}

/**
 * Helper function to get project types by category
 */
export function getProjectTypesByCategory(categoryKey: CategoryKey): ProjectType[] {
	return projectTypes.filter((pt) => pt.category_key === categoryKey);
}

/**
 * Helper function to get project type by id
 */
export function getProjectTypeById(id: number): ProjectType | undefined {
	return projectTypes.find((pt) => pt.id === id);
}

/**
 * Helper function to get all category keys
 */
export function getCategoryKeys(): CategoryKey[] {
	return categories.map((c) => c.key);
}
