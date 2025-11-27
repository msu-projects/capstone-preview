export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'suspended';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type CategoryKey =
	| 'infrastructure'
	| 'agriculture'
	| 'education'
	| 'health'
	| 'livelihood'
	| 'environment';

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

	// Coding information
	coding?: {
		number: string;
		code: string;
	};

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
	livestock_poultry?: {
		pigs?: number;
		cows?: number;
		carabaos?: number;
		horses?: number;
		goats?: number;
		chickens?: number;
		ducks?: number;
	};

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

export interface MonitoringDetails {
	fundSource: string;
	fiscalYear: number;
	implementingUnit: string;
	location: string;
	allotment: {
		allocated: number;
		supplemental: number;
		total: number;
		released: number;
	};
	expenditure: {
		obligations: number;
		contractCost: number;
	};
	physical: {
		plan: number;
		actual: number;
		slippage: number;
	};
	employment: {
		male: number;
		female: number;
	};
	contract: {
		duration: string;
		delivery: string;
		extension: string;
	};
	statusSummary: {
		stage: string;
		issues: string;
		recommendations: string;
	};
	catchUpPlan: string;
}

// ===== NEW ENHANCED TRACKING SYSTEM TYPES =====

export interface Category {
	id: number;
	key: CategoryKey;
	name: string;
	description: string;
	icon: string;
}

export interface ProjectType {
	id: number;
	category_key: CategoryKey;
	name: string;
	description: string;
	default_indicators: PerformanceIndicator[];
}

export interface PerformanceIndicator {
	id: string;
	name: string;
	unit: string;
	description: string;
}

export interface ProjectSitio {
	project_id: number;
	sitio_id: number;
	sitio_name: string;
	municipality: string;
	barangay: string;
	beneficiaries_target: number;
	priority_level: PriorityLevel;
	focal_person?: string;
	focal_contact?: string;
}

export interface PerformanceTarget {
	id: number;
	project_id: number;
	indicator_type: string;
	indicator_name: string;
	target_value: number;
	unit_of_measure: string;
	monthly_breakdown?: Record<string, number>; // DEPRECATED: Use monthly_plan_percentage instead
	monthly_plan_percentage?: Record<string, number>; // Cumulative planned progress % { '2025-01': 15, '2025-02': 35, ... final: 100 }
	monthly_actual_percentage?: Record<string, number>; // Cumulative actual progress % { '2025-01': 12, '2025-02': 30, ... }
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

export interface MonthlyProgress {
	id: number;
	project_id: number;
	sitio_id?: number; // null means project-level progress
	month_year: string; // Format: 'YYYY-MM'
	achieved_outputs: Record<string, number>; // { 'seedlings_distributed': 500, 'training_sessions': 3 }
	beneficiaries_reached: number;
	issues_encountered?: string;
	photo_urls?: string[];
	photo_documentation?: PhotoDocumentation[];
	status: 'on-track' | 'delayed' | 'ahead';
	created_at: string;
	updated_at: string;
}

export interface MonthlyBudgetUtilization {
	id: number;
	project_id: number;
	month_year: string;
	budget_released: number;
	actual_expenses: number;
	obligations: number;
	remaining_balance: number;
	created_at: string;
	updated_at: string;
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

export interface MonthlyReleaseSchedule {
	id: number;
	project_id: number;
	month_year: string;
	planned_release: number;
	actual_release?: number;
	milestone_tied?: string;
}

export interface MonthlyPhysicalProgress {
	month_year: string;
	plan_percentage: number;
	actual_percentage?: number;
}

export interface Project {
	id: number;
	title: string;
	description: string;
	category: string;
	category_key?: CategoryKey;
	project_type_id?: number;
	project_type_name?: string;
	/** @deprecated Use project_sitios instead for multi-sitio support */
	sitio_id: number;
	/** @deprecated Use project_sitios instead for multi-sitio support */
	sitio_name: string;
	/** @deprecated Use project_sitios instead for multi-sitio support */
	municipality: string;
	status: ProjectStatus;
	start_date: string;
	end_date: string;
	budget: number;
	beneficiaries: number;
	completion_percentage: number;
	project_year: number;
	monitoring?: MonitoringDetails;
	// Enhanced fields
	project_sitios?: ProjectSitio[];
	performance_targets?: PerformanceTarget[];
	monthly_progress?: MonthlyProgress[];
	monthly_budget?: MonthlyBudgetUtilization[];
	funding_sources?: FundingSource[];
	budget_components?: BudgetComponent[];
	release_schedule?: MonthlyReleaseSchedule[];
	monthly_physical_progress?: MonthlyPhysicalProgress[];
	employment_generated?: {
		male: number;
		female: number;
	};
	project_manager_team?: {
		project_manager?: string;
		agency?: string;
		technical_lead?: string;
		lgu_counterpart?: string[];
	};
	sitio_coordinators?: Array<{
		sitio_id: number;
		barangay_captain?: string;
		sitio_leader?: string;
		volunteer_coordinator?: string;
		contact_numbers?: string[];
	}>;
	oversight_structure?: {
		provincial_team?: string[];
		dilg_rep?: string;
		sectoral_rep?: string;
	};
	created_at: string;
	updated_at: string;
}

export interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	department: string;
	status: string;
	last_login: string;
	created_at: string;
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
