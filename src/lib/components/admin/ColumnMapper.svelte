<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import type { ColumnMapping } from '$lib/types';
	import {
		SITIO_FIELD_DEFINITIONS,
		getMappingStats,
		getUnmappedRequiredFields
	} from '$lib/utils/column-mapper';
	import { AlertCircle, CheckCircle2, Info } from '@lucide/svelte';

	let { mappings, onComplete, onBack } = $props<{
		mappings: ColumnMapping[];
		onComplete: (mappings: ColumnMapping[]) => void;
		onBack?: () => void;
	}>();

	let localMappings = $state([...mappings]);

	function updateMapping(index: number, newField: string) {
		localMappings[index] = {
			...localMappings[index],
			sitioField: newField,
			autoMatched: false
		};
	}

	const stats = $derived(getMappingStats(localMappings));
	const unmappedRequired = $derived(getUnmappedRequiredFields(localMappings));
	const canProceed = $derived(unmappedRequired.length === 0);

	function handleContinue() {
		if (canProceed) {
			onComplete(localMappings);
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Map Columns to Sitio Fields</Card.Title>
		<Card.Description>
			Review and adjust how your CSV columns map to sitio data fields. Required fields must be
			mapped to proceed.
		</Card.Description>
	</Card.Header>

	<Card.Content class="space-y-6">
		<!-- Mapping Statistics -->
		<div class="grid grid-cols-4 gap-4">
			<div class="rounded-lg bg-primary/5 p-4">
				<div class="text-2xl font-bold">{stats.autoMapped}</div>
				<div class="text-sm text-muted-foreground">Auto-Mapped</div>
			</div>
			<div class="rounded-lg bg-secondary/50 p-4">
				<div class="text-2xl font-bold">{stats.manuallyMapped}</div>
				<div class="text-sm text-muted-foreground">Manual</div>
			</div>
			<div class="rounded-lg bg-muted p-4">
				<div class="text-2xl font-bold">{stats.unmapped}</div>
				<div class="text-sm text-muted-foreground">Unmapped</div>
			</div>
			<div class="rounded-lg bg-destructive/10 p-4">
				<div class="text-2xl font-bold">{stats.requiredUnmapped}</div>
				<div class="text-sm text-muted-foreground">Required Missing</div>
			</div>
		</div>

		<!-- Warning for unmapped required fields -->
		{#if unmappedRequired.length > 0}
			<div
				class="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4"
			>
				<AlertCircle class="mt-0.5 size-5 shrink-0 text-destructive" />
				<div>
					<p class="font-semibold text-destructive">Required fields not mapped</p>
					<p class="text-sm text-destructive/80">
						The following required fields must be mapped: {unmappedRequired.join(', ')}
					</p>
				</div>
			</div>
		{/if}

		<!-- Column Mapping Table -->
		<div class="rounded-lg border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[300px]">CSV Column</Table.Head>
						<Table.Head>Maps To</Table.Head>
						<Table.Head class="w-[120px]">Status</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each localMappings as mapping, i}
						<Table.Row>
							<Table.Cell class="font-medium">
								{mapping.csvHeader}
								{#if mapping.isRequired}
									<Badge variant="outline" class="ml-2">Required</Badge>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<Select.Root
									type="single"
									value={mapping.sitioField}
									onValueChange={(val: string) => {
										updateMapping(i, val);
									}}
								>
									<Select.Trigger class="w-full">
										{#if mapping.sitioField}
											{SITIO_FIELD_DEFINITIONS.find((d) => d.field === mapping.sitioField)?.label ||
												'Select field...'}
										{:else}
											Select field...
										{/if}
									</Select.Trigger>
									<Select.Content class="max-h-[300px]">
										<Select.Item value="">-- Do not map --</Select.Item>
										{#each SITIO_FIELD_DEFINITIONS as def}
											<Select.Item value={def.field}>
												{def.label}
												{#if def.required}
													<span class="text-destructive">*</span>
												{/if}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</Table.Cell>
							<Table.Cell>
								{#if mapping.sitioField}
									{#if mapping.autoMatched}
										<Badge variant="default" class="gap-1">
											<CheckCircle2 class="size-3" />
											Auto
										</Badge>
									{:else}
										<Badge variant="secondary" class="gap-1">
											<Info class="size-3" />
											Manual
										</Badge>
									{/if}
								{:else}
									<Badge variant="outline">Unmapped</Badge>
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</Card.Content>

	<Card.Footer class="flex justify-between">
		{#if onBack}
			<Button variant="outline" onclick={onBack}>Back</Button>
		{:else}
			<div></div>
		{/if}
		<Button onclick={handleContinue} disabled={!canProceed}>Continue to Preview</Button>
	</Card.Footer>
</Card.Root>
