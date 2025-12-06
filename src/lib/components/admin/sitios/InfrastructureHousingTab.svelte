<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Combobox, ComboboxWithCount } from '$lib/components/ui/combobox';
	import FormSection from '$lib/components/ui/form-section/form-section.svelte';
	import HelpTooltip from '$lib/components/ui/help-tooltip/help-tooltip.svelte';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import * as Select from '$lib/components/ui/select';
	import {
		alternativeElectricitySourceOptions,
		housingOwnershipOptions,
		housingQualityOptions,
		toiletFacilityTypeOptions,
		waterSourceOptions,
		waterStatusOptions
	} from '$lib/config/sitio-options';
	import { Droplets, Home, Plus, Recycle, Trash2, Zap } from '@lucide/svelte';

	let {
		water_systems_count = $bindable(0),
		water_sources = $bindable([{ source: '', status: '' }]),
		households_without_toilet = $bindable(0),
		toilet_facility_types = $bindable([]),
		waste_segregation_practice = $bindable(null),
		households_with_electricity = $bindable(0),
		alternative_electricity_sources = $bindable([]),
		quality_types = $bindable([]),
		ownership_types = $bindable([])
	}: {
		water_systems_count: number;
		water_sources: Array<{ source: string; status: string }>;
		households_without_toilet: number;
		toilet_facility_types: string[];
		waste_segregation_practice: boolean | null;
		households_with_electricity: number;
		alternative_electricity_sources: string[];
		quality_types: Array<{ type: string; count: number }>;
		ownership_types: Array<{ type: string; count: number }>;
	} = $props();

	function addWaterSource() {
		water_sources = [...water_sources, { source: '', status: '' }];
	}

	function removeWaterSource(index: number) {
		water_sources = water_sources.filter((_, i) => i !== index);
	}

	function toggleItem(arr: string[], item: string) {
		if (arr.includes(item)) {
			return arr.filter((i) => i !== item);
		} else {
			return [...arr, item];
		}
	}

	function toggleToiletType(type: string) {
		toilet_facility_types = toggleItem(toilet_facility_types, type);
	}

	// Get available water sources for a specific row (exclude already selected ones except current)
	function getAvailableWaterSources(currentIndex: number): string[] {
		const selectedSources = water_sources
			.filter((_, i) => i !== currentIndex)
			.map((ws) => ws.source)
			.filter((s) => s !== '');
		return waterSourceOptions.filter((opt) => !selectedSources.includes(opt));
	}
</script>

<div class="space-y-6">
	<!-- Water Section -->
	<FormSection
		title="Water Systems"
		description="Water sources and supply infrastructure"
		icon={Droplets}
		variant="info"
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<Label for="water_systems_count" class="flex items-center gap-1.5">
					Number of Water Systems
					<HelpTooltip
						content="Total count of functional water distribution systems in the sitio"
					/>
				</Label>
				<NumberInput
					id="water_systems_count"
					bind:value={water_systems_count}
					placeholder="0"
					min={0}
				/>
			</div>
		</div>

		<!-- Water Sources -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<Label class="flex items-center gap-1.5">
					Water Sources
					<HelpTooltip
						content="List all water sources including wells, springs, rivers, and their current condition"
					/>
				</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={addWaterSource}
					class="h-8 gap-1.5"
				>
					<Plus class="size-3.5" />
					Add
				</Button>
			</div>

			{#if water_sources.length === 0}
				<div
					class="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center"
				>
					<Droplets class="size-8 text-muted-foreground/50" />
					<p class="text-sm text-muted-foreground">No water sources added yet</p>
				</div>
			{:else}
				<div class="rounded-lg border">
					<table class="w-full">
						<thead>
							<tr class="border-b bg-muted/30">
								<th class="px-3 py-2 text-left text-sm font-medium">Source</th>
								<th class="w-40 px-3 py-2 text-left text-sm font-medium">Condition</th>
								<th class="w-10"></th>
							</tr>
						</thead>
						<tbody>
							{#each water_sources as source, i (i)}
								<tr class="border-b last:border-0">
									<td class="w-full px-3 py-2">
										<Combobox
											bind:value={source.source}
											options={getAvailableWaterSources(i)}
											placeholder="Select source"
											searchPlaceholder="Search source..."
										/>
									</td>
									<td class="px-3 py-2">
										<Combobox
											bind:value={source.status}
											options={waterStatusOptions}
											placeholder="Condition"
											searchPlaceholder="Search condition..."
										/>
									</td>
									<td class="px-1 py-2">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											class="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
											onclick={() => removeWaterSource(i)}
										>
											<Trash2 class="size-4" />
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</FormSection>

	<!-- Sanitation Section -->
	<FormSection
		title="Sanitation"
		description="Toilet facilities and waste management"
		icon={Recycle}
		variant="default"
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<Label for="households_without_toilet">Households Without Toilet</Label>
				<NumberInput
					id="households_without_toilet"
					bind:value={households_without_toilet}
					placeholder="0"
					min={0}
				/>
			</div>
			<div class="space-y-2">
				<Label class="flex items-center gap-1.5">
					Waste Segregation
					<HelpTooltip
						content="Whether the sitio practices proper waste segregation (biodegradable vs non-biodegradable)"
					/>
				</Label>
				<Select.Root
					type="single"
					value={waste_segregation_practice === true
						? 'yes'
						: waste_segregation_practice === false
							? 'no'
							: undefined}
					onValueChange={(v: string | undefined) => {
						waste_segregation_practice = v === 'yes' ? true : v === 'no' ? false : null;
					}}
				>
					<Select.Trigger class="w-full">
						{waste_segregation_practice === true
							? 'Yes'
							: waste_segregation_practice === false
								? 'No'
								: 'Unknown'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="yes">Yes</Select.Item>
						<Select.Item value="no">No</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<div class="space-y-3">
			<Label>Toilet Facility Types</Label>
			<div class="grid grid-cols-2 gap-2 md:grid-cols-4">
				{#each toiletFacilityTypeOptions as type}
					<Label
						for={`toilet_${type}`}
						class="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-normal transition-colors hover:bg-muted/50
						{toilet_facility_types.includes(type) ? 'border-primary/30 bg-primary/5' : ''}"
					>
						<Checkbox
							id={`toilet_${type}`}
							checked={toilet_facility_types.includes(type)}
							onCheckedChange={() => toggleToiletType(type)}
						/>
						<span> {type}</span>
					</Label>
				{/each}
			</div>
		</div>
	</FormSection>

	<!-- Electricity Section -->
	<FormSection
		title="Electricity"
		description="Power access and alternative sources"
		icon={Zap}
		variant="warning"
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<Label for="households_with_electricity">Households with Electricity</Label>
				<NumberInput
					id="households_with_electricity"
					bind:value={households_with_electricity}
					placeholder="0"
					min={0}
				/>
			</div>
		</div>

		<div class="space-y-3">
			<Label>Alternative Electricity Sources</Label>
			<div class="flex flex-wrap gap-2">
				{#each alternativeElectricitySourceOptions as source}
					<Label
						for={`elec_${source}`}
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-normal transition-colors hover:bg-muted/50 
						{alternative_electricity_sources.includes(source) ? 'border-primary/30' : ''}"
					>
						<Checkbox
							id={`elec_${source}`}
							checked={alternative_electricity_sources.includes(source)}
							onCheckedChange={() => {
								alternative_electricity_sources = toggleItem(
									alternative_electricity_sources,
									source
								);
							}}
						/>
						<span> {source}</span>
					</Label>
				{/each}
			</div>
		</div>
	</FormSection>

	<!-- Housing Section -->
	<FormSection
		title="Housing"
		description="Quality and ownership breakdown"
		icon={Home}
		variant="success"
	>
		<!-- Housing Quality Types -->
		<div class="space-y-3">
			<Label class="flex items-center gap-1.5">
				Housing Quality
				<HelpTooltip
					content="Categorize housing by construction material and quality (Concrete, Wood, Half-Concrete, Makeshift)"
				/>
			</Label>
			<ComboboxWithCount
				bind:items={quality_types}
				options={housingQualityOptions}
				placeholder="Select quality type..."
				addLabel="Add Quality Type"
				emptyMessage="No quality types added"
				emptyIcon={Home}
				allowCustom
			/>
		</div>

		<!-- Housing Ownership Types -->
		<div class="space-y-3">
			<Label class="flex items-center gap-1.5">
				Ownership Types
				<HelpTooltip
					content="Categorize housing by ownership status (Owned, Rented, Protected Land, Informal Settler, Owner Consent)"
				/>
			</Label>
			<ComboboxWithCount
				bind:items={ownership_types}
				options={housingOwnershipOptions}
				placeholder="Select ownership type..."
				addLabel="Add Ownership Type"
				emptyMessage="No ownership types added"
				emptyIcon={Home}
				allowCustom
			/>
		</div>
	</FormSection>
</div>
