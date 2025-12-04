# Admin Processes Documentation

## South Cotabato Convergence Data Bank - Administrative Module

This document provides comprehensive documentation of all administrative processes within the South Cotabato Convergence Data Bank system. It covers user workflows, system features, and technical implementation details.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Admin Dashboard](#3-admin-dashboard)
4. [Sitio Management](#4-sitio-management)
5. [Project Management](#5-project-management)
6. [Data Import](#6-data-import)
7. [User Management](#7-user-management)
8. [Audit Logging](#8-audit-logging)
9. [Data Flow Diagrams](#9-data-flow-diagrams)

---

## 1. System Overview

### 1.1 Purpose

The Admin Module provides authorized users with tools to:
- Manage community (Sitio) data and demographics
- Create, monitor, and update development projects
- Import bulk data from CSV/Excel files
- Manage user accounts and permissions
- Track all system activities through audit logs

### 1.2 Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | SvelteKit with Svelte 5 |
| Language | TypeScript |
| UI Components | shadcn-svelte |
| Icons | @lucide/svelte |
| Styling | Tailwind CSS v4 |
| State Management | Svelte 5 Runes ($state, $derived, $effect) |
| Data Storage | localStorage (prototype) |

### 1.3 Admin Navigation Structure

```
/admin
├── Dashboard (/)
├── Data Management
│   ├── Sitios (/sitios)
│   │   ├── List View
│   │   ├── Create New (/sitios/new)
│   │   ├── View Details (/sitios/[id])
│   │   └── Edit (/sitios/[id]/edit)
│   ├── Projects (/projects)
│   │   ├── List View
│   │   ├── Create New (/projects/new)
│   │   ├── View Details (/projects/[id])
│   │   ├── Edit (/projects/[id]/edit)
│   │   └── Quick Edit (/projects/[id]/quick-edit)
│   └── Import Data (/import)
├── System
│   ├── Users (/users) [Superadmin only]
│   └── Audit Logs (/audit) [Admin+ only]
└── Public Portal (external link)
```

---

## 2. Authentication & Authorization

### 2.1 Login Process

**Route:** `/login`

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User navigates to /login                                │
│                    │                                        │
│                    ▼                                        │
│  2. Check if already authenticated                          │
│         │                                                   │
│    ┌────┴────┐                                              │
│    │ Yes     │ No                                           │
│    ▼         ▼                                              │
│  Redirect   Display login form                              │
│  to /admin       │                                          │
│                  ▼                                          │
│  3. User enters email + password                            │
│                  │                                          │
│                  ▼                                          │
│  4. Validate credentials                                    │
│         │                                                   │
│    ┌────┴────┐                                              │
│    │ Valid   │ Invalid                                      │
│    ▼         ▼                                              │
│  - Create   Display error                                   │
│    session  message                                         │
│  - Store in                                                 │
│    localStorage                                             │
│  - Log audit                                                │
│    action                                                   │
│  - Redirect                                                 │
│    to /admin                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 User Roles & Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| **Superadmin** | Full system access | All CRUD operations, user management |
| **Admin** | Content manager | CRUD on sitios/projects, view audit logs |
| **Viewer** | Read-only access | View sitios, projects, dashboards |

### 2.3 Permission Matrix

| Resource | Superadmin | Admin | Viewer |
|----------|------------|-------|--------|
| **Sitios** | Read, Write, Delete | Read, Write, Delete | Read |
| **Projects** | Read, Write, Delete | Read, Write, Delete | Read |
| **Users** | Read, Write, Delete | Read | None |
| **Audit Logs** | Read | Read | None |

### 2.4 Session Management

- **Storage:** localStorage with key `sccdp_auth_session`
- **Expiry:** 24 hours from login
- **Validation:** Checked on each admin page load
- **Auto-redirect:** Unauthenticated users sent to `/login`

---

## 3. Admin Dashboard

**Route:** `/admin`

### 3.1 Dashboard Components

#### 3.1.1 Statistics Overview

Displays key metrics in a 4-column grid:
- Total Sitios
- Active Projects
- Completed Projects
- Total Beneficiaries

#### 3.1.2 Analytics Tabs

| Tab | Content |
|-----|---------|
| **Overview** | Project status distribution, category breakdown, monthly progress |
| **Sitios** | Population stats, demographics, social services summary |
| **Geographic** | Projects by municipality distribution |
| **Budget** | Budget allocation by category |
| **Employment** | Employment generation stats (male/female) |

#### 3.1.3 Quick Actions

- **Export Report:** Generate PDF report of all projects
- **New Project:** Navigate to project creation form

### 3.2 Dashboard Data Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Mock Data      │────▶│   Aggregation    │────▶│   Dashboard      │
│   (localStorage) │     │   Functions      │     │   Components     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                        │
        │                        │                        │
    ┌───┴───┐               ┌───┴───┐               ┌───┴───┐
    │sitios │               │stats  │               │Charts │
    │projects│              │chart  │               │Tables │
    │activities│            │data   │               │Cards  │
    └───────┘               └───────┘               └───────┘
```

---

## 4. Sitio Management

### 4.1 Sitio List View

**Route:** `/admin/sitios`

#### Features:
- **Search:** Filter by sitio name, municipality, or barangay
- **Filters:** Municipality dropdown, Barangay dropdown
- **Sorting:** Name, municipality, barangay, population, households
- **Pagination:** 10 items per page
- **URL Sync:** Filters persist in URL query parameters

#### Actions per Sitio:
- View details
- Edit
- Delete (with confirmation dialog)
- Download PDF (planned)

### 4.2 Create Sitio

**Route:** `/admin/sitios/new`

#### Multi-Tab Form Structure:

```
┌─────────────────────────────────────────────────────────────┐
│                    CREATE SITIO WIZARD                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tab 1: Basic Info                                          │
│  ├── Municipality (required)                                │
│  ├── Barangay (required)                                    │
│  ├── Sitio Name (required)                                  │
│  ├── Province                                               │
│  ├── Population                                             │
│  ├── Households                                             │
│  ├── Coordinates (lat/lng)                                  │
│  └── Coding                                                 │
│                                                             │
│  Tab 2: Demographics & Social                               │
│  ├── Demographics                                           │
│  │   ├── Male population                                    │
│  │   ├── Female population                                  │
│  │   ├── Age 0-14                                           │
│  │   ├── Age 15-64                                          │
│  │   └── Age 65+                                            │
│  └── Social Services                                        │
│      ├── Registered voters                                  │
│      ├── PhilHealth beneficiaries                           │
│      └── 4Ps beneficiaries                                  │
│                                                             │
│  Tab 3: Livelihoods & Economy                               │
│  ├── Employment types                                       │
│  ├── Income brackets                                        │
│  ├── Agriculture data                                       │
│  │   ├── Farmers count                                      │
│  │   ├── Farm area (hectares)                               │
│  │   └── Top crops                                          │
│  ├── Livestock counts                                       │
│  └── Food security                                          │
│                                                             │
│  Tab 4: Infrastructure & Housing                            │
│  ├── Water & Sanitation                                     │
│  │   ├── Water systems                                      │
│  │   ├── Water sources                                      │
│  │   └── Toilet facilities                                  │
│  ├── Utilities                                              │
│  │   ├── Electricity access                                 │
│  │   └── Alternative sources                                │
│  └── Housing                                                │
│      ├── Quality types                                      │
│      └── Ownership types                                    │
│                                                             │
│  Tab 5: Community Services                                  │
│  ├── Organizations                                          │
│  ├── Info dissemination methods                             │
│  ├── Transportation methods                                 │
│  └── Domestic animals (pets)                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Sitio Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  SITIO CREATION PROCESS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Navigate to /admin/sitios/new                           │
│                    │                                        │
│                    ▼                                        │
│  2. Fill Tab 1: Basic Info (required)                       │
│     - Validation: municipality, barangay, name required     │
│                    │                                        │
│                    ▼                                        │
│  3. Fill Tabs 2-5: Additional Data (optional)               │
│     - Demographic validation on save                        │
│                    │                                        │
│                    ▼                                        │
│  4. Click "Create Sitio"                                    │
│                    │                                        │
│                    ▼                                        │
│  5. System Validates                                        │
│     - Required fields check                                 │
│     - Demographic consistency check                         │
│         │                                                   │
│    ┌────┴────┐                                              │
│    │ Valid   │ Invalid                                      │
│    ▼         ▼                                              │
│  6a. Save   6b. Show error toast                            │
│  to storage      │                                          │
│      │           │                                          │
│      ▼           │                                          │
│  7. Log audit    │                                          │
│     action       │                                          │
│      │           │                                          │
│      ▼           │                                          │
│  8. Show success │                                          │
│     toast        │                                          │
│      │           │                                          │
│      ▼           │                                          │
│  9. Redirect to  │                                          │
│     /admin/sitios                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Edit Sitio

**Route:** `/admin/sitios/[id]/edit`

- Pre-populates form with existing data
- Same tab structure as create
- Tracks changes for audit log
- Validates demographic data on save

### 4.5 Delete Sitio

**Process:**
1. User clicks delete icon on sitio row
2. Confirmation dialog appears
3. User confirms deletion
4. System removes sitio from storage
5. Audit log entry created
6. Success toast displayed
7. List refreshes

---

## 5. Project Management

### 5.1 Project List View

**Route:** `/admin/projects`

#### Features:
- **Search:** Filter by project title or sitio location
- **Filters:** Status, Category
- **Sorting:** Title, budget, progress, status, last updated
- **Pagination:** 10 items per page
- **URL Sync:** All filters persist in URL

#### Status Badges:
| Status | Badge Variant | Color |
|--------|---------------|-------|
| Planning | Secondary | Gray |
| In Progress | Warning | Yellow |
| Completed | Success | Green |
| Suspended | Destructive | Red |

#### Actions per Project:
- View details
- Edit
- Quick edit
- Delete
- Download PDF report

### 5.2 Create Project

**Route:** `/admin/projects/new`

#### Multi-Tab Wizard (5 Steps):

```
┌─────────────────────────────────────────────────────────────┐
│                  PROJECT CREATION WIZARD                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ═══════════════════════════════════════════════════════    │
│  Tab 1: Category & Type ────────────────────────────────    │
│  ═══════════════════════════════════════════════════════    │
│  │                                                          │
│  ├── Project Title (required)                               │
│  ├── Description (required)                                 │
│  ├── Category Selection (required)                          │
│  │   - Infrastructure                                       │
│  │   - Agriculture                                          │
│  │   - Education                                            │
│  │   - Health                                               │
│  │   - Livelihood                                           │
│  │   - Environment                                          │
│  ├── Project Type (required) - based on category            │
│  └── Implementing Agency (required)                         │
│                                                             │
│  ═══════════════════════════════════════════════════════    │
│  Tab 2: Location & Beneficiaries ───────────────────────    │
│  ═══════════════════════════════════════════════════════    │
│  │                                                          │
│  └── Project Sitios (required - at least 1)                 │
│      ├── Select from existing sitios                        │
│      ├── Beneficiaries target per sitio                     │
│      ├── Priority level (high/medium/low)                   │
│      ├── Focal person name                                  │
│      └── Focal person contact                               │
│                                                             │
│  ═══════════════════════════════════════════════════════    │
│  Tab 3: Performance Targets ────────────────────────────    │
│  ═══════════════════════════════════════════════════════    │
│  │                                                          │
│  ├── Target Start Date (required)                           │
│  ├── Duration in Calendar Days (required)                   │
│  ├── Total Budget (required)                                │
│  ├── Employment Generated                                   │
│  │   ├── Male                                               │
│  │   └── Female                                             │
│  └── Performance Indicators (auto-populated by type)        │
│                                                             │
│  ═══════════════════════════════════════════════════════    │
│  Tab 4: Budget & Resources ─────────────────────────────    │
│  ═══════════════════════════════════════════════════════    │
│  │                                                          │
│  ├── Funding Sources (required - at least 1)                │
│  │   ├── Source name                                        │
│  │   ├── Source type (provincial/national/partner/lgu)      │
│  │   ├── Amount                                             │
│  │   └── Percentage                                         │
│  └── Budget Components (required - at least 1)              │
│      ├── Component name                                     │
│      ├── Amount                                             │
│      └── Percentage                                         │
│                                                             │
│  ═══════════════════════════════════════════════════════    │
│  Tab 5: Monthly Planning ───────────────────────────────    │
│  ═══════════════════════════════════════════════════════    │
│  │                                                          │
│  └── Monthly Targets (auto-generated from dates)            │
│      ├── Month/Year                                         │
│      ├── Planned Physical Progress %                        │
│      └── Planned Budget Release                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Project Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                PROJECT CREATION PROCESS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  START                                                      │
│    │                                                        │
│    ▼                                                        │
│  Navigate to /admin/projects/new                            │
│    │                                                        │
│    ▼                                                        │
│  ┌─────────────────────────────────────┐                    │
│  │ Tab 1: Category & Type              │                    │
│  │ Validation: All fields required     │                    │
│  └────────────────┬────────────────────┘                    │
│                   │ Valid → Next                            │
│                   ▼                                         │
│  ┌─────────────────────────────────────┐                    │
│  │ Tab 2: Location & Beneficiaries     │                    │
│  │ Validation: At least 1 sitio        │                    │
│  └────────────────┬────────────────────┘                    │
│                   │ Valid → Next                            │
│                   ▼                                         │
│  ┌─────────────────────────────────────┐                    │
│  │ Tab 3: Performance Targets          │                    │
│  │ Validation: Dates & budget required │                    │
│  └────────────────┬────────────────────┘                    │
│                   │ Valid → Next                            │
│                   ▼                                         │
│  ┌─────────────────────────────────────┐                    │
│  │ Tab 4: Budget & Resources           │                    │
│  │ Validation: At least 1 of each      │                    │
│  └────────────────┬────────────────────┘                    │
│                   │ Valid → Next                            │
│                   ▼                                         │
│  ┌─────────────────────────────────────┐                    │
│  │ Tab 5: Monthly Planning             │                    │
│  │ Validation: All months have targets │                    │
│  └────────────────┬────────────────────┘                    │
│                   │                                         │
│                   ▼                                         │
│  All tabs valid? ─────┐                                     │
│         │             │                                     │
│    ┌────┴────┐   ┌────┴────┐                                │
│    │ Yes     │   │ No      │                                │
│    ▼         │   ▼         │                                │
│  Enable      │   Show validation                            │
│  Save button │   errors on tabs                             │
│    │         │                                              │
│    ▼         │                                              │
│  Click Save  │                                              │
│    │         │                                              │
│    ▼         │                                              │
│  Generate ID │                                              │
│    │         │                                              │
│    ▼         │                                              │
│  Calculate   │                                              │
│  totals      │                                              │
│    │         │                                              │
│    ▼         │                                              │
│  Determine   │                                              │
│  status from │                                              │
│  start date  │                                              │
│    │         │                                              │
│    ▼         │                                              │
│  Save to     │                                              │
│  localStorage│                                              │
│    │         │                                              │
│    ▼         │                                              │
│  Log audit   │                                              │
│  action      │                                              │
│    │         │                                              │
│    ▼         │                                              │
│  Redirect to │                                              │
│  /admin/projects                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Project Data Structure

```typescript
interface Project {
  id: number;
  title: string;
  description: string;
  category_key: CategoryKey;
  project_type_id?: number;
  status: 'planning' | 'in-progress' | 'completed' | 'suspended';
  start_date: string;
  contract_duration: string;
  total_budget: number;
  contract_cost: number;
  beneficiaries: number;
  project_year: number;
  
  // Status tracking
  issues?: string;
  recommendations?: string;
  catch_up_plan?: string;
  
  // Related data
  project_sitios?: ProjectSitio[];
  monthly_progress?: MonthlyProgress[];
  monthly_targets?: MonthlyTarget[];
  funding_sources?: FundingSource[];
  budget_components?: BudgetComponent[];
  employment_generated?: { male: number; female: number };
  implementing_agency?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}
```

---

## 6. Data Import

**Route:** `/admin/import`

### 6.1 Import Wizard Steps

```
┌─────────────────────────────────────────────────────────────┐
│                    IMPORT WIZARD                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Upload                                             │
│  ═══════════════                                            │
│  ├── Drag & drop or click to select file                    │
│  ├── Supported formats: CSV, Excel (.xlsx, .xls)            │
│  └── File size limit: 10MB                                  │
│                                                             │
│  Step 2: Map Columns                                        │
│  ═══════════════════                                        │
│  ├── Auto-detection of column mappings                      │
│  ├── Manual override for each column                        │
│  ├── Required fields highlighted                            │
│  └── Preview of first few rows                              │
│                                                             │
│  Step 3: Preview                                            │
│  ═══════════════                                            │
│  ├── Valid records count                                    │
│  ├── Invalid records with error details                     │
│  ├── Review and confirm import                              │
│  └── Option to go back and fix mappings                     │
│                                                             │
│  Step 4: Duplicates (conditional)                           │
│  ═════════════════════════════════                          │
│  ├── Shown only if duplicates found                         │
│  ├── Options per duplicate:                                 │
│  │   - Skip (keep existing)                                 │
│  │   - Replace (overwrite existing)                         │
│  └── Bulk actions for all duplicates                        │
│                                                             │
│  Step 5: Complete                                           │
│  ═══════════════                                            │
│  ├── Success summary                                        │
│  │   - New sitios added                                     │
│  │   - Sitios updated (replaced)                            │
│  │   - Duplicates skipped                                   │
│  └── Actions:                                               │
│      - Import More Data                                     │
│      - View Sitios List                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Import Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  IMPORT PROCESS FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  File Upload                                                │
│      │                                                      │
│      ▼                                                      │
│  Parse File (CSV/Excel)                                     │
│      │                                                      │
│      ▼                                                      │
│  Extract Headers                                            │
│      │                                                      │
│      ▼                                                      │
│  Auto-Map Columns ◄─── Column Mapping Config                │
│      │                                                      │
│      ▼                                                      │
│  User Reviews/Adjusts Mappings                              │
│      │                                                      │
│      ▼                                                      │
│  Transform Rows to Sitio Objects                            │
│      │                                                      │
│      ▼                                                      │
│  Validate Each Sitio                                        │
│      │                                                      │
│      ├──► Valid Sitios                                      │
│      └──► Invalid Sitios (with errors)                      │
│      │                                                      │
│      ▼                                                      │
│  Check for Duplicates                                       │
│  (match by municipality+barangay+name)                      │
│      │                                                      │
│      ├──► No duplicates → Proceed to import                 │
│      └──► Duplicates found → Show resolver                  │
│               │                                             │
│               ▼                                             │
│          User resolves each:                                │
│          - Skip or Replace                                  │
│               │                                             │
│               ▼                                             │
│  Perform Import                                             │
│      │                                                      │
│      ├──► Add new sitios                                    │
│      ├──► Replace existing (if chosen)                      │
│      └──► Skip duplicates (if chosen)                       │
│      │                                                      │
│      ▼                                                      │
│  Save to localStorage                                       │
│      │                                                      │
│      ▼                                                      │
│  Log Audit Action                                           │
│      │                                                      │
│      ▼                                                      │
│  Display Results Summary                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Column Mapping Configuration

The system auto-detects common column headers:

| CSV Header Pattern | Sitio Field |
|-------------------|-------------|
| municipality, mun | municipality |
| barangay, brgy | barangay |
| sitio, name | name |
| population, pop | population |
| households, hh | households |
| latitude, lat | coordinates.lat |
| longitude, lng, long | coordinates.lng |

---

## 7. User Management

**Route:** `/admin/users` (Superadmin only)

### 7.1 User List Features

- **Search:** Filter by name, email, or department
- **Filters:** Role, Status (active/inactive)
- **Display:** Avatar, name, email, role badge, department, status, last login
- **Actions:** Edit, Deactivate (soft delete)

### 7.2 Create User

```
┌─────────────────────────────────────────────────────────────┐
│                   CREATE USER FORM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Basic Information                                          │
│  ├── Full Name (required)                                   │
│  ├── Email (required, unique)                               │
│  ├── Password (required)                                    │
│  └── Department                                             │
│                                                             │
│  Role & Status                                              │
│  ├── Role Selection                                         │
│  │   ├── Superadmin                                         │
│  │   ├── Admin                                              │
│  │   └── Viewer                                             │
│  └── Active Status (checkbox)                               │
│                                                             │
│  Permissions Matrix                                         │
│  ┌────────────────┬───────┬───────┬────────┐                │
│  │ Resource       │ Read  │ Write │ Delete │                │
│  ├────────────────┼───────┼───────┼────────┤                │
│  │ Sitios         │  [x]  │  [x]  │  [x]   │                │
│  │ Projects       │  [x]  │  [x]  │  [x]   │                │
│  │ Users          │  [x]  │  [ ]  │  [ ]   │                │
│  │ Audit Logs     │  [x]  │  [ ]  │  [ ]   │                │
│  └────────────────┴───────┴───────┴────────┘                │
│                                                             │
│  Note: Permissions auto-populate based on role              │
│        but can be customized                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Default Permissions by Role

```typescript
const DEFAULT_PERMISSIONS = {
  superadmin: {
    sitios: { read: true, write: true, delete: true },
    projects: { read: true, write: true, delete: true },
    users: { read: true, write: true, delete: true },
    audit_logs: { read: true, write: true, delete: true }
  },
  admin: {
    sitios: { read: true, write: true, delete: true },
    projects: { read: true, write: true, delete: true },
    users: { read: true, write: false, delete: false },
    audit_logs: { read: true, write: false, delete: false }
  },
  viewer: {
    sitios: { read: true, write: false, delete: false },
    projects: { read: true, write: false, delete: false },
    users: { read: false, write: false, delete: false },
    audit_logs: { read: false, write: false, delete: false }
  }
};
```

### 7.4 User Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                   USER LIFECYCLE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐                                               │
│  │ Created  │ ──► User added to system                      │
│  └────┬─────┘     - Default permissions applied             │
│       │           - Audit logged                            │
│       ▼                                                     │
│  ┌──────────┐                                               │
│  │  Active  │ ──► User can log in                           │
│  └────┬─────┘     - Access based on role/permissions        │
│       │                                                     │
│       │ (Edit)                                              │
│       ▼                                                     │
│  ┌──────────┐                                               │
│  │ Modified │ ──► Update role, permissions, info            │
│  └────┬─────┘     - Changes tracked in audit log            │
│       │                                                     │
│       │ (Deactivate)                                        │
│       ▼                                                     │
│  ┌──────────┐                                               │
│  │ Inactive │ ──► Cannot log in                             │
│  └────┬─────┘     - Data preserved                          │
│       │           - Can be reactivated                      │
│       │                                                     │
│       │ (Reactivate)                                        │
│       ▼                                                     │
│  ┌──────────┐                                               │
│  │  Active  │ ──► User can log in again                     │
│  └──────────┘                                               │
│                                                             │
│  Note: Hard delete not supported - soft delete only         │
│        to preserve audit trail integrity                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Audit Logging

**Route:** `/admin/audit` (Admin+ only)

### 8.1 Audit Log Features

- **Statistics Cards:**
  - Total Activities
  - Login count
  - Update count
  - Active users count

- **Filters:**
  - Search by user, action, resource
  - Filter by action type
  - Filter by resource type
  - Filter by user

- **Log Entry Details:**
  - Timestamp (relative & absolute)
  - User name & avatar
  - Action badge (color-coded)
  - Resource type & name
  - Details text
  - Field-level changes (for updates)

### 8.2 Audit Actions

| Action | Icon | Badge Color | Description |
|--------|------|-------------|-------------|
| Login | LogIn | Green | User authentication |
| Logout | LogOut | Default | User session end |
| Create | Plus | Primary | New record created |
| Update | Pencil | Secondary | Record modified |
| Delete | Trash | Destructive | Record removed |
| View | FileText | Outline | Record accessed |
| Export | Download | Outline | Data exported |
| Import | Upload | Outline | Data imported |

### 8.3 Audit Log Structure

```typescript
interface AuditLog {
  id: string;              // UUID
  user_id: number;         // Reference to user
  user_name: string;       // Denormalized for display
  action: AuditAction;     // login, create, update, etc.
  resource_type: string;   // user, sitio, project, system
  resource_id?: number;    // ID of affected record
  resource_name?: string;  // Name for display
  details?: string;        // Human-readable description
  changes?: AuditFieldChange[];  // For updates
  ip_address?: string;     // Client IP (if available)
  timestamp: string;       // ISO 8601 format
}

interface AuditFieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}
```

### 8.4 Audit Log Export

- **Format:** CSV
- **Columns:** Timestamp, User, Action, Resource Type, Resource Name, Details, IP Address
- **Filename:** `audit-logs-YYYY-MM-DD.csv`

---

## 9. Data Flow Diagrams

### 9.1 Overall System Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM DATA FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐                                                        │
│  │   Browser   │                                                        │
│  │  (Client)   │                                                        │
│  └──────┬──────┘                                                        │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────────────────┐                │
│  │              SvelteKit Application                   │                │
│  │  ┌───────────────────────────────────────────────┐  │                │
│  │  │                   Routes                       │  │                │
│  │  │  /admin  /admin/sitios  /admin/projects  ...  │  │                │
│  │  └──────────────────────┬────────────────────────┘  │                │
│  │                         │                            │                │
│  │  ┌──────────────────────▼────────────────────────┐  │                │
│  │  │                  Components                    │  │                │
│  │  │   Forms  Tables  Charts  Dialogs  Cards  ...  │  │                │
│  │  └──────────────────────┬────────────────────────┘  │                │
│  │                         │                            │                │
│  │  ┌──────────────────────▼────────────────────────┐  │                │
│  │  │               Stores & State                   │  │                │
│  │  │          authStore  ($state runes)            │  │                │
│  │  └──────────────────────┬────────────────────────┘  │                │
│  │                         │                            │                │
│  │  ┌──────────────────────▼────────────────────────┐  │                │
│  │  │             Utility Functions                  │  │                │
│  │  │  storage.ts  audit.ts  validators  parsers    │  │                │
│  │  └──────────────────────┬────────────────────────┘  │                │
│  └─────────────────────────┼────────────────────────────┘                │
│                            │                                             │
│                            ▼                                             │
│  ┌─────────────────────────────────────────────────────┐                │
│  │                   localStorage                       │                │
│  │                                                      │                │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐          │                │
│  │   │  sitios  │  │ projects │  │  users   │          │                │
│  │   └──────────┘  └──────────┘  └──────────┘          │                │
│  │                                                      │                │
│  │   ┌──────────┐  ┌──────────┐                        │                │
│  │   │  audit   │  │ session  │                        │                │
│  │   │   logs   │  │   data   │                        │                │
│  │   └──────────┘  └──────────┘                        │                │
│  │                                                      │                │
│  └─────────────────────────────────────────────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Storage Keys

| Key | Content | Description |
|-----|---------|-------------|
| `sccdp_sitios` | Sitio[] | All sitio records |
| `sccdp_projects` | Project[] | All project records |
| `sccdp_users` | User[] | All user accounts |
| `sccdp_audit_logs` | AuditLog[] | Audit trail |
| `sccdp_auth_session` | Session | Current user session |

---

## Appendix A: File Structure Reference

```
src/
├── routes/
│   ├── admin/
│   │   ├── +layout.svelte        # Admin layout with auth check
│   │   ├── +page.svelte          # Dashboard
│   │   ├── sitios/
│   │   │   ├── +page.svelte      # Sitio list
│   │   │   ├── new/+page.svelte  # Create sitio
│   │   │   └── [id]/
│   │   │       ├── +page.svelte  # View sitio
│   │   │       └── edit/         # Edit sitio
│   │   ├── projects/
│   │   │   ├── +page.svelte      # Project list
│   │   │   ├── new/+page.svelte  # Create project
│   │   │   └── [id]/
│   │   │       ├── +page.svelte  # View project
│   │   │       ├── edit/         # Edit project
│   │   │       └── quick-edit/   # Quick edit
│   │   ├── import/+page.svelte   # Data import
│   │   ├── users/+page.svelte    # User management
│   │   └── audit/+page.svelte    # Audit logs
│   └── login/+page.svelte        # Login page
├── lib/
│   ├── components/
│   │   ├── admin/                # Admin-specific components
│   │   ├── ui/                   # shadcn-svelte components
│   │   └── ...
│   ├── stores/
│   │   └── auth.svelte.ts        # Auth state management
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   └── utils/
│       ├── storage.ts            # localStorage operations
│       ├── audit.ts              # Audit logging
│       ├── user-storage.ts       # User CRUD
│       ├── import-parser.ts      # CSV/Excel parsing
│       ├── import-validator.ts   # Data validation
│       └── column-mapper.ts      # Import column mapping
```

---

## Appendix B: Error Handling

### Validation Errors

| Context | Error | Resolution |
|---------|-------|------------|
| Sitio Creation | Missing required fields | Highlight tab with errors |
| Project Creation | Invalid tab progression | Block "Next" until valid |
| Import | Invalid row data | Show in preview, exclude from import |
| User Creation | Duplicate email | Show toast error |
| Login | Invalid credentials | Show error in alert |

### Storage Errors

- **Storage Full:** Show toast with message suggesting data cleanup
- **Parse Error:** Log to console, show user-friendly message
- **Session Expired:** Redirect to login with message

---

## Appendix C: Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Superadmin | superadmin@southcotabato.gov.ph | admin123 |
| Admin | juan.delacruz@southcotabato.gov.ph | admin123 |
| Viewer | pedro.reyes@southcotabato.gov.ph | viewer123 |

---

*Document Version: 1.0*
*Last Updated: December 2, 2025*
*System: South Cotabato Convergence Data Bank - Admin Module*
