<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import * as Select from '$lib/components/ui/select';
	import { Plus, Trash2 } from '@lucide/svelte';

	let {
		water_systems_count = $bindable(0),
		water_sources = $bindable([{ source: '', condition: '' }]),
		households_without_toilet = $bindable(0),
		toilet_facility_types = $bindable([]),
		waste_segregation_practice = $bindable(null),
		households_with_electricity = $bindable(0),
		alternative_electricity_sources = $bindable([]),
		quality_types = $bindable([]),
		ownership_types = $bindable([])
	}: {
		water_systems_count: number;
		water_sources: Array<{ source: string; condition: string }>;
		households_without_toilet: number;
		toilet_facility_types: string[];
		waste_segregation_practice: boolean | null;
		households_with_electricity: number;
		alternative_electricity_sources: string[];
		quality_types: string[];
		ownership_types: string[];
	} = $props();

	const toiletFacilityTypes = ['Water Sealed', 'Open Pit', 'Pour Flush', 'Composting'];
	const alternativeElectricitySources = ['Solar', 'Generator', 'Battery'];
	const housingQualityTypes = ['Concrete', 'Wood', 'Half-Concrete', 'Makeshift', 'Others'];
	const housingOwnershipTypes = [
		'Owned',
		'Rented',
		'Protected Land',
		'Informal Settler',
		'Owner Consent'
	];

	function addWaterSource() {
		water_sources = [...water_sources, { source: '', condition: '' }];
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
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Infrastructure & Housing</Card.Title>
		<Card.Description>Water, sanitation, electricity, and housing conditions</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Water Systems -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Water Systems</h3>
			<div class="space-y-2">
				<Label for="water_systems_count">Number of Water Systems</Label>
				<NumberInput
					id="water_systems_count"
					bind:value={water_systems_count}
					placeholder="0"
					min={0}
				/>
			</div>
		</div>

		<!-- Water Sources -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold">Water Sources</h3>
				<Button type="button" variant="outline" size="sm" onclick={addWaterSource}>
					<Plus class="mr-2 size-4" />
					Add Source
				</Button>
			</div>
			<div class="space-y-3">
				{#each water_sources as source, i}
					<div class="flex gap-2">
						<div class="flex-1 space-y-2">
							<Input bind:value={source.source} placeholder="e.g., Deep Well, Spring, River" />
						</div>
						<div class="flex-1 space-y-2">
							<Input bind:value={source.condition} placeholder="e.g., Good, Fair, Poor" />
						</div>
						{#if water_sources.length > 1}
							<Button type="button" variant="ghost" size="sm" onclick={() => removeWaterSource(i)}>
								<Trash2 class="size-4" />
							</Button>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Sanitation -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Sanitation</h3>
			<div class="space-y-2">
				<Label for="households_without_toilet">Households Without Toilet</Label>
				<NumberInput
					id="households_without_toilet"
					bind:value={households_without_toilet}
					placeholder="0"
					min={0}
				/>
			</div>

			<div class="space-y-3">
				<Label>Toilet Facility Types</Label>
				<div class="grid grid-cols-2 gap-3">
					{#each toiletFacilityTypes as type}
						<div class="flex items-center space-x-2">
							<Checkbox
								id={`toilet_${type}`}
								checked={toilet_facility_types.includes(type)}
								onCheckedChange={() => toggleToiletType(type)}
							/>
							<Label for={`toilet_${type}`} class="cursor-pointer font-normal">{type}</Label>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Waste Management -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Waste Management</h3>
			<div class="space-y-2">
				<Label>Waste Segregation Practice</Label>
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
					<Select.Trigger>
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

		<!-- Utilities (Electricity) -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Electricity</h3>
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
				<div class="grid grid-cols-2 gap-3">
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
	</Card.Content>
</Card.Root>
