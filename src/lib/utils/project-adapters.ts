/**
 * Data adapter functions to map between legacy monitoring fields
 * and enhanced project structures for backwards compatibility
 */

import type { MonitoringDetails, PhotoDocumentation, Project } from '$lib/types';
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
	budgetDisbursed: string; // Cumulative (read-only, for display)
	monthlyDisbursement: string; // Amount disbursed THIS month only
	// Timeline
	startDate: string;
	targetEndDate: string;
	extensionRequested: boolean;
	extensionDays: string;
	// Beneficiaries
	targetBeneficiaries: number;
	currentBeneficiaries: string;
	householdsReached: string;
	// Photo Documentation
	photoDocumentation: PhotoDocumentation[];
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

	// Get latest budget utilization for current month
	const latestBudgetUtil = project.monthly_budget?.find((mb) => mb.month_year === currentMonth);

	// Get planned percentage from multiple sources (priority order):
	// 1. monthly_physical_progress (preferred, from Monthly Planning tab)
	// 2. monitoring.physical.plan (legacy fallback)
	const monthlyPhysicalProgress = project.monthly_physical_progress?.find(
		(mp) => mp.month_year === currentMonth
	);
	const plannedPercentage = monthlyPhysicalProgress?.plan_percentage;

	// Calculate cumulative disbursed amount (sum of all monthly expenses up to current month)
	const cumulativeDisbursed =
		project.monthly_budget?.reduce((sum, mb) => {
			// Only sum expenses up to and including current month
			if (mb.month_year <= currentMonth) {
				return sum + (mb.actual_expenses || 0);
			}
			return sum;
		}, 0) ||
		project.monitoring?.allotment?.released ||
		project.monitoring?.expenditure?.obligations ||
		0;

	// Get THIS month's disbursement only (not cumulative)
	const monthlyDisbursement = latestBudgetUtil?.actual_expenses || 0;

	return {
		// Progress & Status
		status: project.status,
		physicalActual: project.completion_percentage?.toString() || '0',
		plannedPercentage:
			plannedPercentage?.toString() || project.monitoring?.physical?.plan?.toString() || '0',
		statusStage: project.monitoring?.statusSummary?.stage || '',
		statusIssues: project.monitoring?.statusSummary?.issues || '',
		statusRecommendations: project.monitoring?.statusSummary?.recommendations || '',
		catchUpPlan: project.monitoring?.catchUpPlan || '',
		// Employment - check employment_generated first (new field), then fallback to monitoring.employment (legacy)
		maleEmployment:
			project.employment_generated?.male?.toString() ||
			project.monitoring?.employment?.male?.toString() ||
			'0',
		femaleEmployment:
			project.employment_generated?.female?.toString() ||
			project.monitoring?.employment?.female?.toString() ||
			'0',
		// Financial
		totalBudget: project.budget || 0,
		budgetDisbursed: cumulativeDisbursed.toString(), // Cumulative total
		monthlyDisbursement: monthlyDisbursement.toString(), // This month only
		// Timeline
		startDate: project.start_date || '',
		targetEndDate: project.end_date || '',
		extensionRequested: !!project.monitoring?.contract?.extension,
		extensionDays: (() => {
			// Calculate extension days from stored extension date
			if (!project.monitoring?.contract?.extension || !project.end_date) return '';
			const endDate = new Date(project.end_date);
			const extensionDate = new Date(project.monitoring.contract.extension);
			const diffInMs = extensionDate.getTime() - endDate.getTime();
			const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
			return diffInDays > 0 ? diffInDays.toString() : '';
		})(),
		// Beneficiaries
		targetBeneficiaries: project.beneficiaries || 0,
		currentBeneficiaries:
			latestMonthlyProgress?.beneficiaries_reached?.toString() ||
			project.beneficiaries?.toString() ||
			'0',
		householdsReached: '0', // This could be enhanced to pull from sitio data
		// Photo Documentation
		photoDocumentation: latestMonthlyProgress?.photo_documentation || []
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
		implementingUnit: project.monitoring?.implementingUnit || '',
		location: project.monitoring?.location || project.project_sitios?.[0]?.sitio_name || '',
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
			extension: (() => {
				// Calculate extension date from calendar days
				if (!formData.extensionRequested || !formData.extensionDays) return '';
				const days = Number(formData.extensionDays);
				if (isNaN(days) || days <= 0) return '';
				const baseDate = new Date(formData.targetEndDate);
				const extensionDate = new Date(baseDate);
				extensionDate.setDate(extensionDate.getDate() + days);
				return extensionDate.toISOString().split('T')[0];
			})()
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

	// Calculate cumulative disbursed (sum of all months except current, then add new monthly amount)
	const previousMonthsTotal = updatedMonthlyBudget
		.filter((mb) => mb.month_year !== currentMonth && mb.month_year < currentMonth)
		.reduce((sum, mb) => sum + (mb.actual_expenses || 0), 0);

	const monthlyAmount = Number(formData.monthlyDisbursement || 0);
	const cumulativeTotal = previousMonthsTotal + monthlyAmount;
	const remainingBalance = project.budget - cumulativeTotal;

	if (existingBudgetIndex >= 0) {
		// Update existing record for current month
		updatedMonthlyBudget = updatedMonthlyBudget.map((mb) =>
			mb.month_year === currentMonth
				? {
						...mb,
						budget_released: monthlyAmount, // This month's amount
						actual_expenses: monthlyAmount, // This month's expenses only
						obligations: monthlyAmount,
						remaining_balance: remainingBalance, // Balance after cumulative total
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
			budget_released: monthlyAmount, // This month's amount
			actual_expenses: monthlyAmount, // This month's expenses only
			obligations: monthlyAmount,
			remaining_balance: remainingBalance, // Balance after cumulative total
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
						photo_documentation: formData.photoDocumentation,
						status: slippage > 10 ? 'delayed' : slippage < -5 ? 'ahead' : ('on-track' as const),
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
		end_date: formData.targetEndDate,
		completion_percentage: actualPct,
		beneficiaries: Number(formData.currentBeneficiaries || project.beneficiaries || 0),
		monitoring: updatedMonitoring,
		monthly_budget: updatedMonthlyBudget,
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
	const targetBeneficiaries = formData.targetBeneficiaries;

	if (currentBeneficiaries < 0) {
		errors.push('Current beneficiaries cannot be negative');
	}

	// Validate extension
	if (formData.extensionRequested && !formData.extensionDays) {
		errors.push('Extension days is required when extension is requested');
	}

	if (formData.extensionRequested && formData.extensionDays) {
		const days = Number(formData.extensionDays);
		if (isNaN(days) || days <= 0) {
			errors.push('Extension days must be a positive number');
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
