import { z } from 'zod';
import { type Sitio } from './index';

// ===== ZOD SCHEMAS =====

const DemographicsSchema = z.object({
	male: z.number().int().nonnegative(),
	female: z.number().int().nonnegative(),
	total: z.number().int().nonnegative(),
	age_0_14: z.number().int().nonnegative(),
	age_15_64: z.number().int().nonnegative(),
	age_65_above: z.number().int().nonnegative()
});

const SocialServicesSchema = z.object({
	registered_voters: z.number().int().nonnegative(),
	philhealth_beneficiaries: z.number().int().nonnegative(),
	fourps_beneficiaries: z.number().int().nonnegative()
});

const EconomicConditionSchema = z.object({
	employments: z.array(z.string()),
	income_brackets: z.array(z.string())
});

const AgricultureSchema = z.object({
	farmers_count: z.number().int().nonnegative(),
	farmer_associations: z.number().int().nonnegative(),
	farm_area_hectares: z.number().nonnegative(),
	top_crops: z.array(z.string())
});

const WaterSourceSchema = z.object({
	source: z.string(),
	status: z.string()
});

const WaterSanitationSchema = z.object({
	water_systems_count: z.number().int().nonnegative(),
	water_sources: z.array(WaterSourceSchema),
	households_without_toilet: z.number().int().nonnegative(),
	toilet_facility_types: z.array(z.string()),
	waste_segregation_practice: z.boolean().nullable()
});

const FoodSecuritySchema = z.object({
	households_with_backyard_garden: z.number().int().nonnegative(),
	common_garden_commodities: z.array(z.string())
});

const TypeCountSchema = z.object({
	type: z.string(),
	count: z.number().int().nonnegative()
});

const HousingSchema = z.object({
	quality_types: z.array(TypeCountSchema),
	ownership_types: z.array(TypeCountSchema)
});

const DomesticAnimalsSchema = z.object({
	dogs: z.number().int().nonnegative(),
	cats: z.number().int().nonnegative(),
	dogs_vaccinated: z.number().int().nonnegative(),
	cats_vaccinated: z.number().int().nonnegative()
});

const CommunityEmpowermentSchema = z.object({
	sectoral_organizations: z.number().int().nonnegative(),
	info_dissemination_methods: z.array(z.string()),
	transportation_methods: z.array(z.string())
});

const UtilitiesSchema = z.object({
	households_with_electricity: z.number().int().nonnegative(),
	alternative_electricity_sources: z.array(z.string())
});

const OfficialSchema = z.object({
	name: z.string(),
	position: z.string()
});

const SitioIssueSchema = z.object({
	id: z.string(),
	name: z.string(),
	category: z.string(),
	isCustom: z.boolean().optional(),
	linkedPPAIds: z.array(z.string()).optional()
});

const SitioPPASchema = z.object({
	id: z.string(),
	name: z.string(),
	category: z.string(),
	isCustom: z.boolean().optional(),
	linkedIssueIds: z.array(z.string()).optional(),
	projectTypeId: z.number().optional()
});

const NeedLevelSchema = z.enum(['critical', 'high', 'medium', 'low']);

/**
 * Zod schema for SitioYearlySnapshot validation
 */
export const SitioYearlySnapshotSchema = z.object({
	year: z.number().int().min(2000).max(2100),
	sitio_id: z.number().int().positive(),
	recorded_at: z.string().datetime({ offset: true }).or(z.string().datetime()),

	// Core demographic data
	population: z.number().int().nonnegative(),
	households: z.number().int().nonnegative(),

	// Demographics
	demographics: DemographicsSchema,

	// Need assessment (yearly tracking)
	need_score: z.number().int().min(1).max(10),
	need_level: NeedLevelSchema,

	// Optional sections
	social_services: SocialServicesSchema.optional(),
	economic_condition: EconomicConditionSchema.optional(),
	agriculture: AgricultureSchema.optional(),
	water_sanitation: WaterSanitationSchema.optional(),
	livestock_poultry: z.array(z.string()).optional(),
	food_security: FoodSecuritySchema.optional(),
	housing: HousingSchema.optional(),
	domestic_animals: DomesticAnimalsSchema.optional(),
	community_empowerment: CommunityEmpowermentSchema.optional(),
	utilities: UtilitiesSchema.optional(),

	// Cultural and religious demographics (can change over time)
	ethnicities: z.array(z.string()).optional(),
	religions: z.array(z.string()).optional(),

	// Officials (term-based, changes over years)
	local_officials: z.array(OfficialSchema).optional(),
	rst_officials: z.array(OfficialSchema).optional(),

	// Priority tracking (changes yearly based on needs assessment)
	issues_concerns: z.array(SitioIssueSchema).optional(),
	proposed_ppas: z.array(SitioPPASchema).optional()
});

/**
 * A snapshot of sitio data for a specific year.
 * This captures all the data that can change year-over-year.
 */
export type SitioYearlySnapshot = z.infer<typeof SitioYearlySnapshotSchema>;

/**
 * Validate a snapshot object against the schema
 * @param data The data to validate
 * @returns Validated snapshot or throws ZodError
 */
export function validateSnapshot(data: unknown): SitioYearlySnapshot {
	return SitioYearlySnapshotSchema.parse(data);
}

/**
 * Safely validate a snapshot object against the schema
 * @param data The data to validate
 * @returns Result object with success flag and data or error
 */
export function safeValidateSnapshot(data: unknown) {
	return SitioYearlySnapshotSchema.safeParse(data);
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

		// Need assessment
		need_score: sitio.need_score,
		need_level: sitio.need_level,

		// Optional data sections
		social_services: sitio.social_services ? { ...sitio.social_services } : undefined,
		economic_condition: sitio.economic_condition
			? {
					employments: sitio.economic_condition.employments
						? [...sitio.economic_condition.employments]
						: [],
					income_brackets: sitio.economic_condition.income_brackets
						? [...sitio.economic_condition.income_brackets]
						: []
				}
			: undefined,
		agriculture: sitio.agriculture
			? {
					...sitio.agriculture,
					top_crops: [...sitio.agriculture.top_crops]
				}
			: undefined,
		water_sanitation: sitio.water_sanitation
			? {
					...sitio.water_sanitation,
					water_sources: sitio.water_sanitation.water_sources?.map((w) => ({ ...w })) || [],
					toilet_facility_types: [...(sitio.water_sanitation.toilet_facility_types || [])]
				}
			: undefined,
		livestock_poultry: sitio.livestock_poultry ? [...sitio.livestock_poultry] : undefined,
		food_security: sitio.food_security
			? {
					...sitio.food_security,
					common_garden_commodities: [...(sitio.food_security.common_garden_commodities || [])]
				}
			: undefined,
		housing: sitio.housing
			? {
					quality_types: sitio.housing.quality_types?.map((h) => ({ ...h })) || [],
					ownership_types: sitio.housing.ownership_types?.map((h) => ({ ...h })) || []
				}
			: undefined,
		domestic_animals: sitio.domestic_animals ? { ...sitio.domestic_animals } : undefined,
		community_empowerment: sitio.community_empowerment
			? {
					...sitio.community_empowerment,
					info_dissemination_methods: [
						...(sitio.community_empowerment.info_dissemination_methods || [])
					],
					transportation_methods: [...(sitio.community_empowerment.transportation_methods || [])]
				}
			: undefined,
		utilities: sitio.utilities
			? {
					...sitio.utilities,
					alternative_electricity_sources: [
						...(sitio.utilities.alternative_electricity_sources || [])
					]
				}
			: undefined,

		// Cultural demographics (deep copy arrays)
		ethnicities: sitio.ethnicities ? [...sitio.ethnicities] : undefined,
		religions: sitio.religions ? [...sitio.religions] : undefined,

		// Officials (deep copy objects in arrays)
		local_officials: sitio.local_officials?.map((o) => ({ ...o })),
		rst_officials: sitio.rst_officials?.map((o) => ({ ...o })),

		// Priority tracking (deep copy structured data)
		issues_concerns: sitio.issues_concerns?.map((i) => ({
			...i,
			linkedPPAIds: i.linkedPPAIds ? [...i.linkedPPAIds] : undefined
		})),
		proposed_ppas: sitio.proposed_ppas?.map((p) => ({
			...p,
			linkedIssueIds: p.linkedIssueIds ? [...p.linkedIssueIds] : undefined
		}))
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

		// Need assessment
		need_score: snapshot.need_score,
		need_level: snapshot.need_level,

		// Optional data sections
		social_services: snapshot.social_services ? { ...snapshot.social_services } : undefined,
		economic_condition: snapshot.economic_condition
			? {
					employments: snapshot.economic_condition.employments
						? [...snapshot.economic_condition.employments]
						: [],
					income_brackets: snapshot.economic_condition.income_brackets
						? [...snapshot.economic_condition.income_brackets]
						: []
				}
			: undefined,
		agriculture: snapshot.agriculture
			? {
					...snapshot.agriculture,
					top_crops: [...snapshot.agriculture.top_crops]
				}
			: undefined,
		water_sanitation: snapshot.water_sanitation
			? {
					...snapshot.water_sanitation,
					water_sources: snapshot.water_sanitation.water_sources?.map((w) => ({ ...w })) || [],
					toilet_facility_types: [...(snapshot.water_sanitation.toilet_facility_types || [])]
				}
			: undefined,
		livestock_poultry: snapshot.livestock_poultry ? [...snapshot.livestock_poultry] : undefined,
		food_security: snapshot.food_security
			? {
					...snapshot.food_security,
					common_garden_commodities: [...(snapshot.food_security.common_garden_commodities || [])]
				}
			: undefined,
		housing: snapshot.housing
			? {
					quality_types: snapshot.housing.quality_types?.map((h) => ({ ...h })) || [],
					ownership_types: snapshot.housing.ownership_types?.map((h) => ({ ...h })) || []
				}
			: undefined,
		domestic_animals: snapshot.domestic_animals ? { ...snapshot.domestic_animals } : undefined,
		community_empowerment: snapshot.community_empowerment
			? {
					...snapshot.community_empowerment,
					info_dissemination_methods: [
						...(snapshot.community_empowerment.info_dissemination_methods || [])
					],
					transportation_methods: [...(snapshot.community_empowerment.transportation_methods || [])]
				}
			: undefined,
		utilities: snapshot.utilities
			? {
					...snapshot.utilities,
					alternative_electricity_sources: [
						...(snapshot.utilities.alternative_electricity_sources || [])
					]
				}
			: undefined,

		// Cultural demographics
		ethnicities: snapshot.ethnicities ? [...snapshot.ethnicities] : undefined,
		religions: snapshot.religions ? [...snapshot.religions] : undefined,

		// Officials
		local_officials: snapshot.local_officials?.map((o) => ({ ...o })),
		rst_officials: snapshot.rst_officials?.map((o) => ({ ...o })),

		// Priority tracking
		issues_concerns: snapshot.issues_concerns?.map((i) => ({
			...i,
			linkedPPAIds: i.linkedPPAIds ? [...i.linkedPPAIds] : undefined
		})),
		proposed_ppas: snapshot.proposed_ppas?.map((p) => ({
			...p,
			linkedIssueIds: p.linkedIssueIds ? [...p.linkedIssueIds] : undefined
		})),

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
