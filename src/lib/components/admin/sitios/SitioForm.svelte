<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { LocationPicker } from '$lib/components/ui/location-picker';
	import { NumberInput } from '$lib/components/ui/number-input';
	import * as Popover from '$lib/components/ui/popover';
	import * as Tabs from '$lib/components/ui/tabs';
	import { MUNICIPALITIES, getBarangaysForMunicipality } from '$lib/config/location-data';
	import type { Sitio } from '$lib/types';
	import { cn } from '$lib/utils';
	import { AlertCircle, Check, ChevronsUpDown, Save } from '@lucide/svelte';

	let {
		initialData = null,
		onSubmit,
		onCancel
	}: {
		initialData?: Partial<Sitio> | null;
		onSubmit: (data: Sitio) => void;
		onCancel: () => void;
	} = $props();

	// Initialize form state with default values
	let formData = $state<Sitio>({
		id: initialData?.id || 0,
		name: initialData?.name || '',
		municipality: initialData?.municipality || '',
		barangay: initialData?.barangay || '',
		province: initialData?.province || '',
		population: initialData?.population || 0,
		households: initialData?.households || 0,
		coordinates: {
			lat: initialData?.coordinates?.lat || 0,
			lng: initialData?.coordinates?.lng || 0
		},
		created_at: initialData?.created_at || new Date().toISOString(),
		coding: {
			number: initialData?.coding?.number || '',
			code: initialData?.coding?.code || ''
		},
		demographics: {
			male: initialData?.demographics?.male || 0,
			female: initialData?.demographics?.female || 0,
			total: initialData?.demographics?.total || 0,
			age_0_14: initialData?.demographics?.age_0_14 || 0,
			age_15_64: initialData?.demographics?.age_15_64 || 0,
			age_65_above: initialData?.demographics?.age_65_above || 0
		},
		social_services: {
			registered_voters: initialData?.social_services?.registered_voters || 0,
			philhealth_beneficiaries: initialData?.social_services?.philhealth_beneficiaries || 0,
			fourps_beneficiaries: initialData?.social_services?.fourps_beneficiaries || 0
		},
		economic_condition: {
			top_employments: initialData?.economic_condition?.top_employments || ['', '', ''],
			top_income_brackets: initialData?.economic_condition?.top_income_brackets || ['', '', '']
		},
		agriculture: {
			farmers_count: initialData?.agriculture?.farmers_count || 0,
			farmer_associations: initialData?.agriculture?.farmer_associations || 0,
			farm_area_hectares: initialData?.agriculture?.farm_area_hectares || 0,
			top_crops: initialData?.agriculture?.top_crops || ['', '', '', '', '']
		},
		water_sanitation: {
			water_systems_count: initialData?.water_sanitation?.water_systems_count || 0,
			water_sources: initialData?.water_sanitation?.water_sources || [
				{ source: '', condition: '' }
			],
			households_without_toilet: initialData?.water_sanitation?.households_without_toilet || 0,
			toilet_facility_types: initialData?.water_sanitation?.toilet_facility_types || [],
			waste_segregation_practice: initialData?.water_sanitation?.waste_segregation_practice || null
		},
		livestock_poultry: {
			pigs: initialData?.livestock_poultry?.pigs || 0,
			cows: initialData?.livestock_poultry?.cows || 0,
			carabaos: initialData?.livestock_poultry?.carabaos || 0,
			horses: initialData?.livestock_poultry?.horses || 0,
			goats: initialData?.livestock_poultry?.goats || 0,
			chickens: initialData?.livestock_poultry?.chickens || 0,
			ducks: initialData?.livestock_poultry?.ducks || 0
		},
		food_security: {
			households_with_backyard_garden:
				initialData?.food_security?.households_with_backyard_garden || 0,
			common_garden_commodities: initialData?.food_security?.common_garden_commodities || [
				'',
				'',
				''
			]
		},
		housing: {
			quality_types: initialData?.housing?.quality_types || [],
			ownership_types: initialData?.housing?.ownership_types || []
		},
		domestic_animals: {
			total_count: initialData?.domestic_animals?.total_count || 0,
			dogs: initialData?.domestic_animals?.dogs || 0,
			cats: initialData?.domestic_animals?.cats || 0,
			dogs_vaccinated: initialData?.domestic_animals?.dogs_vaccinated || 0,
			cats_vaccinated: initialData?.domestic_animals?.cats_vaccinated || 0
		},
		community_empowerment: {
			sectoral_organizations: initialData?.community_empowerment?.sectoral_organizations || 0,
			info_dissemination_methods:
				initialData?.community_empowerment?.info_dissemination_methods || [],
			transportation_methods: initialData?.community_empowerment?.transportation_methods || []
		},
		utilities: {
			households_with_electricity: initialData?.utilities?.households_with_electricity || 0,
			alternative_electricity_sources: initialData?.utilities?.alternative_electricity_sources || []
		}
	});

	let errors = $state<Record<string, string>>({});

	// Popover states for searchable dropdowns
	let municipalityPopoverOpen = $state(false);
	let barangayPopoverOpen = $state(false);
	let municipalitySearchQuery = $state('');
	let barangaySearchQuery = $state('');

	// Filtered lists for searchable dropdowns
	const filteredMunicipalities = $derived(
		MUNICIPALITIES.filter((m) => m.toLowerCase().includes(municipalitySearchQuery.toLowerCase()))
	);

	const availableBarangays = $derived(
		formData.municipality ? getBarangaysForMunicipality(formData.municipality) : []
	);

	const filteredBarangays = $derived(
		availableBarangays.filter((b) => b.toLowerCase().includes(barangaySearchQuery.toLowerCase()))
	);

	function selectMunicipality(municipality: string) {
		formData.municipality = municipality;
		// Reset barangay when municipality changes
		formData.barangay = '';
		municipalityPopoverOpen = false;
		municipalitySearchQuery = '';
	}

	function selectBarangay(barangay: string) {
		formData.barangay = barangay;
		barangayPopoverOpen = false;
		barangaySearchQuery = '';
	}

	function validateForm(): boolean {
		errors = {};

		// Required fields
		if (!formData.municipality?.trim()) {
			errors.municipality = 'Municipality is required';
		}
		if (!formData.barangay?.trim()) {
			errors.barangay = 'Barangay is required';
		}
		if (!formData.name?.trim()) {
			errors.name = 'Sitio name is required';
		}

		// Coordinate validation
		if (formData.coordinates) {
			if (formData.coordinates.lat < -90 || formData.coordinates.lat > 90) {
				errors.coordinates_lat = 'Latitude must be between -90 and 90';
			}
			if (formData.coordinates.lng < -180 || formData.coordinates.lng > 180) {
				errors.coordinates_lng = 'Longitude must be between -180 and 180';
			}
		}

		return Object.keys(errors).length === 0;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		onSubmit(formData);
	}

	// Helper functions for array manipulation
	function toggleArrayItem(array: string[], item: string) {
		const index = array.indexOf(item);
		if (index > -1) {
			array.splice(index, 1);
		} else {
			array.push(item);
		}
		return array;
	}

	function addWaterSource() {
		formData.water_sanitation!.water_sources.push({ source: '', condition: '' });
	}

	function removeWaterSource(index: number) {
		formData.water_sanitation!.water_sources.splice(index, 1);
	}

	// Housing quality types
	const housingQualityTypes = ['Concrete', 'Wood', 'Half-Concrete', 'Makeshift', 'Others'];

	// Housing ownership types
	const housingOwnershipTypes = [
		'Owned',
		'Rented',
		'Protected Land',
		'Informal Settler',
		'Owner Consent'
	];

	// Toilet facility types
	const toiletFacilityTypes = ['Water Sealed', 'Open Pit', 'Pour Flush', 'Composting'];

	// Info dissemination methods
	const infoDisseminationMethods = [
		'Radio',
		'Signages',
		'Person in Authority',
		'Assembly',
		'Newspaper',
		'TV',
		'Internet/Social Media'
	];

	// Transportation methods
	const transportationMethods = ['Motorcycle', 'Tricycle', '4-Wheels', 'Boat'];

	// Alternative electricity sources
	const alternativeElectricitySources = ['Solar', 'Generator', 'Battery'];
</script>

<form onsubmit={handleSubmit} class="space-y-6">
	<Tabs.Root value="basic" class="w-full">
		<Tabs.List class="grid w-full grid-cols-6 lg:grid-cols-12">
			<Tabs.Trigger value="basic">Basic Info</Tabs.Trigger>
			<Tabs.Trigger value="demographics">Demographics</Tabs.Trigger>
			<Tabs.Trigger value="social">Social</Tabs.Trigger>
			<Tabs.Trigger value="economic">Economic</Tabs.Trigger>
			<Tabs.Trigger value="agriculture">Agriculture</Tabs.Trigger>
			<Tabs.Trigger value="water">Water</Tabs.Trigger>
			<Tabs.Trigger value="livestock">Livestock</Tabs.Trigger>
			<Tabs.Trigger value="food">Food</Tabs.Trigger>
			<Tabs.Trigger value="housing">Housing</Tabs.Trigger>
			<Tabs.Trigger value="animals">Animals</Tabs.Trigger>
			<Tabs.Trigger value="community">Community</Tabs.Trigger>
			<Tabs.Trigger value="utilities">Utilities</Tabs.Trigger>
		</Tabs.List>

		<!-- Basic Information Tab -->
		<Tabs.Content value="basic">
			<Card.Root>
				<Card.Header>
					<Card.Title>Basic Information</Card.Title>
					<Card.Description>
						Core identification and location data (required fields marked with *)
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- Municipality Searchable Dropdown -->
						<div class="space-y-2">
							<Label for="municipality">
								Municipality <span class="text-destructive">*</span>
							</Label>
							<Popover.Root bind:open={municipalityPopoverOpen}>
								<Popover.Trigger
									class={cn(
										'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
										errors.municipality ? 'border-destructive' : ''
									)}
								>
									<span class={cn('truncate', !formData.municipality && 'text-muted-foreground')}>
										{formData.municipality || 'Select municipality...'}
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
												{#each filteredMunicipalities as municipality}
													<button
														type="button"
														class={cn(
															'relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground',
															formData.municipality === municipality && 'bg-accent'
														)}
														onclick={() => selectMunicipality(municipality)}
													>
														<Check
															class={cn(
																'mr-2 size-4',
																formData.municipality === municipality ? 'opacity-100' : 'opacity-0'
															)}
														/>
														{municipality}
													</button>
												{/each}
											</div>
										{/if}
									</div>
								</Popover.Content>
							</Popover.Root>
							{#if errors.municipality}
								<p class="text-sm text-destructive">{errors.municipality}</p>
							{/if}
						</div>

						<!-- Barangay Searchable Dropdown -->
						<div class="space-y-2">
							<Label for="barangay">
								Barangay <span class="text-destructive">*</span>
							</Label>
							<Popover.Root bind:open={barangayPopoverOpen}>
								<Popover.Trigger
									disabled={!formData.municipality}
									class={cn(
										'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
										errors.barangay ? 'border-destructive' : ''
									)}
								>
									<span class={cn('truncate', !formData.barangay && 'text-muted-foreground')}>
										{formData.barangay || 'Select barangay...'}
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
										{#if !formData.municipality}
											<div class="px-2 py-6 text-center text-sm text-muted-foreground">
												Please select a municipality first
											</div>
										{:else if filteredBarangays.length === 0}
											<div class="px-2 py-6 text-center text-sm text-muted-foreground">
												No barangays found
											</div>
										{:else}
											<div class="p-1">
												{#each filteredBarangays as barangay}
													<button
														type="button"
														class={cn(
															'relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground',
															formData.barangay === barangay && 'bg-accent'
														)}
														onclick={() => selectBarangay(barangay)}
													>
														<Check
															class={cn(
																'mr-2 size-4',
																formData.barangay === barangay ? 'opacity-100' : 'opacity-0'
															)}
														/>
														{barangay}
													</button>
												{/each}
											</div>
										{/if}
									</div>
								</Popover.Content>
							</Popover.Root>
							{#if errors.barangay}
								<p class="text-sm text-destructive">{errors.barangay}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="sitio">
								Sitio/Purok <span class="text-destructive">*</span>
							</Label>
							<Input
								id="sitio"
								bind:value={formData.name}
								placeholder="Enter sitio or purok name"
								class={errors.name ? 'border-destructive' : ''}
							/>
							{#if errors.name}
								<p class="text-sm text-destructive">{errors.name}</p>
							{/if}
						</div>

						<!-- <div class="space-y-2">
							<Label for="province">Province</Label>
							<Input id="province" bind:value={formData.province} placeholder="Enter province" />
						</div> -->

						<div class="space-y-2">
							<Label for="population">Total Population</Label>
							<NumberInput id="population" bind:value={formData.population} placeholder="0" />
						</div>

						<div class="space-y-2">
							<Label for="households">Number of Households</Label>
							<NumberInput id="households" bind:value={formData.households} placeholder="0" />
						</div>
					</div>

					<!-- Location Picker -->
					<LocationPicker
						bind:lat={formData.coordinates.lat}
						bind:lng={formData.coordinates.lng}
						municipality={formData.municipality}
						barangay={formData.barangay}
						errors={{
							lat: errors.coordinates_lat,
							lng: errors.coordinates_lng
						}}
					/>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="coding_number">Record Number</Label>
							<Input
								id="coding_number"
								bind:value={formData.coding!.number}
								placeholder="Enter record number"
							/>
						</div>

						<div class="space-y-2">
							<Label for="coding_code">Coding</Label>
							<Input id="coding_code" bind:value={formData.coding!.code} placeholder="e.g., 1-1" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Demographics Tab -->
		<Tabs.Content value="demographics">
			<Card.Root>
				<Card.Header>
					<Card.Title>Demographics</Card.Title>
					<Card.Description>Population breakdown by gender and age groups</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div class="space-y-2">
							<Label for="male">Male Population</Label>
							<NumberInput id="male" bind:value={formData.demographics.male} placeholder="0" />
						</div>
						<div class="space-y-2">
							<Label for="female">Female Population</Label>
							<NumberInput id="female" bind:value={formData.demographics.female} placeholder="0" />
						</div>
						<div class="space-y-2">
							<Label for="total_pop">Total Population</Label>
							<NumberInput
								id="total_pop"
								bind:value={formData.demographics.total}
								placeholder="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="age_0_14">Age 0-14</Label>
							<NumberInput
								id="age_0_14"
								bind:value={formData.demographics.age_0_14}
								placeholder="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="age_15_64">Age 15-64</Label>
							<NumberInput
								id="age_15_64"
								bind:value={formData.demographics.age_15_64}
								placeholder="0"
							/>
						</div>

						<div class="space-y-2">
							<Label for="age_65_above">Age 65+</Label>
							<NumberInput
								id="age_65_above"
								bind:value={formData.demographics.age_65_above}
								placeholder="0"
							/>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Social Services Tab -->
		<Tabs.Content value="social">
			<Card.Root>
				<Card.Header>
					<Card.Title>Social Services</Card.Title>
					<Card.Description>Government support and civic participation</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div class="space-y-2">
							<Label for="registered_voters">Registered Voters</Label>
							<NumberInput
								id="registered_voters"
								bind:value={formData.social_services!.registered_voters}
								placeholder="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="philhealth">PhilHealth Beneficiaries</Label>
							<NumberInput
								id="philhealth"
								bind:value={formData.social_services!.philhealth_beneficiaries}
								placeholder="0"
							/>
						</div>

						<div class="space-y-2">
							<Label for="fourps">4Ps Beneficiaries</Label>
							<NumberInput
								id="fourps"
								bind:value={formData.social_services!.fourps_beneficiaries}
								placeholder="0"
							/>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Economic Condition Tab -->
		<Tabs.Content value="economic">
			<Card.Root>
				<Card.Header>
					<Card.Title>Economic Condition</Card.Title>
					<Card.Description>Employment and income information</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Top 3 Common Employments</h3>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							{#each [0, 1, 2] as i}
								<div class="space-y-2">
									<Label for="employment_{i}">Employment {i + 1}</Label>
									<Input
										id="employment_{i}"
										bind:value={formData.economic_condition!.top_employments[i]}
										placeholder="e.g., Farming"
									/>
								</div>
							{/each}
						</div>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Top 3 Income Brackets</h3>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							{#each [0, 1, 2] as i}
								<div class="space-y-2">
									<Label for="income_{i}">Income Bracket {i + 1}</Label>
									<Input
										id="income_{i}"
										bind:value={formData.economic_condition!.top_income_brackets[i]}
										placeholder="e.g., P101 - P300"
									/>
								</div>
							{/each}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Agriculture Tab -->
		<Tabs.Content value="agriculture">
			<Card.Root>
				<Card.Header>
					<Card.Title>Agriculture</Card.Title>
					<Card.Description>Farming data and crop production</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div class="space-y-2">
							<Label for="farmers_count">Number of Farmers</Label>
							<NumberInput
								id="farmers_count"
								bind:value={formData.agriculture!.farmers_count}
								placeholder="0"
							/>
						</div>

						<div class="space-y-2">
							<Label for="farmer_associations">Farmer Associations</Label>
							<NumberInput
								id="farmer_associations"
								bind:value={formData.agriculture!.farmer_associations}
								placeholder="0"
							/>
						</div>

						<div class="space-y-2">
							<Label for="farm_area">Farm Area (Hectares)</Label>
							<NumberInput
								id="farm_area"
								step="0.01"
								bind:value={formData.agriculture!.farm_area_hectares}
								placeholder="0.00"
							/>
						</div>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Top 5 Crops Produced</h3>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{#each [0, 1, 2, 3, 4] as i}
								<div class="space-y-2">
									<Label for="crop_{i}">Crop {i + 1}</Label>
									<Input
										id="crop_{i}"
										bind:value={formData.agriculture!.top_crops[i]}
										placeholder="e.g., Rice, Corn"
									/>
								</div>
							{/each}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Water & Sanitation Tab -->
		<Tabs.Content value="water">
			<Card.Root>
				<Card.Header>
					<Card.Title>Water & Sanitation</Card.Title>
					<Card.Description>Water sources and sanitation facilities</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="water_systems">Number of Water Systems</Label>
							<NumberInput
								id="water_systems"
								bind:value={formData.water_sanitation!.water_systems_count}
								placeholder="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="households_without_toilet">Households Without Toilet</Label>
							<NumberInput
								id="households_without_toilet"
								bind:value={formData.water_sanitation!.households_without_toilet}
								placeholder="0"
							/>
						</div>
					</div>

					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-semibold">Water Sources</h3>
							<Button type="button" variant="outline" size="sm" onclick={addWaterSource}>
								Add Source
							</Button>
						</div>
						{#each formData.water_sanitation!.water_sources as source, i}
							<div class="flex gap-2">
								<div class="flex-1 space-y-2">
									<Label for="water_source_{i}">Source {i + 1}</Label>
									<Input
										id="water_source_{i}"
										bind:value={source.source}
										placeholder="e.g., Deep Well, Spring"
									/>
								</div>
								<div class="flex-1 space-y-2">
									<Label for="water_condition_{i}">Condition</Label>
									<Input
										id="water_condition_{i}"
										bind:value={source.condition}
										placeholder="e.g., Good, Needs Repair"
									/>
								</div>
								<Button
									type="button"
									variant="destructive"
									size="icon"
									class="mt-8"
									onclick={() => removeWaterSource(i)}
								>
									<AlertCircle class="size-4" />
								</Button>
							</div>
						{/each}
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Toilet Facility Types</h3>
						<div class="grid grid-cols-2 gap-4">
							{#each toiletFacilityTypes as type}
								<div class="flex items-center space-x-2">
									<Checkbox
										id="toilet_{type}"
										checked={formData.water_sanitation!.toilet_facility_types.includes(type)}
										onCheckedChange={() => {
											formData.water_sanitation!.toilet_facility_types = toggleArrayItem(
												formData.water_sanitation!.toilet_facility_types,
												type
											);
										}}
									/>
									<Label for="toilet_{type}" class="font-normal">{type}</Label>
								</div>
							{/each}
						</div>
					</div>

					<div class="space-y-2">
						<Label>Waste Segregation Practice</Label>
						<div class="flex gap-4">
							<div class="flex items-center space-x-2">
								<input
									type="radio"
									id="waste_yes"
									name="waste_segregation"
									checked={formData.water_sanitation!.waste_segregation_practice === true}
									onchange={() => {
										formData.water_sanitation!.waste_segregation_practice = true;
									}}
								/>
								<Label for="waste_yes" class="font-normal">Yes</Label>
							</div>
							<div class="flex items-center space-x-2">
								<input
									type="radio"
									id="waste_no"
									name="waste_segregation"
									checked={formData.water_sanitation!.waste_segregation_practice === false}
									onchange={() => {
										formData.water_sanitation!.waste_segregation_practice = false;
									}}
								/>
								<Label for="waste_no" class="font-normal">No</Label>
							</div>
							<div class="flex items-center space-x-2">
								<input
									type="radio"
									id="waste_unknown"
									name="waste_segregation"
									checked={formData.water_sanitation!.waste_segregation_practice === null}
									onchange={() => {
										formData.water_sanitation!.waste_segregation_practice = null;
									}}
								/>
								<Label for="waste_unknown" class="font-normal">Unknown</Label>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Livestock & Poultry Tab -->
		<Tabs.Content value="livestock">
			<Card.Root>
				<Card.Header>
					<Card.Title>Livestock & Poultry</Card.Title>
					<Card.Description>Inventory of farm animals</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
						<div class="space-y-2">
							<Label for="pigs">Pigs</Label>
							<NumberInput
								id="pigs"
								bind:value={formData.livestock_poultry!.pigs}
								placeholder="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="cows">Cows</Label>
							<NumberInput
								id="cows"
								bind:value={formData.livestock_poultry!.cows}
								placeholder="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="carabaos">Carabaos</Label>
							<NumberInput
								id="carabaos"
								bind:value={formData.livestock_poultry!.carabaos}
								placeholder="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="horses">Horses</Label>
							<NumberInput
								id="horses"
								bind:value={formData.livestock_poultry!.horses}
								placeholder="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="goats">Goats</Label>
							<NumberInput
								id="goats"
								bind:value={formData.livestock_poultry!.goats}
								placeholder="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="chickens">Chickens</Label>
							<NumberInput
								id="chickens"
								bind:value={formData.livestock_poultry!.chickens}
								placeholder="0"
							/>
						</div>
						<div class="space-y-2">
							<Label for="ducks">Ducks</Label>
							<NumberInput
								id="ducks"
								bind:value={formData.livestock_poultry!.ducks}
								placeholder="0"
							/>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Food Security Tab -->
		<Tabs.Content value="food">
			<Card.Root>
				<Card.Header>
					<Card.Title>Food Security</Card.Title>
					<Card.Description>Backyard gardens and food production</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="space-y-2">
						<Label for="backyard_gardens">Households with Backyard Garden</Label>
						<NumberInput
							id="backyard_gardens"
							bind:value={formData.food_security!.households_with_backyard_garden}
							placeholder="0"
						/>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Top 3 Garden Commodities</h3>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							{#each [0, 1, 2] as i}
								<div class="space-y-2">
									<Label for="commodity_{i}">Commodity {i + 1}</Label>
									<Input
										id="commodity_{i}"
										bind:value={formData.food_security!.common_garden_commodities[i]}
										placeholder="e.g., Vegetables, Fruits"
									/>
								</div>
							{/each}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Housing Tab -->
		<Tabs.Content value="housing">
			<Card.Root>
				<Card.Header>
					<Card.Title>Housing</Card.Title>
					<Card.Description>Housing quality and ownership types</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">House Quality Types</h3>
						<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
							{#each housingQualityTypes as type}
								<div class="flex items-center space-x-2">
									<Checkbox
										id="quality_{type}"
										checked={formData.housing!.quality_types.includes(type)}
										onCheckedChange={() => {
											formData.housing!.quality_types = toggleArrayItem(
												formData.housing!.quality_types,
												type
											);
										}}
									/>
									<Label for="quality_{type}" class="font-normal">{type}</Label>
								</div>
							{/each}
						</div>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Ownership Types</h3>
						<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
							{#each housingOwnershipTypes as type}
								<div class="flex items-center space-x-2">
									<Checkbox
										id="ownership_{type}"
										checked={formData.housing!.ownership_types.includes(type)}
										onCheckedChange={() => {
											formData.housing!.ownership_types = toggleArrayItem(
												formData.housing!.ownership_types,
												type
											);
										}}
									/>
									<Label for="ownership_{type}" class="font-normal">{type}</Label>
								</div>
							{/each}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Domestic Animals Tab -->
		<Tabs.Content value="animals">
			<Card.Root>
				<Card.Header>
					<Card.Title>Domestic Animals</Card.Title>
					<Card.Description>Pets and vaccination records</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div class="space-y-2">
							<Label for="total_domestic">Total Domestic Animals</Label>
							<NumberInput
								id="total_domestic"
								bind:value={formData.domestic_animals!.total_count}
								placeholder="0"
							/>
						</div>

						<div class="space-y-2">
							<Label for="dogs">Dogs</Label>
							<NumberInput id="dogs" bind:value={formData.domestic_animals!.dogs} placeholder="0" />
						</div>

						<div class="space-y-2">
							<Label for="cats">Cats</Label>
							<NumberInput id="cats" bind:value={formData.domestic_animals!.cats} placeholder="0" />
						</div>

						<div class="space-y-2">
							<Label for="dogs_vaccinated">Dogs Vaccinated</Label>
							<NumberInput
								id="dogs_vaccinated"
								bind:value={formData.domestic_animals!.dogs_vaccinated}
								placeholder="0"
							/>
						</div>

						<div class="space-y-2">
							<Label for="cats_vaccinated">Cats Vaccinated</Label>
							<NumberInput
								id="cats_vaccinated"
								bind:value={formData.domestic_animals!.cats_vaccinated}
								placeholder="0"
							/>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Community Empowerment Tab -->
		<Tabs.Content value="community">
			<Card.Root>
				<Card.Header>
					<Card.Title>Community Empowerment</Card.Title>
					<Card.Description
						>Organizations, information dissemination, and transportation</Card.Description
					>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="space-y-2">
						<Label for="sectoral_orgs">Sectoral Organizations</Label>
						<NumberInput
							id="sectoral_orgs"
							bind:value={formData.community_empowerment!.sectoral_organizations}
							placeholder="0"
						/>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Information Dissemination Methods</h3>
						<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
							{#each infoDisseminationMethods as method}
								<div class="flex items-center space-x-2">
									<Checkbox
										id="info_{method}"
										checked={formData.community_empowerment!.info_dissemination_methods.includes(
											method
										)}
										onCheckedChange={() => {
											formData.community_empowerment!.info_dissemination_methods = toggleArrayItem(
												formData.community_empowerment!.info_dissemination_methods,
												method
											);
										}}
									/>
									<Label for="info_{method}" class="font-normal">{method}</Label>
								</div>
							{/each}
						</div>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Transportation Methods</h3>
						<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
							{#each transportationMethods as method}
								<div class="flex items-center space-x-2">
									<Checkbox
										id="transport_{method}"
										checked={formData.community_empowerment!.transportation_methods.includes(
											method
										)}
										onCheckedChange={() => {
											formData.community_empowerment!.transportation_methods = toggleArrayItem(
												formData.community_empowerment!.transportation_methods,
												method
											);
										}}
									/>
									<Label for="transport_{method}" class="font-normal">{method}</Label>
								</div>
							{/each}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Utilities Tab -->
		<Tabs.Content value="utilities">
			<Card.Root>
				<Card.Header>
					<Card.Title>Utilities</Card.Title>
					<Card.Description>Electricity access and alternative sources</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="space-y-2">
						<Label for="electricity_households">Households with Electricity</Label>
						<NumberInput
							id="electricity_households"
							bind:value={formData.utilities!.households_with_electricity}
							placeholder="0"
						/>
					</div>

					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Alternative Electricity Sources</h3>
						<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
							{#each alternativeElectricitySources as source}
								<div class="flex items-center space-x-2">
									<Checkbox
										id="elec_{source}"
										checked={formData.utilities!.alternative_electricity_sources.includes(source)}
										onCheckedChange={() => {
											formData.utilities!.alternative_electricity_sources = toggleArrayItem(
												formData.utilities!.alternative_electricity_sources,
												source
											);
										}}
									/>
									<Label for="elec_{source}" class="font-normal">{source}</Label>
								</div>
							{/each}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>

	<!-- Form Actions -->
	<div class="flex justify-end gap-2">
		<Button type="button" variant="outline" onclick={onCancel}>Cancel</Button>
		<Button type="submit">
			<Save class="mr-2 size-4" />
			{initialData ? 'Update' : 'Create'} Sitio
		</Button>
	</div>
</form>
