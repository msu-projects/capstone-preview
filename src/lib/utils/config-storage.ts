/**
 * Configuration Storage Layer
 *
 * Provides localStorage persistence for system configuration with:
 * - Override mechanism that merges with code defaults
 * - Per-section reset functionality
 * - Audit logging for all configuration changes
 */

import { logAuditAction } from './audit';

// ===== STORAGE KEYS =====

export const CONFIG_STORAGE_KEYS = {
	SITIO_OPTIONS: 'sccdp_config_sitio_options',
	LOCATIONS: 'sccdp_config_locations',
	PROJECT_CATEGORIES: 'sccdp_config_project_categories',
	PROJECT_TYPES: 'sccdp_config_project_types',
	ISSUES_PPAS: 'sccdp_config_issues_ppas',
	STATUS_CONFIG: 'sccdp_config_status'
} as const;

export type ConfigStorageKey = (typeof CONFIG_STORAGE_KEYS)[keyof typeof CONFIG_STORAGE_KEYS];

// ===== CONFIG SECTION TYPES =====

export type ConfigSection =
	| 'sitio-options'
	| 'locations'
	| 'project-categories'
	| 'project-types'
	| 'issues-ppas'
	| 'status';

export const CONFIG_SECTION_LABELS: Record<ConfigSection, string> = {
	'sitio-options': 'Sitio Form Options',
	locations: 'Municipalities & Barangays',
	'project-categories': 'Project Categories',
	'project-types': 'Project Types',
	'issues-ppas': 'Issues & PPAs',
	status: 'Status Configuration'
};

export const CONFIG_SECTION_DESCRIPTIONS: Record<ConfigSection, string> = {
	'sitio-options':
		'Manage dropdown options for sitio forms including ethnicities, religions, employment types, crops, and more.',
	locations: 'Manage the list of municipalities and their barangays in South Cotabato.',
	'project-categories': 'Manage project categories like Infrastructure, Agriculture, Health, etc.',
	'project-types':
		'Manage project types within each category and their default performance indicators.',
	'issues-ppas':
		'Manage predefined community issues, proposed PPAs, and their mappings to project types.',
	status: 'Customize status labels and colors for projects and sitio need levels.'
};

// ===== INDICATOR UNIT OPTIONS (FIXED) =====

export const INDICATOR_UNIT_OPTIONS = [
	'units',
	'percentage',
	'PHP',
	'hectares',
	'meters',
	'kilometers',
	'sq. meters',
	'days',
	'sessions',
	'individuals',
	'households',
	'farmers',
	'students',
	'children',
	'facilities',
	'bridges',
	'lights',
	'seedlings',
	'heads',
	'sets',
	'doses',
	'packs',
	'trips',
	'members',
	'linkages',
	'trees',
	'sources',
	'classrooms',
	'cubicles',
	'stations',
	'systems',
	'centers',
	'labs',
	'learners',
	'scholars',
	'consultations',
	'patients',
	'vaccines',
	'workers',
	'trainees',
	'hours',
	'enterprises',
	'cooperatives',
	'producers',
	'metric tons',
	'meals',
	'materials'
] as const;

export type IndicatorUnit = (typeof INDICATOR_UNIT_OPTIONS)[number];

// ===== GENERIC CONFIG STORAGE FUNCTIONS =====

/**
 * Load configuration override from localStorage
 */
export function loadConfigOverride<T>(key: ConfigStorageKey): T | null {
	if (typeof window === 'undefined') return null;

	try {
		const json = localStorage.getItem(key);
		return json ? JSON.parse(json) : null;
	} catch (error) {
		console.error(`Failed to load config override for ${key}:`, error);
		return null;
	}
}

/**
 * Save configuration override to localStorage
 */
export function saveConfigOverride<T>(
	key: ConfigStorageKey,
	data: T,
	section: ConfigSection,
	changeDescription?: string
): boolean {
	if (typeof window === 'undefined') return false;

	try {
		localStorage.setItem(key, JSON.stringify(data));

		// Log audit action
		logAuditAction(
			'update',
			'system',
			undefined,
			CONFIG_SECTION_LABELS[section],
			changeDescription || `Updated ${CONFIG_SECTION_LABELS[section]} configuration`
		);

		return true;
	} catch (error) {
		console.error(`Failed to save config override for ${key}:`, error);
		return false;
	}
}

/**
 * Reset configuration to defaults (remove localStorage override)
 */
export function resetConfigToDefault(key: ConfigStorageKey, section: ConfigSection): boolean {
	if (typeof window === 'undefined') return false;

	try {
		localStorage.removeItem(key);

		// Log audit action
		logAuditAction(
			'update',
			'system',
			undefined,
			CONFIG_SECTION_LABELS[section],
			`Reset ${CONFIG_SECTION_LABELS[section]} to default values`
		);

		return true;
	} catch (error) {
		console.error(`Failed to reset config for ${key}:`, error);
		return false;
	}
}

/**
 * Check if a configuration has custom overrides
 */
export function hasConfigOverride(key: ConfigStorageKey): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(key) !== null;
}

/**
 * Get configuration with overrides merged with defaults
 * For simple arrays: override replaces default entirely
 */
export function getConfigWithOverrides<T>(key: ConfigStorageKey, defaults: T): T {
	const override = loadConfigOverride<T>(key);
	return override !== null ? override : defaults;
}

/**
 * Get configuration with partial overrides merged with defaults
 * For objects: deep merge override into defaults
 */
export function getConfigWithPartialOverrides<T extends object>(
	key: ConfigStorageKey,
	defaults: T
): T {
	const override = loadConfigOverride<Partial<T>>(key);
	if (override === null) return defaults;

	return deepMerge(defaults, override);
}

/**
 * Deep merge two objects
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
	const result = { ...target };

	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			const sourceValue = source[key];
			const targetValue = result[key];

			if (
				sourceValue !== undefined &&
				typeof sourceValue === 'object' &&
				sourceValue !== null &&
				!Array.isArray(sourceValue) &&
				typeof targetValue === 'object' &&
				targetValue !== null &&
				!Array.isArray(targetValue)
			) {
				// Recursively merge nested objects
				result[key] = deepMerge(targetValue as object, sourceValue as object) as T[Extract<
					keyof T,
					string
				>];
			} else if (sourceValue !== undefined) {
				// Override primitive values and arrays
				result[key] = sourceValue as T[Extract<keyof T, string>];
			}
		}
	}

	return result;
}

// ===== SITIO OPTIONS CONFIG =====

export interface SitioOptionsConfig {
	ethnicityOptions: string[];
	religionOptions: string[];
	employmentTypeOptions: string[];
	incomeBracketOptions: Array<{ label: string; value: string }>;
	livestockPoultryOptions: string[];
	cropOptions: string[];
	gardenCommodityOptions: string[];
	waterSourceOptions: string[];
	waterStatusOptions: string[];
	toiletFacilityTypeOptions: string[];
	alternativeElectricitySourceOptions: string[];
	housingQualityOptions: string[];
	housingOwnershipOptions: string[];
	infoDisseminationMethodOptions: string[];
	transportationMethodOptions: string[];
	localOfficialPositionOptions: string[];
	rstOfficialPositionOptions: string[];
}

// ===== LOCATIONS CONFIG =====

export interface LocationsConfig {
	municipalities: Array<{
		name: string;
		barangays: string[];
	}>;
}

// ===== PROJECT CATEGORIES CONFIG =====

export interface ProjectCategoriesConfig {
	categories: Array<{
		id: number;
		key: string;
		name: string;
		description: string;
		icon: string;
	}>;
}

// ===== PROJECT TYPES CONFIG =====

export interface ProjectTypesConfig {
	projectTypes: Array<{
		id: number;
		category_key: string;
		name: string;
		description: string;
		default_indicators?: Array<{
			id: string;
			name: string;
			unit: string;
			description: string;
		}>;
	}>;
}

// ===== ISSUES & PPAS CONFIG =====

export interface IssuesPPAsConfig {
	predefinedIssues: Array<{
		id: string;
		name: string;
		category: string;
		suggestedPPAIds: string[];
		keywords: string[];
	}>;
	predefinedPPAs: Array<{
		id: string;
		name: string;
		category: string;
		projectTypeId: number;
		addressesIssueIds: string[];
		keywords: string[];
	}>;
}

// ===== STATUS CONFIG =====

export interface StatusConfigData {
	projectStatuses: Record<
		string,
		{
			label: string;
			badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
			color: string;
			bgColor: string;
			textColor: string;
			darkBgColor: string;
			darkTextColor: string;
		}
	>;
	needLevels: Record<
		string,
		{
			label: string;
			shortLabel: string;
			bgClass: string;
			textClass: string;
			darkBgClass: string;
			darkTextClass: string;
			badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
		}
	>;
}

// ===== VALIDATION HELPERS =====

/**
 * Validate that an indicator ID is unique within a project type
 */
export function isIndicatorIdUnique(
	indicatorId: string,
	existingIndicators: Array<{ id: string }>,
	excludeIndex?: number
): boolean {
	return !existingIndicators.some((ind, idx) => ind.id === indicatorId && idx !== excludeIndex);
}

/**
 * Validate that an indicator unit is in the allowed list
 */
export function isValidIndicatorUnit(unit: string): unit is IndicatorUnit {
	return INDICATOR_UNIT_OPTIONS.includes(unit as IndicatorUnit);
}

/**
 * Generate a unique ID from a name (for new indicators)
 */
export function generateIndicatorId(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_|_$/g, '');
}
