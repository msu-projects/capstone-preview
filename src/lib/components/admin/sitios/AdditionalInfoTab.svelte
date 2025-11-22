<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';

	let {
		households_with_electricity = $bindable(0),
		alternative_electricity_sources = $bindable([]),
		sectoral_organizations = $bindable(0),
		info_dissemination_methods = $bindable([]),
		transportation_methods = $bindable([]),
		quality_types = $bindable([]),
		ownership_types = $bindable([]),
		total_count = $bindable(0),
		dogs = $bindable(0),
		cats = $bindable(0),
		dogs_vaccinated = $bindable(0),
		cats_vaccinated = $bindable(0),
		households_with_backyard_garden = $bindable(0),
		common_garden_commodities = $bindable(['', '', ''])
	}: {
		households_with_electricity: number;
		alternative_electricity_sources: string[];
		sectoral_organizations: number;
		info_dissemination_methods: string[];
		transportation_methods: string[];
		quality_types: string[];
		ownership_types: string[];
		total_count: number;
		dogs: number;
		cats: number;
		dogs_vaccinated: number;
		cats_vaccinated: number;
		households_with_backyard_garden: number;
		common_garden_commodities: string[];
	} = $props();

	const alternativeElectricitySources = ['Solar', 'Generator', 'Battery'];
	const infoDisseminationMethods = [
		'Radio',
		'Signages',
		'Person in Authority',
		'Assembly',
		'Newspaper',
		'TV',
		'Internet/Social Media'
	];
	const transportationMethods = ['Motorcycle', 'Tricycle', '4-Wheels', 'Boat'];
	const housingQualityTypes = ['Concrete', 'Wood', 'Half-Concrete', 'Makeshift', 'Others'];
	const housingOwnershipTypes = [
		'Owned',
		'Rented',
		'Protected Land',
		'Informal Settler',
		'Owner Consent'
	];

	function toggleItem(arr: string[], item: string) {
		if (arr.includes(item)) {
			return arr.filter((i) => i !== item);
		} else {
			return [...arr, item];
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Additional Information</Card.Title>
		<Card.Description>
			Other community data including utilities, housing, and community empowerment
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Utilities -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Utilities</h3>
			<div class="space-y-2">
				<Label for="households_with_electricity">Households with Electricity</Label>
				<NumberInput
					id="households_with_electricity"
					bind:value={households_with_electricity}
					placeholder="0"
					min={0}
				/>
			</div>
			<div class="space-y-3">
				<Label>Alternative Electricity Sources</Label>
				{#each alternativeElectricitySources as source}
					<div class="flex items-center space-x-2">
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
						<Label for={`elec_${source}`} class="cursor-pointer font-normal">{source}</Label>
					</div>
				{/each}
			</div>
		</div>

		<!-- Community Empowerment -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Community Empowerment</h3>
			<div class="space-y-2">
				<Label for="sectoral_organizations">Sectoral Organizations</Label>
				<NumberInput
					id="sectoral_organizations"
					bind:value={sectoral_organizations}
					placeholder="0"
					min={0}
				/>
			</div>
			<div class="space-y-3">
				<Label>Info Dissemination Methods</Label>
				<div class="grid grid-cols-2 gap-3">
					{#each infoDisseminationMethods as method}
						<div class="flex items-center space-x-2">
							<Checkbox
								id={`info_${method}`}
								checked={info_dissemination_methods.includes(method)}
								onCheckedChange={() => {
									info_dissemination_methods = toggleItem(info_dissemination_methods, method);
								}}
							/>
							<Label for={`info_${method}`} class="cursor-pointer font-normal">{method}</Label>
						</div>
					{/each}
				</div>
			</div>
			<div class="space-y-3">
				<Label>Transportation Methods</Label>
				<div class="grid grid-cols-2 gap-3">
					{#each transportationMethods as method}
						<div class="flex items-center space-x-2">
							<Checkbox
								id={`transport_${method}`}
								checked={transportation_methods.includes(method)}
								onCheckedChange={() => {
									transportation_methods = toggleItem(transportation_methods, method);
								}}
							/>
							<Label for={`transport_${method}`} class="cursor-pointer font-normal">{method}</Label>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Housing -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Housing</h3>
			<div class="space-y-3">
				<Label>Housing Quality Types</Label>
				<div class="grid grid-cols-2 gap-3">
					{#each housingQualityTypes as type}
						<div class="flex items-center space-x-2">
							<Checkbox
								id={`quality_${type}`}
								checked={quality_types.includes(type)}
								onCheckedChange={() => {
									quality_types = toggleItem(quality_types, type);
								}}
							/>
							<Label for={`quality_${type}`} class="cursor-pointer font-normal">{type}</Label>
						</div>
					{/each}
				</div>
			</div>
			<div class="space-y-3">
				<Label>Housing Ownership Types</Label>
				<div class="grid grid-cols-2 gap-3">
					{#each housingOwnershipTypes as type}
						<div class="flex items-center space-x-2">
							<Checkbox
								id={`ownership_${type}`}
								checked={ownership_types.includes(type)}
								onCheckedChange={() => {
									ownership_types = toggleItem(ownership_types, type);
								}}
							/>
							<Label for={`ownership_${type}`} class="cursor-pointer font-normal">{type}</Label>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Domestic Animals -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Domestic Animals</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="total_count">Total Domestic Animals</Label>
					<NumberInput id="total_count" bind:value={total_count} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="dogs">Dogs</Label>
					<NumberInput id="dogs" bind:value={dogs} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="cats">Cats</Label>
					<NumberInput id="cats" bind:value={cats} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="dogs_vaccinated">Dogs Vaccinated</Label>
					<NumberInput id="dogs_vaccinated" bind:value={dogs_vaccinated} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="cats_vaccinated">Cats Vaccinated</Label>
					<NumberInput id="cats_vaccinated" bind:value={cats_vaccinated} placeholder="0" min={0} />
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
				{#each common_garden_commodities as commodity, i}
					<div class="space-y-2">
						<Input
							bind:value={common_garden_commodities[i]}
							placeholder={`Commodity ${i + 1} (e.g., Tomatoes, Lettuce)`}
						/>
					</div>
				{/each}
			</div>
		</div>
	</Card.Content>
</Card.Root>
