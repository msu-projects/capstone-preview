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

/** Livestock types with display info */
export const livestockTypes = [
	{ id: 'pigs', label: 'Pigs', icon: '🐷' },
	{ id: 'cows', label: 'Cows', icon: '🐄' },
	{ id: 'carabaos', label: 'Carabaos', icon: '🦬' },
	{ id: 'horses', label: 'Horses', icon: '🐴' },
	{ id: 'goats', label: 'Goats', icon: '🐐' },
	{ id: 'chickens', label: 'Chickens', icon: '🐔' },
	{ id: 'ducks', label: 'Ducks', icon: '🦆' }
] as const;

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
