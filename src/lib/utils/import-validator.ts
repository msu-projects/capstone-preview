import type { DuplicateSitio, ImportValidationError, Sitio } from '$lib/types';

/**
 * Validate a partial Sitio object
 * Returns array of validation errors
 */
export function validateSitio(sitio: Partial<Sitio>, rowIndex: number): ImportValidationError[] {
	const errors: ImportValidationError[] = [];

	// Required fields
	if (!sitio.municipality || String(sitio.municipality).trim() === '') {
		errors.push({
			row: rowIndex,
			field: 'municipality',
			message: 'Municipality is required'
		});
	}

	if (!sitio.barangay || String(sitio.barangay).trim() === '') {
		errors.push({
			row: rowIndex,
			field: 'barangay',
			message: 'Barangay is required'
		});
	}

	if (!sitio.name || String(sitio.name).trim() === '') {
		errors.push({
			row: rowIndex,
			field: 'name',
			message: 'Sitio name is required'
		});
	}

	// Type validation - population
	if (sitio.population !== undefined && sitio.population !== null) {
		if (typeof sitio.population !== 'number' || sitio.population < 0) {
			errors.push({
				row: rowIndex,
				field: 'population',
				message: 'Population must be a non-negative number'
			});
		}
	}

	// Type validation - households
	if (sitio.households !== undefined && sitio.households !== null) {
		if (typeof sitio.households !== 'number' || sitio.households < 0) {
			errors.push({
				row: rowIndex,
				field: 'households',
				message: 'Households must be a non-negative number'
			});
		}
	}

	// Coordinate validation
	if (sitio.coordinates) {
		if (sitio.coordinates.lat !== undefined) {
			if (
				typeof sitio.coordinates.lat !== 'number' ||
				sitio.coordinates.lat < -90 ||
				sitio.coordinates.lat > 90
			) {
				errors.push({
					row: rowIndex,
					field: 'coordinates.lat',
					message: 'Latitude must be between -90 and 90'
				});
			}
		}

		if (sitio.coordinates.lng !== undefined) {
			if (
				typeof sitio.coordinates.lng !== 'number' ||
				sitio.coordinates.lng < -180 ||
				sitio.coordinates.lng > 180
			) {
				errors.push({
					row: rowIndex,
					field: 'coordinates.lng',
					message: 'Longitude must be between -180 and 180'
				});
			}
		}
	}

	// Need score validation (warning only, not error)
	if (sitio.need_score !== undefined && sitio.need_score !== null) {
		if (typeof sitio.need_score !== 'number' || sitio.need_score < 1 || sitio.need_score > 10) {
			errors.push({
				row: rowIndex,
				field: 'need_score',
				message: 'Warning: Need score should be between 1 and 10'
			});
		}
	}

	// Demographics validation
	if (sitio.demographics) {
		// Check if male + female = total
		if (
			sitio.demographics.male !== undefined &&
			sitio.demographics.female !== undefined &&
			sitio.demographics.total !== undefined
		) {
			const sum = sitio.demographics.male + sitio.demographics.female;
			if (Math.abs(sum - sitio.demographics.total) > 1) {
				// Allow 1 person tolerance for rounding
				errors.push({
					row: rowIndex,
					field: 'demographics',
					message: `Male + Female (${sum}) does not equal Total (${sitio.demographics.total})`
				});
			}
		}

		// Check if age groups sum to total
		if (
			sitio.demographics.age_0_14 !== undefined &&
			sitio.demographics.age_15_64 !== undefined &&
			sitio.demographics.age_65_above !== undefined &&
			sitio.demographics.total !== undefined
		) {
			const ageSum =
				sitio.demographics.age_0_14 +
				sitio.demographics.age_15_64 +
				sitio.demographics.age_65_above;
			if (Math.abs(ageSum - sitio.demographics.total) > 2) {
				// Allow small tolerance
				errors.push({
					row: rowIndex,
					field: 'demographics',
					message: `Age groups sum (${ageSum}) does not match Total (${sitio.demographics.total})`
				});
			}
		}
	}

	return errors;
}

/**
 * Find duplicate sitios between incoming data and existing data
 * Duplicates are identified by: municipality + barangay + sitio name
 */
export function findDuplicates(
	incomingSitios: Partial<Sitio>[],
	existingSitios: Sitio[]
): DuplicateSitio[] {
	const duplicates: DuplicateSitio[] = [];

	incomingSitios.forEach((incoming) => {
		if (!incoming.municipality || !incoming.barangay || !incoming.name) {
			return; // Skip if key fields are missing
		}

		const key = `${incoming.municipality.toLowerCase().trim()}-${incoming.barangay.toLowerCase().trim()}-${incoming.name.toLowerCase().trim()}`;

		const existing = existingSitios.find((s) => {
			const existingKey = `${s.municipality.toLowerCase().trim()}-${s.barangay.toLowerCase().trim()}-${s.name.toLowerCase().trim()}`;
			return existingKey === key;
		});

		if (existing) {
			duplicates.push({
				existing,
				incoming: incoming as Sitio,
				key
			});
		}
	});

	return duplicates;
}

/**
 * Validate all sitios in a batch
 * Returns object with valid sitios and errors
 */
export function validateBatch(sitios: Partial<Sitio>[]): {
	valid: Partial<Sitio>[];
	invalid: Partial<Sitio>[];
	errors: ImportValidationError[];
} {
	const valid: Partial<Sitio>[] = [];
	const invalid: Partial<Sitio>[] = [];
	const errors: ImportValidationError[] = [];

	sitios.forEach((sitio, index) => {
		const sitioErrors = validateSitio(sitio, index + 1); // 1-based row numbers

		if (sitioErrors.length === 0) {
			valid.push(sitio);
		} else {
			invalid.push(sitio);
			errors.push(...sitioErrors);
		}
	});

	return { valid, invalid, errors };
}

/**
 * Check if sitio has minimum required data
 */
export function hasMinimumData(sitio: Partial<Sitio>): boolean {
	return !!(sitio.municipality && sitio.barangay && sitio.name);
}

/**
 * Calculate data completeness percentage
 */
export function calculateCompleteness(sitio: Partial<Sitio>): number {
	let totalFields = 0;
	let filledFields = 0;

	// Core fields (weight: 2x)
	totalFields += 7 * 2;
	if (sitio.name) filledFields += 2;
	if (sitio.municipality) filledFields += 2;
	if (sitio.barangay) filledFields += 2;
	if (sitio.province) filledFields += 2;
	if (sitio.population) filledFields += 2;
	if (sitio.households) filledFields += 2;
	if (sitio.coordinates?.lat && sitio.coordinates?.lng) filledFields += 2;

	// Demographics (weight: 1x)
	totalFields += 6;
	if (sitio.demographics?.male) filledFields++;
	if (sitio.demographics?.female) filledFields++;
	if (sitio.demographics?.total) filledFields++;
	if (sitio.demographics?.age_0_14) filledFields++;
	if (sitio.demographics?.age_15_64) filledFields++;
	if (sitio.demographics?.age_65_above) filledFields++;

	// Other sections (weight: 0.5x each)
	totalFields += 10 * 0.5;
	if (sitio.social_services) filledFields += 0.5;
	if (sitio.economic_condition) filledFields += 0.5;
	if (sitio.agriculture) filledFields += 0.5;
	if (sitio.water_sanitation) filledFields += 0.5;
	if (sitio.livestock_poultry) filledFields += 0.5;
	if (sitio.food_security) filledFields += 0.5;
	if (sitio.housing) filledFields += 0.5;
	if (sitio.domestic_animals) filledFields += 0.5;
	if (sitio.community_empowerment) filledFields += 0.5;
	if (sitio.utilities) filledFields += 0.5;

	return Math.round((filledFields / totalFields) * 100);
}

/**
 * Generate summary statistics for validation errors
 */
export function getErrorSummary(errors: ImportValidationError[]): {
	totalErrors: number;
	errorsByField: Record<string, number>;
	errorsByRow: Record<number, number>;
	mostCommonErrors: Array<{ field: string; count: number }>;
} {
	const errorsByField: Record<string, number> = {};
	const errorsByRow: Record<number, number> = {};

	errors.forEach((error) => {
		// Count by field
		errorsByField[error.field] = (errorsByField[error.field] || 0) + 1;

		// Count by row
		errorsByRow[error.row] = (errorsByRow[error.row] || 0) + 1;
	});

	// Sort errors by frequency
	const mostCommonErrors = Object.entries(errorsByField)
		.map(([field, count]) => ({ field, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);

	return {
		totalErrors: errors.length,
		errorsByField,
		errorsByRow,
		mostCommonErrors
	};
}
