import type { Sitio } from '$lib/types';

// Auto-generated from SC CATCH-UP 2025 DATABANK - MSU - MASTER.csv
// Generated on: 2025-11-22T04:35:10.882Z

export const csvSitiosData: Sitio[] = [
	{
		id: 1,
		name: 'PROPER LAMPACO',
		municipality: 'BANGA',
		barangay: 'LIWANAY',
		province: 'South Cotabato',
		population: 412,
		households: 92,
		coordinates: {
			lat: 6.304206797637232,
			lng: 125.05636408488827
		},
		coding: {
			number: '1',
			code: '1-1'
		},
		demographics: {
			male: 224,
			female: 188,
			total: 412,
			age_0_14: 188,
			age_15_64: 224,
			age_65_above: 22
		},
		social_services: {
			registered_voters: 208,
			philhealth_beneficiaries: 0,
			fourps_beneficiaries: 16
		},
		economic_condition: {
			employments: [
				{ type: 'Vendor', count: 35 },
				{ type: 'Farmer', count: 30 },
				{ type: 'Tricycle Driver', count: 15 },
				{ type: 'Laborer', count: 12 }
			],
			income_brackets: [
				{ bracket: '<=100', households: 40 },
				{ bracket: '100-300', households: 30 },
				{ bracket: '300-500', households: 15 },
				{ bracket: '>=500', households: 7 }
			]
		},
		agriculture: {
			farmers_count: 0,
			farmer_associations: 0,
			farm_area_hectares: 56,
			top_crops: ['RICE', 'COCONUT', 'CORN', 'PINEAPPLE', 'FRUIT TREES']
		},
		water_sanitation: {
			water_systems_count: 0,
			water_sources: [{ source: 'DEEP WELL' }],
			households_without_toilet: 12,
			toilet_facility_types: ['Water Sealed'],
			waste_segregation_practice: true
		},
		food_security: {
			households_with_backyard_garden: 70,
			common_garden_commodities: ['Vegetables']
		},
		housing: {
			quality_types: ['Concrete', 'Wood', 'Half-Concrete'],
			ownership_types: ['Owned', 'Informal Settler']
		},
		domestic_animals: {
			total_count: 91,
			dogs: 56,
			cats: 35,
			dogs_vaccinated: 40,
			cats_vaccinated: 35
		},
		community_empowerment: {
			sectoral_organizations: 3,
			info_dissemination_methods: ['Person in Authority', 'Assembly'],
			transportation_methods: ['Bike', 'Motorcycle', 'Tricycle']
		},
		utilities: {
			households_with_electricity: 77,
			alternative_electricity_sources: []
		},
		created_at: '2025-01-01',
		updated_at: '2025-01-01'
	}
];
