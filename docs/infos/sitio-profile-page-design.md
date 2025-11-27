# Sitio Profile Page Design & Implementation Plan

## Document Overview

This document provides a comprehensive design and implementation plan for the Sitio Profile page in the South Cotabato Convergence Data Bank system. The Sitio (community) profile serves as a central hub for viewing all data about a specific vulnerable community, including demographics, economic indicators, infrastructure, and related development projects.

---

## 1. Purpose & Goals

### 1.1 Primary Objectives

| Objective                  | Description                                                                   |
| -------------------------- | ----------------------------------------------------------------------------- |
| **Community Transparency** | Provide citizens easy access to comprehensive community data                  |
| **Decision Support**       | Enable administrators to make data-driven decisions about resource allocation |
| **Project Tracking**       | Link community profiles to ongoing/planned development projects               |
| **Impact Monitoring**      | Track how projects affect community indicators over time                      |

### 1.2 User Stories

**As an Administrator, I want to:**

- View complete sitio profile at a glance
- Edit sitio information quickly
- See which projects are linked to this community
- Export sitio data for reports
- Add monitoring notes

**As a Public User, I want to:**

- Understand my community's current situation
- See what projects are planned/ongoing in my area
- View the location on a map
- See government investment in my community

---

## 2. Current Implementation Status

### 2.1 Existing Components ✅

| Component                   | Location                     | Status      |
| --------------------------- | ---------------------------- | ----------- |
| `SitioDetailView.svelte`    | `src/lib/components/sitios/` | ✅ Complete |
| `SitioBreadcrumb.svelte`    | `src/lib/components/sitios/` | ✅ Complete |
| `SitioHeader.svelte`        | `src/lib/components/sitios/` | ✅ Complete |
| `SitioMap.svelte`           | `src/lib/components/sitios/` | ✅ Complete |
| `SitioTabNavigation.svelte` | `src/lib/components/sitios/` | ✅ Complete |

### 2.2 Existing Tab Components ✅

| Tab                      | Component                         | Description                                               |
| ------------------------ | --------------------------------- | --------------------------------------------------------- |
| Overview                 | `OverviewTab.svelte`              | Location info, map, quick stats, social services summary  |
| Demographics             | `DemographicsTab.svelte`          | Gender/age distribution charts, population summary        |
| Economic & Livelihoods   | `EconomicLivelihoodsTab.svelte`   | Employment types, income brackets, agriculture, livestock |
| Infrastructure & Housing | `InfrastructureHousingTab.svelte` | Housing quality/ownership, water, sanitation, utilities   |
| Social Services          | `SocialServicesTab.svelte`        | Health coverage, food security, community empowerment     |
| Related Projects         | `RelatedProjectsTab.svelte`       | Linked projects table with budget/beneficiary summary     |

### 2.3 Routes ✅

```
src/routes/admin/sitios/
├── +page.svelte           # Sitio listing page
├── [id]/
│   ├── +page.svelte       # Sitio detail view
│   ├── +page.ts           # Data loader
│   └── edit/              # Edit sitio
└── new/                   # Create new sitio
```

---

## 3. Data Model Reference

The `Sitio` interface (from `src/lib/types/index.ts`) contains the following data categories:

### 3.1 Core Identification

```typescript
{
  id: number;
  name: string;           // Sitio/Purok name
  municipality: string;
  barangay: string;
  province?: string;
  coordinates: { lat: number; lng: number };
  coding?: { number: string; code: string };
}
```

### 3.2 Population & Demographics

```typescript
{
  population: number;
  households: number;
  demographics: {
    male: number;
    female: number;
    total: number;
    age_0_14: number;
    age_15_64: number;
    age_65_above: number;
    employment_rate?: number;      // Legacy
    poverty_incidence?: number;    // Legacy
  };
}
```

### 3.3 Social Services

```typescript
{
  social_services?: {
    registered_voters: number;
    philhealth_beneficiaries: number;
    fourps_beneficiaries: number;
  };
}
```

### 3.4 Economic Condition

```typescript
{
  economic_condition?: {
    employments: Array<{ type: string; count: number }>;
    income_brackets: Array<{ bracket: string; households: number }>;
    // bracket options: '<=100', '100-300', '300-500', '>=500'
  };
}
```

### 3.5 Agriculture

```typescript
{
  agriculture?: {
    farmers_count: number;
    farmer_associations: number;
    farm_area_hectares: number;
    top_crops: string[];  // Top 5
  };
}
```

### 3.6 Water & Sanitation

```typescript
{
  water_sanitation?: {
    water_systems_count: number;
    water_sources: Array<{ source: string; status: string }>;
    households_without_toilet: number;
    toilet_facility_types: string[];
    waste_segregation_practice: boolean | null;
  };
}
```

### 3.7 Livestock & Poultry

```typescript
{
  livestock_poultry?: {
    pigs?: number;
    cows?: number;
    carabaos?: number;
    horses?: number;
    goats?: number;
    chickens?: number;
    ducks?: number;
  };
}
```

### 3.8 Food Security

```typescript
{
  food_security?: {
    households_with_backyard_garden: number;
    common_garden_commodities: string[];  // Top 3
  };
}
```

### 3.9 Housing

```typescript
{
  housing?: {
    quality_types: Array<{ type: string; count: number }>;
    // Types: Concrete, Wood, Half-Concrete, Makeshift, Others
    ownership_types: Array<{ type: string; count: number }>;
    // Types: Owned, Rented, Protected Land, Informal Settler, Owner Consent
  };
}
```

### 3.10 Domestic Animals

```typescript
{
  domestic_animals?: {
    total_count: number;
    dogs: number;
    cats: number;
    dogs_vaccinated: number;
    cats_vaccinated: number;
  };
}
```

### 3.11 Community Empowerment

```typescript
{
  community_empowerment?: {
    sectoral_organizations: number;
    info_dissemination_methods: string[];
    // Methods: Radio, Signages, Person in Authority, Assembly, etc.
    transportation_methods: string[];
    // Methods: Motorcycle, Tricycle, 4-Wheels, Boat
  };
}
```

### 3.12 Utilities

```typescript
{
  utilities?: {
    households_with_electricity: number;
    alternative_electricity_sources: string[];
    // Sources: Solar, Generator, Battery
  };
}
```

---

## 4. Page Architecture

### 4.1 Component Hierarchy

```
SitioDetailView.svelte (Main Container)
├── SitioBreadcrumb.svelte
│   └── Province > Municipality > Barangay > Sitio
│
├── SitioHeader.svelte
│   ├── Sitio Name & Code
│   ├── Quick Stats (Population, Households, Projects)
│   └── Action Buttons (Edit, Export, Map View)
│
└── Tabs.Root
    ├── TabsList (Navigation)
    │   ├── Overview
    │   ├── Demographics
    │   ├── Economic & Livelihoods
    │   ├── Infrastructure & Housing
    │   ├── Social Services
    │   └── Related Projects
    │
    └── TabsContent
        ├── OverviewTab.svelte
        │   ├── Location Information Card
        │   ├── SitioMap Component
        │   ├── Social Services Summary
        │   └── Projects Quick Summary
        │
        ├── DemographicsTab.svelte
        │   ├── Gender Distribution (BarChart)
        │   ├── Age Distribution (BarChart)
        │   ├── Population Summary Card
        │   ├── Age Groups Summary Card
        │   └── Dependency Ratio Card
        │
        ├── EconomicLivelihoodsTab.svelte
        │   ├── Employment Types (BarChart)
        │   ├── Income Distribution (DonutChart)
        │   ├── Agriculture Profile Card
        │   └── Livestock Census (BarChart)
        │
        ├── InfrastructureHousingTab.svelte
        │   ├── Housing Quality (DonutChart)
        │   ├── Housing Ownership (DonutChart)
        │   ├── Water Sources Card
        │   ├── Sanitation Facilities Card
        │   └── Utilities Access Card
        │
        ├── SocialServicesTab.svelte
        │   ├── Health Services Card
        │   ├── Food Security Card
        │   └── Community Empowerment Card
        │
        └── RelatedProjectsTab.svelte
            ├── Summary Cards (Total, Active, Budget, Beneficiaries)
            └── Projects Table
```

### 4.2 Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│ BREADCRUMB: South Cotabato > Municipality > Barangay > Sitio │
├────────────────────────────────────────────────────────────┤
│ HEADER                                                       │
│ ┌──────────────────────────────────────────┬──────────────┐│
│ │ Sitio Name                               │ [Edit] [PDF] ││
│ │ Code: 1-1                                │ [Map View]   ││
│ │                                          │              ││
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐     │              ││
│ │ │ 1,234   │ │   245   │ │    5    │     │              ││
│ │ │Population│ │Households│ │Projects│     │              ││
│ │ └─────────┘ └─────────┘ └─────────┘     │              ││
│ └──────────────────────────────────────────┴──────────────┘│
├────────────────────────────────────────────────────────────┤
│ TABS                                                         │
│ [Overview] [Demographics] [Economic] [Infrastructure] [Social] [Projects] │
├────────────────────────────────────────────────────────────┤
│ TAB CONTENT                                                  │
│                                                              │
│ ┌─────────────────────────────┐ ┌─────────────────────────┐│
│ │                             │ │                         ││
│ │     Primary Card            │ │    Secondary Card       ││
│ │                             │ │                         ││
│ └─────────────────────────────┘ └─────────────────────────┘│
│                                                              │
│ ┌───────────────────────────────────────────────────────────┐│
│ │                                                           ││
│ │                    Full-Width Card                        ││
│ │                                                           ││
│ └───────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

---

## 5. Tab Content Specifications

### 5.1 Overview Tab

**Purpose:** Quick snapshot of the sitio with essential information.

| Section                 | Components                     | Data Source                                      |
| ----------------------- | ------------------------------ | ------------------------------------------------ |
| Location Information    | Card with grid layout          | `municipality`, `barangay`, `province`, `coding` |
| Location Map            | `SitioMap` component (Leaflet) | `coordinates.lat`, `coordinates.lng`             |
| Social Services Summary | Progress bars, stats           | `social_services.*`                              |
| Projects Summary        | Count cards with links         | Related `projects` array                         |

**Visual Elements:**

- Map height: 350px
- Grid: 2 columns (map + info) on desktop, stacked on mobile

### 5.2 Demographics Tab

**Purpose:** Detailed population structure analysis.

| Visualization       | Chart Type           | Data Source                                |
| ------------------- | -------------------- | ------------------------------------------ |
| Gender Distribution | Horizontal Bar Chart | `demographics.male`, `demographics.female` |
| Age Distribution    | Vertical Bar Chart   | `demographics.age_*`                       |
| Population Summary  | Stat Card            | `population`, `demographics.*`             |
| Dependency Ratio    | Calculated Metric    | `(age_0_14 + age_65_above) / age_15_64`    |

**Key Metrics:**

- Male/Female percentage
- Working-age population %
- Dependency ratio interpretation

### 5.3 Economic & Livelihoods Tab

**Purpose:** Economic profile and livelihood sources.

| Section             | Visualization        | Data Source                          |
| ------------------- | -------------------- | ------------------------------------ |
| Employment Types    | Horizontal Bar Chart | `economic_condition.employments`     |
| Income Distribution | Donut Chart          | `economic_condition.income_brackets` |
| Agriculture Profile | Card with badges     | `agriculture.*`                      |
| Livestock Census    | Bar Chart            | `livestock_poultry.*`                |

**Income Bracket Labels:**

- `<=100` → "Below ₱100/day"
- `100-300` → "₱100-300/day"
- `300-500` → "₱300-500/day"
- `>=500` → "₱500+/day"

### 5.4 Infrastructure & Housing Tab

**Purpose:** Housing conditions and basic utilities access.

| Section           | Visualization    | Data Source                      |
| ----------------- | ---------------- | -------------------------------- |
| Housing Quality   | Donut Chart      | `housing.quality_types`          |
| Housing Ownership | Donut Chart      | `housing.ownership_types`        |
| Water Sources     | Card with badges | `water_sanitation.water_sources` |
| Sanitation        | Progress bars    | `water_sanitation.*`             |
| Electricity       | Progress bar     | `utilities.*`                    |

**Coverage Calculations:**

- Electricity: `households_with_electricity / households * 100`
- Toilet: `(households - households_without_toilet) / households * 100`

### 5.5 Social Services Tab

**Purpose:** Government programs and community welfare.

| Section               | Content                       | Data Source               |
| --------------------- | ----------------------------- | ------------------------- |
| Health Services       | PhilHealth coverage, 4Ps      | `social_services.*`       |
| Food Security         | Backyard gardens, commodities | `food_security.*`         |
| Community Empowerment | Organizations, info methods   | `community_empowerment.*` |
| Animal Welfare        | Vaccination rates             | `domestic_animals.*`      |

### 5.6 Related Projects Tab

**Purpose:** Link sitio to development initiatives.

| Element        | Description                                   |
| -------------- | --------------------------------------------- |
| Summary Cards  | Total projects, active, budget, beneficiaries |
| Projects Table | Title, category, status, budget, progress     |
| Actions        | Link to project detail view                   |

**Project Linking Logic:**

```typescript
const relatedProjects = projects.filter((p) => {
  // Legacy single-sitio
  if (p.sitio_id === sitio.id) return true;
  // Multi-sitio support
  if (p.project_sitios?.some((ps) => ps.sitio_id === sitio.id)) return true;
  return false;
});
```

---

## 6. UI Components Used

### 6.1 shadcn-svelte Components

| Component   | Usage                   |
| ----------- | ----------------------- |
| `Card`      | Section containers      |
| `Tabs`      | Main navigation         |
| `Badge`     | Status indicators, tags |
| `Progress`  | Coverage percentages    |
| `Table`     | Projects listing        |
| `Button`    | Actions                 |
| `Separator` | Visual dividers         |

### 6.2 Custom Chart Components

| Component           | Location                     | Purpose                        |
| ------------------- | ---------------------------- | ------------------------------ |
| `BarChart.svelte`   | `src/lib/components/charts/` | Horizontal/vertical bar charts |
| `DonutChart.svelte` | `src/lib/components/charts/` | Pie/donut visualizations       |

### 6.3 Lucide Icons Used

```typescript
import {
  Users,        // Demographics
  Home,         // Housing
  MapPin,       // Location
  Briefcase,    // Employment
  Heart,        // Social services
  FolderKanban, // Projects
  FileText,     // Overview
  Droplets,     // Water
  Zap,          // Electricity
  Sprout,       // Agriculture
  Beef,         // Livestock
  Banknote,     // Budget/Income
  Vote,         // Voters
  Bath,         // Sanitation
  Dog,          // Animals
  Apple,        // Food security
} from '@lucide/svelte';
```

---

## 7. Future Enhancements

### 7.1 Phase 2: Enhanced Features

| Feature             | Description                      | Priority |
| ------------------- | -------------------------------- | -------- |
| **Historical Data** | Track sitio indicators over time | High     |
| **Comparison View** | Compare two sitios side-by-side  | Medium   |
| **PDF Export**      | Generate sitio profile reports   | High     |
| **Data Validation** | Flag incomplete/suspicious data  | Medium   |
| **Photo Gallery**   | Community photos with geo-tags   | Low      |

### 7.2 Phase 3: Advanced Analytics

| Feature                  | Description                            |
| ------------------------ | -------------------------------------- |
| **Vulnerability Index**  | Composite score based on indicators    |
| **Project Impact Score** | Measure how projects affect indicators |
| **Predictive Needs**     | Suggest projects based on gaps         |
| **Trend Analysis**       | Show improvement/decline over time     |

### 7.3 Proposed New Tabs

#### 7.3.1 History/Timeline Tab

- Track changes to sitio data over time
- Show when projects started/completed
- Display milestone events

#### 7.3.2 Needs Assessment Tab

- Gap analysis based on indicators
- Recommended interventions
- Priority ranking for projects

#### 7.3.3 Documents Tab

- Uploaded files (surveys, photos)
- Meeting minutes
- Official communications

---

## 8. Responsive Design Guidelines

### 8.1 Breakpoints

| Breakpoint | Width      | Layout                         |
| ---------- | ---------- | ------------------------------ |
| Mobile     | < 640px    | Single column, stacked cards   |
| Tablet     | 640-1024px | 2-column grid                  |
| Desktop    | > 1024px   | 3-column grid where applicable |

### 8.2 Tab Behavior

- **Desktop:** Horizontal tab list
- **Mobile:** Horizontal scroll or dropdown selector
- **Touch:** Swipe between tabs (future enhancement)

### 8.3 Chart Responsiveness

```svelte
<div style="height: {isMobile ? '200px' : '300px'};">
	<BarChart data={chartData} height={isMobile ? 200 : 300} />
</div>
```

---

## 9. Data Loading Strategy

### 9.1 Current Approach

```typescript
// src/routes/admin/sitios/[id]/+page.ts
export async function load({ params }) {
  const sitioId = parseInt(params.id);
  const sitio = sitios.find(s => s.id === sitioId);

  if (!sitio) {
    throw error(404, 'Sitio not found');
  }

  return { sitio };
}
```

### 9.2 Future: API Integration

```typescript
// Future implementation
export async function load({ params, fetch }) {
  const response = await fetch(`/api/sitios/${params.id}`);

  if (!response.ok) {
    throw error(response.status, 'Failed to load sitio');
  }

  const sitio = await response.json();
  return { sitio };
}
```

### 9.3 Lazy Loading for Performance

- Load Overview tab immediately
- Defer other tabs until selected
- Use skeleton loaders during data fetch

---

## 10. Accessibility Considerations

### 10.1 WCAG 2.1 Compliance

| Requirement         | Implementation                       |
| ------------------- | ------------------------------------ |
| Color Contrast      | Minimum 4.5:1 ratio                  |
| Keyboard Navigation | Tab through all interactive elements |
| Screen Reader       | ARIA labels on charts and cards      |
| Focus Indicators    | Visible focus rings                  |

### 10.2 Chart Accessibility

```svelte
<div role="img" aria-label="Gender distribution: 52% male, 48% female">
	<BarChart data={genderData} />
	<!-- Hidden table for screen readers -->
	<table class="sr-only">
		{#each genderData as item}
			<tr><td>{item.label}</td><td>{item.value}</td></tr>
		{/each}
	</table>
</div>
```

---

## 11. Testing Checklist

### 11.1 Functional Tests

- [ ] All tabs render correctly
- [ ] Charts display with correct data
- [ ] Empty state handling (no data)
- [ ] Project linking works (legacy + multi-sitio)
- [ ] Map displays correct location
- [ ] Edit/Export buttons function (admin only)

### 11.2 Edge Cases

- [ ] Sitio with no projects
- [ ] Sitio with missing optional fields
- [ ] Very large population numbers (formatting)
- [ ] Zero values in demographics
- [ ] Invalid coordinates

### 11.3 Performance Tests

- [ ] Page load time < 2 seconds
- [ ] Chart rendering < 500ms
- [ ] No layout shift during load

---

## 12. Implementation Checklist

### 12.1 Completed ✅

- [x] `SitioDetailView.svelte` - Main container
- [x] `SitioBreadcrumb.svelte` - Navigation
- [x] `SitioHeader.svelte` - Header with stats
- [x] `SitioMap.svelte` - Leaflet map integration
- [x] `OverviewTab.svelte` - Overview content
- [x] `DemographicsTab.svelte` - Demographics charts
- [x] `EconomicLivelihoodsTab.svelte` - Economic data
- [x] `InfrastructureHousingTab.svelte` - Infrastructure data
- [x] `SocialServicesTab.svelte` - Social services
- [x] `RelatedProjectsTab.svelte` - Linked projects
- [x] Route: `/admin/sitios/[id]`
- [x] Route: `/admin/sitios/[id]/edit`

### 12.2 Pending / Future Work 🔄

- [ ] PDF export functionality
- [ ] Historical data tracking
- [ ] Comparison view between sitios
- [ ] Needs assessment tab
- [ ] Documents/attachments tab
- [ ] Public view route (`/sitios/[id]`)
- [ ] API integration (replace mock data)
- [ ] Audit logging for changes

---

## 13. File Structure Summary

```
src/
├── lib/
│   ├── components/
│   │   ├── sitios/
│   │   │   ├── SitioDetailView.svelte      # Main container
│   │   │   ├── SitioBreadcrumb.svelte      # Breadcrumb nav
│   │   │   ├── SitioHeader.svelte          # Header section
│   │   │   ├── SitioMap.svelte             # Map component
│   │   │   ├── SitioTabNavigation.svelte   # Tab navigation
│   │   │   └── tabs/
│   │   │       ├── OverviewTab.svelte
│   │   │       ├── DemographicsTab.svelte
│   │   │       ├── EconomicLivelihoodsTab.svelte
│   │   │       ├── InfrastructureHousingTab.svelte
│   │   │       ├── SocialServicesTab.svelte
│   │   │       └── RelatedProjectsTab.svelte
│   │   └── charts/
│   │       ├── BarChart.svelte
│   │       └── DonutChart.svelte
│   └── types/
│       └── index.ts                        # Sitio interface
│
└── routes/
    └── admin/
        └── sitios/
            ├── +page.svelte                # Sitio listing
            ├── [id]/
            │   ├── +page.svelte            # Sitio detail
            │   ├── +page.ts                # Data loader
            │   └── edit/
            │       └── +page.svelte        # Edit sitio
            └── new/
                └── +page.svelte            # Create sitio
```

---

## 14. Conclusion

The Sitio Profile page is the cornerstone of the South Cotabato Convergence Data Bank system, providing comprehensive visibility into community data. The current implementation covers all essential features with a robust, maintainable component architecture.

### Key Strengths:

1. **Modular Design** - Each tab is a separate component for easy maintenance
2. **Complete Data Coverage** - All 86 columns from CSV are mapped to UI
3. **Visual Clarity** - Charts and progress bars make data accessible
4. **Project Integration** - Clear link between communities and development projects

### Next Priority Actions:

1. Implement PDF export for reporting
2. Add historical data tracking
3. Create public-facing sitio view
4. Build API backend to replace mock data

---

_Document Version: 1.0_  
_Last Updated: November 2025_  
_Author: Development Team_
