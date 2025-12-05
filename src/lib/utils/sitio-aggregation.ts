/**
 * Sitio Aggregation Utilities
 *
 * Functions to compute aggregated metrics from a collection of sitios.
 * Used by the sitios dashboard for overview statistics and charts.
 */

import type { Sitio } from '$lib/types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface AggregatedDemographics {
	totalPopulation: number;
	totalMale: number;
	totalFemale: number;
	malePercentage: number;
	femalePercentage: number;
	age0to14: number;
	age15to64: number;
	age65above: number;
	age0to14Percentage: number;
	age15to64Percentage: number;
	age65abovePercentage: number;
	dependencyRatio: number;
	totalHouseholds: number;
	averageHouseholdSize: number;
}

export interface AggregatedInfrastructure {
	totalHouseholds: number;
	householdsWithElectricity: number;
	electricityCoveragePercent: number;
	totalWaterSystems: number;
	householdsWithoutToilet: number;
	toiletCoveragePercent: number;
	wasteSegregationCount: number;
	wasteSegregationPercent: number;
	housingQualityDistribution: Map<string, number>;
	housingOwnershipDistribution: Map<string, number>;
}

export interface AggregatedSocialServices {
	totalPopulation: number;
	totalHouseholds: number;
	registeredVoters: number;
	voterRegistrationPercent: number;
	philhealthBeneficiaries: number;
	philhealthCoveragePercent: number;
	fourpsBeneficiaries: number;
	fourpsCoveragePercent: number;
	householdsWithBackyardGarden: number;
	backyardGardenPercent: number;
	totalDogs: number;
	totalCats: number;
	dogsVaccinated: number;
	catsVaccinated: number;
	dogVaccinationRate: number;
	catVaccinationRate: number;
}

export interface AggregatedEconomy {
	employmentByType: Map<string, number>;
	incomeBracketDistribution: Map<string, number>;
	livestockFrequency: Map<string, number>; // How many sitios have each livestock type
	livestockList: Array<{ type: string; count: number }>;
}

export interface AggregatedAgriculture {
	totalFarmers: number;
	totalFarmerAssociations: number;
	totalFarmAreaHectares: number;
	topCropsFrequency: Map<string, number>;
	topCropsList: Array<{ crop: string; count: number }>;
}

export interface MunicipalityDistribution {
	municipality: string;
	sitioCount: number;
	population: number;
	households: number;
}

export interface GeographicDistribution {
	byMunicipality: MunicipalityDistribution[];
	totalMunicipalities: number;
	totalBarangays: number;
}

// ============================================================================
// Aggregation Functions
// ============================================================================

/**
 * Aggregate demographic data from sitios
 */
export function aggregateDemographics(sitios: Sitio[]): AggregatedDemographics {
	const totals = sitios.reduce(
		(acc, sitio) => {
			acc.population += sitio.population;
			acc.households += sitio.households;
			acc.male += sitio.demographics.male;
			acc.female += sitio.demographics.female;
			acc.age0to14 += sitio.demographics.age_0_14;
			acc.age15to64 += sitio.demographics.age_15_64;
			acc.age65above += sitio.demographics.age_65_above;
			return acc;
		},
		{
			population: 0,
			households: 0,
			male: 0,
			female: 0,
			age0to14: 0,
			age15to64: 0,
			age65above: 0
		}
	);

	const dependentPopulation = totals.age0to14 + totals.age65above;
	const dependencyRatio = totals.age15to64 > 0 ? (dependentPopulation / totals.age15to64) * 100 : 0;

	return {
		totalPopulation: totals.population,
		totalMale: totals.male,
		totalFemale: totals.female,
		malePercentage: totals.population > 0 ? (totals.male / totals.population) * 100 : 0,
		femalePercentage: totals.population > 0 ? (totals.female / totals.population) * 100 : 0,
		age0to14: totals.age0to14,
		age15to64: totals.age15to64,
		age65above: totals.age65above,
		age0to14Percentage: totals.population > 0 ? (totals.age0to14 / totals.population) * 100 : 0,
		age15to64Percentage: totals.population > 0 ? (totals.age15to64 / totals.population) * 100 : 0,
		age65abovePercentage: totals.population > 0 ? (totals.age65above / totals.population) * 100 : 0,
		dependencyRatio,
		totalHouseholds: totals.households,
		averageHouseholdSize: totals.households > 0 ? totals.population / totals.households : 0
	};
}

/**
 * Aggregate infrastructure data from sitios
 */
export function aggregateInfrastructure(sitios: Sitio[]): AggregatedInfrastructure {
	const housingQuality = new Map<string, number>();
	const housingOwnership = new Map<string, number>();

	const totals = sitios.reduce(
		(acc, sitio) => {
			acc.households += sitio.households;

			if (sitio.utilities) {
				acc.householdsWithElectricity += sitio.utilities.households_with_electricity;
			}

			if (sitio.water_sanitation) {
				acc.waterSystems += sitio.water_sanitation.water_systems_count;
				acc.householdsWithoutToilet += sitio.water_sanitation.households_without_toilet;
				if (sitio.water_sanitation.waste_segregation_practice) {
					acc.wasteSegregationCount += 1;
				}
			}

			// Aggregate housing quality types
			if (sitio.housing?.quality_types) {
				for (const qt of sitio.housing.quality_types) {
					housingQuality.set(qt.type, (housingQuality.get(qt.type) || 0) + qt.count);
				}
			}

			// Aggregate housing ownership types
			if (sitio.housing?.ownership_types) {
				for (const ot of sitio.housing.ownership_types) {
					housingOwnership.set(ot.type, (housingOwnership.get(ot.type) || 0) + ot.count);
				}
			}

			return acc;
		},
		{
			households: 0,
			householdsWithElectricity: 0,
			waterSystems: 0,
			householdsWithoutToilet: 0,
			wasteSegregationCount: 0
		}
	);

	const householdsWithToilet = totals.households - totals.householdsWithoutToilet;

	return {
		totalHouseholds: totals.households,
		householdsWithElectricity: totals.householdsWithElectricity,
		electricityCoveragePercent:
			totals.households > 0 ? (totals.householdsWithElectricity / totals.households) * 100 : 0,
		totalWaterSystems: totals.waterSystems,
		householdsWithoutToilet: totals.householdsWithoutToilet,
		toiletCoveragePercent:
			totals.households > 0 ? (householdsWithToilet / totals.households) * 100 : 0,
		wasteSegregationCount: totals.wasteSegregationCount,
		wasteSegregationPercent:
			sitios.length > 0 ? (totals.wasteSegregationCount / sitios.length) * 100 : 0,
		housingQualityDistribution: housingQuality,
		housingOwnershipDistribution: housingOwnership
	};
}

/**
 * Aggregate social services data from sitios
 */
export function aggregateSocialServices(sitios: Sitio[]): AggregatedSocialServices {
	const totals = sitios.reduce(
		(acc, sitio) => {
			acc.population += sitio.population;
			acc.households += sitio.households;

			if (sitio.social_services) {
				acc.registeredVoters += sitio.social_services.registered_voters;
				acc.philhealthBeneficiaries += sitio.social_services.philhealth_beneficiaries;
				acc.fourpsBeneficiaries += sitio.social_services.fourps_beneficiaries;
			}

			if (sitio.food_security) {
				acc.householdsWithBackyardGarden += sitio.food_security.households_with_backyard_garden;
			}

			if (sitio.domestic_animals) {
				acc.dogs += sitio.domestic_animals.dogs;
				acc.cats += sitio.domestic_animals.cats;
				acc.dogsVaccinated += sitio.domestic_animals.dogs_vaccinated;
				acc.catsVaccinated += sitio.domestic_animals.cats_vaccinated;
			}

			return acc;
		},
		{
			population: 0,
			households: 0,
			registeredVoters: 0,
			philhealthBeneficiaries: 0,
			fourpsBeneficiaries: 0,
			householdsWithBackyardGarden: 0,
			dogs: 0,
			cats: 0,
			dogsVaccinated: 0,
			catsVaccinated: 0
		}
	);

	// Estimate voting age population (15-64 + 65+)
	const votingAgePopulation = sitios.reduce(
		(sum, s) => sum + s.demographics.age_15_64 + s.demographics.age_65_above,
		0
	);

	return {
		totalPopulation: totals.population,
		totalHouseholds: totals.households,
		registeredVoters: totals.registeredVoters,
		voterRegistrationPercent:
			votingAgePopulation > 0
				? Math.min(100, (totals.registeredVoters / votingAgePopulation) * 100)
				: 0,
		philhealthBeneficiaries: totals.philhealthBeneficiaries,
		philhealthCoveragePercent:
			totals.population > 0 ? (totals.philhealthBeneficiaries / totals.population) * 100 : 0,
		fourpsBeneficiaries: totals.fourpsBeneficiaries,
		fourpsCoveragePercent:
			totals.households > 0 ? (totals.fourpsBeneficiaries / totals.households) * 100 : 0,
		householdsWithBackyardGarden: totals.householdsWithBackyardGarden,
		backyardGardenPercent:
			totals.households > 0 ? (totals.householdsWithBackyardGarden / totals.households) * 100 : 0,
		totalDogs: totals.dogs,
		totalCats: totals.cats,
		dogsVaccinated: totals.dogsVaccinated,
		catsVaccinated: totals.catsVaccinated,
		dogVaccinationRate: totals.dogs > 0 ? (totals.dogsVaccinated / totals.dogs) * 100 : 0,
		catVaccinationRate: totals.cats > 0 ? (totals.catsVaccinated / totals.cats) * 100 : 0
	};
}

/**
 * Aggregate economic data from sitios
 */
export function aggregateEconomy(sitios: Sitio[]): AggregatedEconomy {
	const employmentByType = new Map<string, number>();
	const incomeBrackets = new Map<string, number>();
	const livestockFrequency = new Map<string, number>();

	for (const sitio of sitios) {
		// Employment types
		if (sitio.economic_condition?.employments) {
			for (const emp of sitio.economic_condition.employments) {
				employmentByType.set(emp.type, (employmentByType.get(emp.type) || 0) + emp.count);
			}
		}

		// Income brackets
		if (sitio.economic_condition?.income_brackets) {
			for (const bracket of sitio.economic_condition.income_brackets) {
				incomeBrackets.set(
					bracket.bracket,
					(incomeBrackets.get(bracket.bracket) || 0) + bracket.households
				);
			}
		}

		// Livestock - count frequency across sitios
		if (sitio.livestock_poultry && sitio.livestock_poultry.length > 0) {
			for (const animal of sitio.livestock_poultry) {
				livestockFrequency.set(animal, (livestockFrequency.get(animal) || 0) + 1);
			}
		}
	}

	// Convert livestock frequency map to sorted list
	const livestockList = Array.from(livestockFrequency.entries())
		.map(([type, count]) => ({ type, count }))
		.sort((a, b) => b.count - a.count);

	return {
		employmentByType,
		incomeBracketDistribution: incomeBrackets,
		livestockFrequency,
		livestockList
	};
}

/**
 * Aggregate agriculture data from sitios
 */
export function aggregateAgriculture(sitios: Sitio[]): AggregatedAgriculture {
	const cropFrequency = new Map<string, number>();

	const totals = sitios.reduce(
		(acc, sitio) => {
			if (sitio.agriculture) {
				acc.farmers += sitio.agriculture.farmers_count;
				acc.farmerAssociations += sitio.agriculture.farmer_associations;
				acc.farmArea += sitio.agriculture.farm_area_hectares;

				// Count crop occurrences
				for (const crop of sitio.agriculture.top_crops) {
					cropFrequency.set(crop, (cropFrequency.get(crop) || 0) + 1);
				}
			}
			return acc;
		},
		{ farmers: 0, farmerAssociations: 0, farmArea: 0 }
	);

	// Sort crops by frequency
	const topCropsList = Array.from(cropFrequency.entries())
		.map(([crop, count]) => ({ crop, count }))
		.sort((a, b) => b.count - a.count);

	return {
		totalFarmers: totals.farmers,
		totalFarmerAssociations: totals.farmerAssociations,
		totalFarmAreaHectares: totals.farmArea,
		topCropsFrequency: cropFrequency,
		topCropsList
	};
}

/**
 * Get geographic distribution of sitios by municipality
 */
export function getGeographicDistribution(sitios: Sitio[]): GeographicDistribution {
	const municipalityMap = new Map<
		string,
		{ sitioCount: number; population: number; households: number }
	>();
	const barangaySet = new Set<string>();

	for (const sitio of sitios) {
		const current = municipalityMap.get(sitio.municipality) || {
			sitioCount: 0,
			population: 0,
			households: 0
		};
		current.sitioCount += 1;
		current.population += sitio.population;
		current.households += sitio.households;
		municipalityMap.set(sitio.municipality, current);

		// Track unique barangays
		barangaySet.add(`${sitio.municipality}-${sitio.barangay}`);
	}

	const byMunicipality: MunicipalityDistribution[] = Array.from(municipalityMap.entries())
		.map(([municipality, data]) => ({
			municipality,
			sitioCount: data.sitioCount,
			population: data.population,
			households: data.households
		}))
		.sort((a, b) => b.population - a.population);

	return {
		byMunicipality,
		totalMunicipalities: municipalityMap.size,
		totalBarangays: barangaySet.size
	};
}

// ============================================================================
// Helper Functions for Chart Data
// ============================================================================

/**
 * Convert demographics to gender chart data
 */
export function toGenderChartData(demographics: AggregatedDemographics) {
	return [
		{ label: 'Male', value: demographics.totalMale, color: 'hsl(217, 91%, 60%)' },
		{ label: 'Female', value: demographics.totalFemale, color: 'hsl(330, 81%, 60%)' }
	];
}

/**
 * Convert demographics to age distribution chart data
 */
export function toAgeChartData(demographics: AggregatedDemographics) {
	return [
		{ label: 'Children (0-14)', value: demographics.age0to14, color: 'hsl(217, 91%, 60%)' },
		{ label: 'Working Age (15-64)', value: demographics.age15to64, color: 'hsl(142, 71%, 45%)' },
		{ label: 'Seniors (65+)', value: demographics.age65above, color: 'hsl(24, 95%, 53%)' }
	];
}

/**
 * Convert demographics to population pyramid data
 */
export function toPopulationPyramidData(demographics: AggregatedDemographics) {
	const maleRatio =
		demographics.totalPopulation > 0 ? demographics.totalMale / demographics.totalPopulation : 0.5;
	const femaleRatio = 1 - maleRatio;

	return [
		{
			ageGroup: '65+',
			male: Math.round(demographics.age65above * maleRatio),
			female: Math.round(demographics.age65above * femaleRatio)
		},
		{
			ageGroup: '15-64',
			male: Math.round(demographics.age15to64 * maleRatio),
			female: Math.round(demographics.age15to64 * femaleRatio)
		},
		{
			ageGroup: '0-14',
			male: Math.round(demographics.age0to14 * maleRatio),
			female: Math.round(demographics.age0to14 * femaleRatio)
		}
	];
}

/**
 * Convert infrastructure to utilities radar chart data
 */
export function toUtilitiesRadarData(infrastructure: AggregatedInfrastructure) {
	// Estimate water access based on water systems (rough approximation)
	const waterAccessPercent = Math.min(
		100,
		infrastructure.totalWaterSystems > 0 ? infrastructure.totalWaterSystems * 10 : 0
	);

	return [
		{ label: 'Electricity', value: infrastructure.electricityCoveragePercent },
		{ label: 'Water Access', value: waterAccessPercent },
		{ label: 'Sanitary Toilet', value: infrastructure.toiletCoveragePercent }
	];
}

/**
 * Convert Map to array for chart consumption
 */
export function mapToChartData(
	map: Map<string, number>,
	colors?: string[]
): Array<{ label: string; value: number; color: string }> {
	const defaultColors = [
		'hsl(217, 91%, 60%)',
		'hsl(142, 71%, 45%)',
		'hsl(24, 95%, 53%)',
		'hsl(262, 83%, 58%)',
		'hsl(189, 85%, 45%)',
		'hsl(330, 81%, 60%)',
		'hsl(45, 93%, 47%)',
		'hsl(0, 84%, 60%)'
	];

	return Array.from(map.entries()).map(([label, value], i) => ({
		label,
		value,
		color: colors?.[i] ?? defaultColors[i % defaultColors.length]
	}));
}

/**
 * Convert geographic distribution to bar chart data
 */
export function toMunicipalityBarData(
	geo: GeographicDistribution,
	metric: 'population' | 'sitioCount' | 'households' = 'population'
) {
	return geo.byMunicipality.map((m, i) => ({
		label: m.municipality,
		value: m[metric],
		color: [
			'hsl(217, 91%, 60%)',
			'hsl(142, 71%, 45%)',
			'hsl(24, 95%, 53%)',
			'hsl(262, 83%, 58%)',
			'hsl(189, 85%, 45%)',
			'hsl(330, 81%, 60%)',
			'hsl(45, 93%, 47%)',
			'hsl(0, 84%, 60%)'
		][i % 8]
	}));
}
