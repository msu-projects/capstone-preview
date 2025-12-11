/**
 * Data adapter functions to map between project fields
 * and form structures for UI interaction
 */

import type {
	MonthlyProgress,
	MonthlyReport,
	MonthlyTarget,
	PerformanceTarget,
	PhotoDocumentation,
	Project
} from '$lib/types';
import { getCompletionPercentage, getCurrentMonth } from './project-calculations';

/**
 * Interface for Quick Update form data
 */
export interface QuickUpdateFormData {
	// Progress & Status
	status: Project['status'];
	physicalActual: number;
	plannedPercentage: string;
	issues: string;
	recommendations: string;
	catchUpPlan: string;
	// Employment
	maleEmployment: number;
	femaleEmployment: number;
	// Financial
	totalBudget: number;
	budgetDisbursed: string; // Cumulative (read-only, for display)
	monthlyDisbursement: string; // Amount disbursed THIS month only
	targetDisbursementThisMonth: number; // Planned budget for THIS month (from MonthlyTarget)
	// Timeline
	startDate: string;
	contractDuration: string;
	// Beneficiaries
	targetBeneficiaries: number;
	currentBeneficiaries: string;
	householdsReached: string;
	// Photo Documentation
	photoDocumentation: PhotoDocumentation[];
	// Performance Indicators
	cumulativeAchievedOutputs: Record<string, number>; // Cumulative from previous months (read-only, for display)
	monthlyAchievedOutputs: Record<string, number>; // This month's achievements only (editable)
	performanceTargets: PerformanceTarget[]; // Read-only reference for display
}

/**
 * Extracts Quick Update form data from a Project
 */
export function projectToQuickUpdate(project: Project): QuickUpdateFormData {
	const currentMonth = getCurrentMonth();

	// Get current month's progress entry (if exists)
	const currentMonthProgress = project.monthly_progress?.find(
		(mp: MonthlyProgress) => mp.month_year === currentMonth
	);

	// Get the most recent monthly progress entry (for loading previous values)
	const sortedProgress = [...(project.monthly_progress || [])].sort((a, b) =>
		b.month_year.localeCompare(a.month_year)
	);
	const latestMonthlyProgress = sortedProgress[0];

	// Get planned percentage from monthly_targets
	const monthlyTarget = project.monthly_targets?.find(
		(mt: MonthlyTarget) => mt.month_year === currentMonth
	);
	const plannedPercentage = monthlyTarget?.planned_physical_progress;

	// Calculate cumulative disbursed amount (sum of all monthly progress budget_utilized up to current month)
	const cumulativeDisbursed =
		project.monthly_progress?.reduce((sum: number, mp: MonthlyProgress) => {
			// Only sum expenses up to and including current month
			if (mp.month_year <= currentMonth) {
				return sum + (mp.budget_utilized || 0);
			}
			return sum;
		}, 0) || 0;

	// Get THIS month's disbursement only (not cumulative) - use current month if exists, otherwise 0
	const monthlyDisbursement = currentMonthProgress?.budget_utilized || 0;

	// Get target disbursement for this month from monthly_targets
	const targetDisbursementThisMonth = 0; // planned_budget removed || 0;

	// Get completion percentage from latest monthly progress
	const completionPct = getCompletionPercentage(project);

	// Get cumulative achieved outputs from the LAST month's record (before current month)
	// Since achieved_outputs is stored cumulatively, we just need the most recent previous month's values
	const previousMonthsProgress = [...(project.monthly_progress || [])]
		.filter((mp: MonthlyProgress) => mp.month_year < currentMonth)
		.sort((a, b) => b.month_year.localeCompare(a.month_year));
	const lastMonthProgress = previousMonthsProgress[0];

	const cumulativeAchievedOutputs: Record<string, number> = Object.fromEntries(
		Object.entries(lastMonthProgress?.achieved_outputs || {}).map(([k, v]) => [k, Number(v) || 0])
	);

	// Get THIS month's achieved outputs only (or 0 for new month)
	const monthlyAchievedOutputs: Record<string, number> = Object.fromEntries(
		Object.entries(currentMonthProgress?.achieved_outputs || {}).map(([k, v]) => [
			k,
			Number(v) || 0
		])
	);

	return {
		// Progress & Status
		status: project.status,
		physicalActual: completionPct,
		plannedPercentage: plannedPercentage?.toString() || '0',
		// Status tracking - use current month's values if available, otherwise latest
		issues: currentMonthProgress?.issues || latestMonthlyProgress?.issues || '',
		recommendations:
			currentMonthProgress?.recommendations || latestMonthlyProgress?.recommendations || '',
		catchUpPlan: currentMonthProgress?.catch_up_plan || latestMonthlyProgress?.catch_up_plan || '',
		// Employment
		maleEmployment: project.employment_generated?.male || 0,
		femaleEmployment: project.employment_generated?.female || 0,
		// Financial
		totalBudget: project.project_cost || 0,
		budgetDisbursed: cumulativeDisbursed.toString(), // Cumulative total
		monthlyDisbursement: monthlyDisbursement.toString(), // This month only
		targetDisbursementThisMonth: targetDisbursementThisMonth, // Planned for this month
		// Timeline
		startDate: project.start_date || '',
		contractDuration: project.contract_duration || '',
		// Beneficiaries
		targetBeneficiaries: project.beneficiaries || 0,
		currentBeneficiaries:
			latestMonthlyProgress?.beneficiaries_reached?.toString() ||
			project.beneficiaries?.toString() ||
			'0',
		householdsReached: '0', // This could be enhanced to pull from sitio data
		// Photo Documentation - current month's photos, or empty for new month
		photoDocumentation: currentMonthProgress?.photo_documentation || [],
		// Performance Indicators - cumulative from previous months + this month's editable values
		cumulativeAchievedOutputs,
		monthlyAchievedOutputs,
		performanceTargets: project.performance_targets || []
	};
}

/**
 * Applies Quick Update form data back to a Project
 */
export function applyQuickUpdateToProject(
	formData: QuickUpdateFormData,
	project: Project
): Project {
	const currentMonth = getCurrentMonth();

	// Calculate slippage
	const plannedPct = Number(formData.plannedPercentage || 0);
	const actualPct = formData.physicalActual;
	const slippage = plannedPct - actualPct;

	const monthlyAmount = Number(formData.monthlyDisbursement || 0);

	// Compute final cumulative achieved outputs (cumulative + this month's values)
	const finalAchievedOutputs: Record<string, number> = { ...formData.cumulativeAchievedOutputs };
	Object.entries(formData.monthlyAchievedOutputs).forEach(([key, value]) => {
		finalAchievedOutputs[key] = (finalAchievedOutputs[key] || 0) + (Number(value) || 0);
	});

	// Update or create monthly_progress for current month
	let updatedMonthlyProgress: MonthlyProgress[] = project.monthly_progress || [];
	const existingProgressIndex = updatedMonthlyProgress.findIndex(
		(mp: MonthlyProgress) => mp.month_year === currentMonth
	);

	if (existingProgressIndex >= 0) {
		// Update existing record
		updatedMonthlyProgress = updatedMonthlyProgress.map((mp: MonthlyProgress) =>
			mp.month_year === currentMonth
				? {
						...mp,
						physical_progress_percentage: actualPct,
						budget_utilized: monthlyAmount,
						beneficiaries_reached: Number(formData.currentBeneficiaries || 0),
						issues: formData.issues,
						recommendations: formData.recommendations,
						catch_up_plan: formData.catchUpPlan,
						photo_documentation: formData.photoDocumentation,
						achieved_outputs: { ...finalAchievedOutputs },
						status: slippage > 10 ? 'delayed' : slippage < -5 ? 'ahead' : ('on-track' as const),
						updated_at: new Date().toISOString()
					}
				: mp
		);
	} else {
		// Create new record for current month
		updatedMonthlyProgress.push({
			id: Date.now(),
			project_id: project.id,
			month_year: currentMonth,
			physical_progress_percentage: actualPct,
			budget_utilized: monthlyAmount,
			achieved_outputs: { ...finalAchievedOutputs },
			beneficiaries_reached: Number(formData.currentBeneficiaries || 0),
			issues: formData.issues,
			recommendations: formData.recommendations,
			catch_up_plan: formData.catchUpPlan,
			photo_documentation: formData.photoDocumentation,
			status: slippage > 10 ? 'delayed' : slippage < -5 ? 'ahead' : ('on-track' as const),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		});
	}

	// Return updated project
	return {
		...project,
		status: formData.status,
		contract_duration: formData.contractDuration,
		beneficiaries: Number(formData.currentBeneficiaries || project.beneficiaries || 0),
		monthly_progress: updatedMonthlyProgress,
		employment_generated: {
			male: formData.maleEmployment,
			female: formData.femaleEmployment
		},
		updated_at: new Date().toISOString()
	};
}

/**
 * Validates Quick Update form data
 * Returns validation errors if any
 */
export function validateQuickUpdateData(formData: QuickUpdateFormData): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	// Validate progress percentages
	const actualPct = formData.physicalActual;
	const plannedPct = Number(formData.plannedPercentage || 0);

	if (actualPct < 0 || actualPct > 100) {
		errors.push('Actual progress must be between 0% and 100%');
	}

	if (plannedPct < 0 || plannedPct > 100) {
		errors.push('Planned progress must be between 0% and 100%');
	}

	// Validate budget
	const monthlyDisbursement = Number(formData.monthlyDisbursement || 0);
	if (monthlyDisbursement < 0) {
		errors.push('Monthly disbursement cannot be negative');
	}

	// Validate that monthly disbursement doesn't exceed total budget
	if (monthlyDisbursement > formData.totalBudget) {
		errors.push('Monthly disbursement cannot exceed total project budget');
	}

	// Validate employment
	if (formData.maleEmployment < 0) {
		errors.push('Male employment cannot be negative');
	}

	if (formData.femaleEmployment < 0) {
		errors.push('Female employment cannot be negative');
	}

	// Validate beneficiaries
	const currentBeneficiaries = Number(formData.currentBeneficiaries || 0);

	if (currentBeneficiaries < 0) {
		errors.push('Current beneficiaries cannot be negative');
	}

	// Validate contract duration format
	if (formData.contractDuration && !/^\d+\s*CD$/.test(formData.contractDuration.trim())) {
		errors.push('Contract duration should be in format "XXX CD" (e.g., "180 CD")');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Generates warnings for Quick Update data
 * Non-blocking issues that should be shown to the user
 */
export function getQuickUpdateWarnings(
	formData: QuickUpdateFormData
): { type: 'warning' | 'info'; message: string }[] {
	const warnings: { type: 'warning' | 'info'; message: string }[] = [];

	// Budget warnings
	const disbursed = Number(formData.budgetDisbursed || 0);
	const utilizationPct = (disbursed / formData.totalBudget) * 100;

	if (disbursed > formData.totalBudget) {
		warnings.push({
			type: 'warning',
			message: `Budget overrun: Disbursed amount (₱${disbursed.toLocaleString()}) exceeds total budget`
		});
	} else if (utilizationPct > 90) {
		warnings.push({
			type: 'info',
			message: `High budget utilization: ${utilizationPct.toFixed(1)}% of budget used`
		});
	}

	// Progress warnings
	const actualPct = Number(formData.physicalActual || 0);
	const plannedPct = Number(formData.plannedPercentage || 0);
	const slippage = plannedPct - actualPct;

	if (slippage > 20) {
		warnings.push({
			type: 'warning',
			message: `Severe delay: Project is ${slippage.toFixed(1)}% behind schedule`
		});
	} else if (slippage > 10) {
		warnings.push({
			type: 'info',
			message: `Project is ${slippage.toFixed(1)}% behind schedule`
		});
	}

	// Beneficiary warnings
	const currentBeneficiaries = Number(formData.currentBeneficiaries || 0);
	const beneficiaryPct = (currentBeneficiaries / formData.targetBeneficiaries) * 100;

	if (actualPct > 70 && beneficiaryPct < 50) {
		warnings.push({
			type: 'warning',
			message: `Low beneficiary reach: Physical progress is ${actualPct}% but only ${beneficiaryPct.toFixed(1)}% of beneficiaries reached`
		});
	}

	// Timeline warnings based on contract duration
	// Parse contract duration (e.g., "180 CD" -> 180 days)
	const durationMatch = formData.contractDuration?.match(/(\d+)\s*CD/i);
	if (durationMatch && formData.startDate) {
		const contractDays = parseInt(durationMatch[1], 10);
		const startDate = new Date(formData.startDate);
		const targetEndDate = new Date(startDate);
		targetEndDate.setDate(targetEndDate.getDate() + contractDays);

		const today = new Date();
		const daysRemaining = Math.ceil(
			(targetEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
		);

		if (daysRemaining < 0 && actualPct < 100) {
			warnings.push({
				type: 'warning',
				message: `Project is overdue by ${Math.abs(daysRemaining)} days`
			});
		} else if (daysRemaining <= 30 && daysRemaining > 0 && actualPct < 90) {
			warnings.push({
				type: 'info',
				message: `Deadline approaching in ${daysRemaining} days with ${actualPct}% completion`
			});
		}
	}

	return warnings;
}

/**
 * Month name mapping for display formatting
 */
const MONTH_NAMES = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

/**
 * Format month_year string to display format
 * @example '2024-01' -> 'Jan 2024'
 */
export function formatMonthYear(monthYear: string): string {
	const [year, month] = monthYear.split('-');
	const monthIndex = parseInt(month, 10) - 1;
	return `${MONTH_NAMES[monthIndex]} ${year}`;
}

/**
 * Map MonthlyProgress status to display status
 */
export function mapProgressStatus(status: MonthlyProgress['status']): string {
	switch (status) {
		case 'on-track':
			return 'On Track';
		case 'delayed':
			return 'Delayed';
		case 'ahead':
			return 'Ahead of Schedule';
		default:
			return 'Unknown';
	}
}

/**
 * Transform MonthlyProgress[] + MonthlyTarget[] into MonthlyReport[] for display
 * Sorted by month_year descending (newest first)
 */
export function transformToMonthlyReports(
	monthlyProgress: MonthlyProgress[] | undefined,
	monthlyTargets: MonthlyTarget[] | undefined
): MonthlyReport[] {
	if (!monthlyProgress || monthlyProgress.length === 0) {
		return [];
	}

	// Create a map of targets for quick lookup
	const targetMap = new Map<string, MonthlyTarget>();
	if (monthlyTargets) {
		for (const target of monthlyTargets) {
			targetMap.set(target.month_year, target);
		}
	}

	// Transform each progress entry to a MonthlyReport
	const reports: MonthlyReport[] = monthlyProgress.map((progress) => {
		const target = targetMap.get(progress.month_year);

		return {
			month: formatMonthYear(progress.month_year),
			month_year: progress.month_year,
			plan_physical: target?.planned_physical_progress ?? 0,
			actual_physical: progress.physical_progress_percentage,
			status: mapProgressStatus(progress.status),
			remarks: progress.issues || '',
			photos: progress.photo_documentation || [],
			// Enhanced fields
			achieved_outputs: progress.achieved_outputs,
			beneficiaries_reached: progress.beneficiaries_reached,
			// Status tracking fields
			issues: progress.issues,
			recommendations: progress.recommendations,
			catch_up_plan: progress.catch_up_plan
		};
	});

	// Sort by month_year descending (newest first)
	reports.sort((a, b) => b.month_year.localeCompare(a.month_year));

	return reports;
}

/**
 * Get latest achieved_outputs from monthly progress entries
 * Since achieved_outputs is cumulative, we return the most recent month's values
 */
export function aggregateAchievedOutputs(
	monthlyProgress: MonthlyProgress[] | undefined
): Record<string, number> {
	if (!monthlyProgress || monthlyProgress.length === 0) {
		return {};
	}

	// Sort by month_year descending and get the latest entry with achieved_outputs
	const sortedProgress = [...monthlyProgress].sort((a, b) =>
		b.month_year.localeCompare(a.month_year)
	);

	const latestWithOutputs = sortedProgress.find(
		(p) => p.achieved_outputs && Object.keys(p.achieved_outputs).length > 0
	);

	if (!latestWithOutputs?.achieved_outputs) {
		return {};
	}

	// Return the latest cumulative values
	const result: Record<string, number> = {};
	for (const [key, value] of Object.entries(latestWithOutputs.achieved_outputs)) {
		result[key] = Number(value) || 0;
	}

	return result;
}

/**
 * Get cumulative beneficiaries reached from all monthly progress entries
 * Returns the maximum value (assuming beneficiaries reached is cumulative in reports)
 */
export function getCumulativeBeneficiariesReached(
	monthlyProgress: MonthlyProgress[] | undefined
): number {
	if (!monthlyProgress || monthlyProgress.length === 0) {
		return 0;
	}

	// Get the latest (most recent) beneficiaries_reached value
	const sorted = [...monthlyProgress].sort((a, b) => b.month_year.localeCompare(a.month_year));

	return sorted[0]?.beneficiaries_reached || 0;
}
