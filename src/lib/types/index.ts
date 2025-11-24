export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'suspended';
export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed';
export type DelayType = 'weather' | 'material' | 'utility_coordination' | 'permit' | 'other';
export type DelaySeverity = 'low' | 'medium' | 'high' | 'critical';
export type RecoveryActionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type IssueCategory =
	| 'weather_climate'
	| 'material_supply'
	| 'budget_funding'
	| 'community_concerns'
	| 'technical_challenges'
	| 'permit_clearance'
	| 'partner_coordination';
export type CategoryKey =
	| 'infrastructure'
	| 'agriculture'
	| 'education'
	| 'health'
	| 'livelihood'
	| 'environment';

export interface Sitio {
	// Core identification (required for backwards compatibility)
	id: number;
	name: string; // maps to SITIO column
	municipality: string;
	barangay: string;
	province?: string;
	population: number; // maps to POPULATION - TOTAL
	households: number; // maps to No. of Households
	coordinates: {
		lat: number;
		lng: number;
	};

	// Coding information
	coding?: {
		number: string; // NO.
		code: string; // CODING (e.g., "1-1")
	};

	// Demographics (expanded for 86-column dataset)
	demographics: {
		male: number;
		female: number;
		total: number;
		age_0_14: number;
		age_15_64: number;
		age_65_above: number;
		// Legacy fields (kept for backwards compatibility)
		employment_rate?: number;
		poverty_incidence?: number;
		farmers?: number;
		potable_water_access?: number;
		electricity_access?: number;
	};

	// Social services
	social_services?: {
		registered_voters: number;
		philhealth_beneficiaries: number;
		fourps_beneficiaries: number;
	};

	// Economic condition
	economic_condition?: {
		top_employments: string[]; // Array of top 3
		top_income_brackets: string[]; // Array of top 3
	};

	// Agriculture
	agriculture?: {
		farmers_count: number;
		farmer_associations: number;
		farm_area_hectares: number;
		top_crops: string[]; // Array of top 5
	};

	// Water and sanitation
	water_sanitation?: {
		water_systems_count: number;
		water_sources: Array<{ source: string; condition?: string }>;
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
		common_garden_commodities: string[]; // Top 3
	};

	// Housing
	housing?: {
		quality_types: string[]; // Concrete, Wood, Half-Concrete, Makeshift, Others
		ownership_types: string[]; // Owned, Rented, Protected Land, Informal Settler, Owner Consent
	};

	// Domestic animals
	domestic_animals?: {
		total_count: number;
		dogs: number;
		cats: number;
		dogs_vaccinated: number;
		cats_vaccinated: number;
	};

	// Community empowerment
	community_empowerment?: {
		sectoral_organizations: number;
		info_dissemination_methods: string[]; // Radio, Signages, Person in Authority, etc.
		transportation_methods: string[]; // Motorcycle, Tricycle, 4-Wheels, Boat
	};

	// Utilities
	utilities?: {
		households_with_electricity: number;
		alternative_electricity_sources: string[]; // Solar, Generator, Battery
	};

	// Metadata
	projects_count?: number;
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
	key: string; // municipality-barangay-sitio identifier
}

export interface TimelineEvent {
	date: string;
	status: string;
	title: string;
	description: string;
}

export interface Phase {
	id: number;
	name: string;
	order: number;
}

export interface Milestone {
	id: number;
	phase_id: number;
	name: string;
	description: string;
	baseline_start: string;
	baseline_end: string;
	planned_start: string;
	planned_end: string;
	actual_start: string | null;
	actual_end: string | null;
	status: MilestoneStatus;
	completion_percentage: number;
	owner: string;
	approver: string;
	deliverables: string[];
	budget_allocation: number;
	delay_ids?: number[];
}

export interface Delay {
	id: number;
	milestone_id: number;
	reported_date: string;
	reported_by: string;
	title: string;
	delay_type: DelayType;
	root_cause: string;
	contributing_factors: string[];
	preventable: boolean;
	responsible_party: string;
	accountability_type: string;
	internal_contributing?: string;
	duration_days_estimated: number;
	duration_days_actual: number | null;
	schedule_impact_days: number;
	cost_impact: number;
	critical_path_affected: boolean;
	beneficiary_impact: string;
	severity: DelaySeverity;
	status: string;
	resolution_target_date: string;
	resolution_actual_date: string | null;
	recovery_action_ids: number[];
	lessons_learned?: string;
	preventive_actions_future?: string;
}

export interface RecoveryAction {
	id: number;
	delay_id: number;
	action: string;
	description: string;
	owner: string;
	owner_contact: string;
	supporting_parties: string[];
	planned_start: string;
	target_completion: string;
	actual_completion: string | null;
	status: RecoveryActionStatus;
	progress_percentage: number;
	expected_time_recovery_days: number;
	actual_time_recovery_days: number | null;
	effectiveness_rating: number | null;
	cost_estimate: number;
	cost_actual: number | null;
	notes?: string;
	obstacles?: string | null;
}

export interface Accountability {
	project_manager: string;
	pm_agency: string;
	technical_lead: string;
	contractor: string;
	oversight_committee: string[];
	escalation_contacts: {
		technical: string;
		administrative: string;
	};
}

export interface Baseline {
	approved_date: string;
	planned_start: string;
	planned_end: string;
	planned_duration_days: number;
	budget: number;
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

export interface MonthlyProgress {
	id: number;
	project_id: number;
	sitio_id?: number; // null means project-level progress
	month_year: string; // Format: 'YYYY-MM'
	achieved_outputs: Record<string, number>; // { 'seedlings_distributed': 500, 'training_sessions': 3 }
	beneficiaries_reached: number;
	issues_encountered?: string;
	photo_urls?: string[];
	status: 'on-track' | 'delayed' | 'ahead';
	created_at: string;
	updated_at: string;
}

export interface MonthlyBudgetUtilization {
	id: number;
	project_id: number;
	month_year: string; // Format: 'YYYY-MM'
	budget_released: number;
	actual_expenses: number;
	obligations: number;
	remaining_balance: number;
	created_at: string;
	updated_at: string;
}

export interface ProjectIssue {
	id: number;
	project_id: number;
	sitio_id?: number;
	month_year: string;
	category: IssueCategory;
	title: string;
	description: string;
	affected_sitios: number[];
	deliverables_at_risk: string[];
	beneficiaries_impacted: number;
	days_delay: number;
	mitigation_actions?: string;
	resources_needed?: string;
	revised_timeline?: string;
	status: 'open' | 'mitigating' | 'resolved';
	created_at: string;
	updated_at: string;
}

export interface Partner {
	id: number;
	name: string;
	type: 'ngo' | 'cso' | 'private_sector' | 'lgu' | 'national_agency';
	contact_person?: string;
	contact_number?: string;
	email?: string;
}

export interface ProjectPartner {
	project_id: number;
	partner_id: number;
	role: string;
	contribution_amount?: number;
	contribution_inkind?: string;
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
	month_year: string; // Format: 'YYYY-MM'
	plan_percentage: number; // Cumulative planned %
	actual_percentage?: number; // Cumulative actual % - optional, only filled during monitoring
}

export interface Project {
	id: number;
	title: string;
	description: string;
	category: string;
	category_key?: CategoryKey; // NEW: For category-driven design
	project_type_id?: number; // NEW: Links to ProjectType
	project_type_name?: string; // NEW: Display name of project type
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
	timeline?: TimelineEvent[];
	phases?: Phase[];
	milestones?: Milestone[];
	delays?: Delay[];
	recovery_actions?: RecoveryAction[];
	accountability?: Accountability;
	baseline?: Baseline;
	monitoring?: MonitoringDetails;
	// NEW ENHANCED FIELDS
	project_sitios?: ProjectSitio[]; // Multi-sitio support
	performance_targets?: PerformanceTarget[]; // Category-specific targets
	monthly_progress?: MonthlyProgress[]; // Monthly tracking
	monthly_budget?: MonthlyBudgetUtilization[]; // Monthly budget tracking
	issues?: ProjectIssue[]; // Issue management
	partners?: ProjectPartner[]; // Implementation partners
	funding_sources?: FundingSource[]; // Multi-source funding
	budget_components?: BudgetComponent[]; // Budget breakdown
	release_schedule?: MonthlyReleaseSchedule[]; // Monthly releases
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
