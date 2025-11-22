/**
 * Location data extracted from SC CATCH-UP 2025 DATABANK
 * Municipalities and Barangays in South Cotabato
 */

export interface MunicipalityData {
	name: string;
	barangays: string[];
}

export const MUNICIPALITIES_DATA: MunicipalityData[] = [
	{
		name: 'BANGA',
		barangays: [
			'LIWANAY',
			'RANG-AY',
			'EL NONOK',
			'YANGCO',
			'RIZAL POB.',
			'MALAYA',
			'KUSAN',
			'SAN VICENTE',
			'REYES',
			'CINCO',
			'CABULING',
			'SAN JOSE',
			'LAMBA',
			'BENITEZ',
			'CABUDIAN',
			'RIZAL 3',
			'PUNONG GRANDE',
			'LAM-APOS',
			'IMPROGO'
		]
	},
	{
		name: 'KORONADAL',
		barangays: []
	},
	{
		name: 'LAKE SEBU',
		barangays: [
			'BACDULONG',
			'TASIMAN',
			'LUHIB',
			'LAKE LAHIT',
			'LOWER MACULAN',
			'HALILAN',
			'DENLAG',
			'LAMFUGON',
			'UPPER MACULAN',
			'NED',
			'LAMCADE'
		]
	},
	{
		name: 'NORALA',
		barangays: ['SAN MIGUEL', 'LOPEZ JAENA', 'PUTI', 'LAPUZ', 'DUMAGUIL', 'TINAGO']
	},
	{
		name: 'POLOMOLOK',
		barangays: [
			'KORONADAL PROPER',
			'LAPU',
			'SUMBAKIL',
			'MAGSAYSAY',
			'MALIGO',
			'KINILIS',
			'POLO',
			'CROSSING PALKAN',
			'LUMAKIL',
			'BENTUNG'
		]
	},
	{
		name: 'STO. NIÑO',
		barangays: ['PANAY', 'AMBALGAN', 'TERESITA', 'M. ROXAS', 'SAN VICENTE']
	},
	{
		name: 'SURALLAH',
		barangays: ['CANAHAY', 'COLONGULO', 'DUENGAS', 'TALAHIK', 'LITTLE BAGUIO', 'UPPER SEPAKA']
	},
	{
		name: 'TAMPAKAN',
		barangays: [
			'SAN ISIDRO',
			'KIPALBIG',
			'STA. CRUZ',
			'MALTANA',
			'DANLAG',
			'PULA BATO',
			'BUTO',
			'LAMPITAK',
			'PALO 19',
			'LAMBAYONG',
			'PULABATO',
			'POBLACION',
			'ALBAGAN',
			'TABLU',
			'LIBERTY'
		]
	},
	{
		name: 'TANTANGAN',
		barangays: [
			'LIBAS',
			'TINONGCOP',
			'NEW LAMBUNAO',
			'SAN FELIPE',
			'MAGON',
			'NEW CUYAPO',
			'CABULING',
			'MANGILALA',
			'POBLACION',
			'NEW ILOILO',
			'MAIBO',
			'BUKAY PAIT',
			'DUMADALIG'
		]
	},
	{
		name: "T'BOLI",
		barangays: [
			'KEMATU',
			'LAMBANGAN',
			'LACONON',
			'DATAL DLANAG',
			'TUDOK',
			'LEMSNOLON',
			'SALACAFE',
			'LAMBULING',
			'LAMHAKU',
			'DESAWO',
			'AFUS',
			'TALUFO',
			'TBOLOK',
			'EDWARDS',
			'DATAL BOB',
			'POBLACION',
			'TALCON'
		]
	},
	{
		name: 'TUPI',
		barangays: ['CEBUANO']
	}
];

// Get all unique municipalities
export const MUNICIPALITIES = MUNICIPALITIES_DATA.map((m) => m.name).sort();

// Get barangays for a specific municipality
export function getBarangaysForMunicipality(municipality: string): string[] {
	const municipalityData = MUNICIPALITIES_DATA.find((m) => m.name === municipality);
	return municipalityData?.barangays || [];
}

// Get all barangays (flattened)
export const ALL_BARANGAYS = MUNICIPALITIES_DATA.flatMap((m) => m.barangays).sort();
