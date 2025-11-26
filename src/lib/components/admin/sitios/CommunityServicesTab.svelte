<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';

	let {
		sectoral_organizations = $bindable(0),
		info_dissemination_methods = $bindable([]),
		transportation_methods = $bindable([]),
		dogs = $bindable(0),
		cats = $bindable(0),
		dogs_vaccinated = $bindable(0),
		cats_vaccinated = $bindable(0)
	}: {
		sectoral_organizations: number;
		info_dissemination_methods: string[];
		transportation_methods: string[];
		dogs: number;
		cats: number;
		dogs_vaccinated: number;
		cats_vaccinated: number;
	} = $props();

	// Computed values
	const total_count = $derived(dogs + cats);
	const dog_vaccination_rate = $derived(
		dogs > 0 ? ((dogs_vaccinated / dogs) * 100).toFixed(1) : '0'
	);
	const cat_vaccination_rate = $derived(
		cats > 0 ? ((cats_vaccinated / cats) * 100).toFixed(1) : '0'
	);
	const overall_vaccination_rate = $derived(
		total_count > 0 ? (((dogs_vaccinated + cats_vaccinated) / total_count) * 100).toFixed(1) : '0'
	);

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
		<Card.Title>Community Services</Card.Title>
		<Card.Description>
			Community empowerment, communication, transportation, and public health
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
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
		</div>

		<!-- Information Dissemination -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Information Dissemination</h3>
			<div class="space-y-3">
				<Label>Available Methods</Label>
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
		</div>

		<!-- Transportation -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Transportation</h3>
			<div class="space-y-3">
				<Label>Available Methods</Label>
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

		<!-- Domestic Animals (Public Health) -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Domestic Animals (Public Health)</h3>
			<p class="text-sm text-muted-foreground">
				Track domestic animals for rabies control and public health monitoring
			</p>

			<!-- Dogs -->
			<div class="space-y-2">
				<Label class="text-base">Dogs</Label>
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<Label for="dogs" class="whitespace-nowrap">Total:</Label>
						<NumberInput id="dogs" bind:value={dogs} placeholder="0" min={0} class="w-24" />
					</div>
					<div class="flex items-center gap-2">
						<Label for="dogs_vaccinated" class="whitespace-nowrap">Vaccinated:</Label>
						<NumberInput
							id="dogs_vaccinated"
							bind:value={dogs_vaccinated}
							placeholder="0"
							min={0}
							max={dogs}
							class="w-24"
						/>
					</div>
					{#if dogs > 0}
						<span class="text-sm text-muted-foreground">({dog_vaccination_rate}% vaccinated)</span>
					{/if}
				</div>
			</div>

			<!-- Cats -->
			<div class="space-y-2">
				<Label class="text-base">Cats</Label>
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<Label for="cats" class="whitespace-nowrap">Total:</Label>
						<NumberInput id="cats" bind:value={cats} placeholder="0" min={0} class="w-24" />
					</div>
					<div class="flex items-center gap-2">
						<Label for="cats_vaccinated" class="whitespace-nowrap">Vaccinated:</Label>
						<NumberInput
							id="cats_vaccinated"
							bind:value={cats_vaccinated}
							placeholder="0"
							min={0}
							max={cats}
							class="w-24"
						/>
					</div>
					{#if cats > 0}
						<span class="text-sm text-muted-foreground">({cat_vaccination_rate}% vaccinated)</span>
					{/if}
				</div>
			</div>

			<!-- Summary -->
			<div class="rounded-md border bg-muted/50 p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium">Total Domestic Animals</p>
						<p class="text-2xl font-bold">{total_count}</p>
					</div>
					<div class="text-right">
						<p class="text-sm font-medium">Overall Vaccination Rate</p>
						<p class="text-2xl font-bold">{overall_vaccination_rate}%</p>
						<p class="text-xs text-muted-foreground">
							{dogs_vaccinated + cats_vaccinated} of {total_count} vaccinated
						</p>
					</div>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
