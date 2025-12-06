export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'suspended';
export type CategoryKey = string;

// ===== NEED LEVEL TYPE =====

export type NeedLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Derives the need level from a 1-10 need score.
 * - Critical: 8-10 (urgent need, prioritize for projects)
 * - High: 6-7 (significant need)
 * - Medium: 4-5 (moderate need)
 * - Low: 1-3 (relatively well-served)
 */
export function getNeedLevelFromScore(score: number): NeedLevel {
	if (score >= 8) return 'critical';
	if (score >= 6) return 'high';
	if (score >= 4) return 'medium';
	return 'low';
}

// ===== ISSUE & PPA STRUCTURED TYPES =====

export interface SitioIssue {
	id: string;
	name: string;
	category: CategoryKey;
	isCustom?: boolean;
	linkedPPAIds?: string[];
}

export interface SitioPPA {
	id: string;
	name: string;
	category: CategoryKey;
	isCustom?: boolean;
	linkedIssueIds?: string[];
	projectTypeId?: number;
}

export interface Sitio {
	// Core identification
	id: number;
	name: string;
	municipality: string;
	barangay: string;
	province?: string;
	population: number;
	households: number;
	coordinates: {
		lat: number;
		lng: number;
	};

	// Need Score (1-10, admin-assigned)
	need_score: number;
	need_level: NeedLevel;

	// Coding information
	coding?: string;

	// Demographics
	demographics: {
		male: number;
		female: number;
		total: number;
		age_0_14: number;
		age_15_64: number;
		age_65_above: number;
	};

	// Social services
	social_services?: {
		registered_voters: number;
		philhealth_beneficiaries: number;
		fourps_beneficiaries: number;
	};

	// Economic condition
	economic_condition?: {
		employments: Array<{ type: string; count: number }>;
		income_brackets: Array<{ bracket: string; households: number }>;
	};

	// Agriculture
	agriculture?: {
		farmers_count: number;
		farmer_associations: number;
		farm_area_hectares: number;
		top_crops: string[];
	};

	// Water and sanitation
	water_sanitation?: {
		water_systems_count: number;
		water_sources: Array<{ source: string; status: string }>;
		households_without_toilet: number;
		toilet_facility_types: string[];
		waste_segregation_practice: boolean | null;
	};

	// Livestock and poultry
	livestock_poultry?: string[];

	// Food security
	food_security?: {
		households_with_backyard_garden: number;
		common_garden_commodities: string[];
	};

	// Housing
	housing?: {
		quality_types: Array<{ type: string; count: number }>;
		ownership_types: Array<{ type: string; count: number }>;
	};

	// Domestic animals
	domestic_animals?: {
		dogs: number;
		cats: number;
		dogs_vaccinated: number;
		cats_vaccinated: number;
	};

	// Community empowerment
	community_empowerment?: {
		sectoral_organizations: number;
		info_dissemination_methods: string[];
		transportation_methods: string[];
	};

	// Utilities
	utilities?: {
		households_with_electricity: number;
		alternative_electricity_sources: string[];
	};

	// Ethnicity and Religion
	ethnicities?: string[];
	religions?: string[];

	// Local Officials
	local_officials?: Array<{
		name: string;
		position: string;
	}>;

	// RST (Resident Support Team) Officials
	rst_officials?: Array<{
		name: string;
		position: string;
	}>;

	// Primary Priorities - Issues & Concerns (structured)
	issues_concerns?: SitioIssue[];

	// Proposed PPAs (Programs, Projects, and Activities) (structured)
	proposed_ppas?: SitioPPA[];

	// Metadata
	created_at: string;
	updated_at?: string;
}

// Import-related types
export interface ImportedRow {
	[key: string]: string | number | null;
}

export interface ColumnMapping {
	csvHeader: string;
	sitioField: string;
	isRequired: boolean;
	autoMatched: boolean;
}

export interface ImportValidationError {
	row: number;
	field: string;
	message: string;
}

export interface ImportResult {
	total: number;
	successful: number;
	failed: number;
	duplicates: number;
	errors: ImportValidationError[];
}

export interface DuplicateSitio {
	existing: Sitio;
	incoming: Sitio;
	key: string;
}

// ===== NEW ENHANCED TRACKING SYSTEM TYPES =====

export interface Category {
	id: number;
	key: CategoryKey;
	name: string;
	description: string;
	icon: string;
}

export interface PerformanceIndicator {
	id: string;
	name: string;
	unit: string;
	description: string;
}

export interface ProjectType {
	id: number;
	category_key: CategoryKey;
	name: string;
	description: string;
	default_indicators?: PerformanceIndicator[];
}

export interface PerformanceTarget {
	id: number;
	project_id: number;
	indicator_type: string;
	indicator_name: string;
	target_value: number;
	unit_of_measure: string;
}

export interface ProjectSitio {
	project_id: number;
	sitio_id: number;
	sitio_name: string;
	municipality: string;
	barangay: string;
	beneficiaries_target: number;
	focal_person?: string;
	focal_contact?: string;
}

export interface PhotoDocumentation {
	id: string; // Unique identifier (nanoid or UUID)
	filename: string; // Original filename
	caption?: string; // Optional user-provided caption
	file_size: number; // Size in bytes
	mime_type: string; // e.g., 'image/jpeg'
	width: number; // Image dimensions
	height: number;
	thumbnail_id?: string; // Reference to thumbnail in IndexedDB
	uploaded_at: string; // ISO timestamp
	storage_type: 'indexeddb' | 'server'; // For migration tracking
	storage_ref: string; // IndexedDB key OR server URL
}

// Monthly report for display in monitoring timeline (transformed from MonthlyProgress + MonthlyTarget)
export interface MonthlyReport {
	month: string; // Display format: 'Jan 2024'
	month_year: string; // Original format: 'YYYY-MM' for sorting
	plan_physical: number;
	actual_physical: number | null;
	plan_financial: number;
	actual_financial: number | null;
	status: string; // 'On Track' | 'Delayed' | 'Ahead of Schedule' | 'Not Started'
	remarks: string;
	photos: PhotoDocumentation[];
	// Enhanced fields for detailed reporting
	achieved_outputs?: Record<string, number>;
	beneficiaries_reached?: number;
	// Status tracking fields (from MonthlyProgress)
	issues?: string;
	recommendations?: string;
	catch_up_plan?: string;
}

export interface MonthlyProgress {
	id: number;
	project_id: number;
	month_year: string; // Format: 'YYYY-MM'

	// Actual physical progress
	physical_progress_percentage: number;

	// Actual budget utilized
	budget_utilized: number;

	// Other actuals
	achieved_outputs: Record<string, number>; // { 'seedlings_distributed': 500, 'training_sessions': 3 }
	beneficiaries_reached: number;

	// Status tracking (per-month)
	issues?: string;
	recommendations?: string;
	catch_up_plan?: string;

	photo_documentation?: PhotoDocumentation[];
	status: 'on-track' | 'delayed' | 'ahead';
	created_at: string;
	updated_at: string;
}

export interface MonthlyTarget {
	month_year: string; // Format: 'YYYY-MM'
	planned_physical_progress: number; // Planned physical progress percentage
	planned_budget: number; // Planned budget release for the month
}

export interface BudgetComponent {
	id: number;
	project_id: number;
	component_name: string;
	amount: number;
	percentage: number;
}

export interface FundingSource {
	id: number;
	project_id: number;
	source_name: string;
	source_type: 'provincial' | 'national' | 'partner' | 'lgu_counterpart';
	amount: number;
	percentage: number;
}

export interface Project {
	id: number;
	title: string;
	description: string;
	category_key: CategoryKey;
	project_type_id?: number;
	status: ProjectStatus;
	start_date: string;
	contract_duration: string; // e.g., "180 CD" (calendar days)
	total_budget: number;
	contract_cost: number;
	beneficiaries: number;
	project_year: number;

	// Enhanced fields
	project_sitios?: ProjectSitio[];
	monthly_progress?: MonthlyProgress[]; // Actual progress data
	monthly_targets?: MonthlyTarget[]; // Planned physical progress and budget per month
	performance_targets?: PerformanceTarget[]; // Performance indicator targets
	funding_sources?: FundingSource[];
	budget_components?: BudgetComponent[];
	employment_generated?: {
		male: number;
		female: number;
	};
	implementing_agency?: string;
	created_at: string;
	updated_at: string;
}

// ===== USER MANAGEMENT & AUTH TYPES =====

export type UserRole = 'superadmin' | 'admin' | 'viewer';

export interface ResourcePermissions {
	read: boolean;
	write: boolean;
	delete: boolean;
}

export interface UserPermissions {
	sitios: ResourcePermissions;
	projects: ResourcePermissions;
	users: ResourcePermissions;
	audit_logs: ResourcePermissions;
}

export interface User {
	id: number;
	name: string;
	email: string;
	password_hash: string; // For prototype, plain text comparison
	role: UserRole;
	permissions: UserPermissions;
	department: string;
	is_active: boolean;
	last_login: string;
	created_at: string;
	updated_at?: string;
}

// ===== AUDIT LOG TYPES =====

export type AuditAction =
	| 'login'
	| 'logout'
	| 'create'
	| 'update'
	| 'delete'
	| 'view'
	| 'export'
	| 'import';

export type AuditResourceType = 'user' | 'sitio' | 'project' | 'system';

export interface AuditFieldChange {
	field: string;
	oldValue: unknown;
	newValue: unknown;
}

export interface AuditLog {
	id: string;
	user_id: number;
	user_name: string;
	action: AuditAction;
	resource_type: AuditResourceType;
	resource_id?: number | string;
	resource_name?: string;
	details?: string;
	changes?: AuditFieldChange[];
	ip_address?: string;
	timestamp: string;
}

export interface Activity {
	id: number;
	user: string;
	action: string;
	target: string;
	icon: string;
	timestamp: string;
}

export interface Stats {
	total_sitios: number;
	total_projects?: number;
	active_projects: number;
	completed_projects: number;
	planning_projects: number;
	suspended_projects: number;
	total_beneficiaries: number;
	total_budget: number;
	average_completion?: number;
	municipalities?: number;
}

export interface ChartDataItem {
	category?: string;
	count: number;
	status?: string;
	municipality?: string;
	month?: string;
	completed?: number;
}
