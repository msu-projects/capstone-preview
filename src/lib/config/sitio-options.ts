/**
 * Sitio Form Options
 *
 * Centralized constants for all dropdown/combobox options used in sitio forms.
 * Edit these arrays to add, remove, or modify available options.
 */

// ============================================
// Demographics & Social Tab Options
// ============================================

/** Ethnic groups commonly found in the region */
export const ethnicityOptions = [
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
export const religionOptions = [
	'Roman Catholic',
	'Alliance',
	'Baptist',
	'Iglesia ni Cristo',
	'Islam',
	'Seventh Day Adventist',
	"Jehovah's Witness"
];

// ============================================
// Livelihoods & Economy Tab Options
// ============================================

/** Common employment types in rural areas */
export const employmentTypeOptions = [
	'Vendor',
	'Laborer',
	'Farmer',
	'Tricycle Driver',
	'Construction Worker',
	'Charcoal Maker'
];

/** Daily income brackets in Philippine Peso */
export const incomeBracketOptions = [
	{ label: 'Below ₱100', value: '<=100' },
	{ label: '₱101 - ₱300', value: '100-300' },
	{ label: '₱301 - ₱500', value: '300-500' },
	{ label: 'Above ₱500', value: '>=500' }
] as const;

/** Livestock and poultry options */
export const livestockPoultryOptions = [
	'Pigs',
	'Cows',
	'Carabaos',
	'Horses',
	'Goats',
	'Chickens',
	'Ducks'
];

/** Major agricultural crops */
export const cropOptions = [
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
export const gardenCommodityOptions = [
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

// ============================================
// Infrastructure & Housing Tab Options
// ============================================

/** Water source types */
export const waterSourceOptions = [
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
export const waterStatusOptions = [
	'Good',
	'Needs Repair',
	'Rehabilitation',
	'Not Functioning',
	'Private'
];

/** Toilet facility types */
export const toiletFacilityTypeOptions = ['Water Sealed', 'Open Pit', 'Pour Flush', 'Composting'];

/** Alternative electricity sources */
export const alternativeElectricitySourceOptions = ['Solar', 'Generator', 'Battery'];

/** Housing quality/material types */
export const housingQualityOptions = ['Concrete', 'Wood', 'Half-Concrete', 'Makeshift'];

/** Housing ownership types */
export const housingOwnershipOptions = [
	'Owned',
	'Rented',
	'Protected Land',
	'Informal Settler',
	'Owner Consent'
];

// ============================================
// Community Services Tab Options
// ============================================

/** Information dissemination methods */
export const infoDisseminationMethodOptions = [
	'Radio',
	'Signages',
	'Person in Authority',
	'Assembly',
	'Newspaper',
	'TV',
	'Internet/Social Media'
];

/** Transportation methods available in the area */
export const transportationMethodOptions = ['Motorcycle', 'Tricycle', '4-Wheels', 'Boat'];

/** Local sitio official positions */
export const localOfficialPositionOptions = [
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
export const rstOfficialPositionOptions = [
	'Team Leader',
	'Assistant Team Leader',
	'Secretary',
	'Member'
];
