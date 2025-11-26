<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import { AlertCircle, CheckCircle2 } from '@lucide/svelte';

	let {
		male = $bindable(0),
		female = $bindable(0),
		total = $bindable(0),
		age_0_14 = $bindable(0),
		age_15_64 = $bindable(0),
		age_65_above = $bindable(0),
		registered_voters = $bindable(0),
		philhealth_beneficiaries = $bindable(0),
		fourps_beneficiaries = $bindable(0),
		population = 0
	}: {
		male: number;
		female: number;
		total: number;
		age_0_14: number;
		age_15_64: number;
		age_65_above: number;
		registered_voters: number;
		philhealth_beneficiaries: number;
		fourps_beneficiaries: number;
		population?: number;
	} = $props();

	// Auto-calculate total from gender
	$effect(() => {
		total = male + female;
	});

	const genderTotal = $derived(male + female);
	const ageTotal = $derived(age_0_14 + age_15_64 + age_65_above);
	const hasGenderData = $derived(male > 0 || female > 0);
	const hasAgeData = $derived(age_0_14 > 0 || age_15_64 > 0 || age_65_above > 0);
	const hasPopulation = $derived(population > 0);

	// Validate against population (the source of truth)
	const isGenderValid = $derived(genderTotal === population);
	const isAgeValid = $derived(ageTotal === population);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Demographics & Social Services</Card.Title>
		<Card.Description>
			Population breakdown by gender and age groups, plus social service coverage
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Gender Distribution -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold">Gender Distribution</h3>
				{#if hasGenderData && hasPopulation}
					{#if isGenderValid}
						<div class="flex items-center gap-2 text-sm text-success">
							<CheckCircle2 class="size-4" />
							<span>Matches population ({genderTotal})</span>
						</div>
					{:else}
						<div class="flex items-center gap-2 text-sm text-destructive">
							<AlertCircle class="size-4" />
							<span>Must equal {population} (currently {genderTotal})</span>
						</div>
					{/if}
				{/if}
			</div>
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
			{#if hasGenderData && hasPopulation && !isGenderValid}
				<div class="rounded-md border border-destructive/50 bg-destructive/10 p-3">
					<div class="flex gap-2">
						<AlertCircle class="size-4 shrink-0 text-destructive mt-0.5" />
						<div class="text-sm">
							<p class="font-medium text-destructive">
								Gender distribution must equal total population
							</p>
							<p class="text-muted-foreground mt-1">
								Male ({male}) + Female ({female}) = {genderTotal}, but Population is {population}
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Age Distribution -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold">Age Distribution</h3>
				{#if hasAgeData && hasPopulation}
					{#if isAgeValid}
						<div class="flex items-center gap-2 text-sm text-success">
							<CheckCircle2 class="size-4" />
							<span>Matches population ({ageTotal})</span>
						</div>
					{:else}
						<div class="flex items-center gap-2 text-sm text-destructive">
							<AlertCircle class="size-4" />
							<span>Must equal {population} (currently {ageTotal})</span>
						</div>
					{/if}
				{/if}
			</div>
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
			{#if hasAgeData && hasPopulation && !isAgeValid}
				<div class="rounded-md border border-destructive/50 bg-destructive/10 p-3">
					<div class="flex gap-2">
						<AlertCircle class="size-4 shrink-0 text-destructive mt-0.5" />
						<div class="text-sm">
							<p class="font-medium text-destructive">
								Age distribution must equal total population
							</p>
							<p class="text-muted-foreground mt-1">
								Age 0-14 ({age_0_14}) + Age 15-64 ({age_15_64}) + Age 65+ ({age_65_above}) =
								{ageTotal}, but Population is {population}
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Social Services -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Social Services Coverage</h3>
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
		</div>
	</Card.Content>
</Card.Root>
