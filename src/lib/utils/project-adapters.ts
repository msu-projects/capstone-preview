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
	physicalActual: string;
	plannedPercentage: string;
	issues: string;
	recommendations: string;
	catchUpPlan: string;
	// Employment
	maleEmployment: string;
	femaleEmployment: string;
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
	achievedOutputs: Record<string, string>; // { 'indicator_id': '50' } - strings for form binding
	performanceTargets: PerformanceTarget[]; // Read-only reference for display
}

/**
 * Extracts Quick Update form data from a Project
 */
export function projectToQuickUpdate(project: Project): QuickUpdateFormData {
	const currentMonth = getCurrentMonth();

	// Get latest monthly progress for current beneficiaries
	const latestMonthlyProgress = project.monthly_progress?.find(
		(mp: MonthlyProgress) => mp.month_year === currentMonth
	);

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

	// Get THIS month's disbursement only (not cumulative)
	const monthlyDisbursement = latestMonthlyProgress?.budget_utilized || 0;

	// Get target disbursement for this month from monthly_targets
	const targetDisbursementThisMonth = monthlyTarget?.planned_budget || 0;

	// Get completion percentage from latest monthly progress
	const completionPct = getCompletionPercentage(project);

	return {
		// Progress & Status
		status: project.status,
		physicalActual: completionPct.toString(),
		plannedPercentage: plannedPercentage?.toString() || '0',
		issues: project.issues || '',
		recommendations: project.recommendations || '',
		catchUpPlan: project.catch_up_plan || '',
		// Employment
		maleEmployment: project.employment_generated?.male?.toString() || '0',
		femaleEmployment: project.employment_generated?.female?.toString() || '0',
		// Financial
		totalBudget: project.total_budget || 0,
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
		// Photo Documentation
		photoDocumentation: latestMonthlyProgress?.photo_documentation || [],
		// Performance Indicators
		achievedOutputs: Object.fromEntries(
			Object.entries(latestMonthlyProgress?.achieved_outputs || {}).map(([k, v]) => [k, String(v)])
		),
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
	const actualPct = Number(formData.physicalActual || 0);
	const slippage = plannedPct - actualPct;

	const monthlyAmount = Number(formData.monthlyDisbursement || 0);

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
						issues_encountered: formData.issues,
						photo_documentation: formData.photoDocumentation,
						achieved_outputs: Object.fromEntries(
							Object.entries(formData.achievedOutputs || {}).map(([k, v]) => [k, Number(v) || 0])
						),
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
			achieved_outputs: Object.fromEntries(
				Object.entries(formData.achievedOutputs || {}).map(([k, v]) => [k, Number(v) || 0])
			),
			beneficiaries_reached: Number(formData.currentBeneficiaries || 0),
			issues_encountered: formData.issues,
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
		issues: formData.issues || undefined,
		recommendations: formData.recommendations || undefined,
		catch_up_plan: formData.catchUpPlan,
		monthly_progress: updatedMonthlyProgress,
		employment_generated: {
			male: Number(formData.maleEmployment || 0),
			female: Number(formData.femaleEmployment || 0)
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
	const actualPct = Number(formData.physicalActual || 0);
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
	const male = Number(formData.maleEmployment || 0);
	const female = Number(formData.femaleEmployment || 0);

	if (male < 0) {
		errors.push('Male employment cannot be negative');
	}

	if (female < 0) {
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
			plan_financial: target?.planned_budget ?? 0,
			actual_financial: progress.budget_utilized,
			status: mapProgressStatus(progress.status),
			remarks: progress.issues_encountered || '',
			photos: progress.photo_documentation || []
		};
	});

	// Sort by month_year descending (newest first)
	reports.sort((a, b) => b.month_year.localeCompare(a.month_year));

	return reports;
}
