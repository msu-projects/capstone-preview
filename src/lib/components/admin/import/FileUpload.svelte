<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Download, Upload } from '@lucide/svelte';

	let { onFileSelected, year = $bindable(new Date().getFullYear()) } = $props<{
		onFileSelected: (file: File) => void;
		year?: number;
	}>();

	let isDragging = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();
	let selectedFile = $state<File | null>(null);
	let error = $state<string | null>(null);

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

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
		error = null;
		const validExtensions = ['.csv', '.xlsx', '.xls'];
		const extension = '.' + file.name.split('.').pop()?.toLowerCase();

		if (!validExtensions.includes(extension)) {
			error = 'Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)';
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			// 10MB limit
			error = 'File is too large. Maximum file size is 10MB.';
			return;
		}

		if (file.size === 0) {
			error = 'File is empty.';
			return;
		}

		selectedFile = file;
		onFileSelected(file);
	}

	function clearFile() {
		selectedFile = null;
		error = null;
		if (fileInput) {
			fileInput.value = '';
		}
	}

	async function downloadSampleCSV() {
		try {
			const response = await fetch('/api/sample-csv');
			if (!response.ok) throw new Error('Failed to download sample CSV');

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'sitio-import-template.csv';
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (err) {
			console.error('Error downloading sample CSV:', err);
			error = 'Failed to download sample CSV file';
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-start justify-between">
			<div>
				<Card.Title>Upload Sitio Data File</Card.Title>
				<Card.Description>
					Upload a CSV or Excel file containing sitio data. Select the year for this data snapshot.
				</Card.Description>
			</div>
			<Button variant="outline" size="sm" onclick={downloadSampleCSV} class="gap-2">
				<Download class="size-4" />
				Download Template
			</Button>
		</div>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Year Selector -->
		<div class="space-y-2">
			<Label for="import-year">Data Year</Label>
			<Input
				id="import-year"
				type="number"
				bind:value={year}
				min="2000"
				max="2100"
				class="w-full"
			/>
			<p class="text-xs text-muted-foreground">
				This creates a yearly snapshot for tracking changes over time.
			</p>
		</div>

		<!-- File Upload Area -->
		<div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="rounded-lg border-2 border-dashed p-12 text-center transition-colors {isDragging
					? 'border-primary bg-primary/5'
					: ''}"
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
			>
				{#if selectedFile}
					<div class="space-y-4">
						<Upload class="mx-auto size-16 text-primary" />
						<div>
							<h3 class="text-lg font-semibold">{selectedFile.name}</h3>
							<p class="text-sm text-muted-foreground">
								{(selectedFile.size / 1024).toFixed(2)} KB
							</p>
						</div>
						<div class="flex justify-center gap-2">
							<Button onclick={clearFile} variant="outline">Choose Different File</Button>
						</div>
					</div>
				{:else}
					<Upload class="mx-auto mb-4 size-16 text-muted-foreground" />
					<h3 class="mb-2 text-lg font-semibold">Drop your file here</h3>
					<p class="mb-4 text-sm text-muted-foreground">
						Supports CSV and Excel files (.csv, .xlsx, .xls) · Max 10MB
					</p>
					<Button onclick={() => fileInput?.click()} class="mx-auto">Select File</Button>
				{/if}

				<input
					type="file"
					accept=".csv,.xlsx,.xls"
					bind:this={fileInput}
					onchange={handleFileInput}
					class="hidden"
				/>
			</div>

			{#if error}
				<div class="mt-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
					{error}
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
