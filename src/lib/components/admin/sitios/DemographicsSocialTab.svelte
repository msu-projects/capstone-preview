<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import { FormSection } from '$lib/components/ui/form-section';
	import { HelpTooltip } from '$lib/components/ui/help-tooltip';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import {
		AlertCircle,
		Baby,
		CheckCircle2,
		Church,
		HeartHandshake,
		Plus,
		Users,
		X
	} from '@lucide/svelte';

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

	// Section completion checks
	const isGenderComplete = $derived(hasGenderData && (!hasPopulation || isGenderValid));
	const isAgeComplete = $derived(hasAgeData && (!hasPopulation || isAgeValid));
	const isSocialComplete = $derived(
		registered_voters > 0 || philhealth_beneficiaries > 0 || fourps_beneficiaries > 0
	);
	const isCultureComplete = $derived(ethnicities.length > 0 || religions.length > 0);

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

<div class="space-y-4">
	<!-- Gender Distribution -->
	<FormSection
		title="Gender Distribution"
		description="Breakdown of population by gender"
		icon={Users}
		accent="blue"
		isComplete={isGenderComplete}
	>
		{#snippet actions()}
			{#if hasGenderData && hasPopulation}
				{#if isGenderValid}
					<div
						class="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600"
					>
						<CheckCircle2 class="size-3.5" />
						<span class="hidden sm:inline">Matches population</span>
						<span class="sm:hidden">Valid</span>
					</div>
				{:else}
					<div
						class="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
					>
						<AlertCircle class="size-3.5" />
						<span class="hidden sm:inline">Should equal {population.toLocaleString()}</span>
						<span class="sm:hidden">Mismatch</span>
					</div>
				{/if}
			{/if}
		{/snippet}

		<!-- Compact table layout for gender -->
		<div class="overflow-hidden rounded-lg border">
			<div class="grid grid-cols-3 divide-x bg-muted/50">
				<div class="p-3 text-center">
					<Label for="male" class="text-xs font-medium text-muted-foreground">Male</Label>
				</div>
				<div class="p-3 text-center">
					<Label for="female" class="text-xs font-medium text-muted-foreground">Female</Label>
				</div>
				<div class="p-3 text-center">
					<Label for="total" class="text-xs font-medium text-muted-foreground">Total</Label>
				</div>
			</div>
			<div class="grid grid-cols-3 divide-x">
				<div class="p-2">
					<NumberInput
						id="male"
						bind:value={male}
						placeholder="0"
						min={0}
						class={cn('text-center', male > 0 && 'border-primary/30 bg-primary/5')}
					/>
				</div>
				<div class="p-2">
					<NumberInput
						id="female"
						bind:value={female}
						placeholder="0"
						min={0}
						class={cn('text-center', female > 0 && 'border-primary/30 bg-primary/5')}
					/>
				</div>
				<div class="p-2">
					<NumberInput
						id="total"
						value={total}
						placeholder="0"
						disabled
						class="bg-muted/30 text-center"
					/>
				</div>
			</div>
		</div>

		{#if hasGenderData && hasPopulation && !isGenderValid}
			<div
				class="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
			>
				<AlertCircle class="mt-0.5 size-4 shrink-0 text-destructive" />
				<div class="text-sm">
					<p class="font-medium text-destructive">Gender distribution must equal population</p>
					<p class="mt-0.5 text-muted-foreground">
						Male ({male.toLocaleString()}) + Female ({female.toLocaleString()}) = {genderTotal.toLocaleString()},
						but Population is {population.toLocaleString()}
					</p>
				</div>
			</div>
		{/if}
	</FormSection>

	<!-- Age Distribution -->
	<FormSection
		title="Age Distribution"
		description="Breakdown of population by age groups"
		icon={Baby}
		accent="purple"
		isComplete={isAgeComplete}
	>
		{#snippet actions()}
			{#if hasAgeData && hasPopulation}
				{#if isAgeValid}
					<div
						class="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600"
					>
						<CheckCircle2 class="size-3.5" />
						<span class="hidden sm:inline">Matches population</span>
						<span class="sm:hidden">Valid</span>
					</div>
				{:else}
					<div
						class="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
					>
						<AlertCircle class="size-3.5" />
						<span class="hidden sm:inline">Should equal {population.toLocaleString()}</span>
						<span class="sm:hidden">Mismatch</span>
					</div>
				{/if}
			{/if}
		{/snippet}

		<!-- Compact table layout for age -->
		<div class="overflow-hidden rounded-lg border">
			<div class="grid grid-cols-3 divide-x bg-muted/50">
				<div class="p-3 text-center">
					<Label for="age_0_14" class="text-xs font-medium text-muted-foreground">0-14 years</Label>
					<p class="text-[10px] text-muted-foreground/70">Children</p>
				</div>
				<div class="p-3 text-center">
					<Label for="age_15_64" class="text-xs font-medium text-muted-foreground"
						>15-64 years</Label
					>
					<p class="text-[10px] text-muted-foreground/70">Working Age</p>
				</div>
				<div class="p-3 text-center">
					<Label for="age_65_above" class="text-xs font-medium text-muted-foreground"
						>65+ years</Label
					>
					<p class="text-[10px] text-muted-foreground/70">Senior</p>
				</div>
			</div>
			<div class="grid grid-cols-3 divide-x">
				<div class="p-2">
					<NumberInput
						id="age_0_14"
						bind:value={age_0_14}
						placeholder="0"
						min={0}
						class={cn('text-center', age_0_14 > 0 && 'border-primary/30 bg-primary/5')}
					/>
				</div>
				<div class="p-2">
					<NumberInput
						id="age_15_64"
						bind:value={age_15_64}
						placeholder="0"
						min={0}
						class={cn('text-center', age_15_64 > 0 && 'border-primary/30 bg-primary/5')}
					/>
				</div>
				<div class="p-2">
					<NumberInput
						id="age_65_above"
						bind:value={age_65_above}
						placeholder="0"
						min={0}
						class={cn('text-center', age_65_above > 0 && 'border-primary/30 bg-primary/5')}
					/>
				</div>
			</div>
			<!-- Total row -->
			<div class="border-t bg-muted/30 px-3 py-2 text-center text-sm">
				<span class="text-muted-foreground">Total: </span>
				<span class="font-semibold">{ageTotal.toLocaleString()}</span>
			</div>
		</div>

		{#if hasAgeData && hasPopulation && !isAgeValid}
			<div
				class="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
			>
				<AlertCircle class="mt-0.5 size-4 shrink-0 text-destructive" />
				<div class="text-sm">
					<p class="font-medium text-destructive">Age distribution must equal population</p>
					<p class="mt-0.5 text-muted-foreground">
						Sum of age groups = {ageTotal.toLocaleString()}, but Population is {population.toLocaleString()}
					</p>
				</div>
			</div>
		{/if}
	</FormSection>

	<!-- Social Services -->
	<FormSection
		title="Social Services Coverage"
		description="Government program beneficiaries and voter registration"
		icon={HeartHandshake}
		accent="green"
		isComplete={isSocialComplete}
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="space-y-2">
				<Label for="registered_voters" class="flex items-center gap-1.5">
					Registered Voters
					<HelpTooltip content="Number of individuals registered to vote in elections" />
				</Label>
				<NumberInput
					id="registered_voters"
					bind:value={registered_voters}
					placeholder="0"
					min={0}
					class={cn('transition-all', registered_voters > 0 && 'border-primary/30 bg-primary/5')}
				/>
			</div>
			<div class="space-y-2">
				<Label for="philhealth" class="flex items-center gap-1.5">
					PhilHealth Beneficiaries
					<HelpTooltip
						content="Members of the Philippine Health Insurance Corporation (PhilHealth) who have health coverage"
					/>
				</Label>
				<NumberInput
					id="philhealth"
					bind:value={philhealth_beneficiaries}
					placeholder="0"
					min={0}
					class={cn(
						'transition-all',
						philhealth_beneficiaries > 0 && 'border-primary/30 bg-primary/5'
					)}
				/>
			</div>
			<div class="space-y-2">
				<Label for="fourps" class="flex items-center gap-1.5">
					4Ps Beneficiaries
					<HelpTooltip
						content="Pantawid Pamilyang Pilipino Program (4Ps) is a conditional cash transfer program for poor households with children"
					/>
				</Label>
				<NumberInput
					id="fourps"
					bind:value={fourps_beneficiaries}
					placeholder="0"
					min={0}
					class={cn('transition-all', fourps_beneficiaries > 0 && 'border-primary/30 bg-primary/5')}
				/>
			</div>
		</div>
	</FormSection>

	<!-- Cultural Identity -->
	<FormSection
		title="Cultural Identity"
		description="Ethnic groups and religious affiliations in the community"
		icon={Church}
		accent="amber"
		collapsible
		defaultOpen={isCultureComplete}
		isComplete={isCultureComplete}
	>
		<div class="space-y-6">
			<!-- Ethnicity -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<div>
						<Label class="text-sm font-medium">Ethnicity</Label>
						<p class="text-xs text-muted-foreground">Ethnic groups present in the sitio</p>
					</div>
					<Popover.Root bind:open={ethnicityOpen}>
						<Popover.Trigger>
							<Button type="button" variant="outline" size="sm" class="gap-2">
								<Plus class="size-4" />
								<span class="hidden sm:inline">Add Ethnicity</span>
								<span class="sm:hidden">Add</span>
							</Button>
						</Popover.Trigger>
						<Popover.Content class="max-w-[min(280px,calc(100vw-2rem))] p-0" align="end">
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
											<Command.Item
												value="__custom__"
												onSelect={() => addEthnicity(ethnicitySearch)}
											>
												<Plus class="mr-2 size-4" />
												Add "{ethnicitySearch}"
											</Command.Item>
										{/if}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
				</div>

				<!-- Selected ethnicities as tags -->
				{#if ethnicities.length === 0}
					<div
						class="flex items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-sm text-muted-foreground"
					>
						<p>No ethnicities added yet</p>
					</div>
				{:else}
					<div class="flex flex-wrap gap-2">
						{#each ethnicities as ethnicity (ethnicity)}
							<div
								class="group flex items-center gap-1.5 rounded-full border bg-muted/50 py-1 pr-1 pl-3 text-sm transition-all hover:bg-muted"
							>
								<span>{ethnicity}</span>
								<button
									type="button"
									onclick={() => removeEthnicity(ethnicity)}
									class="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
								>
									<X class="size-3" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Religion -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<div>
						<Label class="text-sm font-medium">Religion</Label>
						<p class="text-xs text-muted-foreground">Religious affiliations in the sitio</p>
					</div>
					<Popover.Root bind:open={religionOpen}>
						<Popover.Trigger>
							<Button type="button" variant="outline" size="sm" class="gap-2">
								<Plus class="size-4" />
								<span class="hidden sm:inline">Add Religion</span>
								<span class="sm:hidden">Add</span>
							</Button>
						</Popover.Trigger>
						<Popover.Content class="max-w-[min(280px,calc(100vw-2rem))] p-0" align="end">
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
												Add "{religionSearch}"
											</Command.Item>
										{/if}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
				</div>

				<!-- Selected religions as tags -->
				{#if religions.length === 0}
					<div
						class="flex items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-sm text-muted-foreground"
					>
						<p>No religions added yet</p>
					</div>
				{:else}
					<div class="flex flex-wrap gap-2">
						{#each religions as religion (religion)}
							<div
								class="group flex items-center gap-1.5 rounded-full border bg-muted/50 py-1 pr-1 pl-3 text-sm transition-all hover:bg-muted"
							>
								<span>{religion}</span>
								<button
									type="button"
									onclick={() => removeReligion(religion)}
									class="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
								>
									<X class="size-3" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</FormSection>
</div>
