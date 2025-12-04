<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Command from '$lib/components/ui/command';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import * as Popover from '$lib/components/ui/popover';
	import { AlertCircle, CheckCircle2, ChevronsUpDown, Plus, Trash2 } from '@lucide/svelte';

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
		ethnicities = $bindable<string[]>([]),
		religions = $bindable<string[]>([]),
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
		ethnicities: string[];
		religions: string[];
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

	// Predefined options for ethnicities and religions
	const ethnicityOptions = [
		'Ilonggo',
		'Cebuano',
		'Tagalog',
		'Ilocano',
		'Waray',
		'Muslim',
		"T'boli",
		"B'laan"
	];

	const religionOptions = [
		'Roman Catholic',
		'Alliance',
		'Baptist',
		'Iglesia ni Cristo',
		'Islam',
		'Seventh Day Adventist',
		"Jehovah's Witness"
	];

	// Combobox states
	let ethnicityOpen = $state(false);
	let religionOpen = $state(false);
	let ethnicitySearch = $state('');
	let religionSearch = $state('');

	// Filter available options (exclude already selected)
	const availableEthnicities = $derived(ethnicityOptions.filter((e) => !ethnicities.includes(e)));
	const availableReligions = $derived(religionOptions.filter((r) => !religions.includes(r)));

	// Filtered by search
	const filteredEthnicities = $derived(
		availableEthnicities.filter((e) => e.toLowerCase().includes(ethnicitySearch.toLowerCase()))
	);
	const filteredReligions = $derived(
		availableReligions.filter((r) => r.toLowerCase().includes(religionSearch.toLowerCase()))
	);

	// Check if search is a custom entry
	const isCustomEthnicity = $derived(
		ethnicitySearch.trim() !== '' &&
			!ethnicityOptions.some((e) => e.toLowerCase() === ethnicitySearch.toLowerCase()) &&
			!ethnicities.some((e) => e.toLowerCase() === ethnicitySearch.toLowerCase())
	);
	const isCustomReligion = $derived(
		religionSearch.trim() !== '' &&
			!religionOptions.some((r) => r.toLowerCase() === religionSearch.toLowerCase()) &&
			!religions.some((r) => r.toLowerCase() === religionSearch.toLowerCase())
	);

	function addEthnicity(value: string) {
		if (value.trim() && !ethnicities.includes(value.trim())) {
			ethnicities = [...ethnicities, value.trim()];
		}
		ethnicitySearch = '';
		ethnicityOpen = false;
	}

	function removeEthnicity(value: string) {
		ethnicities = ethnicities.filter((e) => e !== value);
	}

	function addReligion(value: string) {
		if (value.trim() && !religions.includes(value.trim())) {
			religions = [...religions, value.trim()];
		}
		religionSearch = '';
		religionOpen = false;
	}

	function removeReligion(value: string) {
		religions = religions.filter((r) => r !== value);
	}
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
							<span>Matches population ({genderTotal.toLocaleString()})</span>
						</div>
					{:else}
						<div class="flex items-center gap-2 text-sm text-destructive">
							<AlertCircle class="size-4" />
							<span
								>Must equal {population.toLocaleString()} (currently {genderTotal.toLocaleString()})</span
							>
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
						<AlertCircle class="mt-0.5 size-4 shrink-0 text-destructive" />
						<div class="text-sm">
							<p class="font-medium text-destructive">
								Gender distribution must equal total population
							</p>
							<p class="mt-1 text-muted-foreground">
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
							<span>Matches population ({ageTotal.toLocaleString()})</span>
						</div>
					{:else}
						<div class="flex items-center gap-2 text-sm text-destructive">
							<AlertCircle class="size-4" />
							<span
								>Must equal {population.toLocaleString()} (currently {ageTotal.toLocaleString()})</span
							>
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
				<div class="hidden rounded-md border border-destructive/50 bg-destructive/10 p-3">
					<div class="flex gap-2">
						<AlertCircle class="mt-0.5 size-4 shrink-0 text-destructive" />
						<div class="text-sm">
							<p class="font-medium text-destructive">
								Age distribution must equal total population
							</p>
							<p class="mt-1 text-muted-foreground">
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

		<!-- Ethnicity -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-semibold">Ethnicity</h3>
					<p class="text-sm text-muted-foreground">Add ethnic groups present in the sitio</p>
				</div>
				<Popover.Root bind:open={ethnicityOpen}>
					<Popover.Trigger>
						<Button type="button" variant="outline" size="sm" class="gap-2">
							<Plus class="size-4" />
							Add Ethnicity
							<ChevronsUpDown class="size-4 opacity-50" />
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-64 p-0" align="end">
						<Command.Root shouldFilter={false}>
							<Command.Input placeholder="Search ethnicity..." bind:value={ethnicitySearch} />
							<Command.List>
								{#if filteredEthnicities.length === 0 && !isCustomEthnicity}
									<Command.Empty>No ethnicity found.</Command.Empty>
								{/if}
								<Command.Group>
									{#each filteredEthnicities as ethnicity}
										<Command.Item value={ethnicity} onSelect={() => addEthnicity(ethnicity)}>
											{ethnicity}
										</Command.Item>
									{/each}
									{#if isCustomEthnicity}
										{#if filteredEthnicities.length > 0}
											<Command.Separator />
										{/if}
										<Command.Item value="__custom__" onSelect={() => addEthnicity(ethnicitySearch)}>
											<Plus class="mr-2 size-4" />
											Add "{ethnicitySearch}" as custom
										</Command.Item>
									{/if}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- Selected ethnicities list -->
			{#if ethnicities.length === 0}
				<p class="text-sm text-muted-foreground italic">No ethnicities added yet.</p>
			{:else}
				<div class="space-y-2">
					{#each ethnicities as ethnicity, i (ethnicity)}
						<div class="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
							<span class="text-sm">{ethnicity}</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class="size-7"
								onclick={() => removeEthnicity(ethnicity)}
							>
								<Trash2 class="size-4 text-destructive" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Religion -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-semibold">Religion</h3>
					<p class="text-sm text-muted-foreground">
						Add religious affiliations present in the sitio
					</p>
				</div>
				<Popover.Root bind:open={religionOpen}>
					<Popover.Trigger>
						<Button type="button" variant="outline" size="sm" class="gap-2">
							<Plus class="size-4" />
							Add Religion
							<ChevronsUpDown class="size-4 opacity-50" />
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-64 p-0" align="end">
						<Command.Root shouldFilter={false}>
							<Command.Input placeholder="Search religion..." bind:value={religionSearch} />
							<Command.List>
								{#if filteredReligions.length === 0 && !isCustomReligion}
									<Command.Empty>No religion found.</Command.Empty>
								{/if}
								<Command.Group>
									{#each filteredReligions as religion}
										<Command.Item value={religion} onSelect={() => addReligion(religion)}>
											{religion}
										</Command.Item>
									{/each}
									{#if isCustomReligion}
										{#if filteredReligions.length > 0}
											<Command.Separator />
										{/if}
										<Command.Item value="__custom__" onSelect={() => addReligion(religionSearch)}>
											<Plus class="mr-2 size-4" />
											Add "{religionSearch}" as custom
										</Command.Item>
									{/if}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- Selected religions list -->
			{#if religions.length === 0}
				<p class="text-sm text-muted-foreground italic">No religions added yet.</p>
			{:else}
				<div class="space-y-2">
					{#each religions as religion, i (religion)}
						<div class="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
							<span class="text-sm">{religion}</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class="size-7"
								onclick={() => removeReligion(religion)}
							>
								<Trash2 class="size-4 text-destructive" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
