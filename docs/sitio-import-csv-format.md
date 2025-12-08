# Sitio Import CSV Format Documentation

This document describes the required structure and format for CSV files used to import sitio data into the system.

## Overview

The import system supports CSV and Excel files (.csv, .xlsx, .xls) with a maximum file size of 10MB. Each row represents one sitio (community area) with various demographic, economic, and infrastructure data.

## File Requirements

- **Format**: CSV, XLSX, or XLS
- **Max Size**: 10MB
- **Encoding**: UTF-8 recommended
- **Header Row**: Required (first row must contain column names)

## Column Structure

### Required Columns

These columns are mandatory and must contain valid data for each row:

| Column Name             | Description       | Example     |
| ----------------------- | ----------------- | ----------- |
| `CODING - MUNICIPALITY` | Municipality name | `Tubod`     |
| `BARANGAY`              | Barangay name     | `Poblacion` |
| `SITIO`                 | Sitio/Purok name  | `Centro`    |

### Core Information Columns

| Column Name         | Type   | Description                                            | Example           |
| ------------------- | ------ | ------------------------------------------------------ | ----------------- |
| `CODING`            | Text   | Unique coding identifier (optional)                    | `001`             |
| `PROVINCE`          | Text   | Province name                                          | `Lanao del Norte` |
| `No. of Households` | Number | Total number of households                             | `45`              |
| `LAT`               | Number | Latitude coordinate (-90 to 90)                        | `8.5667`          |
| `LNG`               | Number | Longitude coordinate (-180 to 180)                     | `123.8000`        |
| `NEED_SCORE`        | Number | Need assessment score (1-10, where 10 = critical need) | `7`               |

**Note**: `LAT`, `LNG`, and `NEED_SCORE` are optional but highly recommended for mapping and prioritization features.

### Demographics Columns

| Column Name                          | Type   | Description                                                       |
| ------------------------------------ | ------ | ----------------------------------------------------------------- |
| `POPULATION - Male`                  | Number | Male population count                                             |
| `POPULATION - Female`                | Number | Female population count                                           |
| `POPULATION - TOTAL`                 | Number | Total population (if not provided, calculated from male + female) |
| `AGE RANGE - 0-14 years old`         | Number | Population aged 0-14                                              |
| `AGE RANGE - 15-64 years old`        | Number | Population aged 15-64                                             |
| `AGE RANGE - 65 years old and above` | Number | Population aged 65 and above                                      |

### Social Services Columns

| Column Name                               | Type   | Description                 |
| ----------------------------------------- | ------ | --------------------------- |
| `No. of Registered Voters`                | Number | Number of registered voters |
| `No. of Philhealth Members/Beneficiaries` | Number | PhilHealth coverage count   |
| `No. of 4P's Beneficiaries`               | Number | 4Ps program beneficiaries   |

### Economic Condition Columns

#### Employment Types & Counts

| Column Name              | Type   | Description                               |
| ------------------------ | ------ | ----------------------------------------- |
| `Top 3 Employment - 1st` | Text   | Primary employment type (e.g., "Farming") |
| `EMPLOYMENT_1_COUNT`     | Number | Number of people in primary employment    |
| `Top 3 Employment - 2nd` | Text   | Secondary employment type                 |
| `EMPLOYMENT_2_COUNT`     | Number | Number of people in secondary employment  |
| `Top 3 Employment - 3rd` | Text   | Tertiary employment type                  |
| `EMPLOYMENT_3_COUNT`     | Number | Number of people in tertiary employment   |

#### Income Brackets & Household Counts

| Column Name                  | Type   | Description                                 |
| ---------------------------- | ------ | ------------------------------------------- |
| `Top 3 Income Bracket - 1st` | Text   | Primary income bracket (e.g., "5000-10000") |
| `INCOME_1_HOUSEHOLDS`        | Number | Households in primary income bracket        |
| `Top 3 Income Bracket - 2nd` | Text   | Secondary income bracket                    |
| `INCOME_2_HOUSEHOLDS`        | Number | Households in secondary income bracket      |
| `Top 3 Income Bracket - 3rd` | Text   | Tertiary income bracket                     |
| `INCOME_3_HOUSEHOLDS`        | Number | Households in tertiary income bracket       |

### Agriculture Columns

| Column Name                                      | Type   | Description                   |
| ------------------------------------------------ | ------ | ----------------------------- |
| `No. of Farmers`                                 | Number | Total number of farmers       |
| `No. of Farmer Association`                      | Number | Number of farmer associations |
| `No. of Farm Area (has.)`                        | Number | Total farm area in hectares   |
| `Top 5 Crops/Commodities Planted/Produced - 1st` | Text   | Primary crop                  |
| `Top 5 Crops/Commodities Planted/Produced - 2nd` | Text   | Secondary crop                |
| `Top 5 Crops/Commodities Planted/Produced - 3rd` | Text   | Third crop                    |
| `Top 5 Crops/Commodities Planted/Produced - 4th` | Text   | Fourth crop                   |
| `Top 5 Crops/Commodities Planted/Produced - 5th` | Text   | Fifth crop                    |

### Water & Sanitation Columns

#### Water Systems

| Column Name             | Type   | Description                                                   |
| ----------------------- | ------ | ------------------------------------------------------------- |
| `No. of Water Systems`  | Number | Total water systems count                                     |
| `WATER_SOURCE_1`        | Text   | Primary water source type (e.g., "Level II Water System")     |
| `WATER_SOURCE_1_STATUS` | Text   | Primary source status (e.g., "Operational", "Non-functional") |
| `WATER_SOURCE_2`        | Text   | Secondary water source type                                   |
| `WATER_SOURCE_2_STATUS` | Text   | Secondary source status                                       |
| `WATER_SOURCE_3`        | Text   | Tertiary water source type                                    |
| `WATER_SOURCE_3_STATUS` | Text   | Tertiary source status                                        |

**Note**: Water source and status columns must be paired. If a source is provided, its status should also be provided.

#### Sanitation

| Column Name                         | Type   | Description                                         |
| ----------------------------------- | ------ | --------------------------------------------------- |
| `No. of HH without Toilet Facility` | Number | Households without toilets                          |
| `TOILET_TYPE_1`                     | Text   | Primary toilet facility type (e.g., "Water-sealed") |
| `TOILET_TYPE_2`                     | Text   | Secondary toilet facility type                      |
| `TOILET_TYPE_3`                     | Text   | Tertiary toilet facility type                       |
| `Waste Segregation`                 | Yes/No | Whether waste segregation is practiced              |

### Livestock & Poultry Columns

| Column Name       | Type   | Description                        |
| ----------------- | ------ | ---------------------------------- |
| `Livestock - 1st` | Text   | Primary livestock type             |
| `Livestock - 2nd` | Text   | Secondary livestock type           |
| `Livestock - 3rd` | Text   | Tertiary livestock type            |
| `Pigs`            | Number | Pig count (optional, for tracking) |
| `Cows`            | Number | Cow count                          |
| `Carabao`         | Number | Carabao count                      |
| `Horse`           | Number | Horse count                        |
| `Goat`            | Number | Goat count                         |
| `Chicken`         | Number | Chicken count                      |
| `Duck`            | Number | Duck count                         |

**Note**: The system treats livestock columns as a string array. Numbers in livestock columns are stored as text.

### Food Security Columns

| Column Name                             | Type   | Description                |
| --------------------------------------- | ------ | -------------------------- |
| `No. of HH with Backyard Garden`        | Number | Households with gardens    |
| `Top 3 Common Garden Commodities - 1st` | Text   | Primary garden commodity   |
| `Top 3 Common Garden Commodities - 2nd` | Text   | Secondary garden commodity |
| `Top 3 Common Garden Commodities - 3rd` | Text   | Tertiary garden commodity  |

### Housing Columns

#### Quality

| Column Name                    | Type   | Description                                                |
| ------------------------------ | ------ | ---------------------------------------------------------- |
| `Housing - Quality of Housing` | Text   | Housing quality description (e.g., "Good", "Fair", "Poor") |
| `QUALITY_TYPE_COUNT`           | Number | Count for the specified quality type                       |

#### Ownership

| Column Name              | Type   | Description                                 |
| ------------------------ | ------ | ------------------------------------------- |
| `OWNERSHIP_TYPE_1`       | Text   | Primary ownership type (e.g., "Owned")      |
| `OWNERSHIP_TYPE_1_COUNT` | Number | Households with primary ownership type      |
| `OWNERSHIP_TYPE_2`       | Text   | Secondary ownership type (e.g., "Rented")   |
| `OWNERSHIP_TYPE_2_COUNT` | Number | Households with secondary ownership type    |
| `OWNERSHIP_TYPE_3`       | Text   | Tertiary ownership type (e.g., "Amortized") |
| `OWNERSHIP_TYPE_3_COUNT` | Number | Households with tertiary ownership type     |

**Note**: Ownership type and count columns must be paired. If a type is provided, its count should also be provided.

### Domestic Animals Columns

| Column Name                | Type   | Description           |
| -------------------------- | ------ | --------------------- |
| `Dogs`                     | Number | Total number of dogs  |
| `Cats`                     | Number | Total number of cats  |
| `No. of Vaccinated (Dogs)` | Number | Vaccinated dogs count |
| `No. of Vaccinated (Cats)` | Number | Vaccinated cats count |

### Community Empowerment Columns

| Column Name                    | Type   | Description                                                         |
| ------------------------------ | ------ | ------------------------------------------------------------------- |
| `No. of Sectoral Organization` | Number | Number of sectoral organizations                                    |
| `Information Dissemination`    | Text   | Method(s) of information dissemination (e.g., "Community Meetings") |
| `Mode of Transportation`       | Text   | Common transportation mode(s) (e.g., "Motorcycle", "Tricycle")      |

### Utilities Columns

| Column Name                            | Type   | Description                                                    |
| -------------------------------------- | ------ | -------------------------------------------------------------- |
| `No. of HH with access to Electricity` | Number | Households with electricity                                    |
| `Alternative Source of Electricity`    | Text   | Alternative power source(s) (e.g., "Solar Panel", "Generator") |

### Cultural Demographics Columns

| Column Name   | Type | Description                         |
| ------------- | ---- | ----------------------------------- |
| `ETHNICITY_1` | Text | Primary ethnicity (e.g., "Maranao") |
| `ETHNICITY_2` | Text | Secondary ethnicity                 |
| `ETHNICITY_3` | Text | Tertiary ethnicity                  |
| `RELIGION_1`  | Text | Primary religion (e.g., "Islam")    |
| `RELIGION_2`  | Text | Secondary religion                  |
| `RELIGION_3`  | Text | Tertiary religion                   |

## Data Type Guidelines

### Text Fields

- Can contain any alphanumeric characters
- Leading/trailing spaces are automatically trimmed
- Empty cells are ignored

### Number Fields

- Must be numeric values (integers or decimals)
- Negative numbers are not allowed for counts
- Empty cells default to 0

### Yes/No Fields

- Accepted values: `Yes`, `yes`, `No`, `no`, `TRUE`, `true`, `FALSE`, `false`
- Case-insensitive
- Empty cells default to `null`

### Coordinates

- **Latitude**: Must be between -90 and 90
- **Longitude**: Must be between -180 and 180
- Use decimal format (e.g., `8.5667`, not DMS format)

### Need Score

- Must be between 1 and 10
- **1-3**: Low priority (relatively well-served)
- **4-5**: Medium priority (moderate need)
- **6-7**: High priority (significant need)
- **8-10**: Critical priority (urgent need, prioritize for projects)

## Import Process

### 1. Upload

- Select the data year (defaults to current year)
- Upload your CSV/Excel file

### 2. Column Mapping

- The system auto-maps columns based on header names
- Review and adjust mappings as needed
- Unmapped columns are ignored

### 3. Preview

- Review valid and invalid records
- Fix errors before importing
- Invalid records are shown with error details

### 4. Duplicate Resolution

- Duplicates are identified by: Municipality + Barangay + Sitio name (case-insensitive)
- Choose to **Replace** existing data or **Skip** duplicates

### 5. Complete

- Data is saved to the system
- Yearly snapshot is created for historical tracking
- Import statistics are displayed

## Validation Rules

### Required Fields

- Municipality, Barangay, and Sitio name must be provided
- Records without these fields will be marked as invalid

### Demographics Cross-Validation

- Male + Female should approximately equal Total population (±1 person tolerance)
- Age group totals should approximately equal Total population (±2 person tolerance)

### Coordinate Validation

- If provided, coordinates must be within valid ranges
- Invalid coordinates will show warnings but won't prevent import

### Need Score Validation

- If provided, must be between 1 and 10
- Invalid scores will show warnings but won't prevent import

## Sample Data

See `/sample/sample-sitio-import-updated.csv` for a complete example with all columns.

### Minimal Required Example

```csv
CODING - MUNICIPALITY,BARANGAY,SITIO
Tubod,Poblacion,Centro
Tubod,Poblacion,Riverside
```

### Complete Example (abbreviated)

```csv
CODING - MUNICIPALITY,BARANGAY,SITIO,No. of Households,LAT,LNG,NEED_SCORE
Tubod,Poblacion,Centro,45,8.5667,123.8000,7
```

## Tips for Data Preparation

1. **Use the Sample File**: Start with the provided sample CSV and replace the data
2. **Keep Headers Exact**: Column header names must match exactly (case-sensitive)
3. **Remove Empty Rows**: Delete any completely empty rows before importing
4. **Test with Small Batch**: Import a few records first to verify the format
5. **Backup Data**: Keep a copy of your original CSV file
6. **Data Consistency**: Use consistent naming (e.g., always "Farming" not "farming" or "Farm")
7. **Paired Data**: Remember that some fields come in pairs (water sources, housing ownership)
8. **Optional Fields**: Don't worry about filling every column - provide what data you have

## Troubleshooting

### "Failed to parse file"

- Check that the file is a valid CSV/Excel format
- Ensure the file is not corrupted
- Try saving as a new CSV file

### "Missing required fields"

- Verify that Municipality, Barangay, and Sitio columns exist
- Check column header spelling and capitalization

### "Validation errors"

- Review the preview step for specific error messages
- Common issues: negative numbers, invalid coordinates, out-of-range need scores

### "Storage full" error

- The system uses browser localStorage (limited to ~5-10MB)
- Try importing smaller batches
- Clear old/unused data if possible

## Yearly Snapshots

Each import creates a yearly snapshot for historical tracking:

- **Purpose**: Track changes over time (population growth, infrastructure improvements, etc.)
- **Year Selection**: Choose the year this data represents (defaults to current year)
- **Overwriting**: Importing the same year overwrites previous snapshot data
- **Historical Analysis**: Compare data across years in the sitio detail view

## Notes

- Issues and Concerns (complex project planning data) cannot be imported via CSV. These must be added manually through the sitio detail page after import.
- Local Officials and RST Officials cannot be imported via CSV. Add these through the sitio management interface.
- The system automatically calculates the need level based on the need score (if provided).
- Empty or missing optional fields will use system defaults.

## Support

For additional help or questions about the import format, refer to:

- `/docs/sitio-import-plan.md` - Import planning documentation
- `/docs/sitio-import-progress.md` - Import progress tracking
- `/sample/sample-sitio-import-updated.csv` - Complete sample file

---

**Last Updated**: December 8, 2025  
**Version**: 2.0 (Updated with new field definitions)
