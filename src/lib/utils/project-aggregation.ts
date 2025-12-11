/**
 * Project Aggregation Utilities
 *
 * Functions to compute aggregated metrics from a collection of projects.
 * Used by the projects dashboard for overview statistics and charts.
 */

import { categories } from '$lib/config/project-categories';
import type { CategoryKey, Project, ProjectStatus } from '$lib/types';
import { getCompletionPercentage } from './project-calculations';

// ============================================================================
// Type Definitions
// ============================================================================

export interface AggregatedProjectStats {
	totalProjects: number;
	totalBudget: number;
	totalContractCost: number;
	totalBeneficiaries: number;
	employmentGenerated: {
		male: number;
		female: number;
		total: number;
	};
	averageProgress: number;
	averageBudgetPerProject: number;
}

export interface StatusDistribution {
	status: ProjectStatus;
	count: number;
	budget: number;
	percentage: number;
}

export interface CategoryDistribution {
	categoryKey: CategoryKey;
	categoryName: string;
	count: number;
	budget: number;
	beneficiaries: number;
	percentage: number;
}

export interface MunicipalityProjectDistribution {
	municipality: string;
	projectCount: number;
	totalBudget: number;
	beneficiaries: number;
}

export interface GeographicProjectDistribution {
	byMunicipality: MunicipalityProjectDistribution[];
	totalMunicipalities: number;
}

export interface ProgressAggregation {
	averageCompletion: number;
	onTrackCount: number;
	delayedCount: number;
	aheadCount: number;
	notStartedCount: number;
	completedCount: number;
	onTrackPercentage: number;
	delayedPercentage: number;
}

export interface YearDistribution {
	year: number;
	count: number;
	budget: number;
}

// ============================================================================
// Aggregation Functions
// ============================================================================

/**
 * Aggregate overall project statistics
 */
export function aggregateProjectStats(projects: Project[]): AggregatedProjectStats {
	const totals = projects.reduce(
		(acc, project) => {
			acc.budget += project.project_cost;
			acc.contractCost += project.project_cost;
			acc.beneficiaries += project.beneficiaries;
			acc.progress += getCompletionPercentage(project);

			if (project.employment_generated) {
				acc.employmentMale += project.employment_generated.male;
				acc.employmentFemale += project.employment_generated.female;
			}

			return acc;
		},
		{
			budget: 0,
			contractCost: 0,
			beneficiaries: 0,
			progress: 0,
			employmentMale: 0,
			employmentFemale: 0
		}
	);

	return {
		totalProjects: projects.length,
		totalBudget: totals.budget,
		totalContractCost: totals.contractCost,
		totalBeneficiaries: totals.beneficiaries,
		employmentGenerated: {
			male: totals.employmentMale,
			female: totals.employmentFemale,
			total: totals.employmentMale + totals.employmentFemale
		},
		averageProgress: projects.length > 0 ? totals.progress / projects.length : 0,
		averageBudgetPerProject: projects.length > 0 ? totals.budget / projects.length : 0
	};
}

/**
 * Aggregate projects by status
 */
export function aggregateByStatus(projects: Project[]): StatusDistribution[] {
	const statusMap = new Map<ProjectStatus, { count: number; budget: number }>();

	// Initialize all statuses
	const allStatuses: ProjectStatus[] = [
		'preparation',
		'ongoing',
		'completed',
		'delayed',
		'non-completion'
	];
	for (const status of allStatuses) {
		statusMap.set(status, { count: 0, budget: 0 });
	}

	for (const project of projects) {
		const current = statusMap.get(project.status)!;
		current.count += 1;
		current.budget += project.project_cost;
	}

	const total = projects.length;

	return allStatuses.map((status) => {
		const data = statusMap.get(status)!;
		return {
			status,
			count: data.count,
			budget: data.budget,
			percentage: total > 0 ? (data.count / total) * 100 : 0
		};
	});
}

/**
 * Aggregate projects by category
 */
export function aggregateByCategory(projects: Project[]): CategoryDistribution[] {
	const categoryMap = new Map<
		CategoryKey,
		{ count: number; budget: number; beneficiaries: number }
	>();

	// Initialize all categories
	for (const cat of categories) {
		categoryMap.set(cat.key, { count: 0, budget: 0, beneficiaries: 0 });
	}

	for (const project of projects) {
		const current = categoryMap.get(project.category_key);
		if (current) {
			current.count += 1;
			current.budget += project.project_cost;
			current.beneficiaries += project.beneficiaries;
		}
	}

	const total = projects.length;

	return categories.map((cat) => {
		const data = categoryMap.get(cat.key)!;
		return {
			categoryKey: cat.key,
			categoryName: cat.name,
			count: data.count,
			budget: data.budget,
			beneficiaries: data.beneficiaries,
			percentage: total > 0 ? (data.count / total) * 100 : 0
		};
	});
}

/**
 * Aggregate projects by municipality (via project_sitios)
 */
export function aggregateByMunicipality(projects: Project[]): GeographicProjectDistribution {
	const municipalityMap = new Map<
		string,
		{ projectIds: Set<number>; budget: number; beneficiaries: number }
	>();

	for (const project of projects) {
		if (project.project_sitios && project.project_sitios.length > 0) {
			for (const sitio of project.project_sitios) {
				const current = municipalityMap.get(sitio.municipality) || {
					projectIds: new Set<number>(),
					budget: 0,
					beneficiaries: 0
				};

				// Only count project once per municipality
				if (!current.projectIds.has(project.id)) {
					current.projectIds.add(project.id);
					current.budget += project.project_cost;
					current.beneficiaries += sitio.beneficiaries_target;
				}

				municipalityMap.set(sitio.municipality, current);
			}
		}
	}

	const byMunicipality: MunicipalityProjectDistribution[] = Array.from(municipalityMap.entries())
		.map(([municipality, data]) => ({
			municipality,
			projectCount: data.projectIds.size,
			totalBudget: data.budget,
			beneficiaries: data.beneficiaries
		}))
		.sort((a, b) => b.projectCount - a.projectCount);

	return {
		byMunicipality,
		totalMunicipalities: municipalityMap.size
	};
}

/**
 * Aggregate progress metrics across projects
 */
export function aggregateProgress(projects: Project[]): ProgressAggregation {
	let totalProgress = 0;
	let onTrack = 0;
	let delayed = 0;
	let ahead = 0;
	let notStarted = 0;
	let completed = 0;

	for (const project of projects) {
		const progress = getCompletionPercentage(project);
		totalProgress += progress;

		if (project.status === 'completed' || progress >= 100) {
			completed++;
		} else if (progress === 0 && project.status === 'preparation') {
			notStarted++;
		} else if (project.monthly_progress && project.monthly_progress.length > 0) {
			// Check latest status from monthly progress
			const latestProgress = [...project.monthly_progress].sort((a, b) =>
				b.month_year.localeCompare(a.month_year)
			)[0];

			if (latestProgress.status === 'delayed') {
				delayed++;
			} else if (latestProgress.status === 'ongoing') {
				// Consider ongoing projects as on-track by default
				// More sophisticated progress variance checking could be added here
				onTrack++;
			} else {
				onTrack++;
			}
		} else {
			// Default to on-track if in progress without detailed data
			if (project.status === 'ongoing') {
				onTrack++;
			} else if (project.status === 'delayed') {
				delayed++;
			}
		}
	}

	const activeProjects = projects.filter((p) => p.status === 'ongoing').length;

	return {
		averageCompletion: projects.length > 0 ? totalProgress / projects.length : 0,
		onTrackCount: onTrack,
		delayedCount: delayed,
		aheadCount: ahead,
		notStartedCount: notStarted,
		completedCount: completed,
		onTrackPercentage: activeProjects > 0 ? (onTrack / activeProjects) * 100 : 0,
		delayedPercentage: activeProjects > 0 ? (delayed / activeProjects) * 100 : 0
	};
}

/**
 * Aggregate projects by year
 */
export function aggregateByYear(projects: Project[]): YearDistribution[] {
	const yearMap = new Map<number, { count: number; budget: number }>();

	for (const project of projects) {
		const current = yearMap.get(project.project_year) || { count: 0, budget: 0 };
		current.count += 1;
		current.budget += project.project_cost;
		yearMap.set(project.project_year, current);
	}

	return Array.from(yearMap.entries())
		.map(([year, data]) => ({
			year,
			count: data.count,
			budget: data.budget
		}))
		.sort((a, b) => b.year - a.year);
}

/**
 * Get unique years from projects
 */
export function getUniqueYears(projects: Project[]): number[] {
	return Array.from(new Set(projects.map((p) => p.project_year))).sort((a, b) => b - a);
}

/**
 * Get unique municipalities from projects
 */
export function getUniqueMunicipalities(projects: Project[]): string[] {
	const municipalities = new Set<string>();
	for (const project of projects) {
		if (project.project_sitios) {
			for (const sitio of project.project_sitios) {
				municipalities.add(sitio.municipality);
			}
		}
	}
	return Array.from(municipalities).sort();
}

// ============================================================================
// Chart Helper Functions
// ============================================================================

const STATUS_COLORS: Record<ProjectStatus, string> = {
	preparation: 'hsl(217, 91%, 60%)', // Blue
	ongoing: 'hsl(45, 93%, 47%)', // Amber
	completed: 'hsl(142, 71%, 45%)', // Green
	delayed: 'hsl(25, 95%, 53%)', // Orange
	'non-completion': 'hsl(0, 84%, 60%)' // Red
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
	preparation: 'Preparation',
	ongoing: 'On Going',
	completed: 'Completed',
	delayed: 'Delayed',
	'non-completion': 'Non-completion'
};

const CATEGORY_COLORS: Record<CategoryKey, string> = {
	infrastructure: 'hsl(217, 91%, 60%)', // Blue
	agriculture: 'hsl(142, 71%, 45%)', // Green
	education: 'hsl(262, 83%, 58%)', // Purple
	health: 'hsl(330, 81%, 60%)', // Pink
	livelihood: 'hsl(24, 95%, 53%)', // Orange
	environment: 'hsl(189, 85%, 45%)' // Cyan
};

/**
 * Convert status distribution to pie/donut chart data
 */
export function toStatusPieData(statusDist: StatusDistribution[]) {
	return statusDist
		.filter((s) => s.count > 0)
		.map((s) => ({
			label: STATUS_LABELS[s.status],
			value: s.count,
			color: STATUS_COLORS[s.status]
		}));
}

/**
 * Convert status distribution to budget pie data
 */
export function toStatusBudgetPieData(statusDist: StatusDistribution[]) {
	return statusDist
		.filter((s) => s.budget > 0)
		.map((s) => ({
			label: STATUS_LABELS[s.status],
			value: s.budget,
			color: STATUS_COLORS[s.status]
		}));
}

/**
 * Convert category distribution to bar chart data
 */
export function toCategoryBarData(
	categoryDist: CategoryDistribution[],
	metric: 'count' | 'budget' = 'count'
) {
	return categoryDist
		.filter((c) => c.count > 0)
		.map((c) => ({
			label: c.categoryName,
			value: metric === 'count' ? c.count : c.budget,
			color: CATEGORY_COLORS[c.categoryKey]
		}))
		.sort((a, b) => b.value - a.value);
}

/**
 * Convert municipality distribution to bar chart data
 */
export function toMunicipalityProjectBarData(
	geo: GeographicProjectDistribution,
	metric: 'projectCount' | 'totalBudget' | 'beneficiaries' = 'projectCount'
) {
	const colors = [
		'hsl(217, 91%, 60%)',
		'hsl(142, 71%, 45%)',
		'hsl(24, 95%, 53%)',
		'hsl(262, 83%, 58%)',
		'hsl(189, 85%, 45%)',
		'hsl(330, 81%, 60%)',
		'hsl(45, 93%, 47%)',
		'hsl(0, 84%, 60%)'
	];

	return geo.byMunicipality.map((m, i) => ({
		label: m.municipality,
		value: m[metric],
		color: colors[i % colors.length]
	}));
}

/**
 * Convert progress aggregation to donut chart data
 */
export function toProgressDonutData(progress: ProgressAggregation) {
	const data = [];

	if (progress.completedCount > 0) {
		data.push({ label: 'Completed', value: progress.completedCount, color: 'hsl(142, 71%, 45%)' });
	}
	if (progress.onTrackCount > 0) {
		data.push({ label: 'On Track', value: progress.onTrackCount, color: 'hsl(217, 91%, 60%)' });
	}
	if (progress.aheadCount > 0) {
		data.push({ label: 'Ahead', value: progress.aheadCount, color: 'hsl(189, 85%, 45%)' });
	}
	if (progress.delayedCount > 0) {
		data.push({ label: 'Delayed', value: progress.delayedCount, color: 'hsl(0, 84%, 60%)' });
	}
	if (progress.notStartedCount > 0) {
		data.push({
			label: 'Not Started',
			value: progress.notStartedCount,
			color: 'hsl(220, 9%, 46%)'
		});
	}

	return data;
}

/**
 * Convert year distribution to bar chart data
 */
export function toYearBarData(yearDist: YearDistribution[], metric: 'count' | 'budget' = 'count') {
	return yearDist.map((y) => ({
		label: y.year.toString(),
		value: metric === 'count' ? y.count : y.budget,
		color: 'hsl(217, 91%, 60%)'
	}));
}
