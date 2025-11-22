/**
 * Data adapter functions to map between legacy monitoring fields
 * and enhanced project structures for backwards compatibility
 */

import type { Project, MonitoringDetails } from '$lib/types';
import { getCurrentMonth } from './project-calculations';

/**
 * Interface for Quick Update form data
 */
export interface QuickUpdateFormData {
	// Progress & Status
	status: Project['status'];
	physicalActual: string;
	plannedPercentage: string;
	statusStage: string;
	statusIssues: string;
	statusRecommendations: string;
	catchUpPlan: string;
	// Employment
	maleEmployment: string;
	femaleEmployment: string;
	// Financial
	totalBudget: number;
	budgetDisbursed: string;
	// Timeline
	startDate: string;
	targetEndDate: string;
	extensionRequested: boolean;
	extensionDate: string;
	// Beneficiaries
	targetBeneficiaries: number;
	currentBeneficiaries: string;
	householdsReached: string;
}

/**
 * Extracts Quick Update form data from a Project
 * Handles both legacy monitoring and enhanced fields
 */
export function projectToQuickUpdate(project: Project): QuickUpdateFormData {
	const currentMonth = getCurrentMonth();

	// Get latest monthly progress for current beneficiaries
	const latestMonthlyProgress = project.monthly_progress?.find(
		(mp) => mp.month_year === currentMonth
	);

	// Get latest budget utilization
	const latestBudgetUtil = project.monthly_budget?.find((mb) => mb.month_year === currentMonth);

	// Get planned percentage from performance targets (if available)
	const performanceTarget = project.performance_targets?.[0];
	const plannedPercentage = performanceTarget?.monthly_plan_percentage?.[currentMonth];

	// Get disbursed amount from monitoring or monthly budget
	const disbursed =
		latestBudgetUtil?.actual_expenses ||
		project.monitoring?.allotment?.released ||
		project.monitoring?.expenditure?.obligations ||
		0;

	return {
		// Progress & Status
		status: project.status,
		physicalActual: project.completion_percentage?.toString() || '0',
		plannedPercentage: plannedPercentage?.toString() || project.monitoring?.physical?.plan?.toString() || '0',
		statusStage: project.monitoring?.statusSummary?.stage || '',
		statusIssues: project.monitoring?.statusSummary?.issues || '',
		statusRecommendations: project.monitoring?.statusSummary?.recommendations || '',
		catchUpPlan: project.monitoring?.catchUpPlan || '',
		// Employment
		maleEmployment: project.monitoring?.employment?.male?.toString() || '0',
		femaleEmployment: project.monitoring?.employment?.female?.toString() || '0',
		// Financial
		totalBudget: project.budget || 0,
		budgetDisbursed: disbursed.toString(),
		// Timeline
		startDate: project.start_date || '',
		targetEndDate: project.end_date || '',
		extensionRequested: !!project.monitoring?.contract?.extension,
		extensionDate: project.monitoring?.contract?.extension || '',
		// Beneficiaries
		targetBeneficiaries: project.beneficiaries || 0,
		currentBeneficiaries:
			latestMonthlyProgress?.beneficiaries_reached?.toString() ||
			project.beneficiaries?.toString() ||
			'0',
		householdsReached: '0' // This could be enhanced to pull from sitio data
	};
}

/**
 * Applies Quick Update form data back to a Project
 * Updates both legacy monitoring and enhanced fields
 */
export function applyQuickUpdateToProject(
	formData: QuickUpdateFormData,
	project: Project
): Project {
	const currentMonth = getCurrentMonth();

	// Calculate slippage for legacy monitoring
	const plannedPct = Number(formData.plannedPercentage || 0);
	const actualPct = Number(formData.physicalActual || 0);
	const slippage = plannedPct - actualPct;

	// Update legacy monitoring structure
	const updatedMonitoring: MonitoringDetails = {
		...project.monitoring,
		fundSource: project.monitoring?.fundSource || '',
		fiscalYear: project.monitoring?.fiscalYear || project.project_year || new Date().getFullYear(),
		implementingUnit: project.monitoring?.implementingUnit || project.implementing_partner || '',
		location: project.monitoring?.location || project.sitio_name || '',
		allotment: {
			...project.monitoring?.allotment,
			allocated: project.budget || 0,
			supplemental: 0,
			total: project.budget || 0,
			released: Number(formData.budgetDisbursed || 0)
		},
		expenditure: {
			...project.monitoring?.expenditure,
			obligations: Number(formData.budgetDisbursed || 0),
			contractCost: project.monitoring?.expenditure?.contractCost || project.budget || 0
		},
		physical: {
			plan: plannedPct,
			actual: actualPct,
			slippage: slippage
		},
		employment: {
			male: Number(formData.maleEmployment || 0),
			female: Number(formData.femaleEmployment || 0)
		},
		contract: {
			...project.monitoring?.contract,
			duration: project.monitoring?.contract?.duration || '',
			delivery: project.monitoring?.contract?.delivery || '',
			extension: formData.extensionRequested ? formData.extensionDate : ''
		},
		statusSummary: {
			stage: formData.statusStage,
			issues: formData.statusIssues,
			recommendations: formData.statusRecommendations
		},
		catchUpPlan: formData.catchUpPlan
	};

	// Update or create monthly_budget for current month
	let updatedMonthlyBudget = project.monthly_budget || [];
	const existingBudgetIndex = updatedMonthlyBudget.findIndex(
		(mb) => mb.month_year === currentMonth
	);

	if (existingBudgetIndex >= 0) {
		// Update existing record
		updatedMonthlyBudget = updatedMonthlyBudget.map((mb) =>
			mb.month_year === currentMonth
				? {
						...mb,
						budget_released: Number(formData.budgetDisbursed || 0),
						actual_expenses: Number(formData.budgetDisbursed || 0),
						remaining_balance: project.budget - Number(formData.budgetDisbursed || 0),
						updated_at: new Date().toISOString()
					}
				: mb
		);
	} else {
		// Create new record for current month
		updatedMonthlyBudget.push({
			id: Date.now(), // Temporary ID
			project_id: project.id,
			month_year: currentMonth,
			budget_released: Number(formData.budgetDisbursed || 0),
			actual_expenses: Number(formData.budgetDisbursed || 0),
			obligations: Number(formData.budgetDisbursed || 0),
			remaining_balance: project.budget - Number(formData.budgetDisbursed || 0),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		});
	}

	// Update or create monthly_progress for current month
	let updatedMonthlyProgress = project.monthly_progress || [];
	const existingProgressIndex = updatedMonthlyProgress.findIndex(
		(mp) => mp.month_year === currentMonth
	);

	if (existingProgressIndex >= 0) {
		// Update existing record
		updatedMonthlyProgress = updatedMonthlyProgress.map((mp) =>
			mp.month_year === currentMonth
				? {
						...mp,
						beneficiaries_reached: Number(formData.currentBeneficiaries || 0),
						issues_encountered: formData.statusIssues,
						status:
							slippage > 10 ? 'delayed' : slippage < -5 ? 'ahead' : ('on-track' as const),
						updated_at: new Date().toISOString()
					}
				: mp
		);
	} else {
		// Create new record for current month
		updatedMonthlyProgress.push({
			id: Date.now(), // Temporary ID
			project_id: project.id,
			sitio_id: undefined, // Project-level progress
			month_year: currentMonth,
			achieved_outputs: {}, // Could be enhanced to track specific outputs
			beneficiaries_reached: Number(formData.currentBeneficiaries || 0),
			issues_encountered: formData.statusIssues,
			photo_urls: [],
			status: slippage > 10 ? 'delayed' : slippage < -5 ? 'ahead' : ('on-track' as const),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		});
	}

	// Update performance targets with actual progress for current month
	const updatedPerformanceTargets = project.performance_targets?.map((pt) => ({
		...pt,
		monthly_actual_percentage: {
			...pt.monthly_actual_percentage,
			[currentMonth]: actualPct
		}
	}));

	// Return updated project
	return {
		...project,
		status: formData.status,
		end_date: formData.targetEndDate,
		completion_percentage: actualPct,
		beneficiaries: Number(formData.currentBeneficiaries || project.beneficiaries || 0),
		monitoring: updatedMonitoring,
		monthly_budget: updatedMonthlyBudget,
		monthly_progress: updatedMonthlyProgress,
		performance_targets: updatedPerformanceTargets,
		updated_at: new Date().toISOString()
	};
}

/**
 * Validates Quick Update form data
 * Returns validation errors if any
 */
export function validateQuickUpdateData(
	formData: QuickUpdateFormData
): { isValid: boolean; errors: string[] } {
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
	const disbursed = Number(formData.budgetDisbursed || 0);
	if (disbursed < 0) {
		errors.push('Budget disbursed cannot be negative');
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
	const targetBeneficiaries = formData.targetBeneficiaries;

	if (currentBeneficiaries < 0) {
		errors.push('Current beneficiaries cannot be negative');
	}

	// Validate dates
	if (formData.extensionRequested && !formData.extensionDate) {
		errors.push('Extension date is required when extension is requested');
	}

	if (formData.extensionRequested && formData.extensionDate) {
		const extension = new Date(formData.extensionDate);
		const current = new Date(formData.targetEndDate);

		if (extension <= current) {
			errors.push('Extension date must be after the current target end date');
		}
	}

	// Validate timeline
	const startDate = new Date(formData.startDate);
	const endDate = new Date(formData.targetEndDate);

	if (endDate < startDate) {
		errors.push('End date must be after start date');
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

	// Timeline warnings
	const endDate = new Date(formData.targetEndDate);
	const today = new Date();
	const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

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

	return warnings;
}
