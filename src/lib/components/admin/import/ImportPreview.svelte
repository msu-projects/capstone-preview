<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import type { ImportValidationError, Sitio } from '$lib/types';
	import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, X } from '@lucide/svelte';

	let {
		validSitios,
		invalidSitios = [],
		errors,
		onConfirm,
		onBack
	} = $props<{
		validSitios: Partial<Sitio>[];
		invalidSitios?: Partial<Sitio>[];
		errors: ImportValidationError[];
		onConfirm: () => void;
		onBack?: () => void;
	}>();

	let currentPage = $state(1);
	const perPage = 20;

	const totalPages = $derived(Math.ceil(validSitios.length / perPage));
	const paginatedSitios = $derived.by(() => {
		const start = (currentPage - 1) * perPage;
		return validSitios.slice(start, start + perPage);
	});

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}

	const errorsByRow = $derived.by(() => {
		const map = new Map<number, ImportValidationError[]>();
		errors.forEach((error: ImportValidationError) => {
			if (!map.has(error.row)) {
				map.set(error.row, []);
			}
			map.get(error.row)!.push(error);
		});
		return map;
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Preview Import</Card.Title>
		<Card.Description>
			Review the data before importing. Fix any errors before proceeding.
		</Card.Description>
	</Card.Header>

	<Card.Content class="space-y-6">
		<!-- Summary Statistics -->
		<div class="grid grid-cols-3 gap-4">
			<div class="rounded-lg bg-primary/5 p-4">
				<div class="flex items-center gap-2">
					<CheckCircle2 class="size-5 text-primary" />
					<div>
						<div class="text-2xl font-bold">{validSitios.length}</div>
						<div class="text-sm text-muted-foreground">Valid Records</div>
					</div>
				</div>
			</div>
			<div class="rounded-lg bg-destructive/10 p-4">
				<div class="flex items-center gap-2">
					<X class="size-5 text-destructive" />
					<div>
						<div class="text-2xl font-bold">{invalidSitios.length}</div>
						<div class="text-sm text-muted-foreground">Invalid Records</div>
					</div>
				</div>
			</div>
			<div class="rounded-lg bg-muted p-4">
				<div class="flex items-center gap-2">
					<AlertTriangle class="size-5 text-yellow-600" />
					<div>
						<div class="text-2xl font-bold">{errors.length}</div>
						<div class="text-sm text-muted-foreground">Total Errors</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Error Alert -->
		{#if errors.length > 0}
			<Alert.Root variant="destructive">
				<AlertTriangle class="size-4" />
				<Alert.Title>Validation Errors Found</Alert.Title>
				<Alert.Description>
					{errors.length} error(s) found in {invalidSitios.length} record(s). Please fix the errors in
					your source file and try again, or skip invalid records and import only valid data.
				</Alert.Description>
			</Alert.Root>
		{/if}

		<!-- Tabs for Valid and Invalid Data -->
		<Tabs value="valid" class="w-full">
			<TabsList class="grid w-full grid-cols-2">
				<TabsTrigger value="valid">
					Valid Records ({validSitios.length})
				</TabsTrigger>
				<TabsTrigger value="invalid">
					Invalid Records ({invalidSitios.length})
				</TabsTrigger>
			</TabsList>

			<!-- Valid Records Tab -->
			<TabsContent value="valid" class="space-y-4">
				{#if validSitios.length > 0}
					<div class="rounded-lg border">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Municipality</Table.Head>
									<Table.Head>Barangay</Table.Head>
									<Table.Head>Sitio</Table.Head>
									<Table.Head>Population</Table.Head>
									<Table.Head>Households</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each paginatedSitios as sitio, index}
									<Table.Row>
										<Table.Cell>{sitio.municipality || '-'}</Table.Cell>
										<Table.Cell>{sitio.barangay || '-'}</Table.Cell>
										<Table.Cell class="font-medium">{sitio.name || '-'}</Table.Cell>
										<Table.Cell>{sitio.population?.toLocaleString() || '-'}</Table.Cell>
										<Table.Cell>{sitio.households?.toLocaleString() || '-'}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>

					<!-- Pagination -->
					{#if totalPages > 1}
						<div class="flex items-center justify-between">
							<p class="text-sm text-muted-foreground">
								Showing {(currentPage - 1) * perPage + 1} to {Math.min(
									currentPage * perPage,
									validSitios.length
								)} of {validSitios.length} records
							</p>
							<div class="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onclick={() => goToPage(currentPage - 1)}
									disabled={currentPage === 1}
								>
									<ChevronLeft class="size-4" />
									Previous
								</Button>
								<span class="text-sm">
									Page {currentPage} of {totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onclick={() => goToPage(currentPage + 1)}
									disabled={currentPage === totalPages}
								>
									Next
									<ChevronRight class="size-4" />
								</Button>
							</div>
						</div>
					{/if}
				{:else}
					<div class="py-12 text-center text-muted-foreground">No valid records found</div>
				{/if}
			</TabsContent>

			<!-- Invalid Records Tab -->
			<TabsContent value="invalid" class="space-y-4">
				{#if invalidSitios.length > 0}
					<div class="rounded-lg border">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head class="w-20">Row</Table.Head>
									<Table.Head>Municipality</Table.Head>
									<Table.Head>Barangay</Table.Head>
									<Table.Head>Sitio</Table.Head>
									<Table.Head>Errors</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each invalidSitios as sitio, index}
									{@const rowErrors = errorsByRow.get(index + 1) || []}
									<Table.Row>
										<Table.Cell class="font-medium">{index + 1}</Table.Cell>
										<Table.Cell>{sitio.municipality || '-'}</Table.Cell>
										<Table.Cell>{sitio.barangay || '-'}</Table.Cell>
										<Table.Cell>{sitio.name || '-'}</Table.Cell>
										<Table.Cell>
											<div class="space-y-1">
												{#each rowErrors as error}
													<div class="text-sm text-destructive">
														<span class="font-medium">{error.field}:</span>
														{error.message}
													</div>
												{/each}
											</div>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{:else}
					<div class="py-12 text-center text-muted-foreground">All records passed validation ✓</div>
				{/if}
			</TabsContent>
		</Tabs>
	</Card.Content>

	<Card.Footer class="flex justify-between">
		{#if onBack}
			<Button variant="outline" onclick={onBack}>Back</Button>
		{:else}
			<div></div>
		{/if}
		<Button onclick={onConfirm} disabled={validSitios.length === 0}>
			{#if invalidSitios.length > 0}
				Import {validSitios.length} Valid Records
			{:else}
				Import {validSitios.length} Records
			{/if}
		</Button>
	</Card.Footer>
</Card.Root>
