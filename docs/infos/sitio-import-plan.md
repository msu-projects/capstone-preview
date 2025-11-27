# Sitio Data Upload Implementation Plan

## Overview

This document outlines the implementation plan for building a complete sitio data import feature that supports uploading the 86-column dataset described in `docs/sitio.md`. The system will support both CSV and Excel files, allow flexible column mapping, validate data, and persist to browser LocalStorage.

## Current State Analysis

### What Exists

- Basic Sitio type with ~15 fields (id, name, location, population, basic demographics)
- Mock data with 25 sample sitios
- Admin dashboard and layout structure
- shadcn-svelte UI component library

### What's Missing

- Import page route (`/admin/import`)
- Manual sitio entry form (`/admin/sitios/new` and `/admin/sitios/[id]/edit`)
- File upload/parsing capabilities
- Extended Sitio type covering all 86 columns
- Column mapping interface
- Data validation utilities
- LocalStorage persistence layer
- Duplicate resolution logic

## Requirements (Based on User Input)

1. **File Formats**: Support both CSV (.csv) and Excel (.xlsx) files
2. **Manual Input**: Provide a web form for adding/editing individual sitio records
3. **Data Storage**: Browser LocalStorage (persists across sessions, ~5MB limit)
4. **Column Mapping**: Allow manual mapping when CSV headers don't match exactly
5. **Duplicate Handling**: Prompt user to decide (replace/skip) when duplicates detected

## Implementation Phases

### Phase 1: Data Model & Type Updates

**File**: `src/lib/types/index.ts`

Expand the `Sitio` interface to include all 86 columns organized into logical nested objects:

```typescript
export interface Sitio {
  // Existing fields (keep for backwards compatibility)
  id: number;
  name: string; // maps to SITIO column
  municipality: string;
  barangay: string;
  province?: string;
  population: number; // maps to POPULATION - TOTAL
  households: number; // maps to No. of Households
  coordinates: { lat: number; lng: number; };

  // New structured fields for 86-column dataset
  coding?: {
    number: string; // NO.
    code: string; // CODING (e.g., "1-1")
  };

  demographics: {
    male: number;
    female: number;
    total: number;
    age_0_14: number;
    age_15_64: number;
    age_65_above: number;
  };

  social_services?: {
    registered_voters: number;
    philhealth_beneficiaries: number;
    fourps_beneficiaries: number;
  };

  economic_condition?: {
    top_employments: string[]; // Array of top 3
    top_income_brackets: string[]; // Array of top 3
  };

  agriculture?: {
    farmers_count: number;
    farmer_associations: number;
    farm_area_hectares: number;
    top_crops: string[]; // Array of top 5
  };

  water_sanitation?: {
    water_systems_count: number;
    water_sources: Array<{ source: string; condition?: string }>;
    households_without_toilet: number;
    toilet_facility_types: string[];
    waste_segregation_practice: boolean | null;
  };

  livestock_poultry?: {
    pigs?: number;
    cows?: number;
    carabaos?: number;
    horses?: number;
    goats?: number;
    chickens?: number;
    ducks?: number;
  };

  food_security?: {
    households_with_backyard_garden: number;
    common_garden_commodities: string[]; // Top 3
  };

  housing?: {
    quality_types: string[]; // Concrete, Wood, Half-Concrete, Makeshift, Others
    ownership_types: string[]; // Owned, Rented, Protected Land, Informal Settler, Owner Consent
  };

  domestic_animals?: {
    total_count: number;
    dogs: number;
    cats: number;
    dogs_vaccinated: number;
    cats_vaccinated: number;
  };

  community_empowerment?: {
    sectoral_organizations: number;
    info_dissemination_methods: string[]; // Radio, Signages, Person in Authority, etc.
    transportation_methods: string[]; // Motorcycle, Tricycle, 4-Wheels, Boat
  };

  utilities?: {
    households_with_electricity: number;
    alternative_electricity_sources: string[]; // Solar, Generator, Battery
  };

  // Metadata
  projects_count?: number;
  created_at: string;
  updated_at?: string;
}
```

**New Types for Import Flow**:

```typescript
export interface ImportedRow {
  [key: string]: string | number | null;
}

export interface ColumnMapping {
  csvHeader: string;
  sitioField: string;
  isRequired: boolean;
  autoMatched: boolean;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  duplicates: number;
  errors: ImportValidationError[];
}

export interface DuplicateSitio {
  existing: Sitio;
  incoming: Sitio;
  key: string; // municipality-barangay-sitio identifier
}
```

### Phase 2: Install Dependencies

**Commands**:

```bash
npm install papaparse xlsx
npm install --save-dev @types/papaparse
```

**Libraries**:

- `papaparse` (~50KB) - Fast, reliable CSV parser with header detection
- `xlsx` (~800KB) - Excel file reading/writing, supports .xlsx and .xls
- `@types/papaparse` - TypeScript definitions

### Phase 3: Data Persistence Layer

**File**: `src/lib/utils/storage.ts`

Create LocalStorage utilities for persisting sitio data:

```typescript
const STORAGE_KEY = 'sccdp_sitios';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function saveSitios(sitios: Sitio[]): boolean {
  try {
    const json = JSON.stringify(sitios);
    if (json.length > MAX_STORAGE_SIZE) {
      throw new Error('Data exceeds LocalStorage limit (5MB)');
    }
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch (error) {
    console.error('Failed to save sitios:', error);
    return false;
  }
}

export function loadSitios(): Sitio[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Failed to load sitios:', error);
    return [];
  }
}

export function clearSitios(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStorageSize(): number {
  const json = localStorage.getItem(STORAGE_KEY);
  return json ? json.length : 0;
}
```

**File**: Update `src/lib/mock-data/index.ts`

Modify to use LocalStorage with fallback to mock data:

```typescript
import { loadSitios, saveSitios } from '$lib/utils/storage';

// Try to load from storage first, fall back to mock data
let storedSitios = loadSitios();
if (storedSitios.length === 0) {
  // Initialize with mock data on first load
  storedSitios = mockSitiosArray;
  saveSitios(storedSitios);
}

export const sitios = storedSitios;
```

### Phase 4: Import Utilities

#### 4.1 File Parser

**File**: `src/lib/utils/import-parser.ts`

```typescript
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function parseFile(file: File): Promise<{
  headers: string[];
  rows: ImportedRow[];
}> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSV(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file);
  } else {
    throw new Error('Unsupported file type. Please upload CSV or Excel files.');
  }
}

async function parseCSV(file: File): Promise<{ headers: string[]; rows: ImportedRow[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as ImportedRow[];
        resolve({ headers, rows });
      },
      error: (error) => reject(error)
    });
  });
}

async function parseExcel(file: File): Promise<{ headers: string[]; rows: ImportedRow[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Use first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }

        const headers = jsonData[0].map(h => String(h));
        const rows = jsonData.slice(1).map(row => {
          const obj: ImportedRow = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] ?? null;
          });
          return obj;
        });

        resolve({ headers, rows });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
```

#### 4.2 Column Mapper

**File**: `src/lib/utils/column-mapper.ts`

```typescript
// Define expected Sitio field mappings
export const SITIO_FIELD_DEFINITIONS = [
  { field: 'coding.number', label: 'Record Number', csvHeader: 'NO.', required: false },
  { field: 'coding.code', label: 'Coding', csvHeader: 'CODING', required: false },
  { field: 'municipality', label: 'Municipality', csvHeader: 'CODING - MUNICIPALITY', required: true },
  { field: 'barangay', label: 'Barangay', csvHeader: 'BARANGAY', required: true },
  { field: 'name', label: 'Sitio/Purok', csvHeader: 'SITIO', required: true },
  // ... (all 86 column mappings)
];

export function autoMapColumns(csvHeaders: string[]): ColumnMapping[] {
  return csvHeaders.map(csvHeader => {
    // Try exact match first
    let match = SITIO_FIELD_DEFINITIONS.find(def =>
      def.csvHeader.toLowerCase() === csvHeader.toLowerCase()
    );

    // Try fuzzy match (contains, similar)
    if (!match) {
      match = SITIO_FIELD_DEFINITIONS.find(def =>
        csvHeader.toLowerCase().includes(def.label.toLowerCase()) ||
        def.label.toLowerCase().includes(csvHeader.toLowerCase())
      );
    }

    return {
      csvHeader,
      sitioField: match?.field || '',
      isRequired: match?.required || false,
      autoMatched: !!match
    };
  });
}

export function transformRowToSitio(
  row: ImportedRow,
  mappings: ColumnMapping[]
): Partial<Sitio> {
  const sitio: any = {
    demographics: {},
    social_services: {},
    // ... initialize all nested objects
  };

  mappings.forEach(mapping => {
    if (!mapping.sitioField) return;

    const value = row[mapping.csvHeader];
    const fieldPath = mapping.sitioField.split('.');

    // Set nested field value
    let current = sitio;
    for (let i = 0; i < fieldPath.length - 1; i++) {
      current = current[fieldPath[i]];
    }
    current[fieldPath[fieldPath.length - 1]] = value;
  });

  return sitio;
}
```

#### 4.3 Validator

**File**: `src/lib/utils/import-validator.ts`

```typescript
export function validateSitio(sitio: Partial<Sitio>, rowIndex: number): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  // Required fields
  if (!sitio.municipality) {
    errors.push({ row: rowIndex, field: 'municipality', message: 'Municipality is required' });
  }
  if (!sitio.barangay) {
    errors.push({ row: rowIndex, field: 'barangay', message: 'Barangay is required' });
  }
  if (!sitio.name) {
    errors.push({ row: rowIndex, field: 'name', message: 'Sitio name is required' });
  }

  // Type validation
  if (sitio.population && typeof sitio.population !== 'number') {
    errors.push({ row: rowIndex, field: 'population', message: 'Population must be a number' });
  }

  // Coordinate validation
  if (sitio.coordinates) {
    if (sitio.coordinates.lat < -90 || sitio.coordinates.lat > 90) {
      errors.push({ row: rowIndex, field: 'coordinates.lat', message: 'Invalid latitude' });
    }
    if (sitio.coordinates.lng < -180 || sitio.coordinates.lng > 180) {
      errors.push({ row: rowIndex, field: 'coordinates.lng', message: 'Invalid longitude' });
    }
  }

  return errors;
}

export function findDuplicates(
  incomingSitios: Partial<Sitio>[],
  existingSitios: Sitio[]
): DuplicateSitio[] {
  const duplicates: DuplicateSitio[] = [];

  incomingSitios.forEach(incoming => {
    const key = `${incoming.municipality}-${incoming.barangay}-${incoming.name}`;
    const existing = existingSitios.find(s =>
      `${s.municipality}-${s.barangay}-${s.name}` === key
    );

    if (existing) {
      duplicates.push({
        existing,
        incoming: incoming as Sitio,
        key
      });
    }
  });

  return duplicates;
}
```

### Phase 5: UI Components

#### 5.1 Import Page Route

**File**: `src/routes/admin/import/+page.svelte`

Multi-step wizard with state management:

```svelte
<script lang="ts">
  import FileUpload from '$lib/components/admin/FileUpload.svelte';
  import ColumnMapper from '$lib/components/admin/ColumnMapper.svelte';
  import ImportPreview from '$lib/components/admin/ImportPreview.svelte';
  import DuplicateResolver from '$lib/components/admin/DuplicateResolver.svelte';

  let step = $state<'upload' | 'map' | 'preview' | 'duplicates' | 'complete'>('upload');
  let uploadedFile = $state<File | null>(null);
  let parsedData = $state<{ headers: string[]; rows: ImportedRow[] } | null>(null);
  let mappings = $state<ColumnMapping[]>([]);
  let validatedSitios = $state<Partial<Sitio>[]>([]);
  let duplicates = $state<DuplicateSitio[]>([]);

  // Step handlers
  async function handleFileUploaded(file: File) { ... }
  function handleMappingComplete(finalMappings: ColumnMapping[]) { ... }
  function handlePreviewConfirm() { ... }
  function handleDuplicatesResolved(resolutions: Map<string, 'replace' | 'skip'>) { ... }
</script>

<div class="container mx-auto py-8">
	<h1 class="mb-8 text-3xl font-bold">Import Sitio Data</h1>

	{#if step === 'upload'}
		<FileUpload onFileSelected={handleFileUploaded} />
	{:else if step === 'map'}
		<ColumnMapper {mappings} onComplete={handleMappingComplete} />
	{:else if step === 'preview'}
		<ImportPreview {validatedSitios} onConfirm={handlePreviewConfirm} />
	{:else if step === 'duplicates'}
		<DuplicateResolver {duplicates} onResolved={handleDuplicatesResolved} />
	{:else if step === 'complete'}
		<SuccessMessage />
	{/if}
</div>
```

#### 5.2 FileUpload Component

**File**: `src/lib/components/admin/FileUpload.svelte`

Drag-and-drop upload area with file validation:

```svelte
<script lang="ts">
	import { Upload } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	let { onFileSelected } = $props<{ onFileSelected: (file: File) => void }>();

	let isDragging = $state(false);
	let fileInput: HTMLInputElement;

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const file = e.dataTransfer?.files[0];
		if (file) validateAndSelect(file);
	}

	function handleFileInput(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) validateAndSelect(file);
	}

	function validateAndSelect(file: File) {
		const validExtensions = ['.csv', '.xlsx', '.xls'];
		const extension = '.' + file.name.split('.').pop()?.toLowerCase();

		if (!validExtensions.includes(extension)) {
			alert('Please upload a CSV or Excel file');
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			// 10MB limit
			alert('File is too large (max 10MB)');
			return;
		}

		onFileSelected(file);
	}
</script>

<Card.Root>
	<Card.Content class="p-12">
		<div
			class="rounded-lg border-2 border-dashed p-12 text-center"
			class:border-primary={isDragging}
			ondragover={(e) => {
				e.preventDefault();
				isDragging = true;
			}}
			ondragleave={() => (isDragging = false)}
			ondrop={handleDrop}
		>
			<Upload class="mx-auto mb-4 size-16 text-muted-foreground" />
			<h3 class="mb-2 text-lg font-semibold">Drop your file here</h3>
			<p class="mb-4 text-sm text-muted-foreground">Supports CSV and Excel files (max 10MB)</p>
			<Button onclick={() => fileInput.click()}>Select File</Button>
			<input
				type="file"
				accept=".csv,.xlsx,.xls"
				bind:this={fileInput}
				onchange={handleFileInput}
				class="hidden"
			/>
		</div>
	</Card.Content>
</Card.Root>
```

#### 5.3 ColumnMapper Component

**File**: `src/lib/components/admin/ColumnMapper.svelte`

Interactive table for mapping CSV columns to Sitio fields:

```svelte
<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { SITIO_FIELD_DEFINITIONS } from '$lib/utils/column-mapper';

	let { mappings, onComplete } = $props<{
		mappings: ColumnMapping[];
		onComplete: (mappings: ColumnMapping[]) => void;
	}>();

	let localMappings = $state([...mappings]);

	function updateMapping(index: number, newField: string) {
		localMappings[index].sitioField = newField;
		localMappings[index].autoMatched = false;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold">Map Columns</h2>
		<Button onclick={() => onComplete(localMappings)}>Continue</Button>
	</div>

	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>CSV Column</Table.Head>
				<Table.Head>Maps To</Table.Head>
				<Table.Head>Status</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each localMappings as mapping, i}
				<Table.Row>
					<Table.Cell>{mapping.csvHeader}</Table.Cell>
					<Table.Cell>
						<Select.Root value={mapping.sitioField} onValueChange={(val) => updateMapping(i, val)}>
							<Select.Trigger>
								{SITIO_FIELD_DEFINITIONS.find((d) => d.field === mapping.sitioField)?.label ||
									'Select field...'}
							</Select.Trigger>
							<Select.Content>
								{#each SITIO_FIELD_DEFINITIONS as def}
									<Select.Item value={def.field}>{def.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Table.Cell>
					<Table.Cell>
						{#if mapping.autoMatched}
							<Badge variant="success">Auto-matched</Badge>
						{:else if mapping.sitioField}
							<Badge variant="secondary">Manual</Badge>
						{:else}
							<Badge variant="destructive">Unmapped</Badge>
						{/if}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
```

#### 5.4 ImportPreview Component

**File**: `src/lib/components/admin/ImportPreview.svelte`

Paginated preview with validation errors:

```svelte
<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';

	let { validatedSitios, errors, onConfirm } = $props<{
		validatedSitios: Partial<Sitio>[];
		errors: ImportValidationError[];
		onConfirm: () => void;
	}>();

	let page = $state(1);
	const perPage = 50;

	$derived.by(() => {
		const start = (page - 1) * perPage;
		return validatedSitios.slice(start, start + perPage);
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold">Preview Import</h2>
		<div class="flex gap-2">
			<Badge variant="success">{validatedSitios.length - errors.length} Valid</Badge>
			<Badge variant="destructive">{errors.length} Errors</Badge>
		</div>
	</div>

	{#if errors.length > 0}
		<Alert.Root variant="destructive">
			<Alert.Title>Validation Errors Found</Alert.Title>
			<Alert.Description>
				{errors.length} row(s) have errors. Please fix them before importing.
			</Alert.Description>
		</Alert.Root>
	{:else}
		<Button onclick={onConfirm}>Import {validatedSitios.length} Sitios</Button>
	{/if}

	<!-- Preview table with pagination -->
</div>
```

#### 5.5 DuplicateResolver Component

**File**: `src/lib/components/admin/DuplicateResolver.svelte`

Modal dialog for resolving each duplicate:

```svelte
<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	let { duplicates, onResolved } = $props<{
		duplicates: DuplicateSitio[];
		onResolved: (resolutions: Map<string, 'replace' | 'skip'>) => void;
	}>();

	let currentIndex = $state(0);
	let resolutions = $state(new Map<string, 'replace' | 'skip'>());

	function resolve(action: 'replace' | 'skip') {
		const dup = duplicates[currentIndex];
		resolutions.set(dup.key, action);

		if (currentIndex < duplicates.length - 1) {
			currentIndex++;
		} else {
			onResolved(resolutions);
		}
	}
</script>

<Dialog.Root open={currentIndex < duplicates.length}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Duplicate Sitio Found ({currentIndex + 1} of {duplicates.length})</Dialog.Title>
		</Dialog.Header>

		<div class="grid grid-cols-2 gap-4">
			<Card.Root>
				<Card.Header>
					<Card.Title>Existing Data</Card.Title>
				</Card.Header>
				<Card.Content>
					<!-- Display existing sitio data -->
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>New Data</Card.Title>
				</Card.Header>
				<Card.Content>
					<!-- Display incoming sitio data -->
				</Card.Content>
			</Card.Root>
		</div>

		<Dialog.Footer>
			<Button variant="secondary" onclick={() => resolve('skip')}>Keep Existing</Button>
			<Button onclick={() => resolve('replace')}>Replace with New</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

### Phase 6: Integration & Testing

#### 6.1 Update Admin Sidebar

**File**: `src/lib/components/layout/AdminSidebar.svelte`

Add "Import Data" navigation item:

```svelte
<a href="/admin/import" class="nav-item">
	<Upload class="size-4" />
	Import Data
</a>
```

#### 6.2 Create Sitios List Page

**File**: `src/routes/admin/sitios/+page.svelte`

Display imported sitios from LocalStorage:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { loadSitios } from '$lib/utils/storage';
	import * as Table from '$lib/components/ui/table';

	let sitios = $state<Sitio[]>([]);

	onMount(() => {
		sitios = loadSitios();
	});
</script>

<div class="container mx-auto py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Sitios</h1>
		<div class="flex gap-2">
			<a href="/admin/sitios/new">
				<Button>Add Sitio</Button>
			</a>
			<a href="/admin/import">
				<Button variant="secondary">Import Data</Button>
			</a>
		</div>
	</div>

	<Table.Root>
		<!-- Display sitios in table with edit/delete actions -->
	</Table.Root>
</div>
```

### Phase 7: Manual Input Forms

#### 7.1 Create Sitio Form Route

**File**: `src/routes/admin/sitios/new/+page.svelte`

Comprehensive form for manually entering sitio data:

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import SitioForm from '$lib/components/admin/sitios/SitioForm.svelte';
	import { loadSitios, saveSitios } from '$lib/utils/storage';
	import type { Sitio } from '$lib/types';

	async function handleSubmit(sitio: Partial<Sitio>) {
		const sitios = loadSitios();

		// Generate new ID
		const maxId = Math.max(...sitios.map((s) => s.id), 0);
		const newSitio: Sitio = {
			...sitio,
			id: maxId + 1,
			created_at: new Date().toISOString()
		} as Sitio;

		sitios.push(newSitio);

		if (saveSitios(sitios)) {
			goto('/admin/sitios');
		} else {
			alert('Failed to save sitio. Storage may be full.');
		}
	}
</script>

<div class="container mx-auto py-8">
	<div class="mb-6">
		<a href="/admin/sitios" class="text-sm text-muted-foreground hover:text-foreground">
			← Back to Sitios
		</a>
	</div>

	<h1 class="mb-8 text-3xl font-bold">Add New Sitio</h1>

	<SitioForm onSubmit={handleSubmit} />
</div>
```

#### 7.2 Edit Sitio Form Route

**File**: `src/routes/admin/sitios/[id]/edit/+page.svelte`

Edit existing sitio data:

```svelte
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import SitioForm from '$lib/components/admin/sitios/SitioForm.svelte';
	import { loadSitios, saveSitios } from '$lib/utils/storage';
	import type { Sitio } from '$lib/types';

	let sitio = $state<Sitio | null>(null);
	let notFound = $state(false);

	onMount(() => {
		const sitios = loadSitios();
		const id = parseInt($page.params.id);
		sitio = sitios.find((s) => s.id === id) || null;

		if (!sitio) {
			notFound = true;
		}
	});

	async function handleSubmit(updatedData: Partial<Sitio>) {
		const sitios = loadSitios();
		const index = sitios.findIndex((s) => s.id === sitio!.id);

		if (index !== -1) {
			sitios[index] = {
				...sitios[index],
				...updatedData,
				updated_at: new Date().toISOString()
			};

			if (saveSitios(sitios)) {
				goto('/admin/sitios');
			} else {
				alert('Failed to save sitio. Storage may be full.');
			}
		}
	}
</script>

{#if notFound}
	<div class="container mx-auto py-8">
		<p>Sitio not found</p>
	</div>
{:else if sitio}
	<div class="container mx-auto py-8">
		<div class="mb-6">
			<a href="/admin/sitios" class="text-sm text-muted-foreground hover:text-foreground">
				← Back to Sitios
			</a>
		</div>

		<h1 class="mb-8 text-3xl font-bold">Edit Sitio: {sitio.name}</h1>

		<SitioForm {sitio} onSubmit={handleSubmit} />
	</div>
{/if}
```

#### 7.3 Sitio Form Component

**File**: `src/lib/components/admin/sitios/SitioForm.svelte`

Reusable form component with tabbed sections for all 86 fields:

```svelte
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { Sitio } from '$lib/types';

	let { sitio = null, onSubmit } = $props<{
		sitio?: Sitio | null;
		onSubmit: (data: Partial<Sitio>) => void;
	}>();

	// Initialize form state with existing sitio or defaults
	let formData = $state<Partial<Sitio>>({
		name: sitio?.name || '',
		municipality: sitio?.municipality || '',
		barangay: sitio?.barangay || '',
		province: sitio?.province || '',
		population: sitio?.population || 0,
		households: sitio?.households || 0,
		coordinates: sitio?.coordinates || { lat: 0, lng: 0 },
		demographics: sitio?.demographics || {
			male: 0,
			female: 0,
			total: 0,
			age_0_14: 0,
			age_15_64: 0,
			age_65_above: 0
		}
		// ... initialize all other nested objects
	});

	function handleSubmit(e: Event) {
		e.preventDefault();

		// Basic validation
		if (!formData.name || !formData.municipality || !formData.barangay) {
			alert('Please fill in all required fields');
			return;
		}

		onSubmit(formData);
	}
</script>

<form onsubmit={handleSubmit}>
	<Tabs.Root value="basic">
		<Tabs.List class="mb-6">
			<Tabs.Trigger value="basic">Basic Info</Tabs.Trigger>
			<Tabs.Trigger value="demographics">Demographics</Tabs.Trigger>
			<Tabs.Trigger value="social">Social Services</Tabs.Trigger>
			<Tabs.Trigger value="economic">Economic</Tabs.Trigger>
			<Tabs.Trigger value="agriculture">Agriculture</Tabs.Trigger>
			<Tabs.Trigger value="water">Water & Sanitation</Tabs.Trigger>
			<Tabs.Trigger value="livestock">Livestock & Poultry</Tabs.Trigger>
			<Tabs.Trigger value="housing">Housing</Tabs.Trigger>
			<Tabs.Trigger value="utilities">Utilities</Tabs.Trigger>
			<Tabs.Trigger value="community">Community</Tabs.Trigger>
		</Tabs.List>

		<!-- Basic Info Tab -->
		<Tabs.Content value="basic">
			<Card.Root>
				<Card.Header>
					<Card.Title>Basic Information</Card.Title>
					<Card.Description>Enter the core identification details for this sitio</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="municipality">Municipality *</Label>
							<Input id="municipality" bind:value={formData.municipality} required />
						</div>

						<div class="space-y-2">
							<Label for="barangay">Barangay *</Label>
							<Input id="barangay" bind:value={formData.barangay} required />
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="name">Sitio/Purok Name *</Label>
							<Input id="name" bind:value={formData.name} required />
						</div>

						<div class="space-y-2">
							<Label for="province">Province</Label>
							<Input id="province" bind:value={formData.province} />
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="population">Total Population</Label>
							<Input id="population" type="number" bind:value={formData.population} />
						</div>

						<div class="space-y-2">
							<Label for="households">Number of Households</Label>
							<Input id="households" type="number" bind:value={formData.households} />
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="latitude">Latitude</Label>
							<Input
								id="latitude"
								type="number"
								step="0.000001"
								bind:value={formData.coordinates.lat}
							/>
						</div>

						<div class="space-y-2">
							<Label for="longitude">Longitude</Label>
							<Input
								id="longitude"
								type="number"
								step="0.000001"
								bind:value={formData.coordinates.lng}
							/>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Demographics Tab -->
		<Tabs.Content value="demographics">
			<Card.Root>
				<Card.Header>
					<Card.Title>Demographics</Card.Title>
					<Card.Description>Population breakdown by gender and age groups</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-3 gap-4">
						<div class="space-y-2">
							<Label for="male">Male Population</Label>
							<Input id="male" type="number" bind:value={formData.demographics.male} />
						</div>

						<div class="space-y-2">
							<Label for="female">Female Population</Label>
							<Input id="female" type="number" bind:value={formData.demographics.female} />
						</div>

						<div class="space-y-2">
							<Label for="total">Total Population</Label>
							<Input id="total" type="number" bind:value={formData.demographics.total} />
						</div>
					</div>

					<div class="space-y-2">
						<h4 class="font-semibold">Age Groups</h4>
						<div class="grid grid-cols-3 gap-4">
							<div class="space-y-2">
								<Label for="age_0_14">0-14 years</Label>
								<Input id="age_0_14" type="number" bind:value={formData.demographics.age_0_14} />
							</div>

							<div class="space-y-2">
								<Label for="age_15_64">15-64 years</Label>
								<Input id="age_15_64" type="number" bind:value={formData.demographics.age_15_64} />
							</div>

							<div class="space-y-2">
								<Label for="age_65_above">65+ years</Label>
								<Input
									id="age_65_above"
									type="number"
									bind:value={formData.demographics.age_65_above}
								/>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Additional tabs for other sections: social services, economic, agriculture, etc. -->
		<!-- Each tab follows the same Card.Root structure with relevant fields -->

		<!-- Social Services Tab -->
		<Tabs.Content value="social">
			<Card.Root>
				<Card.Header>
					<Card.Title>Social Services</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<!-- Social services fields -->
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Continue pattern for remaining tabs... -->
	</Tabs.Root>

	<div class="mt-6 flex justify-end gap-2">
		<Button type="button" variant="secondary" onclick={() => history.back()}>Cancel</Button>
		<Button type="submit">
			{sitio ? 'Update' : 'Create'} Sitio
		</Button>
	</div>
</form>
```

#### 7.4 Update Sitios List with Actions

Update the sitios list page to include edit and delete actions:

```svelte
<!-- In src/routes/admin/sitios/+page.svelte -->

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Municipality</Table.Head>
			<Table.Head>Barangay</Table.Head>
			<Table.Head>Sitio</Table.Head>
			<Table.Head>Population</Table.Head>
			<Table.Head>Households</Table.Head>
			<Table.Head class="text-right">Actions</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each sitios as sitio}
			<Table.Row>
				<Table.Cell>{sitio.municipality}</Table.Cell>
				<Table.Cell>{sitio.barangay}</Table.Cell>
				<Table.Cell>{sitio.name}</Table.Cell>
				<Table.Cell>{sitio.population.toLocaleString()}</Table.Cell>
				<Table.Cell>{sitio.households.toLocaleString()}</Table.Cell>
				<Table.Cell class="text-right">
					<div class="flex justify-end gap-2">
						<Button
							variant="ghost"
							size="sm"
							onclick={() => goto(`/admin/sitios/${sitio.id}/edit`)}
						>
							Edit
						</Button>
						<Button variant="ghost" size="sm" onclick={() => handleDelete(sitio.id)}>Delete</Button>
					</div>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
```

#### 6.3 Testing Checklist

**Bulk Import (CSV/Excel):**

- [ ] CSV file upload works correctly
- [ ] Excel file upload works correctly
- [ ] File type validation rejects unsupported formats
- [ ] File size validation rejects files over 10MB
- [ ] Auto column mapping detects common headers
- [ ] Manual column mapping updates correctly
- [ ] Required field validation catches missing data
- [ ] Type validation catches invalid data types
- [ ] Coordinate validation catches out-of-range values
- [ ] Duplicate detection identifies matching sitios
- [ ] Replace/Skip actions work correctly for duplicates
- [ ] Import wizard navigation works (back/forward)
- [ ] Success message displays after completion

**Manual Input:**

- [ ] Create new sitio form displays all 86 fields organized in tabs
- [ ] All form fields bind to state correctly
- [ ] Required field validation works (municipality, barangay, name)
- [ ] Numeric fields only accept numbers
- [ ] Coordinate fields validate range (-90 to 90 for lat, -180 to 180 for lng)
- [ ] Form submission creates new sitio with auto-generated ID
- [ ] Edit form loads existing sitio data correctly
- [ ] Edit form submission updates existing sitio
- [ ] Cancel button returns to sitios list
- [ ] Form state persists between tab switches

**Data Persistence:**

- [ ] Data persists in LocalStorage after page reload
- [ ] Imported data appears in sitios list page
- [ ] Manually added sitios appear in sitios list
- [ ] Storage size warning shows when approaching 5MB limit

**List Page:**

- [ ] Sitios display in table format
- [ ] Edit button navigates to edit form
- [ ] Delete button removes sitio after confirmation
- [ ] Add Sitio button navigates to create form
- [ ] Import Data button navigates to import wizard

## Success Metrics

### Functionality

✅ Support CSV and Excel file formats
✅ Support manual data entry through web forms
✅ Parse files up to 10MB
✅ Handle all 86 columns from dataset
✅ Auto-match 80%+ of columns correctly for imports
✅ Validate required fields and data types
✅ Detect and resolve duplicates
✅ Create, read, update, and delete (CRUD) individual sitios
✅ Persist data across browser sessions

### User Experience

✅ Intuitive multi-step wizard flow for bulk imports
✅ Clear tabbed form interface for manual entry
✅ Clear visual feedback for each step
✅ Helpful error messages with row numbers
✅ Responsive design on mobile/tablet/desktop
✅ Accessible (keyboard navigation, screen readers)
✅ Confirmation dialogs for destructive actions (delete)

### Performance

✅ Parse 1000-row CSV in < 2 seconds
✅ No UI blocking during file processing
✅ Smooth transitions between wizard steps
✅ Fast form rendering with tabbed interface
✅ Instant LocalStorage read/write operations

## Future Enhancements (Out of Scope)

- Batch edit multiple sitios at once
- Export sitios back to CSV/Excel
- Import history and rollback
- Backend API integration for server-side persistence
- Real-time collaboration (multiple users)
- Data validation rules configuration UI
- Custom field mapping templates
- Scheduled imports from external sources
- Photo/document attachments for sitios
- Audit log for tracking changes

## Technical Notes

### LocalStorage Limitations

- **Size**: ~5-10MB depending on browser (UTF-16 encoding uses 2 bytes per character)
- **Persistence**: Survives page reloads but not browser data clearing
- **Scope**: Per-origin (protocol + domain + port)
- **Security**: Not encrypted, accessible via JavaScript

### Data Size Estimation

- Average sitio with all 86 fields: ~2-3KB JSON
- 1000 sitios: ~2-3MB
- 2000 sitios: ~4-6MB (approaching limit)

**Recommendation**: Warn users when storage exceeds 80% capacity (4MB), suggest exporting data or clearing old entries.

### Browser Compatibility

- LocalStorage: Supported in all modern browsers (IE8+)
- FileReader API: Supported in all modern browsers
- CSV/Excel libraries: No special requirements

---

## Implementation Timeline Estimate

**Phase 1**: Data Model Updates - **1-2 hours**
**Phase 2**: Install Dependencies - **15 minutes**
**Phase 3**: LocalStorage Layer - **1-2 hours**
**Phase 4**: Import Utilities - **3-4 hours**
**Phase 5**: UI Components (Import Wizard) - **6-8 hours**
**Phase 6**: Integration & Testing - **2-3 hours**
**Phase 7**: Manual Input Forms - **4-6 hours**

**Total**: ~18-26 hours of development time

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Status**: Ready for Implementation
