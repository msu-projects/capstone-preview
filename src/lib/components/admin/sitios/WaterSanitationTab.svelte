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
		waste_segregation_practice = $bindable(null)
	}: {
		water_systems_count: number;
		water_sources: Array<{ source: string; condition: string }>;
		households_without_toilet: number;
		toilet_facility_types: string[];
		waste_segregation_practice: boolean | null;
	} = $props();

	const toiletFacilityTypes = ['Water Sealed', 'Open Pit', 'Pour Flush', 'Composting'];

	function addWaterSource() {
		water_sources = [...water_sources, { source: '', condition: '' }];
	}

	function removeWaterSource(index: number) {
		water_sources = water_sources.filter((_, i) => i !== index);
	}

	function toggleToiletType(type: string) {
		if (toilet_facility_types.includes(type)) {
			toilet_facility_types = toilet_facility_types.filter((t) => t !== type);
		} else {
			toilet_facility_types = [...toilet_facility_types, type];
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Water & Sanitation</Card.Title>
		<Card.Description>Water sources, sanitation, and waste management</Card.Description>
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

		<!-- Waste Segregation -->
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
								: 'Select...'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="yes">Yes</Select.Item>
						<Select.Item value="no">No</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</Card.Content>
</Card.Root>
