<script lang="ts">
	import { FormSection } from '$lib/components/ui/form-section';
	import { HelpTooltip } from '$lib/components/ui/help-tooltip';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { LocationPicker } from '$lib/components/ui/location-picker';
	import { NumberInput } from '$lib/components/ui/number-input';
	import * as Popover from '$lib/components/ui/popover';
	import { MUNICIPALITIES, getBarangaysForMunicipality } from '$lib/config/location-data';
	import { cn } from '$lib/utils';
	import {
		AlertCircle,
		Check,
		CheckCircle2,
		ChevronsUpDown,
		Home,
		MapPin,
		Users
	} from '@lucide/svelte';

	let {
		municipality = $bindable(''),
		barangay = $bindable(''),
		name = $bindable(''),
		province = $bindable(''),
		population = $bindable(0),
		households = $bindable(0),
		coordinates = $bindable({ lat: 0, lng: 0 }),
		coding = $bindable(''),
		demographicsTotal = 0
	}: {
		municipality: string;
		barangay: string;
		name: string;
		province: string;
		population: number;
		households: number;
		coordinates: { lat: number; lng: number };
		coding: string;
		demographicsTotal?: number;
	} = $props();

	// Validation for population vs demographics
	const hasPopulation = $derived(population > 0);
	const hasDemographics = $derived(demographicsTotal > 0);
	const isPopulationSynced = $derived(population === demographicsTotal);

	// Section completion checks
	const isLocationComplete = $derived(
		municipality.trim() !== '' && barangay.trim() !== '' && name.trim() !== ''
	);
	const isPopulationComplete = $derived(population > 0 || households > 0);
	const isCoordinatesComplete = $derived(coordinates.lat !== 0 || coordinates.lng !== 0);

	let municipalityPopoverOpen = $state(false);
	let barangayPopoverOpen = $state(false);
	let municipalitySearchQuery = $state('');
	let barangaySearchQuery = $state('');

	const filteredMunicipalities = $derived(
		MUNICIPALITIES.filter((m) => m.toLowerCase().includes(municipalitySearchQuery.toLowerCase()))
	);

	const availableBarangays = $derived(
		municipality ? getBarangaysForMunicipality(municipality) : []
	);

	const filteredBarangays = $derived(
		availableBarangays.filter((b) => b.toLowerCase().includes(barangaySearchQuery.toLowerCase()))
	);

	function selectMunicipality(m: string) {
		municipality = m;
		barangay = '';
		municipalityPopoverOpen = false;
		municipalitySearchQuery = '';
	}

	function selectBarangay(b: string) {
		barangay = b;
		barangayPopoverOpen = false;
		barangaySearchQuery = '';
	}
</script>

<div class="space-y-4">
	<!-- Location Section -->
	<FormSection
		title="Location Details"
		description="Municipality, barangay, and sitio identification"
		icon={MapPin}
		accent="blue"
		isComplete={isLocationComplete}
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Municipality -->
			<div class="space-y-2">
				<Label for="municipality" class="flex items-center gap-1.5">
					Municipality <span class="text-destructive">*</span>
				</Label>
				<Popover.Root bind:open={municipalityPopoverOpen}>
					<Popover.Trigger
						class={cn(
							'flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all placeholder:text-muted-foreground hover:border-primary/50 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
							municipality && 'border-primary/30 bg-primary/5'
						)}
					>
						<span class={cn('truncate', !municipality && 'text-muted-foreground')}>
							{municipality || 'Select municipality...'}
						</span>
						<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
					</Popover.Trigger>
					<Popover.Content class="max-w-[min(400px,calc(100vw-2rem))] p-0" align="start">
						<div class="p-2">
							<Input
								placeholder="Search municipalities..."
								bind:value={municipalitySearchQuery}
								class="h-9"
							/>
						</div>
						<div class="max-h-[300px] overflow-y-auto">
							{#if filteredMunicipalities.length === 0}
								<div class="px-2 py-6 text-center text-sm text-muted-foreground">
									No municipalities found
								</div>
							{:else}
								<div class="p-1">
									{#each filteredMunicipalities as mun}
										<button
											type="button"
											class={cn(
												'relative flex w-full cursor-pointer items-center rounded-lg px-2 py-2 text-sm transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground',
												municipality === mun && 'bg-accent'
											)}
											onclick={() => selectMunicipality(mun)}
										>
											<Check
												class={cn(
													'mr-2 size-4',
													municipality === mun ? 'opacity-100' : 'opacity-0'
												)}
											/>
											{mun}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- Barangay -->
			<div class="space-y-2">
				<Label for="barangay" class="flex items-center gap-1.5">
					Barangay <span class="text-destructive">*</span>
				</Label>
				<Popover.Root bind:open={barangayPopoverOpen}>
					<Popover.Trigger
						disabled={!municipality}
						class={cn(
							'flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all placeholder:text-muted-foreground hover:border-primary/50 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
							barangay && 'border-primary/30 bg-primary/5'
						)}
					>
						<span class={cn('truncate', !barangay && 'text-muted-foreground')}>
							{barangay || 'Select barangay...'}
						</span>
						<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
					</Popover.Trigger>
					<Popover.Content class="max-w-[min(400px,calc(100vw-2rem))] p-0" align="start">
						<div class="p-2">
							<Input
								placeholder="Search barangays..."
								bind:value={barangaySearchQuery}
								class="h-9"
							/>
						</div>
						<div class="max-h-[300px] overflow-y-auto">
							{#if !municipality}
								<div class="px-2 py-6 text-center text-sm text-muted-foreground">
									Please select a municipality first
								</div>
							{:else if filteredBarangays.length === 0}
								<div class="px-2 py-6 text-center text-sm text-muted-foreground">
									No barangays found
								</div>
							{:else}
								<div class="p-1">
									{#each filteredBarangays as bar}
										<button
											type="button"
											class={cn(
												'relative flex w-full cursor-pointer items-center rounded-lg px-2 py-2 text-sm transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground',
												barangay === bar && 'bg-accent'
											)}
											onclick={() => selectBarangay(bar)}
										>
											<Check
												class={cn('mr-2 size-4', barangay === bar ? 'opacity-100' : 'opacity-0')}
											/>
											{bar}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- Sitio Name -->
			<div class="space-y-2">
				<Label for="sitio" class="flex items-center gap-1.5">
					Sitio Name
					<span class="text-destructive">*</span>
				</Label>
				<Input
					id="sitio"
					bind:value={name}
					placeholder="Enter sitio/purok name"
					class={cn('transition-all', name && 'border-primary/30 bg-primary/5')}
				/>
				<p class="text-xs text-muted-foreground">The name of the sitio or purok</p>
			</div>

			<!-- Coding -->
			<div class="space-y-2">
				<Label for="coding" class="flex items-center gap-1.5">
					Coding
					<HelpTooltip
						content="Unique identifier code assigned to this sitio for government tracking and reporting purposes"
					/>
				</Label>
				<Input
					id="coding"
					bind:value={coding}
					placeholder="e.g., 1-1"
					class={cn('transition-all', coding && 'border-primary/30 bg-primary/5')}
				/>
				<p class="text-xs text-muted-foreground">Official sitio identifier code</p>
			</div>
		</div>
	</FormSection>

	<!-- Population Section -->
	<FormSection
		title="Population & Households"
		description="Basic demographic counts for the sitio"
		icon={Users}
		accent="purple"
		isComplete={isPopulationComplete}
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Population -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label for="population" class="flex items-center gap-1.5">
						Total Population
						<HelpTooltip
							content="The total number of individuals residing in this sitio. This should match the sum of demographics in the next step."
						/>
					</Label>
					{#if hasPopulation && hasDemographics}
						{#if isPopulationSynced}
							<div
								class="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600"
							>
								<CheckCircle2 class="size-3" />
								<span>Synced</span>
							</div>
						{:else}
							<div
								class="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive"
							>
								<AlertCircle class="size-3" />
								<span>Mismatch</span>
							</div>
						{/if}
					{/if}
				</div>
				<NumberInput
					id="population"
					bind:value={population}
					placeholder="0"
					min={0}
					class={cn(
						'transition-all',
						population > 0 && 'border-primary/30 bg-primary/5',
						hasPopulation && hasDemographics && !isPopulationSynced && 'border-destructive/50'
					)}
				/>
				{#if hasPopulation && hasDemographics && !isPopulationSynced}
					<p class="flex items-center gap-1 text-xs text-destructive">
						<AlertCircle class="size-3" />
						Demographics total is {demographicsTotal}. Values should match.
					</p>
				{:else}
					<p class="text-xs text-muted-foreground">Total number of residents</p>
				{/if}
			</div>

			<!-- Households -->
			<div class="space-y-2">
				<Label for="households" class="flex items-center gap-1.5">
					Number of Households
					<HelpTooltip
						content="A household is a group of people living together and sharing meals. This is typically fewer than the population."
					/>
				</Label>
				<NumberInput
					id="households"
					bind:value={households}
					placeholder="0"
					min={0}
					class={cn('transition-all', households > 0 && 'border-primary/30 bg-primary/5')}
				/>
				<p class="text-xs text-muted-foreground">Families or living units</p>
			</div>
		</div>
	</FormSection>

	<!-- Coordinates Section -->
	<FormSection
		title="Geographic Location"
		description="Map coordinates for the sitio center point"
		icon={Home}
		accent="green"
		isComplete={isCoordinatesComplete}
	>
		<LocationPicker
			bind:lat={coordinates.lat}
			bind:lng={coordinates.lng}
			{municipality}
			{barangay}
		/>
		<p class="mt-2 text-xs text-muted-foreground">
			Click on the map or drag the marker to set the sitio location. This helps with mapping and
			geographic analysis.
		</p>
	</FormSection>
</div>
