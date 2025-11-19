export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'suspended';
export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed';
export type DelayType = 'weather' | 'material' | 'utility_coordination' | 'permit' | 'other';
export type DelaySeverity = 'low' | 'medium' | 'high' | 'critical';
export type RecoveryActionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Sitio {
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
	demographics?: {
		employment_rate: number;
		poverty_incidence: number;
		farmers: number;
		potable_water_access: number;
		electricity_access: number;
	};
	projects_count?: number;
	created_at: string;
	updated_at?: string;
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

export interface Project {
	id: number;
	title: string;
	description: string;
	category: string;
	sitio_id: number;
	sitio_name: string;
	municipality: string;
	status: ProjectStatus;
	start_date: string;
	end_date: string;
	budget: number;
	beneficiaries: number;
	completion_percentage: number;
	implementing_partner?: string; // Optional - for NGO/agency partners collaborating with PGO-CATCH-UP
	project_year: number;
	timeline?: TimelineEvent[];
	phases?: Phase[];
	milestones?: Milestone[];
	delays?: Delay[];
	recovery_actions?: RecoveryAction[];
	accountability?: Accountability;
	baseline?: Baseline;
	monitoring?: MonitoringDetails;
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
