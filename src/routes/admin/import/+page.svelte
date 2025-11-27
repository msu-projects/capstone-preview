<script lang="ts">
	import { goto } from '$app/navigation';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import ColumnMapper from '$lib/components/admin/import/ColumnMapper.svelte';
	import DuplicateResolver from '$lib/components/admin/import/DuplicateResolver.svelte';
	import FileUpload from '$lib/components/admin/import/FileUpload.svelte';
	import ImportPreview from '$lib/components/admin/import/ImportPreview.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { ColumnMapping, DuplicateSitio, ImportedRow, Sitio } from '$lib/types';
	import { logAuditAction } from '$lib/utils/audit';
	import { autoMapColumns, transformRowToSitio } from '$lib/utils/column-mapper';
	import { parseFile } from '$lib/utils/import-parser';
	import { findDuplicates, validateBatch } from '$lib/utils/import-validator';
	import { getNextSitioId, loadSitios, saveSitios } from '$lib/utils/storage';
	import { CheckCircle2, FileSearch, Map, Upload } from '@lucide/svelte';

	let step = $state<'upload' | 'map' | 'preview' | 'duplicates' | 'complete'>('upload');
	let uploadedFile = $state<File | null>(null);
	let parsedData = $state<{ headers: string[]; rows: ImportedRow[] } | null>(null);
	let mappings = $state<ColumnMapping[]>([]);
	let validSitios = $state<Partial<Sitio>[]>([]);
	let invalidSitios = $state<Partial<Sitio>[]>([]);
	let errors = $state<any[]>([]);
	let duplicates = $state<DuplicateSitio[]>([]);
	let isProcessing = $state(false);
	let importResult = $state<{ success: number; skipped: number; replaced: number } | null>(null);

	// Step handlers
	async function handleFileUploaded(file: File) {
		uploadedFile = file;
		isProcessing = true;

		try {
			const data = await parseFile(file);
			parsedData = data;

			// Auto-map columns
			mappings = autoMapColumns(data.headers);

			isProcessing = false;
			step = 'map';
		} catch (error) {
			console.error('Failed to parse file:', error);
			alert(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
			isProcessing = false;
		}
	}

	function handleMappingComplete(finalMappings: ColumnMapping[]) {
		mappings = finalMappings;
		isProcessing = true;

		// Transform rows to sitios
		const transformedSitios = parsedData!.rows.map((row) =>
			transformRowToSitio(row, finalMappings)
		);

		// Validate all sitios
		const validation = validateBatch(transformedSitios);
		validSitios = validation.valid;
		invalidSitios = validation.invalid;
		errors = validation.errors;

		isProcessing = false;
		step = 'preview';
	}

	function handlePreviewConfirm() {
		// Check for duplicates
		const existingSitios = loadSitios();
		duplicates = findDuplicates(validSitios, existingSitios);

		if (duplicates.length > 0) {
			step = 'duplicates';
		} else {
			// No duplicates, proceed with import
			// @ts-ignore - Map is generic but TS config might not recognize it
			const emptyMap = new Map();
			performImport(emptyMap);
		}
	}

	// @ts-ignore - Map generic type issue
	function handleDuplicatesResolved(resolutions: Map<string, 'replace' | 'skip'>) {
		performImport(resolutions);
	}

	// @ts-ignore - Map generic type issue
	function performImport(resolutions: Map<string, 'replace' | 'skip'>) {
		isProcessing = true;

		try {
			const existingSitios = loadSitios();
			let nextId = getNextSitioId();
			let skipped = 0;
			let replaced = 0;
			let added = 0;

			const sitiosToImport: Sitio[] = [];

			validSitios.forEach((sitio) => {
				const key = `${sitio.municipality?.toLowerCase().trim()}-${sitio.barangay?.toLowerCase().trim()}-${sitio.name?.toLowerCase().trim()}`;
				const resolution = resolutions.get(key);

				if (resolution === 'skip') {
					skipped++;
					return;
				}

				if (resolution === 'replace') {
					// Find and update existing sitio
					const existingIndex = existingSitios.findIndex((s) => {
						const existingKey = `${s.municipality.toLowerCase().trim()}-${s.barangay.toLowerCase().trim()}-${s.name.toLowerCase().trim()}`;
						return existingKey === key;
					});

					if (existingIndex !== -1) {
						existingSitios[existingIndex] = {
							...existingSitios[existingIndex],
							...sitio,
							id: existingSitios[existingIndex].id,
							updated_at: new Date().toISOString()
						} as Sitio;
						replaced++;
					}
				} else {
					// New sitio
					const newSitio: Sitio = {
						...sitio,
						id: nextId++,
						created_at: new Date().toISOString(),
						// Ensure required fields have values
						name: sitio.name || '',
						municipality: sitio.municipality || '',
						barangay: sitio.barangay || '',
						population: sitio.population || 0,
						households: sitio.households || 0,
						coordinates: sitio.coordinates || { lat: 0, lng: 0 },
						demographics: sitio.demographics || {
							male: 0,
							female: 0,
							total: 0,
							age_0_14: 0,
							age_15_64: 0,
							age_65_above: 0
						}
					} as Sitio;

					existingSitios.push(newSitio);
					added++;
				}
			});

			// Save to storage
			const saved = saveSitios(existingSitios);

			if (saved) {
				importResult = {
					success: added,
					skipped,
					replaced
				};
				step = 'complete';

				// Log the import action
				logAuditAction(
					'import',
					'sitio',
					undefined,
					uploadedFile?.name,
					`Imported ${added} sitios (${skipped} skipped, ${replaced} replaced) from ${uploadedFile?.name || 'file'}`
				);
			} else {
				alert('Failed to save sitios to storage. Storage may be full.');
			}
		} catch (error) {
			console.error('Import failed:', error);
			alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isProcessing = false;
		}
	}

	function resetWizard() {
		step = 'upload';
		uploadedFile = null;
		parsedData = null;
		mappings = [];
		validSitios = [];
		invalidSitios = [];
		errors = [];
		duplicates = [];
		importResult = null;
	}

	function goToSitiosList() {
		goto('/admin/sitios');
	}
</script>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<AdminHeader
		title="Import Sitio Data"
		description="Upload a CSV or Excel file to import multiple sitios at once"
	/>

	<!-- Content -->
	<div class="flex-1 p-6">
		<div class="mx-auto max-w-6xl">
			<!-- Progress Steps -->
			<div class="mb-8 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div
						class="flex size-10 items-center justify-center rounded-full"
						class:bg-primary={step !== 'upload'}
						class:text-primary-foreground={step !== 'upload'}
						class:bg-muted={step === 'upload'}
					>
						{#if step !== 'upload'}
							<CheckCircle2 class="size-5" />
						{:else}
							<Upload class="size-5" />
						{/if}
					</div>
					<span class:font-semibold={step === 'upload'}>Upload</span>
				</div>

				<div class="h-px flex-1 bg-border"></div>

				<div class="flex items-center gap-2">
					<div
						class="flex size-10 items-center justify-center rounded-full"
						class:bg-primary={step !== 'upload' && step !== 'map'}
						class:text-primary-foreground={step !== 'upload' && step !== 'map'}
						class:bg-muted={step === 'upload' || step === 'map'}
					>
						{#if step !== 'upload' && step !== 'map'}
							<CheckCircle2 class="size-5" />
						{:else}
							<Map class="size-5" />
						{/if}
					</div>
					<span class:font-semibold={step === 'map'}>Map Columns</span>
				</div>

				<div class="h-px flex-1 bg-border"></div>

				<div class="flex items-center gap-2">
					<div
						class="flex size-10 items-center justify-center rounded-full"
						class:bg-primary={step !== 'upload' && step !== 'map' && step !== 'preview'}
						class:text-primary-foreground={step !== 'upload' &&
							step !== 'map' &&
							step !== 'preview'}
						class:bg-muted={step === 'upload' || step === 'map' || step === 'preview'}
					>
						{#if step !== 'upload' && step !== 'map' && step !== 'preview'}
							<CheckCircle2 class="size-5" />
						{:else}
							<FileSearch class="size-5" />
						{/if}
					</div>
					<span class:font-semibold={step === 'preview'}>Preview</span>
				</div>

				<div class="h-px flex-1 bg-border"></div>

				<div class="flex items-center gap-2">
					<div
						class="flex size-10 items-center justify-center rounded-full"
						class:bg-primary={step === 'complete'}
						class:text-primary-foreground={step === 'complete'}
						class:bg-muted={step !== 'complete'}
					>
						<CheckCircle2 class="size-5" />
					</div>
					<span class:font-semibold={step === 'complete'}>Complete</span>
				</div>
			</div>

			<!-- Step Content -->
			{#if step === 'upload'}
				<FileUpload onFileSelected={handleFileUploaded} />
			{:else if step === 'map'}
				<ColumnMapper
					{mappings}
					onComplete={handleMappingComplete}
					onBack={() => (step = 'upload')}
				/>
			{:else if step === 'preview'}
				<ImportPreview
					{validSitios}
					{invalidSitios}
					{errors}
					onConfirm={handlePreviewConfirm}
					onBack={() => (step = 'map')}
				/>
			{:else if step === 'duplicates'}
				<DuplicateResolver {duplicates} onResolved={handleDuplicatesResolved} />
			{:else if step === 'complete'}
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2 text-2xl">
							<CheckCircle2 class="size-6 text-primary" />
							Import Complete!
						</Card.Title>
						<Card.Description>Your sitio data has been successfully imported.</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-6">
						{#if importResult}
							<div class="grid grid-cols-3 gap-4">
								<div class="rounded-lg bg-primary/5 p-4 text-center">
									<div class="text-3xl font-bold text-primary">{importResult.success}</div>
									<div class="text-sm text-muted-foreground">New Sitios Added</div>
								</div>
								{#if importResult.replaced > 0}
									<div class="rounded-lg bg-blue-50 p-4 text-center">
										<div class="text-3xl font-bold text-blue-600">{importResult.replaced}</div>
										<div class="text-sm text-muted-foreground">Sitios Updated</div>
									</div>
								{/if}
								{#if importResult.skipped > 0}
									<div class="rounded-lg bg-muted p-4 text-center">
										<div class="text-3xl font-bold">{importResult.skipped}</div>
										<div class="text-sm text-muted-foreground">Duplicates Skipped</div>
									</div>
								{/if}
							</div>
						{/if}
					</Card.Content>
					<Card.Footer class="flex justify-between">
						<Button variant="outline" onclick={resetWizard}>Import More Data</Button>
						<Button onclick={goToSitiosList}>View Sitios List</Button>
					</Card.Footer>
				</Card.Root>
			{/if}

			<!-- Processing Overlay -->
			{#if isProcessing}
				<div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
					<Card.Root class="w-[300px]">
						<Card.Content class="flex flex-col items-center gap-4 py-8">
							<div
								class="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
							></div>
							<p class="text-center text-sm text-muted-foreground">Processing...</p>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}
		</div>
	</div>
</div>
