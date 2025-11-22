/**
 * Utility functions for monthly planning and breakdown of project targets
 */

/**
 * Generates an array of month strings (YYYY-MM) between start and end dates
 * @param startDate - Project start date
 * @param endDate - Project end date
 * @returns Array of month strings in YYYY-MM format
 */
export function generateMonthRange(startDate: string, endDate: string): string[] {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const months: string[] = [];

	const current = new Date(start.getFullYear(), start.getMonth(), 1);

	while (current <= end) {
		const year = current.getFullYear();
		const month = String(current.getMonth() + 1).padStart(2, '0');
		months.push(`${year}-${month}`);
		current.setMonth(current.getMonth() + 1);
	}

	return months;
}

/**
 * Generates a smart template by evenly distributing a target value across months
 * @param totalTarget - The total target value to distribute
 * @param months - Array of month strings
 * @param strategy - Distribution strategy ('even' or 'weighted')
 * @returns Record of month -> value mapping
 */
export function generateMonthlyTemplate(
	totalTarget: number,
	months: string[],
	strategy: 'even' | 'weighted' = 'even'
): Record<string, number> {
	const breakdown: Record<string, number> = {};

	if (months.length === 0) {
		return breakdown;
	}

	if (strategy === 'even') {
		// Distribute evenly
		const baseValue = Math.floor(totalTarget / months.length);
		const remainder = totalTarget - baseValue * months.length;

		months.forEach((month, index) => {
			// Add 1 to the first 'remainder' months to distribute the remainder
			breakdown[month] = index < remainder ? baseValue + 1 : baseValue;
		});
	} else if (strategy === 'weighted') {
		// Weighted strategy: slower start, peak in middle, taper at end
		// This is useful for construction projects
		const weights: number[] = [];
		const midpoint = Math.floor(months.length / 2);

		months.forEach((_, index) => {
			if (index < midpoint) {
				// Ramp up phase
				weights.push(0.5 + (index / midpoint) * 0.5);
			} else {
				// Steady/taper phase
				weights.push(1.0);
			}
		});

		const totalWeight = weights.reduce((sum, w) => sum + w, 0);

		months.forEach((month, index) => {
			const value = Math.round((totalTarget * weights[index]) / totalWeight);
			breakdown[month] = value;
		});

		// Adjust for rounding errors
		const currentTotal = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
		const difference = totalTarget - currentTotal;
		if (difference !== 0) {
			// Add/subtract the difference from the middle month
			breakdown[months[midpoint]] += difference;
		}
	}

	return breakdown;
}

/**
 * Validates that monthly breakdown sums to the overall target
 * @param monthlyBreakdown - Record of month -> value
 * @param targetValue - The expected total
 * @returns Object with isValid flag and difference
 */
export function validateMonthlyBreakdown(
	monthlyBreakdown: Record<string, number>,
	targetValue: number
): { isValid: boolean; difference: number; total: number } {
	const total = Object.values(monthlyBreakdown).reduce((sum, val) => sum + val, 0);
	const difference = total - targetValue;

	return {
		isValid: difference === 0,
		difference,
		total
	};
}

/**
 * Gets cumulative progress for each month
 * @param monthlyBreakdown - Record of month -> value
 * @param months - Array of month strings in order
 * @returns Record of month -> cumulative value
 */
export function getCumulativeProgress(
	monthlyBreakdown: Record<string, number>,
	months: string[]
): Record<string, number> {
	const cumulative: Record<string, number> = {};
	let runningTotal = 0;

	months.forEach((month) => {
		runningTotal += monthlyBreakdown[month] || 0;
		cumulative[month] = runningTotal;
	});

	return cumulative;
}

/**
 * Formats a month string (YYYY-MM) to a readable format
 * @param month - Month string in YYYY-MM format
 * @returns Formatted month string (e.g., "Jan 2025")
 */
export function formatMonth(month: string): string {
	if (!month || typeof month !== 'string') {
		return '';
	}

	const [year, monthNum] = month.split('-');
	if (!year || !monthNum) {
		return '';
	}

	const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);

	return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Auto-adjusts monthly values when the total target changes
 * Proportionally scales all monthly values to match new target
 * @param currentBreakdown - Current monthly breakdown
 * @param newTarget - New target value
 * @returns Adjusted monthly breakdown
 */
export function adjustMonthlyBreakdown(
	currentBreakdown: Record<string, number>,
	newTarget: number
): Record<string, number> {
	const currentTotal = Object.values(currentBreakdown).reduce((sum, val) => sum + val, 0);

	if (currentTotal === 0) {
		return currentBreakdown;
	}

	const ratio = newTarget / currentTotal;
	const adjusted: Record<string, number> = {};

	Object.entries(currentBreakdown).forEach(([month, value]) => {
		adjusted[month] = Math.round(value * ratio);
	});

	// Adjust for rounding errors
	const adjustedTotal = Object.values(adjusted).reduce((sum, val) => sum + val, 0);
	const difference = newTarget - adjustedTotal;

	if (difference !== 0) {
		// Add/subtract difference from the first non-zero month
		const firstMonth = Object.keys(adjusted).find((m) => adjusted[m] > 0);
		if (firstMonth) {
			adjusted[firstMonth] += difference;
		}
	}

	return adjusted;
}

/**
 * Generates cumulative percentage template across months
 * @param months - Array of month strings
 * @param strategy - Distribution strategy ('even' or 'weighted')
 * @returns Record of month -> cumulative percentage (final month = 100%)
 */
export function generateCumulativePercentageTemplate(
	months: string[],
	strategy: 'even' | 'weighted' = 'even'
): Record<string, number> {
	const percentages: Record<string, number> = {};

	if (months.length === 0) {
		return percentages;
	}

	if (strategy === 'even') {
		// Even distribution: cumulative increases evenly
		const incrementPer = 100 / months.length;
		let cumulative = 0;

		months.forEach((month, index) => {
			cumulative += incrementPer;
			// Ensure final month is exactly 100%
			percentages[month] = index === months.length - 1 ? 100 : Math.round(cumulative * 100) / 100;
		});
	} else if (strategy === 'weighted') {
		// Weighted strategy: slower start (10% first month), accelerates to middle, steady to end
		const weights: number[] = [];
		const midpoint = Math.floor(months.length / 2);

		months.forEach((_, index) => {
			if (index < midpoint) {
				// Ramp up phase: 0.3 to 1.0
				weights.push(0.3 + (index / midpoint) * 0.7);
			} else {
				// Steady phase
				weights.push(1.0);
			}
		});

		const totalWeight = weights.reduce((sum, w) => sum + w, 0);
		let cumulative = 0;

		months.forEach((month, index) => {
			cumulative += (100 * weights[index]) / totalWeight;
			// Ensure final month is exactly 100%
			percentages[month] = index === months.length - 1 ? 100 : Math.round(cumulative * 100) / 100;
		});
	}

	return percentages;
}

/**
 * Validates cumulative percentage breakdown
 * @param cumulativePercentages - Record of month -> cumulative percentage
 * @param months - Array of month strings in order
 * @returns Validation result
 */
export function validateCumulativePercentage(
	cumulativePercentages: Record<string, number>,
	months: string[]
): { isValid: boolean; message: string; finalPercentage: number } {
	if (months.length === 0) {
		return { isValid: false, message: 'No months provided', finalPercentage: 0 };
	}

	const finalMonth = months[months.length - 1];
	const finalPercentage = cumulativePercentages[finalMonth] || 0;

	// Check if percentages are increasing
	let previousValue = 0;
	for (const month of months) {
		const currentValue = cumulativePercentages[month] || 0;
		if (currentValue < previousValue) {
			return {
				isValid: false,
				message: 'Percentages must be cumulative (non-decreasing)',
				finalPercentage
			};
		}
		if (currentValue > 100) {
			return {
				isValid: false,
				message: 'Percentage cannot exceed 100%',
				finalPercentage
			};
		}
		previousValue = currentValue;
	}

	// Final month must be 100%
	if (Math.abs(finalPercentage - 100) > 0.01) {
		return {
			isValid: false,
			message: `Final month must be 100% (currently ${finalPercentage}%)`,
			finalPercentage
		};
	}

	return { isValid: true, message: 'Valid', finalPercentage };
}

/**
 * Calculates slippage (Plan % - Actual %) for each month
 * @param planPercentages - Record of month -> planned cumulative percentage
 * @param actualPercentages - Record of month -> actual cumulative percentage
 * @param months - Array of month strings
 * @returns Record of month -> slippage percentage
 */
export function calculateSlippage(
	planPercentages: Record<string, number>,
	actualPercentages: Record<string, number>,
	months: string[]
): Record<string, number> {
	const slippage: Record<string, number> = {};

	months.forEach((month) => {
		const plan = planPercentages[month] || 0;
		const actual = actualPercentages[month] || 0;
		slippage[month] = plan - actual; // Positive = behind, Negative = ahead
	});

	return slippage;
}
