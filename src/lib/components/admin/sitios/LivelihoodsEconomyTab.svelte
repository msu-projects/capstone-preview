<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import * as Select from '$lib/components/ui/select';
	import { Plus, Trash2 } from '@lucide/svelte';

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
		common_garden_commodities = $bindable(['', '', ''])
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
	} = $props();

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
		{ label: '≤100', value: '<=100' },
		{ label: '100-300', value: '100-300' },
		{ label: '300-500', value: '300-500' },
		{ label: '≥500', value: '>=500' }
	];

	// Initialize income_brackets if empty
	$effect(() => {
		if (income_brackets.length === 0) {
			income_brackets = incomeBrackets.map((b) => ({ bracket: b.value, households: 0 }));
		}
	});

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

<Card.Root>
	<Card.Header>
		<Card.Title>Livelihoods & Economy</Card.Title>
		<Card.Description>
			Employment, agriculture, livestock, and food security information
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Employment & Income -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Employment & Income</h3>

			<!-- Employment Types -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<Label>Employment Types</Label>
					<Button type="button" variant="outline" size="sm" onclick={addEmployment}>
						<Plus class="mr-2 size-4" />
						Add Employment
					</Button>
				</div>

				{#if employments.length === 0}
					<div
						class="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground"
					>
						No employments added. Click "Add Employment" to get started.
					</div>
				{:else}
					<div class="space-y-2">
						<!-- Column Headers -->
						<div class="flex items-center gap-2">
							<div class="flex-1">
								<Label>Type</Label>
							</div>
							<div class="w-32">
								<Label>Count</Label>
							</div>
							<div class="w-10"></div>
						</div>

						<!-- Employment Rows -->
						{#each employments as employment, i}
							<div class="flex items-center gap-2">
								<div class="flex-1">
									<Select.Root
										type="single"
										value={employment.type}
										onValueChange={(val) => {
											if (val) employment.type = val;
										}}
									>
										<Select.Trigger id="employment_type_{i}" class="w-full">
											{employment.type || 'Select employment type'}
										</Select.Trigger>
										<Select.Content>
											{#each employmentTypes as type}
												<Select.Item value={type}>{type}</Select.Item>
											{/each}
											<Select.Separator />
											<div class="p-2">
												<Label for="custom_employment_{i}" class="text-xs">Custom Employment</Label>
												<Input
													id="custom_employment_{i}"
													bind:value={employment.type}
													placeholder="Enter custom employment"
													class="mt-1"
												/>
											</div>
										</Select.Content>
									</Select.Root>
								</div>

								<div class="w-40">
									<NumberInput
										id="employment_count_{i}"
										bind:value={employment.count}
										placeholder="0"
										min={0}
									/>
								</div>

								<Button
									type="button"
									variant="destructive"
									size="icon"
									class="size-10"
									onclick={() => removeEmployment(i)}
								>
									<Trash2 class="size-4" />
								</Button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Income Brackets -->
			<div class="space-y-3">
				<Label>Income Brackets (Daily Income in PHP)</Label>
				<div class="space-y-3">
					{#each income_brackets as bracket, i}
						<div class="flex items-center gap-3">
							<div class="w-32">
								<div
									class="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm"
								>
									{bracket.bracket}
								</div>
							</div>
							<div class="flex-1">
								<NumberInput
									id="bracket_households_{i}"
									bind:value={income_brackets[i].households}
									placeholder="Number of households"
									min={0}
								/>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Agriculture -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Agriculture</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
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
					<Label for="farm_area">Farm Area (hectares)</Label>
					<NumberInput
						id="farm_area"
						bind:value={farm_area_hectares}
						placeholder="0"
						min={0}
						step={0.01}
					/>
				</div>
			</div>
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<Label>Top Crops</Label>
					<Button type="button" variant="outline" size="sm" onclick={addCrop}>
						<Plus class="mr-2 size-4" />
						Add Crop
					</Button>
				</div>

				{#if top_crops.length === 0}
					<div
						class="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground"
					>
						No crops added. Click "Add Crop" to get started.
					</div>
				{:else}
					<div class="space-y-2">
						<!-- Column Header -->
						<div class="flex items-center gap-2">
							<div class="flex-1">
								<Label>Crop Name</Label>
							</div>
							<div class="w-10"></div>
						</div>

						<!-- Crop Rows -->
						{#each top_crops as crop, i}
							<div class="flex items-center gap-2">
								<div class="flex-1">
									<Input
										id={`crop_${i}`}
										bind:value={top_crops[i]}
										placeholder="e.g., Rice, Corn, Vegetables"
									/>
								</div>

								<Button
									type="button"
									variant="destructive"
									size="icon"
									class="size-10"
									onclick={() => removeCrop(i)}
								>
									<Trash2 class="size-4" />
								</Button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Livestock & Poultry -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Livestock & Poultry</h3>
			<div class="space-y-2">
				<!-- Column Headers -->
				<div class="flex items-center gap-2">
					<div class="flex-1">
						<Label>Type</Label>
					</div>
					<div class="w-32">
						<Label>Count</Label>
					</div>
				</div>

				<!-- Livestock Rows -->
				<div class="flex items-center gap-2">
					<div class="flex-1">
						<div
							class="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm"
						>
							Pigs
						</div>
					</div>
					<div class="w-32">
						<NumberInput id="pigs" bind:value={pigs} placeholder="0" min={0} />
					</div>
				</div>

				<div class="flex items-center gap-2">
					<div class="flex-1">
						<div
							class="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm"
						>
							Cows
						</div>
					</div>
					<div class="w-32">
						<NumberInput id="cows" bind:value={cows} placeholder="0" min={0} />
					</div>
				</div>

				<div class="flex items-center gap-2">
					<div class="flex-1">
						<div
							class="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm"
						>
							Carabaos
						</div>
					</div>
					<div class="w-32">
						<NumberInput id="carabaos" bind:value={carabaos} placeholder="0" min={0} />
					</div>
				</div>

				<div class="flex items-center gap-2">
					<div class="flex-1">
						<div
							class="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm"
						>
							Horses
						</div>
					</div>
					<div class="w-32">
						<NumberInput id="horses" bind:value={horses} placeholder="0" min={0} />
					</div>
				</div>

				<div class="flex items-center gap-2">
					<div class="flex-1">
						<div
							class="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm"
						>
							Goats
						</div>
					</div>
					<div class="w-32">
						<NumberInput id="goats" bind:value={goats} placeholder="0" min={0} />
					</div>
				</div>

				<div class="flex items-center gap-2">
					<div class="flex-1">
						<div
							class="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm"
						>
							Chickens
						</div>
					</div>
					<div class="w-32">
						<NumberInput id="chickens" bind:value={chickens} placeholder="0" min={0} />
					</div>
				</div>

				<div class="flex items-center gap-2">
					<div class="flex-1">
						<div
							class="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm"
						>
							Ducks
						</div>
					</div>
					<div class="w-32">
						<NumberInput id="ducks" bind:value={ducks} placeholder="0" min={0} />
					</div>
				</div>
			</div>
		</div>

		<!-- Food Security -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Food Security</h3>
			<div class="space-y-2">
				<Label for="households_with_backyard_garden">Households with Backyard Garden</Label>
				<NumberInput
					id="households_with_backyard_garden"
					bind:value={households_with_backyard_garden}
					placeholder="0"
					min={0}
				/>
			</div>
			<div class="space-y-3">
				<Label>Common Garden Commodities</Label>
				<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
					{#each common_garden_commodities as commodity, i}
						<Input
							bind:value={common_garden_commodities[i]}
							placeholder={`Commodity ${i + 1} (e.g., Tomatoes, Lettuce)`}
						/>
					{/each}
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
