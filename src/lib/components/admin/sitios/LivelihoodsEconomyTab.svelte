<script lang="ts">
	import { ComboboxMultiSelect } from '$lib/components/ui/combobox';
	import FormSection from '$lib/components/ui/form-section/form-section.svelte';
	import HelpTooltip from '$lib/components/ui/help-tooltip/help-tooltip.svelte';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import {
		cropOptions,
		employmentTypeOptions,
		gardenCommodityOptions,
		incomeBracketOptions,
		livestockPoultryOptions
	} from '$lib/config/sitio-options';
	import { Briefcase, Coins, PawPrint, Sprout, Wheat } from '@lucide/svelte';

	let {
		employments = $bindable([]),
		income_brackets = $bindable([]),
		farmers_count = $bindable(0),
		farmer_associations = $bindable(0),
		farm_area_hectares = $bindable(0),
		top_crops = $bindable([]),
		livestock_poultry = $bindable<string[]>([]),
		households_with_backyard_garden = $bindable(0),
		common_garden_commodities = $bindable([]),
		households = 0
	}: {
		employments: string[];
		income_brackets: string[];
		farmers_count: number;
		farmer_associations: number;
		farm_area_hectares: number;
		top_crops: string[];
		livestock_poultry: string[];
		households_with_backyard_garden: number;
		common_garden_commodities: string[];
		households?: number;
	} = $props();

	// Convert bracket values to display options for the multi-select
	const incomeBracketDisplayOptions = $derived(incomeBracketOptions.map((opt) => opt.label));

	// Map selected labels back to values for storage
	let selectedIncomeBracketLabels = $state<string[]>([]);

	// Initialize selected labels from values
	$effect(() => {
		selectedIncomeBracketLabels = income_brackets.map(
			(value) => incomeBracketOptions.find((opt) => opt.value === value)?.label || value
		);
	});

	// Update values when labels change
	$effect(() => {
		income_brackets = selectedIncomeBracketLabels.map(
			(label) => incomeBracketOptions.find((opt) => opt.label === label)?.value || label
		);
	});
</script>

<div class="space-y-6">
	<!-- Employment Section -->
	<FormSection
		title="Employment"
		description="Track common employment types in this sitio"
		icon={Briefcase}
		variant="default"
	>
		<div class="space-y-3">
			<Label class="flex items-center gap-1.5">
				Employment Types
				<HelpTooltip content="Select the most common types of employment in this sitio." />
			</Label>
			<ComboboxMultiSelect
				bind:values={employments}
				options={employmentTypeOptions}
				placeholder="Search employment type..."
				addLabel="Add Employment Type"
				emptyMessage="No employment types selected"
				allowCustom={false}
				variant="tags"
			/>
		</div>
	</FormSection>

	<!-- Income Brackets Section -->
	<FormSection
		title="Income Distribution"
		description="Select applicable income brackets"
		icon={Coins}
		variant="default"
		defaultOpen={false}
	>
		<div class="space-y-3">
			<Label class="flex items-center gap-1.5">
				Income Brackets
				<HelpTooltip
					content="Select which daily income brackets are present in this sitio. Brackets are configurable by admins."
				/>
			</Label>
			<ComboboxMultiSelect
				bind:values={selectedIncomeBracketLabels}
				options={incomeBracketDisplayOptions}
				placeholder="Search income bracket..."
				addLabel="Add Income Bracket"
				emptyMessage="No income brackets selected"
				allowCustom={false}
				variant="tags"
			/>
		</div>
	</FormSection>

	<!-- Agriculture Section -->
	<FormSection
		title="Agriculture"
		description="Farming activities and crop production"
		icon={Wheat}
		variant="default"
		defaultOpen={false}
	>
		<div class="grid gap-4 sm:grid-cols-3">
			<div class="space-y-2">
				<Label for="farmers_count">Number of Farmers</Label>
				<NumberInput id="farmers_count" bind:value={farmers_count} placeholder="0" min={0} />
			</div>
			<div class="space-y-2">
				<Label for="farmer_associations">Farmer Associations</Label>
				<NumberInput
					id="farmer_associations"
					bind:value={farmer_associations}
					placeholder="0"
					min={0}
				/>
			</div>
			<div class="space-y-2">
				<Label for="farm_area_hectares">Farm Area (hectares)</Label>
				<NumberInput
					id="farm_area_hectares"
					bind:value={farm_area_hectares}
					placeholder="0"
					min={0}
					step={0.1}
				/>
			</div>
		</div>

		<div class="space-y-3">
			<Label class="flex items-center gap-1.5">
				Top Crops
				<HelpTooltip content="Major crops grown in this sitio." />
			</Label>
			<ComboboxMultiSelect
				bind:values={top_crops}
				options={cropOptions}
				placeholder="Search crop..."
				addLabel="Add Crop"
				emptyMessage="No crops selected"
				allowCustom={false}
				variant="tags"
			/>
		</div>
	</FormSection>

	<!-- Livestock & Poultry Section -->
	<FormSection
		title="Livestock & Poultry"
		description="Common livestock and poultry in the area"
		icon={PawPrint}
		variant="default"
		defaultOpen={false}
	>
		<div class="space-y-3">
			<Label class="flex items-center gap-1.5">
				Livestock & Poultry Types
				<HelpTooltip content="Types of livestock and poultry raised in this sitio." />
			</Label>
			<ComboboxMultiSelect
				bind:values={livestock_poultry}
				options={livestockPoultryOptions}
				placeholder="Search livestock/poultry..."
				addLabel="Add Type"
				emptyMessage="No livestock/poultry selected"
				allowCustom={false}
				variant="list"
			/>
		</div>
	</FormSection>

	<!-- Food Security Section -->
	<FormSection
		title="Food Security"
		description="Backyard gardens and food production"
		icon={Sprout}
		variant="default"
		defaultOpen={false}
	>
		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="households_with_backyard_garden" class="flex items-center gap-1.5">
					Households with Backyard Gardens
					<HelpTooltip content="Number of households maintaining backyard vegetable gardens." />
				</Label>
				<NumberInput
					id="households_with_backyard_garden"
					bind:value={households_with_backyard_garden}
					placeholder="0"
					min={0}
					max={households || undefined}
				/>
				{#if households > 0}
					<p class="text-xs text-muted-foreground">
						Out of {households.toLocaleString()} total households
					</p>
				{/if}
			</div>

			<div class="space-y-3">
				<Label class="flex items-center gap-1.5">
					Common Garden Commodities
					<HelpTooltip content="Vegetables and crops commonly grown in backyard gardens." />
				</Label>
				<ComboboxMultiSelect
					bind:values={common_garden_commodities}
					options={gardenCommodityOptions}
					placeholder="Search commodity..."
					addLabel="Add Commodity"
					emptyMessage="No commodities selected"
					allowCustom={false}
					variant="tags"
				/>
			</div>
		</div>
	</FormSection>
</div>
