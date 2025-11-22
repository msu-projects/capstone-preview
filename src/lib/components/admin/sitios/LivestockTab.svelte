<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';

	let {
		pigs = $bindable(0),
		cows = $bindable(0),
		carabaos = $bindable(0),
		horses = $bindable(0),
		goats = $bindable(0),
		chickens = $bindable(0),
		ducks = $bindable(0)
	}: {
		pigs: number;
		cows: number;
		carabaos: number;
		horses: number;
		goats: number;
		chickens: number;
		ducks: number;
	} = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Livestock & Poultry</Card.Title>
		<Card.Description>Animal population count</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
	</Card.Content>
</Card.Root>
