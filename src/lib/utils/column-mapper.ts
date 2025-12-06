import {
	getNeedLevelFromScore,
	type ColumnMapping,
	type ImportedRow,
	type Sitio
} from '$lib/types';

/**
 * Field definitions for the 86-column Sitio dataset
 * Maps CSV headers to Sitio interface fields
 */
export const SITIO_FIELD_DEFINITIONS = [
	// Core identification
	{ field: 'coding', label: 'Coding', csvHeader: 'CODING', required: false },
	{
		field: 'municipality',
		label: 'Municipality',
		csvHeader: 'CODING - MUNICIPALITY',
		required: true
	},
	{ field: 'barangay', label: 'Barangay', csvHeader: 'BARANGAY', required: true },
	{ field: 'name', label: 'Sitio', csvHeader: 'SITIO', required: true },
	{
		field: 'households',
		label: 'Number of Households',
		csvHeader: 'No. of Households',
		required: false
	},

	// Demographics
	{
		field: 'demographics.male',
		label: 'Male Population',
		csvHeader: 'POPULATION - Male',
		required: false
	},
	{
		field: 'demographics.female',
		label: 'Female Population',
		csvHeader: 'POPULATION - Female',
		required: false
	},
	{
		field: 'population',
		label: 'Total Population',
		csvHeader: 'POPULATION - TOTAL',
		required: false
	},
	{
		field: 'demographics.age_0_14',
		label: 'Age 0-14',
		csvHeader: 'AGE RANGE - 0-14 years old',
		required: false
	},
	{
		field: 'demographics.age_15_64',
		label: 'Age 15-64',
		csvHeader: 'AGE RANGE - 15-64 years old',
		required: false
	},
	{
		field: 'demographics.age_65_above',
		label: 'Age 65+',
		csvHeader: 'AGE RANGE - 65 years old and above',
		required: false
	},

	// Social services
	{
		field: 'social_services.registered_voters',
		label: 'Registered Voters',
		csvHeader: 'No. of Registered Voters',
		required: false
	},
	{
		field: 'social_services.philhealth_beneficiaries',
		label: 'Philhealth Members',
		csvHeader: 'No. of Philhealth Members/Beneficiaries',
		required: false
	},
	{
		field: 'social_services.fourps_beneficiaries',
		label: '4Ps Beneficiaries',
		csvHeader: "No. of 4P's Beneficiaries",
		required: false
	},

	// Economic/Employment
	{
		field: 'economic_condition.employments',
		label: 'Top Employment 1',
		csvHeader: 'Top 3 Employment - 1st',
		required: false
	},
	{
		field: 'economic_condition.employments',
		label: 'Top Employment 2',
		csvHeader: 'Top 3 Employment - 2nd',
		required: false
	},
	{
		field: 'economic_condition.employments',
		label: 'Top Employment 3',
		csvHeader: 'Top 3 Employment - 3rd',
		required: false
	},

	// Income brackets
	{
		field: 'economic_condition.income_brackets',
		label: 'Top Income Bracket 1',
		csvHeader: 'Top 3 Income Bracket - 1st',
		required: false
	},
	{
		field: 'economic_condition.income_brackets',
		label: 'Top Income Bracket 2',
		csvHeader: 'Top 3 Income Bracket - 2nd',
		required: false
	},
	{
		field: 'economic_condition.income_brackets',
		label: 'Top Income Bracket 3',
		csvHeader: 'Top 3 Income Bracket - 3rd',
		required: false
	},

	// Agriculture
	{
		field: 'agriculture.farmers_count',
		label: 'Number of Farmers',
		csvHeader: 'No. of Farmers',
		required: false
	},
	{
		field: 'agriculture.farmer_associations',
		label: 'Farmer Associations',
		csvHeader: 'No. of Farmer Association',
		required: false
	},
	{
		field: 'agriculture.farm_area_hectares',
		label: 'Farm Area (ha)',
		csvHeader: 'No. of Farm Area (has.)',
		required: false
	},
	{
		field: 'agriculture.top_crops',
		label: 'Top Crop 1',
		csvHeader: 'Top 5 Crops/Commodities Planted/Produced - 1st',
		required: false
	},
	{
		field: 'agriculture.top_crops',
		label: 'Top Crop 2',
		csvHeader: 'Top 5 Crops/Commodities Planted/Produced - 2nd',
		required: false
	},
	{
		field: 'agriculture.top_crops',
		label: 'Top Crop 3',
		csvHeader: 'Top 5 Crops/Commodities Planted/Produced - 3rd',
		required: false
	},
	{
		field: 'agriculture.top_crops',
		label: 'Top Crop 4',
		csvHeader: 'Top 5 Crops/Commodities Planted/Produced - 4th',
		required: false
	},
	{
		field: 'agriculture.top_crops',
		label: 'Top Crop 5',
		csvHeader: 'Top 5 Crops/Commodities Planted/Produced - 5th',
		required: false
	},

	// Water and sanitation
	{
		field: 'water_sanitation.water_systems_count',
		label: 'Water Systems',
		csvHeader: 'No. of Water Systems',
		required: false
	},
	{
		field: 'water_sanitation.households_without_toilet',
		label: 'HH Without Toilet',
		csvHeader: 'No. of HH without Toilet Facility',
		required: false
	},
	{
		field: 'water_sanitation.waste_segregation_practice',
		label: 'Waste Segregation',
		csvHeader: 'Waste Segregation',
		required: false
	},

	// Livestock and poultry (now string array like top_crops)
	{
		field: 'livestock_poultry',
		label: 'Livestock 1',
		csvHeader: 'Livestock - 1st',
		required: false
	},
	{
		field: 'livestock_poultry',
		label: 'Livestock 2',
		csvHeader: 'Livestock - 2nd',
		required: false
	},
	{
		field: 'livestock_poultry',
		label: 'Livestock 3',
		csvHeader: 'Livestock - 3rd',
		required: false
	},
	{
		field: 'livestock_poultry',
		label: 'Livestock 4',
		csvHeader: 'Pigs',
		required: false
	},
	{
		field: 'livestock_poultry',
		label: 'Livestock 5',
		csvHeader: 'Cows',
		required: false
	},
	{
		field: 'livestock_poultry',
		label: 'Livestock 6',
		csvHeader: 'Carabao',
		required: false
	},
	{
		field: 'livestock_poultry',
		label: 'Livestock 7',
		csvHeader: 'Horse',
		required: false
	},
	{
		field: 'livestock_poultry',
		label: 'Livestock 8',
		csvHeader: 'Goat',
		required: false
	},
	{
		field: 'livestock_poultry',
		label: 'Livestock 9',
		csvHeader: 'Chicken',
		required: false
	},
	{
		field: 'livestock_poultry',
		label: 'Livestock 10',
		csvHeader: 'Duck',
		required: false
	},

	// Food security
	{
		field: 'food_security.households_with_backyard_garden',
		label: 'HH with Backyard Garden',
		csvHeader: 'No. of HH with Backyard Garden',
		required: false
	},
	{
		field: 'food_security.common_garden_commodities',
		label: 'Garden Commodity 1',
		csvHeader: 'Top 3 Common Garden Commodities - 1st',
		required: false
	},
	{
		field: 'food_security.common_garden_commodities',
		label: 'Garden Commodity 2',
		csvHeader: 'Top 3 Common Garden Commodities - 2nd',
		required: false
	},
	{
		field: 'food_security.common_garden_commodities',
		label: 'Garden Commodity 3',
		csvHeader: 'Top 3 Common Garden Commodities - 3rd',
		required: false
	},

	// Housing quality
	{
		field: 'housing.quality_types',
		label: 'Housing Quality',
		csvHeader: 'Housing - Quality of Housing',
		required: false
	},

	// Domestic animals
	{ field: 'domestic_animals.dogs', label: 'Dogs', csvHeader: 'Dogs', required: false },
	{ field: 'domestic_animals.cats', label: 'Cats', csvHeader: 'Cats', required: false },
	{
		field: 'domestic_animals.dogs_vaccinated',
		label: 'Dogs Vaccinated',
		csvHeader: 'No. of Vaccinated (Dogs)',
		required: false
	},
	{
		field: 'domestic_animals.cats_vaccinated',
		label: 'Cats Vaccinated',
		csvHeader: 'No. of Vaccinated (Cats)',
		required: false
	},

	// Community empowerment
	{
		field: 'community_empowerment.sectoral_organizations',
		label: 'Sectoral Organizations',
		csvHeader: 'No. of Sectoral Organization',
		required: false
	},
	{
		field: 'community_empowerment.info_dissemination_methods',
		label: 'Info Dissemination',
		csvHeader: 'Information Dissemination',
		required: false
	},
	{
		field: 'community_empowerment.transportation_methods',
		label: 'Transportation',
		csvHeader: 'Mode of Transportation',
		required: false
	},

	// Utilities
	{
		field: 'utilities.households_with_electricity',
		label: 'HH with Electricity',
		csvHeader: 'No. of HH with access to Electricity',
		required: false
	},
	{
		field: 'utilities.alternative_electricity_sources',
		label: 'Alternative Power',
		csvHeader: 'Alternative Source of Electricity',
		required: false
	}
];

/**
 * Automatically map CSV headers to Sitio fields
 * Uses exact match first, then fuzzy matching
 */
export function autoMapColumns(csvHeaders: string[]): ColumnMapping[] {
	return csvHeaders.map((csvHeader) => {
		// Try exact match first (case-insensitive)
		let match = SITIO_FIELD_DEFINITIONS.find(
			(def) => def.csvHeader.toLowerCase() === csvHeader.toLowerCase()
		);

		// Try fuzzy match if no exact match
		if (!match) {
			match = SITIO_FIELD_DEFINITIONS.find(
				(def) =>
					csvHeader.toLowerCase().includes(def.label.toLowerCase()) ||
					def.label.toLowerCase().includes(csvHeader.toLowerCase())
			);
		}

		return {
			csvHeader,
			sitioField: match?.field || '',
			isRequired: match?.required || false,
			autoMatched: !!match
		};
	});
}

/**
 * Creates a default Sitio object with all required fields initialized
 */
export function createDefaultSitio(): Sitio {
	return {
		// Required core fields
		id: 0,
		name: '',
		municipality: '',
		barangay: '',
		population: 0,
		households: 0,
		coordinates: { lat: 0, lng: 0 },
		created_at: new Date().toISOString(),

		// Optional fields with defaults
		coding: '',
		demographics: {
			male: 0,
			female: 0,
			total: 0,
			age_0_14: 0,
			age_15_64: 0,
			age_65_above: 0
		},
		social_services: {
			registered_voters: 0,
			philhealth_beneficiaries: 0,
			fourps_beneficiaries: 0
		},
		economic_condition: {
			employments: [],
			income_brackets: []
		},
		agriculture: {
			farmers_count: 0,
			farmer_associations: 0,
			farm_area_hectares: 0,
			top_crops: []
		},
		water_sanitation: {
			water_systems_count: 0,
			water_sources: [],
			households_without_toilet: 0,
			toilet_facility_types: [],
			waste_segregation_practice: null
		},
		livestock_poultry: [],
		food_security: {
			households_with_backyard_garden: 0,
			common_garden_commodities: []
		},
		housing: {
			quality_types: [],
			ownership_types: []
		},
		domestic_animals: {
			dogs: 0,
			cats: 0,
			dogs_vaccinated: 0,
			cats_vaccinated: 0
		},
		community_empowerment: {
			sectoral_organizations: 0,
			info_dissemination_methods: [],
			transportation_methods: []
		},
		utilities: {
			households_with_electricity: 0,
			alternative_electricity_sources: []
		},

		// Need Score (default 5 = medium)
		need_score: 5,
		need_level: getNeedLevelFromScore(5)
	};
}

/**
 * Transform a raw CSV/Excel row to a partial Sitio object
 * Handles nested field paths and array aggregation
 */
export function transformRowToSitio(row: ImportedRow, mappings: ColumnMapping[]): Partial<Sitio> {
	// Create a properly typed default, cast to any for dynamic field manipulation
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const sitio: any = createDefaultSitio();

	mappings.forEach((mapping) => {
		if (!mapping.sitioField) return;

		const value = row[mapping.csvHeader];
		if (value === null || value === undefined || value === '') return;

		const fieldPath = mapping.sitioField.split('.');

		// Define fields that need special array or object-array handling
		const arrayFields = [
			'top_crops',
			'common_garden_commodities',
			'info_dissemination_methods',
			'transportation_methods',
			'alternative_electricity_sources',
			'livestock_poultry'
		];
		const objectArrayFields = [
			'employments',
			'income_brackets',
			'quality_types',
			'ownership_types'
		];
		const lastField = fieldPath[fieldPath.length - 1];

		// Handle simple string array fields
		if (arrayFields.includes(lastField)) {
			// Navigate to parent object
			let current = sitio;
			for (let i = 0; i < fieldPath.length - 1; i++) {
				current = current[fieldPath[i]];
			}

			// Add to array if not already present
			const arrayField = fieldPath[fieldPath.length - 1];
			if (!Array.isArray(current[arrayField])) {
				current[arrayField] = [];
			}

			const stringValue = String(value).trim();
			if (stringValue && !current[arrayField].includes(stringValue)) {
				current[arrayField].push(stringValue);
			}
		} else if (objectArrayFields.includes(lastField)) {
			// Handle object array fields (employments, income_brackets, quality_types, ownership_types)
			let current = sitio;
			for (let i = 0; i < fieldPath.length - 1; i++) {
				current = current[fieldPath[i]];
			}

			if (!Array.isArray(current[lastField])) {
				current[lastField] = [];
			}

			const stringValue = String(value).trim();
			if (stringValue) {
				// Create appropriate object structure based on field type
				if (lastField === 'employments') {
					// Check if this employment type already exists
					const existing = current[lastField].find((e: { type: string }) => e.type === stringValue);
					if (!existing) {
						current[lastField].push({ type: stringValue, count: 0 });
					}
				} else if (lastField === 'income_brackets') {
					const existing = current[lastField].find(
						(e: { bracket: string }) => e.bracket === stringValue
					);
					if (!existing) {
						current[lastField].push({ bracket: stringValue, households: 0 });
					}
				} else if (lastField === 'quality_types' || lastField === 'ownership_types') {
					const existing = current[lastField].find((e: { type: string }) => e.type === stringValue);
					if (!existing) {
						current[lastField].push({ type: stringValue, count: 0 });
					}
				}
			}
		} else {
			// Regular field assignment
			let current = sitio;
			for (let i = 0; i < fieldPath.length - 1; i++) {
				if (!current[fieldPath[i]]) {
					current[fieldPath[i]] = {};
				}
				current = current[fieldPath[i]];
			}

			const finalField = fieldPath[fieldPath.length - 1];

			// Type conversion
			if (typeof value === 'number') {
				current[finalField] = value;
			} else if (value === 'Yes' || value === 'yes' || value === 'TRUE' || value === 'true') {
				current[finalField] = true;
			} else if (value === 'No' || value === 'no' || value === 'FALSE' || value === 'false') {
				current[finalField] = false;
			} else {
				const numValue = Number(value);
				if (!isNaN(numValue)) {
					current[finalField] = numValue;
				} else {
					current[finalField] = String(value).trim();
				}
			}
		}
	});

	// Calculate total demographics if not provided
	if (!sitio.demographics.total && sitio.demographics.male && sitio.demographics.female) {
		sitio.demographics.total = sitio.demographics.male + sitio.demographics.female;
	}

	// Map total to population if population not set
	if (!sitio.population && sitio.demographics.total) {
		sitio.population = sitio.demographics.total;
	}

	return sitio;
}

/**
 * Get list of unmapped required fields
 */
export function getUnmappedRequiredFields(mappings: ColumnMapping[]): string[] {
	const requiredFields = SITIO_FIELD_DEFINITIONS.filter((def) => def.required).map(
		(def) => def.field
	);

	const mappedFields = mappings.filter((m) => m.sitioField).map((m) => m.sitioField);

	return requiredFields.filter((field) => !mappedFields.includes(field));
}

/**
 * Get statistics about column mapping quality
 */
export function getMappingStats(mappings: ColumnMapping[]): {
	total: number;
	autoMapped: number;
	manuallyMapped: number;
	unmapped: number;
	requiredUnmapped: number;
} {
	const total = mappings.length;
	const autoMapped = mappings.filter((m) => m.autoMatched && m.sitioField).length;
	const manuallyMapped = mappings.filter((m) => !m.autoMatched && m.sitioField).length;
	const unmapped = mappings.filter((m) => !m.sitioField).length;
	const requiredUnmapped = getUnmappedRequiredFields(mappings).length;

	return {
		total,
		autoMapped,
		manuallyMapped,
		unmapped,
		requiredUnmapped
	};
}
