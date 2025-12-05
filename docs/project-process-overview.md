# System Overview

## South Cotabato Convergence Data Bank

---

## Executive Summary

This document provides a comprehensive overview of the South Cotabato Convergence Data Bank system. The system serves two primary purposes:

1. **Sitio Data Management** - A public-facing module that allows citizens to view detailed demographic, social, economic, and infrastructure data about vulnerable communities (Sitios) in South Cotabato Province.

2. **Project Tracking** - An administrative module for tracking government development projects implemented across these Sitios, including the CATCH-UP mechanism for monitoring project delays and recovery plans.

The system enables transparency by providing public access to community profiles while supporting government officials in planning and monitoring development interventions.

---

## Table of Contents

### Part I: Sitio Data Module

1. [Sitio Module Purpose](#1-sitio-module-purpose)
2. [Sitio Data Entity](#2-sitio-data-entity)
3. [Sitio Data Categories](#3-sitio-data-categories)
4. [Public Portal Features](#4-public-portal-features)
   - [4.1 Sitio Aggregate Dashboard](#41-sitio-aggregate-dashboard)
   - [4.2 Sitio Discovery](#42-sitio-discovery)
   - [4.3 Sitio Profile View](#43-sitio-profile-view)
   - [4.4 Data Visualization](#44-data-visualization)
   - [4.5 Sitio Data Management (Admin Only)](#45-sitio-data-management-admin-only)
   - [4.6 Sitio Need Score](#46-sitio-need-score)
   - [4.7 Post-Project Sitio Updates](#47-post-project-sitio-updates-optional)

### Part II: Project Management Module

5. [Project Module Purpose](#5-project-module-purpose)
6. [Project Lifecycle](#6-project-lifecycle)
7. [Project Data Entities](#7-project-data-entities)
8. [Project Workflows](#8-project-workflows)
   - [8.6 Sitio Recommendation](#86-sitio-recommendation)
9. [Data Flow](#9-data-flow)
10. [Project Categories](#10-project-categories)
11. [Status Tracking](#11-status-tracking)
12. [Key Metrics](#12-key-metrics)
13. [Suspension & Reactivation Process](#13-suspension--reactivation-process)
14. [Catch-Up Plan](#14-catch-up-plan)

### Part III: System-Wide

15. [Audit Trail](#15-audit-trail)
16. [Access Control](#16-access-control)
17. [Validation Rules & Business Rules](#17-validation-rules--business-rules)
18. [Integration Points](#18-integration-points)
19. [Glossary](#19-glossary)
20. [Future Development Notes](#20-future-development-notes)
21. [Version History](#21-version-history)

---

---

# Part I: Sitio Data Module

---

## 1. Sitio Module Purpose

The Sitio Data Module serves as a public-facing data bank that provides comprehensive information about vulnerable communities (Sitios) in South Cotabato Province. It enables:

- **Public Transparency** - Citizens can view detailed demographic and socioeconomic data about their communities
- **Data-Driven Planning** - Government officials can access community profiles to inform development decisions
- **Project Targeting** - Sitio data helps identify communities that need specific interventions

---

## 2. Sitio Data Entity

### 2.1 Core Identification

| Field        | Description                               |
| ------------ | ----------------------------------------- |
| ID           | Unique identifier                         |
| Name         | Sitio name                                |
| Municipality | Municipality where the sitio is located   |
| Barangay     | Barangay where the sitio belongs          |
| Province     | Province (South Cotabato)                 |
| Coding       | Administrative coding information         |
| Coordinates  | Geographic location (latitude, longitude) |
| Population   | Total population count                    |
| Households   | Total number of households                |

### 2.2 Entity Relationship

```
                              ┌─────────────────┐
                              │      SITIO      │
                              └────────┬────────┘
                                       │
       ┌───────────────┬───────────────┼───────────────┬───────────────┐
       │               │               │               │               │
       ▼               ▼               ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Demographics│ │  Economic   │ │Infrastructure│ │  Health &   │ │  Community  │
│  & Social   │ │ & Livelihood│ │ & Utilities  │ │   Safety    │ │ & Governance│
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
       │               │               │               │               │
       ▼               ▼               ▼               ▼               ▼
  - Population    - Employment   - Water/Sanitation - Domestic    - Organizations
  - Age Groups    - Agriculture  - Housing           Animals     - Info Methods
  - Voters        - Livestock    - Electricity     - Vaccination - Transport
  - 4Ps/PhilHealth- Food Security                  - Status      - Local Officials
  - Ethnicity                                                    - Issues/PPAs
  - Religion
```

---

## 3. Sitio Data Categories

### 3.1 Demographics & Social Services

This category covers population characteristics, government program coverage, and cultural/religious demographics.

#### Population Data

| Field     | Description                   |
| --------- | ----------------------------- |
| Male      | Number of male residents      |
| Female    | Number of female residents    |
| Total     | Total population              |
| Age 0-14  | Children and young dependents |
| Age 15-64 | Working age population        |
| Age 65+   | Senior citizens               |

#### Social Services

| Field                    | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| Registered Voters        | Number of registered voters in the sitio                           |
| PhilHealth Beneficiaries | Number of residents covered by PhilHealth                          |
| 4Ps Beneficiaries        | Number of households under the Pantawid Pamilyang Pilipino Program |

#### Ethnicity

| Field       | Description                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| Ethnicities | List of ethnic groups present in the sitio (e.g., Ilonggo, Cebuano, Antiqueño, Tagalog, Muslim, T'boli) |

#### Religion

| Field     | Description                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------------- |
| Religions | List of religious affiliations in the sitio (e.g., Roman Catholic, Alliance, Baptist, INC, Mormons, Pentacostal, Islam) |

### 3.2 Economic & Livelihood

This category covers employment, income, agriculture, livestock, and food production.

#### Employment & Income

| Data Type        | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| Employment Types | List of employment types with counts (e.g., farming, fishing, labor) |
| Income Brackets  | Distribution of households by income bracket                         |

#### Agriculture

| Field                | Description                               |
| -------------------- | ----------------------------------------- |
| Farmers Count        | Number of farmers in the sitio            |
| Farmer Associations  | Number of registered farmer organizations |
| Farm Area (Hectares) | Total agricultural land area              |
| Top Crops            | Primary agricultural products grown       |

#### Livestock & Poultry

| Animal   | Description              |
| -------- | ------------------------ |
| Pigs     | Number of pigs raised    |
| Cows     | Number of cattle         |
| Carabaos | Number of water buffalos |
| Horses   | Number of horses         |
| Goats    | Number of goats          |
| Chickens | Number of chickens       |
| Ducks    | Number of ducks          |

#### Food Security

| Field                           | Description                                        |
| ------------------------------- | -------------------------------------------------- |
| Households with Backyard Garden | Number of households practicing backyard gardening |
| Common Garden Commodities       | List of commonly grown vegetables/crops            |

### 3.3 Infrastructure & Utilities

This category covers water, sanitation, housing, and electricity access.

#### Water & Sanitation

| Field                      | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| Water Systems Count        | Number of water systems serving the sitio                     |
| Water Sources              | List of water sources with status (functional/non-functional) |
| Households Without Toilet  | Number of households lacking toilet facilities                |
| Toilet Facility Types      | Types of toilet facilities available                          |
| Waste Segregation Practice | Whether waste segregation is practiced (Yes/No/Unknown)       |

#### Housing

| Data Type       | Description                                                                      |
| --------------- | -------------------------------------------------------------------------------- |
| Quality Types   | Distribution by housing quality (e.g., concrete, semi-concrete, light materials) |
| Ownership Types | Distribution by ownership status (owned, rented, etc.)                           |

#### Utilities

| Field                           | Description                                  |
| ------------------------------- | -------------------------------------------- |
| Households with Electricity     | Number of electrified households             |
| Alternative Electricity Sources | Other power sources (e.g., solar, generator) |

### 3.4 Health & Safety

This category covers domestic animal management and vaccination status.

#### Domestic Animals

| Field           | Description                 |
| --------------- | --------------------------- |
| Dogs            | Number of dogs in the sitio |
| Cats            | Number of cats in the sitio |
| Dogs Vaccinated | Number of vaccinated dogs   |
| Cats Vaccinated | Number of vaccinated cats   |

### 3.5 Community & Governance

This category covers community organizations, communication infrastructure, local leadership, and community priorities.

#### Community Empowerment

| Field                      | Description                                                            |
| -------------------------- | ---------------------------------------------------------------------- |
| Sectoral Organizations     | Number of community organizations                                      |
| Info Dissemination Methods | How information is shared (e.g., social media, barangay announcements) |
| Transportation Methods     | Available means of transportation                                      |

#### Local Officials

##### Sitio/Purok Officials

| Field         | Description                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Official Name | Name of the sitio/purok official                                                                                                 |
| Position      | Position held (e.g., Sitio/Purok Leader, Vice-President, Secretary, Treasurer, Auditor, PIO, PIO/Bus. Manager, Business Manager) |

##### RST (Resident Support Team) Officials

| Field         | Description                            |
| ------------- | -------------------------------------- |
| Official Name | Name of the RST official               |
| Position      | Position held within the RST structure |

#### Primary Priorities

##### Issues & Concerns

| Field             | Description                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Issues & Concerns | List of primary issues identified by the community (e.g., Informal Settlers, No Community Plaza, No Water System, Flooding) |

##### Proposed PPAs (Programs, Projects, and Activities)

| Field                    | Description                                                                                                                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proposed PPAs            | List of proposed interventions to address community needs (e.g., Purchase land area for relocation, Provide site for the community plaza, Construction of Water System, Construction of box culvert at Liwanay boundary & libertad) |
| Health & Sanitation PPAs | Health-related proposals (e.g., Provide water-sealed toilets, Vitamins for the Children & Senior Citizens)                                                                                                                          |
| Livelihood PPAs          | Livelihood-related proposals (e.g., Provide Capital to the vendors, Animal Dispersal)                                                                                                                                               |

---

## 4. Public Portal Features

### 4.1 Sitio Aggregate Dashboard

The public portal provides an aggregate dashboard as the main entry point for exploring sitio data. This dashboard displays summary statistics and visualizations that respond to filter selections.

#### Dashboard Components

| Component                | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| Filter Context Indicator | Badge showing current filter (e.g., "Showing: Koronadal City") |
| Municipality Filter      | Dropdown to filter all dashboard data by municipality          |
| Barangay Filter          | Cascading dropdown for barangay (dependent on municipality)    |
| View List Button         | Navigate to detailed sitio list with current filters preserved |
| Collapsible Dashboard    | Toggle to collapse/expand the charts section                   |

#### Quick Stats Cards

| Stat                 | Aggregation                               |
| -------------------- | ----------------------------------------- |
| Total Sitios         | COUNT of filtered sitios                  |
| Total Population     | SUM of population across filtered sitios  |
| Total Households     | SUM of households across filtered sitios  |
| Avg Need Score       | AVG of need scores across filtered sitios |
| Electrification Rate | Percentage of electrified households      |
| PhilHealth Coverage  | Percentage of population with PhilHealth  |

#### Aggregate Charts

| Chart                    | Type           | Description                                              |
| ------------------------ | -------------- | -------------------------------------------------------- |
| Need Level Distribution  | Donut          | Count of sitios by need level (Critical/High/Medium/Low) |
| Social Services Coverage | Horizontal Bar | PhilHealth, 4Ps, and Voter registration rates            |
| Demographics Overview    | Stacked Bar    | Male/Female breakdown by age group                       |
| Infrastructure Summary   | Bar            | Water systems, electricity, toilet access                |

#### Mini Map Preview

- Displays markers for all filtered sitios
- Smaller height (300px) for dashboard context
- Click marker → navigate to sitio profile
- Syncs with active municipality/barangay filters
- **Note:** Sitios without valid coordinates are excluded from map displays but remain visible in list views

#### Empty State

When filters yield 0 sitios, the dashboard shows:

- "No sitios found for the selected filters" message
- All stats display as 0 or N/A
- Charts display empty state with helpful message

### 4.2 Sitio Discovery

From the aggregate dashboard, users can navigate to the detailed sitio list.

```
Start
  │
  ▼
View Aggregate Dashboard
  │
  ├──▶ Filter by Municipality
  ├──▶ Filter by Barangay
  └──▶ View Summary Statistics & Charts
  │
  ▼
Click "View List"
  │
  ▼
Browse Sitios List
  │
  ├──▶ Search by Name
  ├──▶ Toggle List/Map View
  ├──▶ Sort by Name/Population/Municipality
  └──▶ Paginate Results
  │
  ▼
Select Sitio
  │
  ▼
View Sitio Profile
  │
  ▼
End
```

### 4.3 Sitio Profile View

The public can view comprehensive sitio profiles including:

- **Overview** - Name, location, population, households
- **Demographics & Social Services** - Population breakdown by sex/age, government program coverage (voters, PhilHealth, 4Ps), ethnicity, and religion
- **Economic & Livelihood** - Employment, income, agriculture, livestock, and food security data
- **Infrastructure & Utilities** - Water, sanitation, housing, and electricity access
- **Health & Safety** - Domestic animal counts and vaccination status
- **Community & Governance** - Organizations, communication methods, transportation, local officials, and community priorities (issues/proposed PPAs)
- **Related Projects** - Development projects implemented in the sitio (non-financial information only)

**Note:** Financial information (budgets, expenditures) is restricted from public view and is only accessible to authenticated administrators.

### 4.4 Data Visualization

#### Aggregate Dashboard Visualizations

| Visualization            | Type           | Description                                                      |
| ------------------------ | -------------- | ---------------------------------------------------------------- |
| Need Level Distribution  | Donut Chart    | Count of sitios by need level (Critical/High/Medium/Low)         |
| Social Services Coverage | Horizontal Bar | PhilHealth, 4Ps, Voter registration rates across filtered sitios |
| Demographics Overview    | Stacked Bar    | Male/Female breakdown by age group totals                        |
| Infrastructure Summary   | Bar Chart      | Water systems, electrification, toilet access aggregates         |
| Mini Map Preview         | Leaflet Map    | Interactive map showing filtered sitio markers                   |

#### Sitio Profile Visualizations

| Visualization         | Description                            |
| --------------------- | -------------------------------------- |
| Map View              | Interactive map showing sitio location |
| Population Charts     | Demographics breakdown visualization   |
| Infrastructure Status | Visual indicators for service coverage |
| Project Timeline      | Projects implemented in the sitio      |

### 4.5 Sitio Data Management (Admin Only)

Administrators can create, edit, and delete sitio records through a multi-step form wizard.

> **Form Field Input Types:** Different fields have different input behaviors based on annotations in `phase-0a-data-layer.md`:
>
> - **Dropdown with custom entries** - Fields like ethnicities, religions, crops allow selecting from suggestions OR adding custom values
> - **Fixed dropdown** - Fields like housing quality/ownership have a fixed set of options
> - **Checkbox groups** - Fields like toilet facilities, electricity sources are multi-select checkboxes
> - **Editable lists** - Fields like income brackets can be fully customized (add/edit/delete entries)
>
> See Phase 2 documentation for detailed UI component specifications.

#### 4.5.1 Create Sitio

```
Start
  │
  ▼
Enter Core Information
  │
  ├──▶ Name, Municipality, Barangay
  ├──▶ Coordinates (Latitude, Longitude)
  └──▶ Population & Households
  │
  ▼
Enter Category Data
  │
  ├──▶ Demographics & Social Services
  ├──▶ Economic & Livelihood
  ├──▶ Infrastructure & Utilities
  ├──▶ Health & Safety
  └──▶ Community & Governance
  │
  ▼
Validate Data
  │
  ▼
Save Sitio
  │
  ▼
End
```

#### 4.5.2 Edit Sitio

```
Start
  │
  ▼
Select Sitio from List
  │
  ▼
Open Sitio Details
  │
  ▼
Modify Information
  │
  ├──▶ Update Core Information
  └──▶ Update Category Data
  │
  ▼
Validate Changes
  │
  ▼
Save Sitio
  │
  ▼
End
```

#### 4.5.3 Delete Sitio

```
Start
  │
  ▼
Select Sitio from List
  │
  ▼
Check for Dependencies
  │
  ├── Has Projects ──▶ Cannot Delete (show warning)
  │                      │
  │                      ▼
  │                    End
  │
  └── No Projects ──▶ Confirm Deletion
                        │
                        ├── Yes ──▶ Delete Sitio
                        │              │
                        │              ▼
                        │           End
                        │
                        └── No ───▶ Cancel
                                     │
                                     ▼
                                    End
```

**Note:** A sitio cannot be deleted if it has associated projects. All project associations must be removed first.

### 4.6 Sitio Need Score

The Need Score is a manually-assigned metric (1-10) that indicates a sitio's priority for development projects. A higher score indicates a greater need for assistance. Administrators assign this score when creating or editing a sitio based on their assessment of the community's overall needs.

#### 4.6.1 Score Scale

| Score | Description                                      |
| ----- | ------------------------------------------------ |
| 1-3   | Low need - community is relatively well-served   |
| 4-5   | Medium need - some gaps exist but manageable     |
| 6-7   | High need - significant gaps requiring attention |
| 8-10  | Critical need - urgent intervention required     |

#### 4.6.2 Need Levels

| Level    | Score Range | Color Badge | Description                          |
| -------- | ----------- | ----------- | ------------------------------------ |
| Critical | 8–10        | Red/Rose    | Urgent need, prioritize for projects |
| High     | 6–7         | Orange      | Significant need                     |
| Medium   | 4–5         | Yellow      | Moderate need                        |
| Low      | 1–3         | Green       | Relatively well-served               |

#### 4.6.3 Score Assignment

- **Manual Entry**: Administrators assign the score when creating or editing a sitio
- **Default Value**: New sitios default to a score of 5 (Medium need)
- **Required Field**: The need score is mandatory for all sitios
- **Visual Feedback**: The form displays the current need level badge alongside the slider input

#### 4.6.4 Admin Features

| Feature            | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| Need Score Input   | Slider input (1-10) with visual level indicator            |
| Need Score Badge   | Color-coded badge (Critical/High/Medium/Low) in sitio list |
| Filter by Level    | Filter sitio list by need level                            |
| Sort by Score      | Sort sitio list by need score (high to low or low to high) |
| Dashboard Chart    | Donut chart showing distribution of sitios by need level   |
| Average Need Score | Dashboard metric showing average need score across sitios  |

### 4.7 Post-Project Sitio Updates (Optional)

When a project is marked as completed, the system can prompt administrators to update the affected sitios' data to reflect project outcomes. This helps keep need scores accurate over time.

| Project Category | Suggested Fields to Update                 |
| ---------------- | ------------------------------------------ |
| Infrastructure   | Water/sanitation, housing, utilities       |
| Agriculture      | Agriculture, livestock, food security      |
| Health           | Domestic animals, PhilHealth beneficiaries |
| Livelihood       | Employment types, income brackets          |
| Environment      | Waste segregation, issues/concerns         |

**Note:** Pending updates are optional and can be dismissed. They appear as a banner reminder in the admin dashboard.

---

# Part II: Project Management Module

---

## 5. Project Module Purpose

The Project Management module enables administrators to track government development projects across vulnerable communities (Sitios) in South Cotabato Province. It supports the CATCH-UP mechanism for monitoring project delays and recovery plans.

---

## 6. Project Lifecycle

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│  Planning  │────▶│In Progress │────▶│ Completed  │
└────────────┘     └────────────┘     └────────────┘
                          │
                          │ (if issues arise)
                          ▼
                   ┌────────────┐
                   │ Suspended  │
                   └────────────┘
                          │
                          │ (when resolved)
                          ▼
                   Back to In Progress
```

---

## 7. Project Data Entities

### 7.1 Project

| Field                         | Description                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| Title                         | Project name                                                                           |
| Description                   | Project details                                                                        |
| Category                      | Infrastructure, Agriculture, Education, Health, Livelihood, Environment                |
| Project Type                  | Specific type within category (e.g., Housing, Road Construction, School Building)      |
| Performance Indicator         | Target metric based on project type (e.g., Number of houses built, Kilometers of road) |
| Status                        | Planning, In Progress, Completed, Suspended                                            |
| Start Date                    | Target start date                                                                      |
| Duration                      | Contract duration in calendar days                                                     |
| Total Budget                  | Allocated budget                                                                       |
| Beneficiaries                 | Target beneficiary count                                                               |
| Employment Generated (Male)   | Target male employment count                                                           |
| Employment Generated (Female) | Target female employment count                                                         |
| Implementing Agency           | Responsible agency                                                                     |

### 7.2 Related Entities

```
                              ┌─────────────────┐
                              │     PROJECT     │
                              └────────┬────────┘
                                       │
               ┌───────────────────────┼───────────────────────┐
               │                       │                       │
               ▼                       ▼                       ▼
        ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
        │   Project   │         │   Monthly   │         │  Progress   │
        │   Sitios    │         │   Targets   │         │  Updates    │
        └─────────────┘         └─────────────┘         └─────────────┘
               │                       │                       │
               ▼                       ▼                       ▼
         - Sitio ID              - Month/Year            - Update Date
         - Beneficiaries         - Planned %             - Actual %
         - Focal Person          - Planned Budget        - Budget Used
                                                         - Performance
                                                           Indicator Update
                                                         - Employment
                                                           (Male/Female)
                                                         - Extension Request
                                                           (Calendar Days)
                                                         - Status
                                                         - Issues/Remarks
                                                         - Catch-Up Plan
                                                           (if delayed)

**Note:** The latest progress update within a month is treated as the monthly progress for comparison against monthly targets.
```

---

## 8. Project Workflows

### 8.1 Create Project

```
Start
  │
  ▼
Select Category & Project Type
  │
  ▼
Set Performance Indicator Target & Employment Targets (Male/Female)
  │
  ▼
Assign Sitio Locations & Beneficiaries
  │
  ▼
Set Timeline & Budget
  │
  ▼
Configure Monthly Planning Targets
  │
  ▼
Save Project
  │
  ▼
End
```

### 8.2 Edit Project

```
Start
  │
  ▼
Open Project Details
  │
  ▼
Modify Project Information
  │
  ├──▶ Update Basic Details (Title, Description)
  ├──▶ Modify Sitio Assignments & Beneficiaries
  ├──▶ Adjust Timeline & Budget
  └──▶ Update Monthly Planning Targets
  │
  ▼
Validate Changes
  │
  ▼
Save Project
  │
  ▼
End
```

### 8.3 Delete Project

```
Start
  │
  ▼
Select Project from List
  │
  ▼
Confirm Deletion
  │
  ├── Yes ──▶ Delete Project & Associated Data
  │              │
  │              ▼
  │           End
  │
  └── No ───▶ Cancel
               │
               ▼
              End
```

### 8.4 Monitor Project

```
Start
  │
  ▼
View Project List
  │
  ├──▶ Filter by Status / Category / Search
  │
  ▼
Select Project
  │
  ▼
View Progress Dashboard
  │
  ├──▶ Physical Progress (Planned vs Actual)
  ├──▶ Financial Status (Budget vs Utilized)
  └──▶ Monthly Timeline
  │
  ▼
Update Progress (if needed)
  │
  ▼
End
```

### 8.5 Update Project Progress

```
Start
  │
  ▼
Open Project Details
  │
  ▼
Record Progress Update
  │
  ├──▶ Physical % Complete
  ├──▶ Budget Utilized
  ├──▶ Performance Indicator Update (e.g., Houses built so far)
  ├──▶ Employment Generated (Male/Female)
  ├──▶ Status (In Progress / Suspended)
  ├──▶ Issues / Remarks
  └──▶ Catch-Up Plan (if delayed)
        ├── Delay Cause
        ├── Corrective Actions
        └── Extension Request (calendar days)
  │
  ▼
System Compares Against Monthly Planned Targets
(Latest update of the month = Monthly Progress)
  │
  ├── On Track (within ±5% tolerance of planned progress)
  ├── Delayed (actual < planned - 5% for current month)
  └── Ahead of Schedule (actual > planned + 5% for current month)
  │
  ▼
Save Updates
  │
  ▼
End
```

### 8.6 Sitio Recommendation

#### 8.6.1 Overview

The Sitio Recommendation feature assists administrators in identifying the most suitable sitios for a project based on community-expressed needs. When assigning sitios to a project, the system analyzes each sitio's **Proposed PPAs** (Programs, Projects, and Activities) and matches them against the selected project type.

#### 8.6.2 Recommendation Logic

The system uses a two-tier scoring approach:

**Primary Factor: PPA Matching**

- The system performs fuzzy text matching between the project type and the sitio's Proposed PPAs (including Health & Sanitation PPAs and Livelihood PPAs)
- Keywords associated with each project type are matched against PPA text
- Matched PPA excerpts are highlighted in the recommendation display
- Higher match scores indicate stronger alignment with community-expressed needs

**Secondary Factor: Need Indicators**

When PPA matches are equal or as a tiebreaker, the system considers:

| Indicator           | Description                                              |
| ------------------- | -------------------------------------------------------- |
| Population Size     | Larger populations may indicate greater project impact   |
| Income Level        | Lower daily household income indicates higher need       |
| Infrastructure Gaps | Relevant gaps based on project type (e.g., water access) |

**Fallback Behavior**

If no sitios have PPAs matching the project type, the system ranks sitios purely by secondary need indicators and displays a message indicating no direct PPA matches were found.

#### 8.6.3 Project Type to PPA Keyword Mapping

Each project type has associated keywords used for fuzzy matching:

| Project Type          | Sample Keywords                                          |
| --------------------- | -------------------------------------------------------- |
| Housing               | housing, house, shelter, relocation, informal settlers   |
| Road Construction     | road, highway, pavement, access road                     |
| Bridge Construction   | bridge, crossing, overpass                               |
| Water System          | water system, water supply, potable water, water-sealed  |
| Irrigation            | irrigation, farm water, canal                            |
| Seed Distribution     | seeds, planting materials, seedlings                     |
| Farm Equipment        | farm equipment, tools, machinery, animal dispersal       |
| School Building       | school, classroom, education building                    |
| Scholarship           | scholarship, educational assistance, tuition             |
| Health Center         | health center, clinic, medical facility                  |
| Medical Mission       | medical mission, health services, check-up               |
| Medicine Distribution | medicine, vitamins, pharmaceutical                       |
| Skills Training       | training, skills, livelihood training, capacity building |
| Micro-enterprise      | enterprise, business, capital, vendor, livelihood        |
| Cash for Work         | cash for work, employment, jobs                          |
| Reforestation         | reforestation, tree planting, seedlings, environment     |
| Waste Management      | waste, garbage, segregation, sanitation, toilet          |

#### 8.6.4 Recommendation Workflow

```
Start
  │
  ▼
Admin selects Category & Project Type
  │
  ▼
System generates recommendations
  │
  ├──▶ Match PPAs against project type keywords (fuzzy matching)
  ├──▶ Calculate match scores
  └──▶ Apply secondary need indicators
  │
  ▼
Display Recommendation Panel
  │
  ├──▶ Ranked list of sitios
  ├──▶ Match score for each sitio
  ├──▶ Matched PPA text (highlighted)
  └──▶ Secondary indicators summary
  │
  ▼
Admin applies filters (optional)
  │
  ├──▶ Municipality
  ├──▶ Barangay
  ├──▶ Max Income (₱0-₱1,000/household/day slider)
  └──▶ Exclude sitios with existing projects of same type
  │
  ▼
Admin selects sitio(s) from recommendations
  │
  ▼
Sitio(s) added to project assignment list
  │
  ▼
End
```

#### 8.6.5 Filter Options

| Filter                    | Type     | Description                                                                                                        |
| ------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| Municipality              | Select   | Filter sitios by municipality                                                                                      |
| Barangay                  | Select   | Filter sitios by barangay (depends on municipality)                                                                |
| Max Daily Income          | Slider   | Filter sitios where average household income is at or below the selected value (₱0-₱1,000/day range)               |
| Exclude Existing Projects | Checkbox | Hide sitios that already have a project of the same type (any status: Planning, In Progress, Completed, Suspended) |

#### 8.6.6 Recommendation Display

Each recommended sitio card shows:

- **Sitio Name** - Name and location (barangay, municipality)
- **Match Score** - Visual indicator (badge) showing recommendation strength
- **Matched PPAs** - Excerpts from the sitio's Proposed PPAs that match the project type, with matched keywords highlighted
- **Need Indicators** - Summary of secondary factors (population, income level, relevant infrastructure gaps)
- **Add Button** - Adds the sitio to the project's sitio assignment list

**Note:** Multiple sitios can be added to the assignment list. The recommendation panel appears alongside manual sitio search, allowing admins to use either method.

---

## 9. Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           ADMIN USER                                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PROJECT FORMS                               │
│   (Create / Edit / Quick Edit / Progress Update)                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA STORAGE                                 │
│                                                                     │
│   ┌───────────┐    ┌───────────┐    ┌───────────┐                   │
│   │  Projects │◄──▶│   Sitios  │    │   Users   │                   │
│   └───────────┘    └───────────┘    └───────────┘                   │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         OUTPUT / REPORTS                            │
│                                                                     │
│   ┌───────────┐    ┌───────────┐    ┌───────────┐                   │
│   │ Dashboard │    │  PDF      │    │  Public   │                   │
│   │  Charts   │    │  Reports  │    │  Portal   │                   │
│   └───────────┘    └───────────┘    └───────────┘                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Project Categories

| Category       | Description         | Example Projects                  |
| -------------- | ------------------- | --------------------------------- |
| Infrastructure | Physical structures | Roads, bridges, water systems     |
| Agriculture    | Farming support     | Irrigation, seed distribution     |
| Education      | Learning facilities | School buildings, equipment       |
| Health         | Medical services    | Health centers, medical missions  |
| Livelihood     | Income programs     | Skills training, micro-enterprise |
| Environment    | Conservation        | Reforestation, waste management   |

### 10.1 Project Types & Performance Indicators (sample)

| Category       | Project Type          | Performance Indicator                  |
| -------------- | --------------------- | -------------------------------------- |
| Infrastructure | Housing               | Number of houses built                 |
| Infrastructure | Road Construction     | Kilometers of road completed           |
| Infrastructure | Bridge Construction   | Number of bridges completed            |
| Infrastructure | Water System          | Number of households with water access |
| Agriculture    | Irrigation            | Hectares irrigated                     |
| Agriculture    | Seed Distribution     | Kilograms of seeds distributed         |
| Agriculture    | Farm Equipment        | Number of equipment distributed        |
| Education      | School Building       | Number of classrooms built             |
| Education      | Equipment             | Number of equipment provided           |
| Education      | Scholarship           | Number of scholars supported           |
| Health         | Health Center         | Number of facilities built             |
| Health         | Medical Mission       | Number of patients served              |
| Health         | Medicine Distribution | Number of beneficiaries served         |
| Livelihood     | Skills Training       | Number of trainees completed           |
| Livelihood     | Micro-enterprise      | Number of enterprises established      |
| Livelihood     | Cash for Work         | Number of workers employed             |
| Environment    | Reforestation         | Number of trees planted                |
| Environment    | Waste Management      | Number of facilities established       |

---

## 11. Status Tracking

### 11.1 Project Status

| Status          | Condition                          |
| --------------- | ---------------------------------- |
| **Planning**    | Before start date                  |
| **In Progress** | After start date, not yet complete |
| **Completed**   | 100% physical progress             |
| **Suspended**   | Halted due to issues               |

### 11.2 Progress Status (per month)

The system compares the **latest update of the month** against the **monthly planned target** using a **±5% tolerance**.

| Status                | Condition                                                       |
| --------------------- | --------------------------------------------------------------- |
| **On Track**          | Actual progress is within ±5% of planned progress for the month |
| **Delayed**           | Actual progress < Planned progress - 5% for the month           |
| **Ahead of Schedule** | Actual progress > Planned progress + 5% for the month           |

**Example:** If planned progress is 50%, then:

- **Ahead of Schedule**: Actual > 55%
- **On Track**: Actual between 45% and 55% (inclusive)
- **Delayed**: Actual < 45%

---

## 12. Key Metrics

| Metric                        | Description                             |
| ----------------------------- | --------------------------------------- |
| Physical Progress             | Percentage of work completed            |
| Financial Progress            | Budget utilized vs allocated            |
| Performance Indicator         | Actual vs target based on project type  |
| Variance                      | Gap between planned and actual progress |
| Beneficiaries Reached         | Actual vs target beneficiaries          |
| Employment Generated (Male)   | Jobs created for male workers           |
| Employment Generated (Female) | Jobs created for female workers         |

---

## 13. Suspension & Reactivation Process

### 13.1 Overview

Suspension and reactivation are simple status changes made by the admin during a project update.

### 13.2 Suspension

When updating a project, the admin can change the status to "Suspended" and provide a reason.

| Field  | Description                                        |
| ------ | -------------------------------------------------- |
| Status | Set to "Suspended"                                 |
| Reason | Text field explaining why the project is suspended |

### 13.3 Reactivation

When the issue is resolved, the admin updates the project status back to "In Progress".

| Field   | Description                  |
| ------- | ---------------------------- |
| Status  | Set to "In Progress"         |
| Remarks | Optional notes on resolution |

---

## 14. Catch-Up Plan

### 14.1 Overview

The Catch-Up Plan is part of the progress update. When a project is delayed, the admin can document the delay cause and corrective actions directly in the progress update.

### 14.2 Catch-Up Plan Fields

| Field              | Description                                    |
| ------------------ | ---------------------------------------------- |
| Delay Cause        | Reason for the delay                           |
| Corrective Actions | Actions planned to recover progress            |
| Extension Request  | Additional calendar days requested (if needed) |

### 14.3 When to Add a Catch-Up Plan

- When actual progress is below planned progress for the month
- When issues are identified that may cause delays

---

# Part III: System-Wide

---

## 15. Audit Trail

### 15.1 Overview

The system maintains a comprehensive audit trail to track all significant actions performed by users. This ensures accountability, supports compliance requirements, and enables investigation of issues.

### 15.2 Audit Log Entry

| Field         | Description                                                            |
| ------------- | ---------------------------------------------------------------------- |
| ID            | Unique identifier for the audit entry (string)                         |
| User ID       | The ID of the user who performed the action                            |
| User Name     | The name of the user who performed the action                          |
| Action        | The type of action performed (see 15.3)                                |
| Resource Type | The type of resource affected: `user`, `sitio`, `project`, or `system` |
| Resource ID   | The ID of the affected resource (optional)                             |
| Resource Name | The name of the affected resource for display (optional)               |
| Details       | Additional context or notes about the action (optional)                |
| Changes       | Array of field changes with old and new values (optional, see 15.4)    |
| IP Address    | The IP address from which the action was performed (optional)          |
| Timestamp     | Date and time of the action (ISO 8601 format)                          |

### 15.3 Action Types

| Action   | Description                                        |
| -------- | -------------------------------------------------- |
| `login`  | User successfully logged in                        |
| `logout` | User logged out                                    |
| `create` | New record created                                 |
| `update` | Existing record modified                           |
| `delete` | Record deleted                                     |
| `view`   | Record viewed (for sensitive data access tracking) |
| `export` | Data exported (e.g., PDF report generated)         |
| `import` | Data imported (e.g., CSV sitio import)             |

### 15.4 Change Tracking

When a record is updated, the system captures the specific field changes:

| Field    | Description                            |
| -------- | -------------------------------------- |
| field    | The name of the field that was changed |
| oldValue | The previous value before the change   |
| newValue | The new value after the change         |

**Example Change Record:**

```json
{
	"changes": [
		{ "field": "status", "oldValue": "in-progress", "newValue": "suspended" },
		{ "field": "issues", "oldValue": null, "newValue": "Funding delay" }
	]
}
```

### 15.5 Resource Types

| Resource Type | Description                                                |
| ------------- | ---------------------------------------------------------- |
| `user`        | User account operations                                    |
| `sitio`       | Sitio data operations                                      |
| `project`     | Project and progress update operations                     |
| `system`      | System-level operations (authentication, exports, imports) |

### 15.6 Tracked Operations by Resource

| Resource Type | Actions Tracked                       |
| ------------- | ------------------------------------- |
| **System**    | `login`, `logout`, `export`, `import` |
| **Sitio**     | `create`, `update`, `delete`, `view`  |
| **Project**   | `create`, `update`, `delete`, `view`  |
| **User**      | `create`, `update`, `delete`          |

### 15.7 Audit Log Retention

| Rule             | Description                                          |
| ---------------- | ---------------------------------------------------- |
| Retention Period | Audit logs are retained for a minimum of 5 years     |
| Immutability     | Audit entries cannot be modified or deleted by users |
| Access           | Only Superadmins can view the full audit trail       |

---

## 16. Access Control

| Role           | Permissions            |
| -------------- | ---------------------- |
| **Superadmin** | Full CRUD access       |
| **Admin**      | Full CRUD access       |
| **Viewer**     | Read-only access       |
| **Public**     | View via public portal |

### 16.1 Role-Specific Permissions

| Action                     | Superadmin | Admin | Viewer | Public |
| -------------------------- | ---------- | ----- | ------ | ------ |
| Create Project             | ✓          | ✓     | ✗      | ✗      |
| Edit Project               | ✓          | ✓     | ✗      | ✗      |
| Delete Project             | ✓          | ✓     | ✗      | ✗      |
| Update Progress            | ✓          | ✓     | ✗      | ✗      |
| Suspend/Reactivate Project | ✓          | ✓     | ✗      | ✗      |
| Create Catch-Up Plan       | ✓          | ✓     | ✗      | ✗      |
| Request Extension          | ✓          | ✓     | ✗      | ✗      |
| View All Projects          | ✓          | ✓     | ✓      | ✓\*    |
| View Dashboard             | ✓          | ✓     | ✓      | ✓\*    |
| Export Reports             | ✓          | ✓     | ✓      | ✗      |
| Manage Users               | ✓          | ✗     | ✗      | ✗      |

_\* Public users can only view non-financial data. Budget and expenditure information is restricted to authenticated users._

---

## 17. Validation Rules & Business Rules

### 17.1 Sitio Data Rules

| Field              | Rule                                                  |
| ------------------ | ----------------------------------------------------- |
| Name               | Required, 2-100 characters                            |
| Municipality       | Required, must be valid municipality                  |
| Barangay           | Required, must be valid barangay                      |
| Coordinates        | Required, must be valid lat/lng within South Cotabato |
| Population         | Required, must be non-negative integer                |
| Households         | Required, must be non-negative integer                |
| Demographics Total | Must equal male + female                              |
| Age Groups         | Sum must equal total population                       |

### 17.2 Project Creation Rules

| Field                        | Rule                                                    |
| ---------------------------- | ------------------------------------------------------- |
| Title                        | Required, 5-200 characters                              |
| Category                     | Required, must be valid category                        |
| Project Type                 | Required, must match category                           |
| Start Date                   | Required, cannot be in the past (for new projects)      |
| Duration                     | Required, minimum 1 calendar day                        |
| Total Budget                 | Required, must be positive number                       |
| Beneficiaries                | Required, must be positive integer                      |
| Performance Indicator Target | Required, must be positive number                       |
| Employment Target (Male)     | Required, must be non-negative integer                  |
| Employment Target (Female)   | Required, must be non-negative integer                  |
| At least one Sitio           | Required, project must have at least one sitio assigned |

### 17.2.1 Project Edit Rules

| Field               | Rule                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Start Date          | Can be edited for projects in "Planning" status only. Once a project is "In Progress" or beyond, the start date becomes read-only.                               |
| Historical Projects | Existing projects with past start dates can be edited, but the start date field itself cannot be changed to a future date if the project is already in progress. |

### 17.3 Progress Update Rules

| Rule                     | Description                                       |
| ------------------------ | ------------------------------------------------- |
| Actual % Range           | Must be between 0-100%                            |
| Budget Utilized          | Cannot exceed Total Budget                        |
| Performance Indicator    | Cannot exceed Target                              |
| Employment (Male/Female) | Cannot exceed respective targets                  |
| Sequential Progress      | Actual % should not decrease (except corrections) |

### 17.4 Status Transition Rules

| From        | To          | Condition                       |
| ----------- | ----------- | ------------------------------- |
| Planning    | In Progress | Start date reached or passed    |
| In Progress | Completed   | Actual progress = 100%          |
| In Progress | Suspended   | Issue identified, admin action  |
| Suspended   | In Progress | Issue resolved, admin action    |
| Completed   | -           | Terminal state (no transitions) |

### 17.5 Extension Rules

| Rule                | Description                                    |
| ------------------- | ---------------------------------------------- |
| Extension Unit      | Calendar days only                             |
| Extension Request   | Can be made during any monthly progress update |
| Multiple Extensions | Allowed, cumulative                            |

---

## 18. Integration Points

### 18.1 Internal Integrations

| System/Module | Integration Type | Description                                                     |
| ------------- | ---------------- | --------------------------------------------------------------- |
| Sitio Module  | Data Reference   | Projects reference sitio data for location and beneficiary info |
| User Module   | Authentication   | User roles and permissions for access control                   |
| Dashboard     | Data Aggregation | Project data feeds into dashboard charts and metrics            |
| PDF Reports   | Export           | Project data exported to PDF format for reporting               |

### 18.2 Data Dependencies

```
┌─────────────────┐
│   Sitio Data    │
│  (Master Data)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│    Projects     │─────▶│   Dashboard     │
└────────┬────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│ Monthly Progress│─────▶│  PDF Reports    │
└─────────────────┘      └─────────────────┘
```

---

## 19. Glossary

| Term                      | Definition                                                                                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **4Ps**                   | Pantawid Pamilyang Pilipino Program - a conditional cash transfer program for poor households                                                                                                             |
| **Barangay**              | The smallest administrative division in the Philippines, a village or district                                                                                                                            |
| **Beneficiaries**         | The target population who will directly benefit from the project                                                                                                                                          |
| **Calendar Days**         | All days including weekends and holidays, used for measuring project duration and extensions                                                                                                              |
| **CATCH-UP**              | A mechanism for monitoring project delays and implementing recovery plans to get projects back on schedule                                                                                                |
| **Demographics**          | Statistical data about the population characteristics including age, sex, and distribution                                                                                                                |
| **Financial Progress**    | The percentage of budget utilized relative to the total allocated budget                                                                                                                                  |
| **Focal Person**          | The designated contact person for a specific sitio within a project                                                                                                                                       |
| **Implementing Agency**   | The government agency or organization responsible for executing the project                                                                                                                               |
| **Municipality**          | A local government unit in the Philippines, below the province level                                                                                                                                      |
| **Performance Indicator** | A measurable metric specific to the project type (e.g., houses built, kilometers of road)                                                                                                                 |
| **PhilHealth**            | Philippine Health Insurance Corporation - the national health insurance program                                                                                                                           |
| **Physical Progress**     | The percentage of actual work completed relative to the total scope of the project                                                                                                                        |
| **Progress Update**       | A recorded entry documenting the current state of a project including physical completion, budget utilization, and any issues                                                                             |
| **Monthly Target**        | The planned milestone for each month specifying the expected progress percentage and budget allocation                                                                                                    |
| **Sitio**                 | The smallest administrative division in the Philippines, a subdivision of a barangay. In this system, refers to vulnerable communities targeted for development projects and public data access           |
| **Sitio Recommendation**  | A system feature that suggests sitios for project assignment based on matching community Proposed PPAs with project types, prioritizing communities that have explicitly requested relevant interventions |
| **Tolerance**             | A ±5% buffer used when comparing actual vs planned progress to determine project status                                                                                                                   |
| **Variance**              | The difference between actual progress and planned progress, calculated as (Actual - Planned). Negative values indicate delay, positive values indicate ahead of schedule                                 |

---

## 20. Future Development Notes

The following features are planned for future development phases:

| Feature                | Description                                                                      | Priority |
| ---------------------- | -------------------------------------------------------------------------------- | -------- |
| Data Retention Policy  | Define how long different types of data are kept and archived                    | Medium   |
| Backup & Recovery      | Implement automated backup procedures and disaster recovery plans                | High     |
| Concurrent Editing     | Handle scenarios where multiple admins edit the same project simultaneously      | Medium   |
| Notifications & Alerts | Automated alerts for delayed projects, approaching deadlines, and status changes | Medium   |
| Advanced Reporting     | Customizable report generation with filtering and export options                 | Low      |
| Mobile Application     | Native mobile app for field data collection and progress updates                 | Low      |
| API Integration        | External API for integration with other government systems                       | Low      |

---

## 21. Version History

| Version | Date             | Author | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ---------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | December 2, 2025 | -      | Initial document creation                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 1.1     | December 2, 2025 | -      | Added: Executive Summary, Table of Contents, Suspension/Reactivation Process, Catch-Up Plan Process, Validation Rules, Integration Points, Glossary, Version History. Expanded Access Control with role-specific permissions.                                                                                                                                                                                                                                         |
| 2.0     | December 2, 2025 | -      | Major restructure: Added comprehensive Sitio Data Module documentation (Part I) covering all sitio data categories including demographics, social services, economic condition, agriculture, water & sanitation, livestock, food security, housing, domestic animals, community empowerment, and utilities. Reorganized document into three parts: Sitio Data Module, Project Management Module, and System-Wide sections. Updated glossary with sitio-related terms. |
| 2.1     | December 2, 2025 | -      | Added: Edit Project and Delete Project workflows (8.2, 8.3). Added Audit Trail section with tracked actions for authentication, sitios, projects, and users. Updated progress status with ±5% tolerance. Added public data restrictions note. Removed Priority from Project Sitios. Updated lifecycle diagram. Added Future Development Notes section. Enhanced glossary with Progress Update, Monthly Target, Tolerance terms. Fixed Variance definition.            |
| 2.2     | December 2, 2025 | -      | Updated Audit Trail section to align with implementation: Added change tracking with field-level old/new values (AuditFieldChange). Reorganized action types and resource types. Added detailed documentation for change tracking with JSON example.                                                                                                                                                                                                                  |
| 2.3     | December 2, 2025 | -      | Added: Sitio CRUD workflows (4.4), Image & Attachment Handling section (10.2), Employment Targets as required fields (17.2), Project Edit Rules clarifying start date behavior (17.2.1). Added footnote to Access Control table clarifying public view restrictions.                                                                                                                                                                                                  |
| 2.4     | December 2, 2025 | -      | Consolidated Sitio Data Categories from 11 to 5 broader categories: Demographics & Social Services, Economic & Livelihood, Infrastructure & Utilities, Health & Safety, Community & Governance. Updated entity relationship diagram and all related workflows.                                                                                                                                                                                                        |
| 2.5     | December 3, 2025 | -      | Finalized 5-category consolidation: Merged Ethnicity & Religion into Demographics & Social Services. Merged Local Officials and Primary Priorities into Community & Governance. Updated entity diagram, section structure, and Sitio Profile View references.                                                                                                                                                                                                         |
| 2.6     | December 3, 2025 | -      | Added: Sitio Recommendation feature (8.6) for intelligent sitio assignment during project creation/edit. Includes PPA-based fuzzy matching, secondary need indicators, filter options (municipality, barangay, income slider, exclude existing projects), and recommendation display specifications. Added Sitio Recommendation term to glossary.                                                                                                                     |
| 2.7     | December 3, 2025 | -      | Added: Sitio Need Score system (4.5) with composite scoring across 5 categories (Infrastructure, Economic, Social Service, Community, Population). Added need level badges, trend indicators, filters, and sorting. Added Need Score types to Phase 0. Added Post-Project Sitio Updates (4.6) for optional data refresh prompts after project completion.                                                                                                             |

---

_Document Version: 2.7_  
_Last Updated: December 3, 2025_
