<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';

	let {
		registered_voters = $bindable(0),
		philhealth_beneficiaries = $bindable(0),
		fourps_beneficiaries = $bindable(0)
	}: {
		registered_voters: number;
		philhealth_beneficiaries: number;
		fourps_beneficiaries: number;
	} = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Social Services</Card.Title>
		<Card.Description>Social service coverage and beneficiaries</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="space-y-2">
				<Label for="registered_voters">Registered Voters</Label>
				<NumberInput
					id="registered_voters"
					bind:value={registered_voters}
					placeholder="0"
					min={0}
				/>
			</div>
			<div class="space-y-2">
				<Label for="philhealth">PhilHealth Beneficiaries</Label>
				<NumberInput
					id="philhealth"
					bind:value={philhealth_beneficiaries}
					placeholder="0"
					min={0}
				/>
			</div>
			<div class="space-y-2">
				<Label for="fourps">4Ps Beneficiaries</Label>
				<NumberInput id="fourps" bind:value={fourps_beneficiaries} placeholder="0" min={0} />
			</div>
		</div>
	</Card.Content>
</Card.Root>
