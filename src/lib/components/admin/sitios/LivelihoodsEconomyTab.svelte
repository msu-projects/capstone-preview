<script lang="ts">
	import { ComboboxMultiSelect, ComboboxWithCount } from '$lib/components/ui/combobox-multi-select';
	import FormSection from '$lib/components/ui/form-section/form-section.svelte';
	import HelpTooltip from '$lib/components/ui/help-tooltip/help-tooltip.svelte';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import { cn } from '$lib/utils';
	import {
		AlertCircle,
		Briefcase,
		CheckCircle2,
		Coins,
		PawPrint,
		Sprout,
		Wheat
	} from '@lucide/svelte';

	let {
		employments = $bindable([]),
		income_brackets = $bindable([]),
		farmers_count = $bindable(0),
		farmer_associations = $bindable(0),
		farm_area_hectares = $bindable(0),
		top_crops = $bindable([]),
		pigs = $bindable(0),
		cows = $bindable(0),
		carabaos = $bindable(0),
		horses = $bindable(0),
		goats = $bindable(0),
		chickens = $bindable(0),
		ducks = $bindable(0),
		households_with_backyard_garden = $bindable(0),
		common_garden_commodities = $bindable([]),
		households = 0
	}: {
		employments: Array<{ type: string; count: number }>;
		income_brackets: Array<{ bracket: string; households: number }>;
		farmers_count: number;
		farmer_associations: number;
		farm_area_hectares: number;
		top_crops: string[];
		pigs: number;
		cows: number;
		carabaos: number;
		horses: number;
		goats: number;
		chickens: number;
		ducks: number;
		households_with_backyard_garden: number;
		common_garden_commodities: string[];
		households?: number;
	} = $props();

	// Validation for income distribution vs households
	const totalIncomeHouseholds = $derived(
		income_brackets.reduce((sum, b) => sum + (b.households || 0), 0)
	);
	const hasHouseholds = $derived(households > 0);
	const hasIncomeData = $derived(totalIncomeHouseholds > 0);
	const isIncomeDistributionSynced = $derived(households === totalIncomeHouseholds);

	// Employment types (predefined options)
	const employmentTypes = [
		'Vendor',
		'Laborer',
		'Farmer',
		'Tricycle Driver',
		'Construction Worker',
		'Charcoal Maker'
	];

	// Income brackets (daily income in PHP) - static
	const incomeBrackets = [
		{ label: 'Below ₱100', value: '<=100' },
		{ label: '₱101 - ₱300', value: '100-300' },
		{ label: '₱301 - ₱500', value: '300-500' },
		{ label: 'Above ₱500', value: '>=500' }
	];

	// Livestock types for compact grid
	const livestockTypes = [
		{ id: 'pigs', label: 'Pigs', icon: '🐷' },
		{ id: 'cows', label: 'Cows', icon: '🐄' },
		{ id: 'carabaos', label: 'Carabaos', icon: '🦬' },
		{ id: 'horses', label: 'Horses', icon: '🐴' },
		{ id: 'goats', label: 'Goats', icon: '🐐' },
		{ id: 'chickens', label: 'Chickens', icon: '🐔' },
		{ id: 'ducks', label: 'Ducks', icon: '🦆' }
	] as const;

	// Initialize income_brackets if empty
	$effect(() => {
		if (income_brackets.length === 0) {
			income_brackets = incomeBrackets.map((b) => ({ bracket: b.value, households: 0 }));
		}
	});

	function getLabel(value: string) {
		return incomeBrackets.find((v) => v.value === value)?.label ?? 'Unknown';
	}

	// Predefined garden commodities
	const gardenCommodityOptions = [
		'Tomatoes',
		'Eggplant',
		'Kangkong',
		'Pechay',
		'Squash',
		'String Beans',
		'Okra',
		'Ampalaya',
		'Pepper',
		'Onion',
		'Garlic',
		'Ginger'
	];

	// Predefined crop options
	const cropOptions = [
		'Rice',
		'Corn',
		'Coconut',
		'Banana',
		'Sugarcane',
		'Coffee',
		'Cacao',
		'Abaca',
		'Cassava',
		'Sweet Potato',
		'Mango',
		'Pineapple',
		'Rubber',
		'Oil Palm'
	];
</script>

<div class="space-y-6">
	<!-- Employment Section -->
	<FormSection
		title="Employment"
		description="Track employment types and income distribution"
		icon={Briefcase}
		variant="default"
	>
		<!-- Employment Types -->
		<ComboboxWithCount
			bind:items={employments}
			options={employmentTypes}
			placeholder="Search employment type..."
			addLabel="Add"
			emptyMessage="No employments added yet"
			emptyIcon={Briefcase}
		>
			{#snippet label()}
				<Label class="flex items-center gap-1.5">
					Employment Types
					<HelpTooltip content="Track the main types of employment in this sitio with counts" />
				</Label>
			{/snippet}
		</ComboboxWithCount>
	</FormSection>

	<!-- Income Brackets Section -->
	<FormSection
		title="Income Distribution"
		description="Household daily income breakdown"
		icon={Coins}
		variant="default"
		defaultOpen={false}
	>
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<Label class="flex items-center gap-1.5">
					Income Brackets
					<HelpTooltip
						content="Daily income brackets in Philippine Peso (₱) - count households in each bracket. The total should match the number of households."
					/>
				</Label>
				{#if hasHouseholds && hasIncomeData}
					{#if isIncomeDistributionSynced}
						<div
							class="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600"
						>
							<CheckCircle2 class="size-3" />
							<span>Synced</span>
						</div>
					{:else}
						<div
							class="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive"
						>
							<AlertCircle class="size-3" />
							<span>Mismatch ({totalIncomeHouseholds}/{households})</span>
						</div>
					{/if}
				{/if}
			</div>
			<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
				{#each income_brackets as bracket, i}
					<div class="space-y-1.5">
						<Label class="text-xs font-normal text-muted-foreground">
							{getLabel(bracket.bracket)}
						</Label>
						<NumberInput
							id="bracket_households_{i}"
							bind:value={income_brackets[i].households}
							placeholder="0"
							min={0}
							class={cn(
								hasHouseholds &&
									hasIncomeData &&
									!isIncomeDistributionSynced &&
									'border-destructive/50'
							)}
						/>
					</div>
				{/each}
			</div>
			{#if hasHouseholds && hasIncomeData && !isIncomeDistributionSynced}
				<p class="flex items-center gap-1 text-xs text-destructive">
					<AlertCircle class="size-3" />
					Total income distribution ({totalIncomeHouseholds}) should match the number of households
					({households}).
				</p>
			{:else if hasHouseholds}
				<p class="text-xs text-muted-foreground">
					Total: {totalIncomeHouseholds} of {households} households
				</p>
			{:else}
				<p class="text-xs text-muted-foreground">
					Total: {totalIncomeHouseholds} households
				</p>
			{/if}
		</div>
	</FormSection>

	<!-- Agriculture Section -->
	<FormSection
		title="Agriculture"
		description="Farming statistics and crop information"
		icon={Wheat}
		variant="success"
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="space-y-2">
				<Label for="farmers_count">Number of Farmers</Label>
				<NumberInput id="farmers_count" bind:value={farmers_count} placeholder="0" min={0} />
			</div>
			<div class="space-y-2">
				<Label for="farmer_associations" class="flex items-center gap-1.5">
					Farmer Associations
					<HelpTooltip content="Registered farmer cooperatives or associations in the sitio" />
				</Label>
				<NumberInput
					id="farmer_associations"
					bind:value={farmer_associations}
					placeholder="0"
					min={0}
				/>
			</div>
			<div class="space-y-2">
				<Label for="farm_area">Farm Area (ha)</Label>
				<NumberInput
					id="farm_area"
					bind:value={farm_area_hectares}
					placeholder="0"
					min={0}
					step={0.01}
				/>
			</div>
		</div>

		<!-- Top Crops -->
		<div class="space-y-3">
			<Label>Top Crops</Label>
			<ComboboxMultiSelect
				bind:values={top_crops}
				options={cropOptions}
				placeholder="Search crop..."
				addLabel="Add Crop"
				emptyMessage="No crops added"
			/>
		</div>
	</FormSection>

	<!-- Livestock & Poultry Section -->
	<FormSection
		title="Livestock & Poultry"
		description="Animal husbandry statistics"
		icon={PawPrint}
		variant="warning"
	>
		<div class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
			{#each livestockTypes as animal}
				<div class="space-y-1.5 rounded-lg border bg-muted/20 p-3 text-center">
					<div class="text-2xl">{animal.icon}</div>
					<Label for={animal.id} class="text-xs">{animal.label}</Label>
					{#if animal.id === 'pigs'}
						<NumberInput
							id={animal.id}
							bind:value={pigs}
							placeholder="0"
							min={0}
							class="text-center"
						/>
					{:else if animal.id === 'cows'}
						<NumberInput
							id={animal.id}
							bind:value={cows}
							placeholder="0"
							min={0}
							class="text-center"
						/>
					{:else if animal.id === 'carabaos'}
						<NumberInput
							id={animal.id}
							bind:value={carabaos}
							placeholder="0"
							min={0}
							class="text-center"
						/>
					{:else if animal.id === 'horses'}
						<NumberInput
							id={animal.id}
							bind:value={horses}
							placeholder="0"
							min={0}
							class="text-center"
						/>
					{:else if animal.id === 'goats'}
						<NumberInput
							id={animal.id}
							bind:value={goats}
							placeholder="0"
							min={0}
							class="text-center"
						/>
					{:else if animal.id === 'chickens'}
						<NumberInput
							id={animal.id}
							bind:value={chickens}
							placeholder="0"
							min={0}
							class="text-center"
						/>
					{:else if animal.id === 'ducks'}
						<NumberInput
							id={animal.id}
							bind:value={ducks}
							placeholder="0"
							min={0}
							class="text-center"
						/>
					{/if}
				</div>
			{/each}
		</div>
	</FormSection>

	<!-- Food Security Section -->
	<FormSection
		title="Food Security"
		description="Backyard gardening and food production"
		icon={Sprout}
		variant="success"
		defaultOpen={false}
	>
		<div class="flex flex-col gap-4">
			<div class="grid grid-cols-1 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="households_with_backyard_garden" class="flex items-center gap-1.5">
						Households with Backyard Garden
						<HelpTooltip
							content="Number of households that maintain a backyard garden for food production"
						/>
					</Label>
					<NumberInput
						id="households_with_backyard_garden"
						bind:value={households_with_backyard_garden}
						placeholder="0"
						min={0}
					/>
				</div>
			</div>

			<div class="space-y-3">
				<Label>Common Garden Commodities</Label>
				<ComboboxMultiSelect
					bind:values={common_garden_commodities}
					options={gardenCommodityOptions}
					placeholder="Search commodity..."
					addLabel="Add Commodity"
					emptyMessage="No commodities added"
				/>
			</div>
		</div>
	</FormSection>
</div>
