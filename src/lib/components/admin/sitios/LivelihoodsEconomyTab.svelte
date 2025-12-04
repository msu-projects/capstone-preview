<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import FormSection from '$lib/components/ui/form-section/form-section.svelte';
	import HelpTooltip from '$lib/components/ui/help-tooltip/help-tooltip.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import * as Select from '$lib/components/ui/select';
	import { cn } from '$lib/utils';
	import {
		AlertCircle,
		Briefcase,
		CheckCircle2,
		Coins,
		Leaf,
		PawPrint,
		Plus,
		Sprout,
		Trash2,
		Wheat
	} from '@lucide/svelte';

	let {
		employments = $bindable([]),
		income_brackets = $bindable([]),
		farmers_count = $bindable(0),
		farmer_associations = $bindable(0),
		farm_area_hectares = $bindable(0),
		top_crops = $bindable(['']),
		pigs = $bindable(0),
		cows = $bindable(0),
		carabaos = $bindable(0),
		horses = $bindable(0),
		goats = $bindable(0),
		chickens = $bindable(0),
		ducks = $bindable(0),
		households_with_backyard_garden = $bindable(0),
		common_garden_commodities = $bindable(['', '', '']),
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

	// Helper functions for employment management
	function addEmployment() {
		employments.push({ type: '', count: 0 });
		employments = employments;
	}

	function removeEmployment(index: number) {
		employments.splice(index, 1);
		employments = employments;
	}

	// Helper functions for top crops management
	function addCrop() {
		top_crops.push('');
		top_crops = top_crops;
	}

	function removeCrop(index: number) {
		top_crops.splice(index, 1);
		top_crops = top_crops;
	}
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
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<Label class="flex items-center gap-1.5">
					Employment Types
					<HelpTooltip content="Track the main types of employment in this sitio with counts" />
				</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={addEmployment}
					class="h-8 gap-1.5"
				>
					<Plus class="size-3.5" />
					Add
				</Button>
			</div>

			{#if employments.length === 0}
				<div
					class="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center"
				>
					<Briefcase class="size-8 text-muted-foreground/50" />
					<p class="text-sm text-muted-foreground">No employments added yet</p>
				</div>
			{:else}
				<div class="rounded-lg border">
					<table class="w-full">
						<thead>
							<tr class="border-b bg-muted/30">
								<th class="px-3 py-2 text-left text-sm font-medium">Type</th>
								<th class="w-32 px-3 py-2 text-left text-sm font-medium">Count</th>
								<th class="w-10"></th>
							</tr>
						</thead>
						<tbody>
							{#each employments as employment, i}
								<tr class="border-b last:border-0">
									<td class="px-3 py-2">
										<Select.Root
											type="single"
											value={employment.type}
											onValueChange={(val) => {
												if (val) employment.type = val;
											}}
										>
											<Select.Trigger id="employment_type_{i}" class="w-full">
												{employment.type || 'Select type'}
											</Select.Trigger>
											<Select.Content>
												{#each employmentTypes as type}
													<Select.Item value={type}>{type}</Select.Item>
												{/each}
												<Select.Separator />
												<div class="p-2">
													<Label for="custom_employment_{i}" class="text-xs">Custom</Label>
													<Input
														id="custom_employment_{i}"
														bind:value={employment.type}
														placeholder="Enter custom type"
														class="mt-1"
													/>
												</div>
											</Select.Content>
										</Select.Root>
									</td>
									<td class="px-3 py-2">
										<NumberInput
											id="employment_count_{i}"
											bind:value={employment.count}
											placeholder="0"
											min={0}
										/>
									</td>
									<td class="px-1 py-2">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											class="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
											onclick={() => removeEmployment(i)}
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
			<div class="flex items-center justify-between">
				<Label>Top Crops</Label>
				<Button type="button" variant="outline" size="sm" onclick={addCrop} class="h-8 gap-1.5">
					<Plus class="size-3.5" />
					Add
				</Button>
			</div>

			{#if top_crops.length === 0}
				<div
					class="flex flex-col items-center gap-2 rounded-lg border border-dashed py-6 text-center"
				>
					<Leaf class="size-6 text-muted-foreground/50" />
					<p class="text-sm text-muted-foreground">No crops added</p>
				</div>
			{:else}
				<div class="flex flex-wrap gap-2">
					{#each top_crops as crop, i}
						<div class="flex items-center gap-1 rounded-lg border bg-background p-1 pr-1.5">
							<Input
								id={`crop_${i}`}
								bind:value={top_crops[i]}
								placeholder="Crop name"
								class="h-8 w-32 border-0 bg-transparent px-2 focus-visible:ring-0 focus-visible:ring-offset-0"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class="size-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
								onclick={() => removeCrop(i)}
							>
								<Trash2 class="size-3.5" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
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
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
			<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
				{#each common_garden_commodities as commodity, i}
					<Input
						bind:value={common_garden_commodities[i]}
						placeholder={`Commodity ${i + 1} (e.g., Tomatoes)`}
					/>
				{/each}
			</div>
		</div>
	</FormSection>
</div>
