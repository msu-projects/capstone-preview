/**
 * Utility functions for project calculations and auto-computed values
 * Used by Quick Update form for real-time calculations and indicators
 */

/**
 * Calculates budget utilization metrics
 * @param totalBudget - Total project budget
 * @param disbursed - Amount disbursed so far
 * @returns Budget metrics including balance, utilization %, and status
 */
export function calculateBudgetUtilization(totalBudget: number, disbursed: number) {
	const balance = totalBudget - disbursed;
	const utilizationPercentage = totalBudget > 0 ? (disbursed / totalBudget) * 100 : 0;

	// Determine status based on utilization
	let status: 'on-track' | 'warning' | 'overrun' = 'on-track';
	if (utilizationPercentage > 100) {
		status = 'overrun';
	} else if (utilizationPercentage > 90) {
		status = 'warning';
	}

	return {
		balance: Math.max(0, balance),
		utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
		status,
		isOverBudget: disbursed > totalBudget
	};
}

/**
 * Calculates days remaining or overdue for a project
 * @param targetDate - Target completion date (YYYY-MM-DD)
 * @param referenceDate - Reference date (defaults to today)
 * @returns Days remaining (positive) or overdue (negative), and status
 */
export function calculateDaysRemaining(
	targetDate: string,
	referenceDate: Date = new Date()
): {
	days: number;
	isOverdue: boolean;
	status: 'on-time' | 'warning' | 'overdue';
	formattedMessage: string;
} {
	const target = new Date(targetDate);
	const diffTime = target.getTime() - referenceDate.getTime();
	const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	let status: 'on-time' | 'warning' | 'overdue' = 'on-time';
	if (days < 0) {
		status = 'overdue';
	} else if (days <= 30) {
		status = 'warning';
	}

	const isOverdue = days < 0;
	const formattedMessage = isOverdue
		? `${Math.abs(days)} days overdue`
		: `${days} days remaining`;

	return {
		days,
		isOverdue,
		status,
		formattedMessage
	};
}

/**
 * Calculates beneficiary progress metrics
 * @param targetBeneficiaries - Target number of beneficiaries
 * @param currentBeneficiaries - Current number served
 * @returns Progress percentage and status
 */
export function calculateBeneficiaryProgress(
	targetBeneficiaries: number,
	currentBeneficiaries: number
) {
	const percentage = targetBeneficiaries > 0
		? (currentBeneficiaries / targetBeneficiaries) * 100
		: 0;

	let status: 'below-target' | 'on-track' | 'exceeding' = 'on-track';
	if (percentage < 80) {
		status = 'below-target';
	} else if (percentage > 100) {
		status = 'exceeding';
	}

	return {
		percentage: Math.round(percentage * 100) / 100,
		remaining: Math.max(0, targetBeneficiaries - currentBeneficiaries),
		status
	};
}

/**
 * Calculates slippage between planned and actual progress
 * @param plannedPercentage - Planned progress percentage
 * @param actualPercentage - Actual progress percentage
 * @returns Slippage (positive = behind, negative = ahead) and status
 */
export function calculateProgressSlippage(
	plannedPercentage: number,
	actualPercentage: number
) {
	const slippage = plannedPercentage - actualPercentage;

	let status: 'ahead' | 'on-track' | 'behind' = 'on-track';
	let severity: 'minor' | 'moderate' | 'severe' = 'minor';

	if (slippage > 0) {
		status = 'behind';
		if (slippage > 20) {
			severity = 'severe';
		} else if (slippage > 10) {
			severity = 'moderate';
		}
	} else if (slippage < -5) {
		status = 'ahead';
	}

	return {
		slippage: Math.round(slippage * 100) / 100,
		status,
		severity,
		formattedMessage: slippage > 0
			? `${Math.abs(slippage)}% behind schedule`
			: slippage < 0
				? `${Math.abs(slippage)}% ahead of schedule`
				: 'On schedule'
	};
}

/**
 * Projects completion date based on current progress trend
 * @param startDate - Project start date (YYYY-MM-DD)
 * @param currentDate - Current date (defaults to today)
 * @param actualPercentage - Actual progress percentage
 * @returns Projected completion date and whether it's delayed
 */
export function projectCompletionDate(
	startDate: string,
	currentDate: Date = new Date(),
	actualPercentage: number
): {
	projectedDate: Date | null;
	isDelayed: boolean;
	daysFromStart: number;
	formattedDate: string;
} {
	if (actualPercentage <= 0) {
		return {
			projectedDate: null,
			isDelayed: false,
			daysFromStart: 0,
			formattedDate: 'Unable to project'
		};
	}

	const start = new Date(startDate);
	const daysSinceStart = Math.ceil((currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

	// Calculate daily progress rate
	const dailyRate = actualPercentage / daysSinceStart;

	// Project days needed to reach 100%
	const remainingPercentage = 100 - actualPercentage;
	const projectedDaysRemaining = Math.ceil(remainingPercentage / dailyRate);

	const projectedDate = new Date(currentDate);
	projectedDate.setDate(projectedDate.getDate() + projectedDaysRemaining);

	const formattedDate = projectedDate.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});

	return {
		projectedDate,
		isDelayed: false, // Would need target date to determine this
		daysFromStart: daysSinceStart + projectedDaysRemaining,
		formattedDate
	};
}

/**
 * Calculates overall project health score (0-100)
 * Based on multiple factors: budget, timeline, progress, beneficiaries
 */
export function calculateProjectHealth(params: {
	budgetUtilization: number;
	progressPercentage: number;
	plannedPercentage: number;
	beneficiaryProgress: number;
	daysRemaining: number;
}): {
	score: number;
	grade: 'A' | 'B' | 'C' | 'D' | 'F';
	status: 'healthy' | 'needs-attention' | 'critical';
	issues: string[];
} {
	const { budgetUtilization, progressPercentage, plannedPercentage, beneficiaryProgress, daysRemaining } = params;

	let score = 100;
	const issues: string[] = [];

	// Budget component (max -30 points)
	if (budgetUtilization > 100) {
		score -= 30;
		issues.push('Budget overrun');
	} else if (budgetUtilization > 90 && progressPercentage < 85) {
		score -= 15;
		issues.push('High budget utilization vs progress');
	}

	// Progress slippage component (max -30 points)
	const slippage = plannedPercentage - progressPercentage;
	if (slippage > 20) {
		score -= 30;
		issues.push('Severely behind schedule');
	} else if (slippage > 10) {
		score -= 15;
		issues.push('Behind schedule');
	} else if (slippage > 5) {
		score -= 5;
		issues.push('Slightly behind schedule');
	}

	// Timeline component (max -20 points)
	if (daysRemaining < 0) {
		score -= 20;
		issues.push('Overdue');
	} else if (daysRemaining <= 30 && progressPercentage < 90) {
		score -= 10;
		issues.push('Tight deadline with incomplete progress');
	}

	// Beneficiary component (max -20 points)
	if (beneficiaryProgress < 50 && progressPercentage > 70) {
		score -= 20;
		issues.push('Low beneficiary reach vs progress');
	} else if (beneficiaryProgress < 70 && progressPercentage > 85) {
		score -= 10;
		issues.push('Beneficiary targets lagging');
	}

	// Determine grade and status
	let grade: 'A' | 'B' | 'C' | 'D' | 'F';
	let status: 'healthy' | 'needs-attention' | 'critical';

	if (score >= 90) {
		grade = 'A';
		status = 'healthy';
	} else if (score >= 80) {
		grade = 'B';
		status = 'healthy';
	} else if (score >= 70) {
		grade = 'C';
		status = 'needs-attention';
	} else if (score >= 60) {
		grade = 'D';
		status = 'needs-attention';
	} else {
		grade = 'F';
		status = 'critical';
	}

	return {
		score: Math.max(0, score),
		grade,
		status,
		issues
	};
}

/**
 * Formats a number as currency (PHP)
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-PH', {
		style: 'currency',
		currency: 'PHP',
		minimumFractionDigits: 2
	}).format(amount);
}

/**
 * Formats a percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals: number = 2): string {
	return `${value.toFixed(decimals)}%`;
}

/**
 * Gets the current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	return `${year}-${month}`;
}

/**
 * Calculates variance between two values
 */
export function calculateVariance(
	planned: number,
	actual: number
): {
	variance: number;
	percentageVariance: number;
	isPositive: boolean;
} {
	const variance = actual - planned;
	const percentageVariance = planned > 0 ? (variance / planned) * 100 : 0;

	return {
		variance,
		percentageVariance: Math.round(percentageVariance * 100) / 100,
		isPositive: variance >= 0
	};
}
