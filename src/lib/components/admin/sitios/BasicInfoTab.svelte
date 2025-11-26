<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { LocationPicker } from '$lib/components/ui/location-picker';
	import { NumberInput } from '$lib/components/ui/number-input';
	import * as Popover from '$lib/components/ui/popover';
	import { MUNICIPALITIES, getBarangaysForMunicipality } from '$lib/config/location-data';
	import { cn } from '$lib/utils';
	import { AlertCircle, Check, CheckCircle2, ChevronsUpDown } from '@lucide/svelte';

	let {
		municipality = $bindable(''),
		barangay = $bindable(''),
		name = $bindable(''),
		province = $bindable(''),
		population = $bindable(0),
		households = $bindable(0),
		coordinates = $bindable({ lat: 0, lng: 0 }),
		coding = $bindable({ number: '', code: '' }),
		demographicsTotal = 0
	}: {
		municipality: string;
		barangay: string;
		name: string;
		province: string;
		population: number;
		households: number;
		coordinates: { lat: number; lng: number };
		coding: { number: string; code: string };
		demographicsTotal?: number;
	} = $props();

	// Validation for population vs demographics
	const hasPopulation = $derived(population > 0);
	const hasDemographics = $derived(demographicsTotal > 0);
	const isPopulationSynced = $derived(population === demographicsTotal);

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

<Card.Root>
	<Card.Header>
		<Card.Title>Basic Information</Card.Title>
		<Card.Description>
			Core identification and location data (required fields marked with *)
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Municipality -->
			<div class="space-y-2">
				<Label for="municipality">
					Municipality <span class="text-destructive">*</span>
				</Label>
				<Popover.Root bind:open={municipalityPopoverOpen}>
					<Popover.Trigger
						class={cn(
							'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
						)}
					>
						<span class={cn('truncate', !municipality && 'text-muted-foreground')}>
							{municipality || 'Select municipality...'}
						</span>
						<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
					</Popover.Trigger>
					<Popover.Content class="w-[400px] p-0" align="start">
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
												'relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground',
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
				<Label for="barangay">
					Barangay <span class="text-destructive">*</span>
				</Label>
				<Popover.Root bind:open={barangayPopoverOpen}>
					<Popover.Trigger
						disabled={!municipality}
						class={cn(
							'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
						)}
					>
						<span class={cn('truncate', !barangay && 'text-muted-foreground')}>
							{barangay || 'Select barangay...'}
						</span>
						<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
					</Popover.Trigger>
					<Popover.Content class="w-[400px] p-0" align="start">
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
												'relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground',
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
				<Label for="sitio">
					Sitio
					<span class="text-destructive">*</span>
				</Label>
				<Input id="sitio" bind:value={name} placeholder="Enter sitio/purok name" />
			</div>

			<!-- Province -->
			<!-- <div class="space-y-2">
				<Label for="province">Province</Label>
				<Input id="province" bind:value={province} placeholder="Enter province" />
			</div> -->

			<div class="space-y-2">
				<Label for="coding_code">Coding Code</Label>
				<Input id="coding_code" bind:value={coding.code} placeholder="Enter coding code" />
			</div>

			<!-- Population -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label for="population">Population</Label>
					{#if hasPopulation && hasDemographics}
						{#if isPopulationSynced}
							<div class="flex items-center gap-1 text-xs text-success">
								<CheckCircle2 class="size-3" />
								<span>Synced with demographics</span>
							</div>
						{:else}
							<div class="flex items-center gap-1 text-xs text-destructive">
								<AlertCircle class="size-3" />
								<span>Mismatch: {population} ≠ {demographicsTotal}</span>
							</div>
						{/if}
					{/if}
				</div>
				<NumberInput id="population" bind:value={population} placeholder="0" min={0} />
				{#if hasPopulation && hasDemographics && !isPopulationSynced}
					<p class="text-xs text-muted-foreground">
						Demographics total is {demographicsTotal}. Population should match.
					</p>
				{/if}
			</div>

			<!-- Households -->
			<div class="space-y-2">
				<Label for="households">Households</Label>
				<NumberInput id="households" bind:value={households} placeholder="0" min={0} />
			</div>
		</div>

		<!-- Coordinates Section -->
		<div class="space-y-2">
			<Label>Coordinates</Label>
			<LocationPicker
				bind:lat={coordinates.lat}
				bind:lng={coordinates.lng}
				{municipality}
				{barangay}
			/>
		</div>
	</Card.Content>
</Card.Root>
