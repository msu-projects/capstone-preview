import type { Sitio } from './index';

/**
 * A snapshot of sitio data for a specific year.
 * This captures all the data that can change year-over-year.
 */
export interface SitioYearlySnapshot {
	year: number;
	sitio_id: number;
	recorded_at: string; // ISO date string

	// Core demographic data
	population: number;
	households: number;

	// Demographics
	demographics: {
		male: number;
		female: number;
		total: number;
		age_0_14: number;
		age_15_64: number;
		age_65_above: number;
	};

	// Social services
	social_services?: {
		registered_voters: number;
		philhealth_beneficiaries: number;
		fourps_beneficiaries: number;
	};

	// Economic condition
	economic_condition?: {
		employments: Array<{ type: string; count: number }>;
		income_brackets: Array<{ bracket: string; households: number }>;
	};

	// Agriculture
	agriculture?: {
		farmers_count: number;
		farmer_associations: number;
		farm_area_hectares: number;
		top_crops: string[];
	};

	// Water and sanitation
	water_sanitation?: {
		water_systems_count: number;
		water_sources: Array<{ source: string; status: string }>;
		households_without_toilet: number;
		toilet_facility_types: string[];
		waste_segregation_practice: boolean | null;
	};

	// Livestock and poultry
	livestock_poultry?: {
		pigs?: number;
		cows?: number;
		carabaos?: number;
		horses?: number;
		goats?: number;
		chickens?: number;
		ducks?: number;
	};

	// Food security
	food_security?: {
		households_with_backyard_garden: number;
		common_garden_commodities: string[];
	};

	// Housing
	housing?: {
		quality_types: Array<{ type: string; count: number }>;
		ownership_types: Array<{ type: string; count: number }>;
	};

	// Domestic animals
	domestic_animals?: {
		total_count: number;
		dogs: number;
		cats: number;
		dogs_vaccinated: number;
		cats_vaccinated: number;
	};

	// Community empowerment
	community_empowerment?: {
		sectoral_organizations: number;
		info_dissemination_methods: string[];
		transportation_methods: string[];
	};

	// Utilities
	utilities?: {
		households_with_electricity: number;
		alternative_electricity_sources: string[];
	};
}

/**
 * Data comparing two years for trend visualization
 */
export interface YearlyComparison {
	metric: string;
	currentValue: number;
	previousValue: number;
	change: number;
	changePercent: number;
	trend: 'up' | 'down' | 'stable';
}

/**
 * Summary of all yearly snapshots for a sitio
 */
export interface SitioYearlyHistory {
	sitio_id: number;
	years: number[];
	snapshots: Map<number, SitioYearlySnapshot>;
}

/**
 * Create a yearly snapshot from a Sitio object
 */
export function createSnapshotFromSitio(sitio: Sitio, year: number): SitioYearlySnapshot {
	return {
		year,
		sitio_id: sitio.id,
		recorded_at: new Date().toISOString(),
		population: sitio.population,
		households: sitio.households,
		demographics: { ...sitio.demographics },
		social_services: sitio.social_services ? { ...sitio.social_services } : undefined,
		economic_condition: sitio.economic_condition
			? {
					employments: sitio.economic_condition.employments?.map((e) => ({ ...e })) || [],
					income_brackets: sitio.economic_condition.income_brackets?.map((i) => ({ ...i })) || []
				}
			: undefined,
		agriculture: sitio.agriculture ? { ...sitio.agriculture } : undefined,
		water_sanitation: sitio.water_sanitation
			? {
					...sitio.water_sanitation,
					water_sources: sitio.water_sanitation.water_sources?.map((w) => ({ ...w })) || []
				}
			: undefined,
		livestock_poultry: sitio.livestock_poultry ? { ...sitio.livestock_poultry } : undefined,
		food_security: sitio.food_security ? { ...sitio.food_security } : undefined,
		housing: sitio.housing
			? {
					quality_types: sitio.housing.quality_types?.map((h) => ({ ...h })) || [],
					ownership_types: sitio.housing.ownership_types?.map((h) => ({ ...h })) || []
				}
			: undefined,
		domestic_animals: sitio.domestic_animals ? { ...sitio.domestic_animals } : undefined,
		community_empowerment: sitio.community_empowerment
			? { ...sitio.community_empowerment }
			: undefined,
		utilities: sitio.utilities ? { ...sitio.utilities } : undefined
	};
}

/**
 * Apply a yearly snapshot to update a Sitio object
 */
export function applySitioSnapshot(sitio: Sitio, snapshot: SitioYearlySnapshot): Sitio {
	return {
		...sitio,
		population: snapshot.population,
		households: snapshot.households,
		demographics: { ...snapshot.demographics },
		social_services: snapshot.social_services ? { ...snapshot.social_services } : undefined,
		economic_condition: snapshot.economic_condition
			? {
					employments: snapshot.economic_condition.employments?.map((e) => ({ ...e })) || [],
					income_brackets: snapshot.economic_condition.income_brackets?.map((i) => ({ ...i })) || []
				}
			: undefined,
		agriculture: snapshot.agriculture ? { ...snapshot.agriculture } : undefined,
		water_sanitation: snapshot.water_sanitation
			? {
					...snapshot.water_sanitation,
					water_sources: snapshot.water_sanitation.water_sources?.map((w) => ({ ...w })) || []
				}
			: undefined,
		livestock_poultry: snapshot.livestock_poultry ? { ...snapshot.livestock_poultry } : undefined,
		food_security: snapshot.food_security ? { ...snapshot.food_security } : undefined,
		housing: snapshot.housing
			? {
					quality_types: snapshot.housing.quality_types?.map((h) => ({ ...h })) || [],
					ownership_types: snapshot.housing.ownership_types?.map((h) => ({ ...h })) || []
				}
			: undefined,
		domestic_animals: snapshot.domestic_animals ? { ...snapshot.domestic_animals } : undefined,
		community_empowerment: snapshot.community_empowerment
			? { ...snapshot.community_empowerment }
			: undefined,
		utilities: snapshot.utilities ? { ...snapshot.utilities } : undefined,
		updated_at: new Date().toISOString()
	};
}

/**
 * Calculate the comparison between two values
 */
export function calculateComparison(
	metric: string,
	currentValue: number,
	previousValue: number
): YearlyComparison {
	const change = currentValue - previousValue;
	const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
	const trend: 'up' | 'down' | 'stable' =
		Math.abs(changePercent) < 1 ? 'stable' : change > 0 ? 'up' : 'down';

	return {
		metric,
		currentValue,
		previousValue,
		change,
		changePercent,
		trend
	};
}

/**
 * Get key metrics comparisons between two snapshots
 */
export function getKeyMetricsComparison(
	current: SitioYearlySnapshot,
	previous: SitioYearlySnapshot
): YearlyComparison[] {
	const comparisons: YearlyComparison[] = [];

	// Population
	comparisons.push(calculateComparison('Population', current.population, previous.population));

	// Households
	comparisons.push(calculateComparison('Households', current.households, previous.households));

	// PhilHealth beneficiaries
	if (current.social_services && previous.social_services) {
		comparisons.push(
			calculateComparison(
				'PhilHealth Beneficiaries',
				current.social_services.philhealth_beneficiaries,
				previous.social_services.philhealth_beneficiaries
			)
		);
	}

	// 4Ps beneficiaries
	if (current.social_services && previous.social_services) {
		comparisons.push(
			calculateComparison(
				'4Ps Beneficiaries',
				current.social_services.fourps_beneficiaries,
				previous.social_services.fourps_beneficiaries
			)
		);
	}

	// Electricity coverage
	if (current.utilities && previous.utilities) {
		comparisons.push(
			calculateComparison(
				'Electricity Access',
				current.utilities.households_with_electricity,
				previous.utilities.households_with_electricity
			)
		);
	}

	// Farmers count
	if (current.agriculture && previous.agriculture) {
		comparisons.push(
			calculateComparison(
				'Farmers',
				current.agriculture.farmers_count,
				previous.agriculture.farmers_count
			)
		);
	}

	return comparisons;
}
