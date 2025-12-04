<script lang="ts">
	import { ComboboxMultiSelect } from '$lib/components/ui/combobox';
	import { FormSection } from '$lib/components/ui/form-section';
	import { HelpTooltip } from '$lib/components/ui/help-tooltip';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import { ethnicityOptions, religionOptions } from '$lib/config/sitio-options';
	import { cn } from '$lib/utils';
	import { AlertCircle, Baby, CheckCircle2, Church, HeartHandshake, Users } from '@lucide/svelte';

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
		population = 0,
		households = 0
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
		households?: number;
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
	const hasHouseholds = $derived(households > 0);

	// Validate against population (the source of truth)
	const isGenderValid = $derived(genderTotal === population);
	const isAgeValid = $derived(ageTotal === population);

	// Social services validation
	const eligibleVoters = $derived(age_15_64 + age_65_above);
	const isVotersValid = $derived(!hasAgeData || registered_voters <= eligibleVoters);
	const isPhilhealthValid = $derived(!hasHouseholds || philhealth_beneficiaries <= households);
	const isFourPsValid = $derived(!hasHouseholds || fourps_beneficiaries <= households);

	// Section completion checks
	const isGenderComplete = $derived(hasGenderData && (!hasPopulation || isGenderValid));
	const isAgeComplete = $derived(hasAgeData && (!hasPopulation || isAgeValid));
	const isSocialComplete = $derived(
		(registered_voters > 0 || philhealth_beneficiaries > 0 || fourps_beneficiaries > 0) &&
			isVotersValid &&
			isPhilhealthValid &&
			isFourPsValid
	);
	const isCultureComplete = $derived(ethnicities.length > 0 || religions.length > 0);
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
		{#snippet actions()}
			{#if !isVotersValid || !isPhilhealthValid || !isFourPsValid}
				<div
					class="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
				>
					<AlertCircle class="size-3.5" />
					<span class="hidden sm:inline">Validation errors</span>
					<span class="sm:hidden">Error</span>
				</div>
			{/if}
		{/snippet}

		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div class="space-y-2">
				<Label for="registered_voters" class="flex items-center gap-1.5">
					Registered Voters
					<HelpTooltip
						content="Number of individuals registered to vote in elections. Cannot exceed the voting-age population (15+ years)."
					/>
				</Label>
				<NumberInput
					id="registered_voters"
					bind:value={registered_voters}
					placeholder="0"
					min={0}
					class={cn(
						'transition-all',
						registered_voters > 0 && isVotersValid && 'border-primary/30 bg-primary/5',
						!isVotersValid && 'border-destructive/50 bg-destructive/5'
					)}
				/>
				{#if !isVotersValid}
					<p class="text-xs text-destructive">
						Cannot exceed eligible voters ({eligibleVoters.toLocaleString()})
					</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="philhealth" class="flex items-center gap-1.5">
					PhilHealth Beneficiaries
					<HelpTooltip
						content="Members of the Philippine Health Insurance Corporation (PhilHealth) who have health coverage. Cannot exceed total households."
					/>
				</Label>
				<NumberInput
					id="philhealth"
					bind:value={philhealth_beneficiaries}
					placeholder="0"
					min={0}
					class={cn(
						'transition-all',
						philhealth_beneficiaries > 0 && isPhilhealthValid && 'border-primary/30 bg-primary/5',
						!isPhilhealthValid && 'border-destructive/50 bg-destructive/5'
					)}
				/>
				{#if !isPhilhealthValid}
					<p class="text-xs text-destructive">
						Cannot exceed total households ({households.toLocaleString()})
					</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="fourps" class="flex items-center gap-1.5">
					4Ps Beneficiaries
					<HelpTooltip
						content="Pantawid Pamilyang Pilipino Program (4Ps) is a conditional cash transfer program for poor households with children. Cannot exceed total households."
					/>
				</Label>
				<NumberInput
					id="fourps"
					bind:value={fourps_beneficiaries}
					placeholder="0"
					min={0}
					class={cn(
						'transition-all',
						fourps_beneficiaries > 0 && isFourPsValid && 'border-primary/30 bg-primary/5',
						!isFourPsValid && 'border-destructive/50 bg-destructive/5'
					)}
				/>
				{#if !isFourPsValid}
					<p class="text-xs text-destructive">
						Cannot exceed total households ({households.toLocaleString()})
					</p>
				{/if}
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
				<div>
					<Label class="text-sm font-medium">Ethnicity</Label>
					<p class="text-xs text-muted-foreground">Ethnic groups present in the sitio</p>
				</div>
				<ComboboxMultiSelect
					bind:values={ethnicities}
					options={ethnicityOptions}
					placeholder="Search ethnicity..."
					addLabel="Add Ethnicity"
					emptyMessage="No ethnicities added yet"
				/>
			</div>

			<!-- Religion -->
			<div class="space-y-3">
				<div>
					<Label class="text-sm font-medium">Religion</Label>
					<p class="text-xs text-muted-foreground">Religious affiliations in the sitio</p>
				</div>
				<ComboboxMultiSelect
					bind:values={religions}
					options={religionOptions}
					placeholder="Search religion..."
					addLabel="Add Religion"
					emptyMessage="No religions added yet"
				/>
			</div>
		</div>
	</FormSection>
</div>
