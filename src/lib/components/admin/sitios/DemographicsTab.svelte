<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';

	let {
		male = $bindable(0),
		female = $bindable(0),
		total = $bindable(0),
		age_0_14 = $bindable(0),
		age_15_64 = $bindable(0),
		age_65_above = $bindable(0)
	}: {
		male: number;
		female: number;
		total: number;
		age_0_14: number;
		age_15_64: number;
		age_65_above: number;
	} = $props();

	// Auto-calculate total
	$effect(() => {
		total = male + female;
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Demographics</Card.Title>
		<Card.Description>Population breakdown by gender and age groups</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Gender Distribution -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Gender Distribution</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="space-y-2">
					<Label for="male">Male</Label>
					<NumberInput id="male" bind:value={male} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="female">Female</Label>
					<NumberInput id="female" bind:value={female} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="total">Total (Auto-calculated)</Label>
					<NumberInput id="total" value={total} placeholder="0" disabled />
				</div>
			</div>
		</div>

		<!-- Age Distribution -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Age Distribution</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="space-y-2">
					<Label for="age_0_14">0-14 years</Label>
					<NumberInput id="age_0_14" bind:value={age_0_14} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="age_15_64">15-64 years</Label>
					<NumberInput id="age_15_64" bind:value={age_15_64} placeholder="0" min={0} />
				</div>
				<div class="space-y-2">
					<Label for="age_65_above">65+ years</Label>
					<NumberInput id="age_65_above" bind:value={age_65_above} placeholder="0" min={0} />
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
