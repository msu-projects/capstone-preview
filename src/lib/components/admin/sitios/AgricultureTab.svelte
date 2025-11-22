<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';

	let {
		farmers_count = $bindable(0),
		farmer_associations = $bindable(0),
		farm_area_hectares = $bindable(0),
		top_crops = $bindable(['', '', '', '', ''])
	}: {
		farmers_count: number;
		farmer_associations: number;
		farm_area_hectares: number;
		top_crops: string[];
	} = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Agriculture</Card.Title>
		<Card.Description>Farming and agricultural data</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Farm Statistics -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Farm Statistics</h3>
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
		</div>

		<!-- Top Crops -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Top Crops (up to 5)</h3>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				{#each top_crops as crop, i}
					<div class="space-y-2">
						<Label for={`crop_${i}`}>Crop {i + 1}</Label>
						<Input
							id={`crop_${i}`}
							bind:value={top_crops[i]}
							placeholder="e.g., Rice, Corn, Vegetables"
						/>
					</div>
				{/each}
			</div>
		</div>
	</Card.Content>
</Card.Root>
