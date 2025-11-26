<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';

	let {
		top_employments = $bindable(['', '', '']),
		top_income_brackets = $bindable(['', '', '']),
		farmers_count = $bindable(0),
		farmer_associations = $bindable(0),
		farm_area_hectares = $bindable(0),
		top_crops = $bindable(['', '', '', '', '']),
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
		top_employments: string[];
		top_income_brackets: string[];
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
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div class="space-y-3">
					<Label>Top Employment Types</Label>
					{#each top_employments as employment, i}
						<Input
							id={`employment_${i}`}
							bind:value={top_employments[i]}
							placeholder="e.g., Farming, Teaching, Construction"
						/>
					{/each}
				</div>
				<div class="space-y-3">
					<Label>Top Income Brackets</Label>
					{#each top_income_brackets as bracket, i}
						<Input
							id={`bracket_${i}`}
							bind:value={top_income_brackets[i]}
							placeholder="e.g., Below 10k, 10k-20k, Above 20k"
						/>
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
				<Label>Top Crops (up to 5)</Label>
				<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
					{#each top_crops as crop, i}
						<Input
							id={`crop_${i}`}
							bind:value={top_crops[i]}
							placeholder="e.g., Rice, Corn, Vegetables"
						/>
					{/each}
				</div>
			</div>
		</div>

		<!-- Livestock & Poultry -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Livestock & Poultry</h3>
			<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
				<div class="space-y-2">
					<Label for="pigs">Pigs</Label>
					<NumberInput id="pigs" bind:value={pigs} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="cows">Cows</Label>
					<NumberInput id="cows" bind:value={cows} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="carabaos">Carabaos</Label>
					<NumberInput id="carabaos" bind:value={carabaos} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="horses">Horses</Label>
					<NumberInput id="horses" bind:value={horses} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="goats">Goats</Label>
					<NumberInput id="goats" bind:value={goats} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="chickens">Chickens</Label>
					<NumberInput id="chickens" bind:value={chickens} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="ducks">Ducks</Label>
					<NumberInput id="ducks" bind:value={ducks} placeholder="0" min={0} />
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
