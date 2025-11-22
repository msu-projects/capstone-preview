Employment Columns:
ECONOMIC CONDITION - TOP 3 COMMON EMPLOYMENT ECONOMIC CONDITION ECONOMIC CONDITION
0 VENDOR/FARMING TRICYCLE DRIVER LABORER
1 VENDOR LABORER TRICYCLE DRIVER
2 FARMING LABORER NaN
3 FARMING PUBLIC EMPLOYEE LABORER
4 VENDOR (ice cream) LABORER NaN

Income Columns:
ECONOMIC CONDITION - Top 3 AVERAGE HH Income per day ECONOMIC CONDITION ECONOMIC CONDITION
0 Below - P100 P101 - P300 P301 - P500
1 Below - P100 P101 - P300 P301 - P500
2 P101 - P300 P301 - P500 NaN
3 P101 - P300 P301 - P500 NaN
4 P101 - P300 P301 - P500 NaN

Crop Columns:
AGRICULTURE - TOP 5 Crops / Produced AGRICULTURE AGRICULTURE AGRICULTURE AGRICULTURE
0 RICE COCONUT CORN PINEAPPLE FRUIT TREES
1 NaN NaN NaN NaN NaN
2 CORN COCONUT BANANA COFFEE KAMOTE
3 CORN BANANA COCONUT FRUIT TREES NaN
4 NaN NaN NaN NaN NaN

Water Source Columns:
POTABLE WATER SOURCE - Most Common Source of Drinking Water POTABLE WATER SOURCE POTABLE WATER SOURCE POTABLE WATER SOURCE POTABLE WATER SOURCE POTABLE WATER SOURCE
0 DEEP WELL NaN NaN NaN NaN NaN
1 NaN NaN NaN NaN NaN NaN
2 SPRING NEEDS REPAIR NaN NaN NaN NaN
3 SPRING NEEDS REPAIR NaN NaN NaN NaN
4 GROUND WATER GOOD NaN NaN NaN NaN

Housing Columns:
HOUSING - Types of House Quality HOUSING HOUSING HOUSING HOUSING
0 ✔️ ✔️ ✔️ NaN NaN
1 ✔️ ✔️ ✔️ ✔️ NaN
2 NaN ✔️ ✔️ NaN ✔️
3 ✔️ ✔️ ✔️ NaN ✔️
4 NaN NaN ✔️ NaN ✔️

Information Dissemination Columns:
COMMUNITY EMPOWERMENT - Most Common Method of Information Dissemination COMMUNITY EMPOWERMENT COMMUNITY EMPOWERMENT COMMUNITY EMPOWERMENT COMMUNITY EMPOWERMENT COMMUNITY EMPOWERMENT COMMUNITY EMPOWERMENT
0 NaN NaN ✔️ ✔️ NaN NaN NaN
1 NaN NaN ✔️ ✔️ NaN NaN NaN
2 ✔️ NaN ✔️ ✔️ NaN ✔️ ✔️
3 ✔️ NaN ✔️ ✔️ ✔️ ✔️ ✔️
4 ✔️ ✔️ ✔️ ✔️ ✔️ ✔️ ✔️

Transportation Columns:
COMMUNITY EMPOWERMENT - Most Common way of Transportation in the Sitio/Purok COMMUNITY EMPOWERMENT COMMUNITY EMPOWERMENT COMMUNITY EMPOWERMENT COMMUNITY EMPOWERMENT
0 ✔️ ✔️ ✔️ NaN NaN
1 ✔️ ✔️ ✔️ NaN NaN
2 ✔️ ✔️ ✔️ ✔️ NaN
3 ✔️ ✔️ ✔️ ✔️ NaN
4 ✔️ ✔️ ✔️ ✔️ NaN

```

Based on the structural analysis of the dataset, here is a detailed breakdown of all **86 columns** used, categorized by their function and content.

### **1. Location & Identification**

These columns uniquely identify where the data came from and geographically locate the community.

- **`NO.`**: Sequential record number.
- **`CODING`**: An internal coding system (e.g., "1-1") likely used for tracking specific surveys.
- **`CODING - MUNICIPALITY`**: The name of the municipality (e.g., Banga, T'boli).
- **`BARANGAY`**: The specific barangay name.
- **`SITIO`**: The specific sitio or purok (sub-village) name.
- **`COORDINATES`**: Two columns storing Latitude and Longitude data for mapping (though mostly empty in this dataset).

### **2. Demographics**

Columns capturing the population structure.

- **`POPULATION - MALE`**: Total male count.
- **`POPULATION - FEMALE`**: Total female count.
- **`POPULATION - TOTAL`**: Total population count.
- **`AGE GROUP - 0-14`**: Count of children/youth.
- **`AGE GROUP - 15-64`**: Count of the working-age population.
- **`AGE GROUP - 65-above`**: Count of senior citizens.
- **`No. of Households`**: Total number of households in the specific sitio/purok.

### **3. Social Services**

Indicators of government support and civic participation.

- **`SOCIAL REGISTRATION / BENEFITS - Registered Voters`**: Number of eligible voters.
- **`SOCIAL REGISTRATION / BENEFITS - No. of Philhealth Beneficiaries`**: Count of individuals covered by health insurance.
- **`SOCIAL REGISTRATION / BENEFITS - No. of 4Ps Beneficiaries`**: Count of households receiving conditional cash transfers (poverty indicator).

### **4. Economic Profile**

Data describing how the community earns a living.

- **`ECONOMIC CONDITION - TOP 3 COMMON EMPLOYMENT`**: The 1st most common job (e.g., "Farming").
- **`ECONOMIC CONDITION` (x2 columns)**: The 2nd and 3rd most common jobs.
- **`ECONOMIC CONDITION - Top 3 AVERAGE HH Income per day`**: The 1st income bracket (e.g., "P100-P300").
- **`ECONOMIC CONDITION` (x2 columns)**: The 2nd and 3rd most common income brackets.

### **5. Agriculture**

Detailed breakdown of agricultural assets and output.

- **`AGRICULTURE - No. of Farmers`**: Count of individuals identifying as farmers.
- **`AGRICULTURE - Farmers Association / Organization Established`**: Number of active farmer groups (indicates social capital).
- **`AGRICULTURE - Estimated Farm Area (by Hectares)`**: Size of land dedicated to farming.
- **`AGRICULTURE - TOP 5 Crops / Produced`**: The primary crop grown (e.g., "Corn").
- **`AGRICULTURE` (x4 columns)**: The 2nd, 3rd, 4th, and 5th priority crops.

### **6. Water & Sanitation (Critical Infrastructure)**

Columns tracking access to basic needs.

- **`POTABLE WATER SOURCE - No. of Existing Water Systems`**: Count of physical water infrastructure units.
- **`POTABLE WATER SOURCE - Most Common Source of Drinking Water`**: 1st source type (e.g., "Spring").
- **`POTABLE WATER SOURCE` (x5 columns)**: These repeated columns capture the **Condition/Status** of the 1st source (e.g., "Needs Repair") and data for 2nd and 3rd alternate water sources.
- **`SANITATION & SOLID WASTE MANAGEMENT - No. of HHs without Toilet Facility`**: Key health risk indicator.
- **`SANITATION & SOLID WASTE MANAGEMENT - Types of existing Toilet Facility`**: e.g., "Water Sealed", "Open Pit".
- **`SANITATION & SOLID WASTE MANAGEMENT` (x3 columns)**: Checkboxes or counts for other toilet types.
- **`SANITATION & SOLID WASTE MANAGEMENT - Practice of waste segration`**: Tracks if the community separates trash (Yes/No).

### **7. Livestock & Poultry**

Inventory of animal assets.

- **`LIVESTOCK & POULTRY - No. of Livestock/poultry`**: First animal type tracked (e.g., "Pig").
- **`LIVESTOCK & POULTRY` (x6 columns)**: Counts for other animals: Cow, Carabao, Horse, Goat, Chicken, Ducks.

### **8. Food Security**

- **`FOOD SECURITY AND NUTRITION - No. of HH with Backyard Garden`**: Measures self-sufficiency.
- **`FOOD SECURITY AND NUTRITION - Most Common Garden Commodities`**: 1st garden crop (e.g., "Vegetables").
- **`FOOD SECURITY AND NUTRITION` (x2 columns)**: 2nd and 3rd garden crops.

### **9. Housing**

Quality of life indicators based on shelter.

- **`HOUSING - Types of House Quality`**: 1st material type (e.g., "Concrete").
- **`HOUSING` (x4 columns)**: Checkboxes/counts for other types: Wood, Half-Concrete, Makeshift, Others.
- **`HOUSING - Types of Ownership`**: 1st ownership status (e.g., "Owned").
- **`HOUSING` (x4 columns)**: Other statuses: Rented, Protected Land, Informal Settler, Owner Consent.

### **10. Domestic Animals**

- **`DOMESTICATED ANIMALS - No. of Domesticated Animals`**: General count.
- **`DOMESTICATED ANIMALS`**: Specific count for Dogs/Cats.
- **`DOMESTICATED ANIMALS - No. of Dogs Vaccinated`**: Rabies control indicator.
- **`DOMESTICATED ANIMALS - No. of Cats Vaccinated`**: Rabies control indicator.

### **11. Community Empowerment**

- **`COMMUNITY EMPOWERMENT - No. of Existing Sectoral Organization`**: Number of non-farming civil society groups.
- **`COMMUNITY EMPOWERMENT - Most Common Method of Information Dissemination`**: Primary channel (e.g., "Radio").
- **`COMMUNITY EMPOWERMENT` (x6 columns)**: Other channels: Signages, Person in Authority, Assembly, Newspaper, TV, Internet/Social Media.
- **`COMMUNITY EMPOWERMENT - Most Common way of Transportation...`**: Primary transport (e.g., "Motorcycle").
- **`COMMUNITY EMPOWERMENT` (x4 columns)**: Other modes: Tricycle, 4-Wheels, Boat, etc.

### **12. Utilities**

- **`UTILITIES - No. of HHs with Electricity`**: Count of electrified homes.
- **`UTILITIES - Alternative Source of Electricity`**: Primary backup (e.g., "Solar").
- **`UTILITIES` (x2 columns)**: Other backups: Generator, Battery.
```
