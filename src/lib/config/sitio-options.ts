/**
 * Sitio Form Options
 *
 * Centralized constants for all dropdown/combobox options used in sitio forms.
 * Edit these arrays to add, remove, or modify available options.
 *
 * NOTE: These are default values. Admins can customize via the Configuration page.
 * Use the getter functions (e.g., getEthnicityOptions()) to get values with overrides.
 */

import {
	CONFIG_STORAGE_KEYS,
	getConfigWithPartialOverrides,
	hasConfigOverride,
	resetConfigToDefault,
	saveConfigOverride,
	type SitioOptionsConfig
} from '$lib/utils/config-storage';

// ============================================
// DEFAULT VALUES
// ============================================

/** Ethnic groups commonly found in the region */
const DEFAULT_ETHNICITY_OPTIONS = [
	'Ilonggo',
	'Cebuano',
	'Tagalog',
	'Ilocano',
	'Waray',
	'Muslim',
	"T'boli",
	"B'laan"
];

/** Religious affiliations */
const DEFAULT_RELIGION_OPTIONS = [
	'Roman Catholic',
	'Alliance',
	'Baptist',
	'Iglesia ni Cristo',
	'Islam',
	'Seventh Day Adventist',
	"Jehovah's Witness"
];

/** Common employment types in rural areas */
const DEFAULT_EMPLOYMENT_TYPE_OPTIONS = [
	'Vendor',
	'Laborer',
	'Farmer',
	'Tricycle Driver',
	'Construction Worker',
	'Charcoal Maker'
];

/** Daily income brackets in Philippine Peso */
const DEFAULT_INCOME_BRACKET_OPTIONS = [
	{ label: 'Below ₱100', value: '<=100' },
	{ label: '₱101 - ₱300', value: '100-300' },
	{ label: '₱301 - ₱500', value: '300-500' },
	{ label: 'Above ₱500', value: '>=500' }
];

/** Livestock and poultry options */
const DEFAULT_LIVESTOCK_POULTRY_OPTIONS = [
	'Pigs',
	'Cows',
	'Carabaos',
	'Horses',
	'Goats',
	'Chickens',
	'Ducks'
];

/** Major agricultural crops */
const DEFAULT_CROP_OPTIONS = [
	'Rice',
	'Corn',
	'Coconut',
	'Banana',
	'Sugarcane',
	'Coffee',
	'Cacao',
	'Abaca',
	'Cassava',
	'Sweet Potato',
	'Mango',
	'Pineapple',
	'Rubber',
	'Oil Palm'
];

/** Common backyard garden commodities */
const DEFAULT_GARDEN_COMMODITY_OPTIONS = [
	'Tomatoes',
	'Eggplant',
	'Kangkong',
	'Pechay',
	'Squash',
	'String Beans',
	'Okra',
	'Ampalaya',
	'Pepper',
	'Onion',
	'Garlic',
	'Ginger'
];

/** Water source types */
const DEFAULT_WATER_SOURCE_OPTIONS = [
	'Deep Well',
	'Shallow Well',
	'Spring',
	'River',
	'Rainwater',
	'NAWASA/Water District',
	'Artesian Well',
	'Communal Faucet'
];

/** Water source condition/status options */
const DEFAULT_WATER_STATUS_OPTIONS = [
	'Good',
	'Needs Repair',
	'Rehabilitation',
	'Not Functioning',
	'Private'
];

/** Toilet facility types */
const DEFAULT_TOILET_FACILITY_TYPE_OPTIONS = [
	'Water Sealed',
	'Open Pit',
	'Pour Flush',
	'Composting'
];

/** Alternative electricity sources */
const DEFAULT_ALTERNATIVE_ELECTRICITY_SOURCE_OPTIONS = ['Solar', 'Generator', 'Battery'];

/** Housing quality/material types */
const DEFAULT_HOUSING_QUALITY_OPTIONS = ['Concrete', 'Wood', 'Half-Concrete', 'Makeshift'];

/** Housing ownership types */
const DEFAULT_HOUSING_OWNERSHIP_OPTIONS = [
	'Owned',
	'Rented',
	'Protected Land',
	'Informal Settler',
	'Owner Consent'
];

/** Information dissemination methods */
const DEFAULT_INFO_DISSEMINATION_METHOD_OPTIONS = [
	'Radio',
	'Signages',
	'Person in Authority',
	'Assembly',
	'Newspaper',
	'TV',
	'Internet/Social Media'
];

/** Transportation methods available in the area */
const DEFAULT_TRANSPORTATION_METHOD_OPTIONS = ['Motorcycle', 'Tricycle', '4-Wheels', 'Boat'];

/** Local sitio official positions */
const DEFAULT_LOCAL_OFFICIAL_POSITION_OPTIONS = [
	'Sitio Leader',
	'Vice-President',
	'Secretary',
	'Treasurer',
	'Auditor',
	'PIO',
	'PIO/Bus. Manager',
	'Business Manager'
];

/** RST (Resident Support Team) official positions */
const DEFAULT_RST_OFFICIAL_POSITION_OPTIONS = [
	'Team Leader',
	'Assistant Team Leader',
	'Secretary',
	'Member'
];

// ============================================
// DEFAULT CONFIG OBJECT
// ============================================

const DEFAULT_SITIO_OPTIONS_CONFIG: SitioOptionsConfig = {
	ethnicityOptions: DEFAULT_ETHNICITY_OPTIONS,
	religionOptions: DEFAULT_RELIGION_OPTIONS,
	employmentTypeOptions: DEFAULT_EMPLOYMENT_TYPE_OPTIONS,
	incomeBracketOptions: DEFAULT_INCOME_BRACKET_OPTIONS,
	livestockPoultryOptions: DEFAULT_LIVESTOCK_POULTRY_OPTIONS,
	cropOptions: DEFAULT_CROP_OPTIONS,
	gardenCommodityOptions: DEFAULT_GARDEN_COMMODITY_OPTIONS,
	waterSourceOptions: DEFAULT_WATER_SOURCE_OPTIONS,
	waterStatusOptions: DEFAULT_WATER_STATUS_OPTIONS,
	toiletFacilityTypeOptions: DEFAULT_TOILET_FACILITY_TYPE_OPTIONS,
	alternativeElectricitySourceOptions: DEFAULT_ALTERNATIVE_ELECTRICITY_SOURCE_OPTIONS,
	housingQualityOptions: DEFAULT_HOUSING_QUALITY_OPTIONS,
	housingOwnershipOptions: DEFAULT_HOUSING_OWNERSHIP_OPTIONS,
	infoDisseminationMethodOptions: DEFAULT_INFO_DISSEMINATION_METHOD_OPTIONS,
	transportationMethodOptions: DEFAULT_TRANSPORTATION_METHOD_OPTIONS,
	localOfficialPositionOptions: DEFAULT_LOCAL_OFFICIAL_POSITION_OPTIONS,
	rstOfficialPositionOptions: DEFAULT_RST_OFFICIAL_POSITION_OPTIONS
};

// ============================================
// GETTER FUNCTIONS (with localStorage override support)
// ============================================

function getConfig(): SitioOptionsConfig {
	return getConfigWithPartialOverrides(
		CONFIG_STORAGE_KEYS.SITIO_OPTIONS,
		DEFAULT_SITIO_OPTIONS_CONFIG
	);
}

export function getEthnicityOptions(): string[] {
	return getConfig().ethnicityOptions;
}

export function getReligionOptions(): string[] {
	return getConfig().religionOptions;
}

export function getEmploymentTypeOptions(): string[] {
	return getConfig().employmentTypeOptions;
}

export function getIncomeBracketOptions(): Array<{ label: string; value: string }> {
	return getConfig().incomeBracketOptions;
}

export function getLivestockPoultryOptions(): string[] {
	return getConfig().livestockPoultryOptions;
}

export function getCropOptions(): string[] {
	return getConfig().cropOptions;
}

export function getGardenCommodityOptions(): string[] {
	return getConfig().gardenCommodityOptions;
}

export function getWaterSourceOptions(): string[] {
	return getConfig().waterSourceOptions;
}

export function getWaterStatusOptions(): string[] {
	return getConfig().waterStatusOptions;
}

export function getToiletFacilityTypeOptions(): string[] {
	return getConfig().toiletFacilityTypeOptions;
}

export function getAlternativeElectricitySourceOptions(): string[] {
	return getConfig().alternativeElectricitySourceOptions;
}

export function getHousingQualityOptions(): string[] {
	return getConfig().housingQualityOptions;
}

export function getHousingOwnershipOptions(): string[] {
	return getConfig().housingOwnershipOptions;
}

export function getInfoDisseminationMethodOptions(): string[] {
	return getConfig().infoDisseminationMethodOptions;
}

export function getTransportationMethodOptions(): string[] {
	return getConfig().transportationMethodOptions;
}

export function getLocalOfficialPositionOptions(): string[] {
	return getConfig().localOfficialPositionOptions;
}

export function getRstOfficialPositionOptions(): string[] {
	return getConfig().rstOfficialPositionOptions;
}

// ============================================
// FULL CONFIG ACCESS (for admin config page)
// ============================================

export function getSitioOptionsConfig(): SitioOptionsConfig {
	return getConfig();
}

export function getDefaultSitioOptionsConfig(): SitioOptionsConfig {
	return { ...DEFAULT_SITIO_OPTIONS_CONFIG };
}

export function saveSitioOptionsConfig(
	config: SitioOptionsConfig,
	changeDescription?: string
): boolean {
	return saveConfigOverride(
		CONFIG_STORAGE_KEYS.SITIO_OPTIONS,
		config,
		'sitio-options',
		changeDescription
	);
}

export function resetSitioOptionsConfig(): boolean {
	return resetConfigToDefault(CONFIG_STORAGE_KEYS.SITIO_OPTIONS, 'sitio-options');
}

export function hasSitioOptionsOverride(): boolean {
	return hasConfigOverride(CONFIG_STORAGE_KEYS.SITIO_OPTIONS);
}

// ============================================
// CONVENIENCE EXPORTS
// These are evaluated at module load time and reflect localStorage overrides.
// Values update on page reload after config changes.
// ============================================

export const ethnicityOptions = getEthnicityOptions();
export const religionOptions = getReligionOptions();
export const employmentTypeOptions = getEmploymentTypeOptions();
export const incomeBracketOptions = getIncomeBracketOptions();
export const livestockPoultryOptions = getLivestockPoultryOptions();
export const cropOptions = getCropOptions();
export const gardenCommodityOptions = getGardenCommodityOptions();
export const waterSourceOptions = getWaterSourceOptions();
export const waterStatusOptions = getWaterStatusOptions();
export const toiletFacilityTypeOptions = getToiletFacilityTypeOptions();
export const alternativeElectricitySourceOptions = getAlternativeElectricitySourceOptions();
export const housingQualityOptions = getHousingQualityOptions();
export const housingOwnershipOptions = getHousingOwnershipOptions();
export const infoDisseminationMethodOptions = getInfoDisseminationMethodOptions();
export const transportationMethodOptions = getTransportationMethodOptions();
export const localOfficialPositionOptions = getLocalOfficialPositionOptions();
export const rstOfficialPositionOptions = getRstOfficialPositionOptions();
