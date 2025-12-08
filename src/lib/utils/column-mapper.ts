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

	// Coordinates (optional)
	{ field: 'coordinates.lat', label: 'Latitude', csvHeader: 'LAT', required: false },
	{ field: 'coordinates.lng', label: 'Longitude', csvHeader: 'LNG', required: false },

	// Need Score (1-10 scale)
	{ field: 'need_score', label: 'Need Score', csvHeader: 'NEED_SCORE', required: false },

	// Province
	{ field: 'province', label: 'Province', csvHeader: 'PROVINCE', required: false },

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
		field: 'economic_condition.employments.count',
		label: 'Employment 1 Count',
		csvHeader: 'EMPLOYMENT_1_COUNT',
		required: false
	},
	{
		field: 'economic_condition.employments',
		label: 'Top Employment 2',
		csvHeader: 'Top 3 Employment - 2nd',
		required: false
	},
	{
		field: 'economic_condition.employments.count',
		label: 'Employment 2 Count',
		csvHeader: 'EMPLOYMENT_2_COUNT',
		required: false
	},
	{
		field: 'economic_condition.employments',
		label: 'Top Employment 3',
		csvHeader: 'Top 3 Employment - 3rd',
		required: false
	},
	{
		field: 'economic_condition.employments.count',
		label: 'Employment 3 Count',
		csvHeader: 'EMPLOYMENT_3_COUNT',
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
		field: 'economic_condition.income_brackets.households',
		label: 'Income Bracket 1 HH',
		csvHeader: 'INCOME_1_HOUSEHOLDS',
		required: false
	},
	{
		field: 'economic_condition.income_brackets',
		label: 'Top Income Bracket 2',
		csvHeader: 'Top 3 Income Bracket - 2nd',
		required: false
	},
	{
		field: 'economic_condition.income_brackets.households',
		label: 'Income Bracket 2 HH',
		csvHeader: 'INCOME_2_HOUSEHOLDS',
		required: false
	},
	{
		field: 'economic_condition.income_brackets',
		label: 'Top Income Bracket 3',
		csvHeader: 'Top 3 Income Bracket - 3rd',
		required: false
	},
	{
		field: 'economic_condition.income_brackets.households',
		label: 'Income Bracket 3 HH',
		csvHeader: 'INCOME_3_HOUSEHOLDS',
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
		field: 'water_sanitation.water_sources.source',
		label: 'Water Source 1',
		csvHeader: 'WATER_SOURCE_1',
		required: false
	},
	{
		field: 'water_sanitation.water_sources.status',
		label: 'Water Source 1 Status',
		csvHeader: 'WATER_SOURCE_1_STATUS',
		required: false
	},
	{
		field: 'water_sanitation.water_sources.source',
		label: 'Water Source 2',
		csvHeader: 'WATER_SOURCE_2',
		required: false
	},
	{
		field: 'water_sanitation.water_sources.status',
		label: 'Water Source 2 Status',
		csvHeader: 'WATER_SOURCE_2_STATUS',
		required: false
	},
	{
		field: 'water_sanitation.water_sources.source',
		label: 'Water Source 3',
		csvHeader: 'WATER_SOURCE_3',
		required: false
	},
	{
		field: 'water_sanitation.water_sources.status',
		label: 'Water Source 3 Status',
		csvHeader: 'WATER_SOURCE_3_STATUS',
		required: false
	},
	{
		field: 'water_sanitation.households_without_toilet',
		label: 'HH Without Toilet',
		csvHeader: 'No. of HH without Toilet Facility',
		required: false
	},
	{
		field: 'water_sanitation.toilet_facility_types',
		label: 'Toilet Type 1',
		csvHeader: 'TOILET_TYPE_1',
		required: false
	},
	{
		field: 'water_sanitation.toilet_facility_types',
		label: 'Toilet Type 2',
		csvHeader: 'TOILET_TYPE_2',
		required: false
	},
	{
		field: 'water_sanitation.toilet_facility_types',
		label: 'Toilet Type 3',
		csvHeader: 'TOILET_TYPE_3',
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
	{
		field: 'housing.quality_types.count',
		label: 'Quality Type Count',
		csvHeader: 'QUALITY_TYPE_COUNT',
		required: false
	},

	// Housing ownership
	{
		field: 'housing.ownership_types.type',
		label: 'Ownership Type 1',
		csvHeader: 'OWNERSHIP_TYPE_1',
		required: false
	},
	{
		field: 'housing.ownership_types.count',
		label: 'Ownership Type 1 Count',
		csvHeader: 'OWNERSHIP_TYPE_1_COUNT',
		required: false
	},
	{
		field: 'housing.ownership_types.type',
		label: 'Ownership Type 2',
		csvHeader: 'OWNERSHIP_TYPE_2',
		required: false
	},
	{
		field: 'housing.ownership_types.count',
		label: 'Ownership Type 2 Count',
		csvHeader: 'OWNERSHIP_TYPE_2_COUNT',
		required: false
	},
	{
		field: 'housing.ownership_types.type',
		label: 'Ownership Type 3',
		csvHeader: 'OWNERSHIP_TYPE_3',
		required: false
	},
	{
		field: 'housing.ownership_types.count',
		label: 'Ownership Type 3 Count',
		csvHeader: 'OWNERSHIP_TYPE_3_COUNT',
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
	},

	// Ethnicities (array)
	{ field: 'ethnicities', label: 'Ethnicity 1', csvHeader: 'ETHNICITY_1', required: false },
	{ field: 'ethnicities', label: 'Ethnicity 2', csvHeader: 'ETHNICITY_2', required: false },
	{ field: 'ethnicities', label: 'Ethnicity 3', csvHeader: 'ETHNICITY_3', required: false },

	// Religions (array)
	{ field: 'religions', label: 'Religion 1', csvHeader: 'RELIGION_1', required: false },
	{ field: 'religions', label: 'Religion 2', csvHeader: 'RELIGION_2', required: false },
	{ field: 'religions', label: 'Religion 3', csvHeader: 'RELIGION_3', required: false }
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

	// Temporary storage for paired data (water sources, ownership types, etc.)
	const waterSourcesTemp: Array<{ source?: string; status?: string }> = [];
	const ownershipTypesTemp: Array<{ type?: string; count?: number }> = [];
	const employmentsTemp: Array<{ type?: string; count?: number }> = [];
	const incomeBracketsTemp: Array<{ bracket?: string; households?: number }> = [];
	const qualityTypesTemp: Array<{ type?: string; count?: number }> = [];

	mappings.forEach((mapping) => {
		if (!mapping.sitioField) return;

		const value = row[mapping.csvHeader];
		if (value === null || value === undefined || value === '') return;

		const fieldPath = mapping.sitioField.split('.');

		// Define fields that need special array or object-array handling
		const simpleArrayFields = [
			'top_crops',
			'common_garden_commodities',
			'info_dissemination_methods',
			'transportation_methods',
			'alternative_electricity_sources',
			'livestock_poultry',
			'toilet_facility_types',
			'ethnicities',
			'religions'
		];
		const lastField = fieldPath[fieldPath.length - 1];

		// Handle water sources (paired source + status)
		if (fieldPath.includes('water_sources')) {
			if (lastField === 'source') {
				const match = mapping.csvHeader.match(/WATER_SOURCE_(\d+)/);
				const index = match ? parseInt(match[1]) - 1 : waterSourcesTemp.length;
				if (!waterSourcesTemp[index]) waterSourcesTemp[index] = {};
				waterSourcesTemp[index].source = String(value).trim();
			} else if (lastField === 'status') {
				const match = mapping.csvHeader.match(/WATER_SOURCE_(\d+)_STATUS/);
				const index = match ? parseInt(match[1]) - 1 : waterSourcesTemp.length - 1;
				if (!waterSourcesTemp[index]) waterSourcesTemp[index] = {};
				waterSourcesTemp[index].status = String(value).trim();
			}
			return;
		}

		// Handle housing ownership types (paired type + count)
		if (fieldPath.includes('ownership_types')) {
			if (lastField === 'type') {
				const match = mapping.csvHeader.match(/OWNERSHIP_TYPE_(\d+)/);
				const index = match ? parseInt(match[1]) - 1 : ownershipTypesTemp.length;
				if (!ownershipTypesTemp[index]) ownershipTypesTemp[index] = {};
				ownershipTypesTemp[index].type = String(value).trim();
			} else if (lastField === 'count') {
				const match = mapping.csvHeader.match(/OWNERSHIP_TYPE_(\d+)_COUNT/);
				const index = match ? parseInt(match[1]) - 1 : ownershipTypesTemp.length - 1;
				if (!ownershipTypesTemp[index]) ownershipTypesTemp[index] = {};
				const numValue = Number(value);
				ownershipTypesTemp[index].count = !isNaN(numValue) ? numValue : 0;
			}
			return;
		}

		// Handle employments with counts
		if (fieldPath.includes('employments')) {
			if (lastField === 'employments') {
				const match = mapping.csvHeader.match(/Top 3 Employment - (\d+)/);
				const index = match ? parseInt(match[1]) - 1 : employmentsTemp.length;
				if (!employmentsTemp[index]) employmentsTemp[index] = {};
				employmentsTemp[index].type = String(value).trim();
			} else if (lastField === 'count') {
				const match = mapping.csvHeader.match(/EMPLOYMENT_(\d+)_COUNT/);
				const index = match ? parseInt(match[1]) - 1 : employmentsTemp.length - 1;
				if (!employmentsTemp[index]) employmentsTemp[index] = {};
				const numValue = Number(value);
				employmentsTemp[index].count = !isNaN(numValue) ? numValue : 0;
			}
			return;
		}

		// Handle income brackets with households
		if (fieldPath.includes('income_brackets')) {
			if (lastField === 'income_brackets') {
				const match = mapping.csvHeader.match(/Top 3 Income Bracket - (\d+)/);
				const index = match ? parseInt(match[1]) - 1 : incomeBracketsTemp.length;
				if (!incomeBracketsTemp[index]) incomeBracketsTemp[index] = {};
				incomeBracketsTemp[index].bracket = String(value).trim();
			} else if (lastField === 'households') {
				const match = mapping.csvHeader.match(/INCOME_(\d+)_HOUSEHOLDS/);
				const index = match ? parseInt(match[1]) - 1 : incomeBracketsTemp.length - 1;
				if (!incomeBracketsTemp[index]) incomeBracketsTemp[index] = {};
				const numValue = Number(value);
				incomeBracketsTemp[index].households = !isNaN(numValue) ? numValue : 0;
			}
			return;
		}

		// Handle quality types with counts
		if (fieldPath.includes('quality_types')) {
			if (lastField === 'quality_types') {
				if (!qualityTypesTemp[0]) qualityTypesTemp[0] = {};
				qualityTypesTemp[0].type = String(value).trim();
			} else if (lastField === 'count') {
				if (!qualityTypesTemp[0]) qualityTypesTemp[0] = {};
				const numValue = Number(value);
				qualityTypesTemp[0].count = !isNaN(numValue) ? numValue : 0;
			}
			return;
		}

		// Handle simple string array fields
		if (simpleArrayFields.includes(lastField)) {
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

	// Process paired data into proper arrays
	if (waterSourcesTemp.length > 0) {
		sitio.water_sanitation.water_sources = waterSourcesTemp
			.filter((ws) => ws.source && ws.status)
			.map((ws) => ({ source: ws.source!, status: ws.status! }));
	}

	if (ownershipTypesTemp.length > 0) {
		sitio.housing.ownership_types = ownershipTypesTemp
			.filter((ot) => ot.type)
			.map((ot) => ({ type: ot.type!, count: ot.count || 0 }));
	}

	if (employmentsTemp.length > 0) {
		sitio.economic_condition.employments = employmentsTemp
			.filter((e) => e.type)
			.map((e) => ({ type: e.type!, count: e.count || 0 }));
	}

	if (incomeBracketsTemp.length > 0) {
		sitio.economic_condition.income_brackets = incomeBracketsTemp
			.filter((ib) => ib.bracket)
			.map((ib) => ({ bracket: ib.bracket!, households: ib.households || 0 }));
	}

	if (qualityTypesTemp.length > 0 && qualityTypesTemp[0].type) {
		sitio.housing.quality_types = [
			{ type: qualityTypesTemp[0].type, count: qualityTypesTemp[0].count || 0 }
		];
	}

	// Calculate need_level from need_score
	if (sitio.need_score !== undefined && sitio.need_score !== null) {
		sitio.need_level = getNeedLevelFromScore(sitio.need_score);
	}

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
