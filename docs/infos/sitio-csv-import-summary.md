# Sitio Mock Data Update

## Summary

Updated the sitio mock data to use real data from the **SC CATCH-UP 2025 DATABANK - MSU - MASTER.csv** file.

## What Was Done

1. **Created a CSV Parser Script** (`scripts/generate-sitios-from-csv.ts`)
   - Parses the 86-column CSV file with proper handling of quoted fields and special characters
   - Extracts all relevant sitio information including:
     - Basic info (name, municipality, barangay, coordinates)
     - Demographics (population by age and gender)
     - Social services (voters, PhilHealth, 4Ps beneficiaries)
     - Economic data (employment types, income brackets)
     - Agriculture (farmers, crops, farm areas)
     - Water & sanitation (water sources, toilet facilities)
     - Livestock & poultry
     - Food security (backyard gardens)
     - Housing (quality types, ownership)
     - Domestic animals (dogs, cats, vaccination)
     - Community empowerment (organizations, info dissemination)
     - Utilities (electricity, alternative sources)

2. **Generated CSV Sitios Data** (`src/lib/mock-data/csv-sitios.ts`)
   - Auto-generated TypeScript file with 112 real sitios from the CSV
   - All data properly typed according to the `Sitio` interface
   - Includes proper coordinate parsing (handles DMS format like "6°24'4.94"N")

3. **Updated Mock Data Index** (`src/lib/mock-data/index.ts`)
   - Replaced the old mock sitios data with CSV-imported data
   - Maintains LocalStorage integration for persistence
   - All existing code continues to work without changes

## Data Statistics

- **Total Sitios**: 112
- **Municipalities Covered**:
  - BANGA: 19 sitios
  - T'BOLI: 18 sitios
  - TAMPAKAN: 17 sitios
  - LAKE SEBU: 14 sitios
  - POLOMOLOK: 13 sitios
  - TANTANGAN: 12 sitios
  - SURALLAH: 7 sitios
  - NORALA: 6 sitios
  - STO. NIÑO: 5 sitios
  - TUPI: 1 sitio

## Files Created/Modified

### Created:

- `scripts/generate-sitios-from-csv.ts` - CSV parser and code generator
- `src/lib/mock-data/csv-sitios.ts` - Generated sitios data (7,996 lines)

### Modified:

- `src/lib/mock-data/index.ts` - Updated to use CSV data instead of mock data

## Usage

The sitios data is automatically loaded from LocalStorage or initialized with CSV data on first load. All existing components that import `{ sitios }` from `$lib/mock-data` will automatically use the new data.

To regenerate the sitios data from the CSV (if the CSV is updated):

```bash
npx tsx scripts/generate-sitios-from-csv.ts
pnpm check
```

## Notes

- Coordinates that weren't provided in the CSV are auto-generated within South Cotabato bounds
- All data fields are properly typed and validated
- Empty or missing values are handled gracefully with appropriate defaults
- The CSV parser handles complex cases like quoted fields, escaped quotes, and special characters
