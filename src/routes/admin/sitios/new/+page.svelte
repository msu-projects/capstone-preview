<script lang="ts">
	import BasicInfoTab from '$lib/components/admin/sitios/BasicInfoTab.svelte';
	import CommunityServicesTab from '$lib/components/admin/sitios/CommunityServicesTab.svelte';
	import DemographicsSocialTab from '$lib/components/admin/sitios/DemographicsSocialTab.svelte';
	import InfrastructureHousingTab from '$lib/components/admin/sitios/InfrastructureHousingTab.svelte';
	import LivelihoodsEconomyTab from '$lib/components/admin/sitios/LivelihoodsEconomyTab.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { Sitio } from '$lib/types';
	import { validateDemographics } from '$lib/utils/demographic-validation';
	import { loadSitios, saveSitios } from '$lib/utils/storage';
	import {
		ArrowLeft,
		ArrowRight,
		Building,
		CircleAlert,
		HandHelping,
		MapPin,
		Save,
		Sprout,
		Users,
		X
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let isSaving = $state(false);
	let activeTab = $state('basic');
	let cancelDialogOpen = $state(false);

	// Tab 1: Basic Info
	let municipality = $state('');
	let barangay = $state('');
	let name = $state('');
	let province = $state('');
	let population = $state(0);
	let households = $state(0);
	let coordinates = $state({ lat: 0, lng: 0 });
	let coding = $state({ number: '', code: '' });

	// Tab 2: Demographics
	let demographics = $state({
		male: 0,
		female: 0,
		total: 0,
		age_0_14: 0,
		age_15_64: 0,
		age_65_above: 0
	});

	// Tab 3: Social Services
	let social_services = $state({
		registered_voters: 0,
		philhealth_beneficiaries: 0,
		fourps_beneficiaries: 0
	});

	// Tab 4: Economic
	let economic_condition = $state({
		employments: [],
		income_brackets: []
	});

	// Tab 5: Agriculture
	let agriculture = $state({
		farmers_count: 0,
		farmer_associations: 0,
		farm_area_hectares: 0,
		top_crops: ['']
	});

	// Tab 6: Water & Sanitation
	let water_sanitation = $state({
		water_systems_count: 0,
		water_sources: [{ source: '', status: '' }],
		households_without_toilet: 0,
		toilet_facility_types: [],
		waste_segregation_practice: null
	});

	// Tab 7: Livestock
	let livestock_poultry = $state({
		pigs: 0,
		cows: 0,
		carabaos: 0,
		horses: 0,
		goats: 0,
		chickens: 0,
		ducks: 0
	});

	// Tab 8: Additional Info
	let utilities = $state({
		households_with_electricity: 0,
		alternative_electricity_sources: []
	});

	let community_empowerment = $state({
		sectoral_organizations: 0,
		info_dissemination_methods: [],
		transportation_methods: []
	});

	let housing = $state({
		quality_types: [],
		ownership_types: []
	});

	let domestic_animals = $state({
		total_count: 0,
		dogs: 0,
		cats: 0,
		dogs_vaccinated: 0,
		cats_vaccinated: 0
	});

	let food_security = $state({
		households_with_backyard_garden: 0,
		common_garden_commodities: ['', '', '']
	});

	// Validation
	const isTab1Valid = $derived(
		municipality.trim() !== '' && barangay.trim() !== '' && name.trim() !== ''
	);

	const canSave = $derived(isTab1Valid);

	// Tab navigation
	const tabOrder = ['basic', 'demographics-social', 'livelihoods', 'infrastructure', 'community'];
	const currentTabIndex = $derived(tabOrder.indexOf(activeTab));
	const canGoNext = $derived(currentTabIndex < tabOrder.length - 1);
	const canGoPrevious = $derived(currentTabIndex > 0);

	function nextTab() {
		if (canGoNext) {
			activeTab = tabOrder[currentTabIndex + 1];
		}
	}

	function previousTab() {
		if (canGoPrevious) {
			activeTab = tabOrder[currentTabIndex - 1];
		}
	}

	async function handleSave() {
		if (!canSave) {
			toast.error('Please complete required fields in Basic Information');
			return;
		}

		// Validate demographics
		const demographicValidation = validateDemographics({
			population,
			demographics
		});

		if (!demographicValidation.isValid) {
			const errorMessages = demographicValidation.errors.map((e) => e.message).join('\n');
			toast.error('Demographic data validation failed:\n' + errorMessages);
			activeTab = 'demographics'; // Switch to demographics tab to show errors
			return;
		}

		isSaving = true;

		const sitios = loadSitios();
		const maxId = sitios.reduce((max, s) => Math.max(max, s.id), 0);

		const newSitio: Sitio = {
			id: maxId + 1,
			name,
			municipality,
			barangay,
			province,
			population,
			households,
			coordinates,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			coding,
			demographics,
			social_services,
			economic_condition,
			agriculture,
			water_sanitation,
			livestock_poultry,
			utilities,
			community_empowerment,
			housing,
			domestic_animals,
			food_security
		};

		sitios.push(newSitio);
		const success = saveSitios(sitios);

		isSaving = false;

		if (success) {
			toast.success('Sitio created successfully!');
			setTimeout(() => {
				window.location.href = '/admin/sitios';
			}, 1000);
		} else {
			toast.error('Failed to save sitio. Storage may be full.');
		}
	}

	function handleCancel() {
		cancelDialogOpen = true;
	}

	function confirmCancel() {
		window.location.href = '/admin/sitios';
	}
</script>

<svelte:head>
	<title>Create New Sitio - Admin</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-muted/30">
	<!-- Header -->
	<div class="sticky top-0 z-10 border-b border-border bg-background shadow-sm">
		<div class="flex items-center justify-between p-4">
			<div>
				<h1 class="text-2xl font-bold">Create New Sitio</h1>
				<p class="text-sm text-muted-foreground">Enter sitio data step by step</p>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="outline" onclick={handleCancel} disabled={isSaving} class="gap-2">
					<X class="size-4" />
					Cancel
				</Button>
				<Button onclick={handleSave} disabled={!canSave || isSaving} class="gap-2">
					<Save class="size-4" />
					{isSaving ? 'Saving...' : 'Create Sitio'}
				</Button>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 p-6">
		<div class="w-full">
			<Tabs.Root bind:value={activeTab} class="w-full">
				<!-- Tabs List -->
				<Card.Card class="mb-6 py-0">
					<Card.CardContent class="p-3">
						<Tabs.List class="grid w-full grid-cols-2 gap-1 lg:grid-cols-5">
							<Tabs.Trigger value="basic" class="flex items-center gap-2 text-xs">
								<MapPin class="size-4" />
								<span class="hidden lg:inline">Basic Info</span>
								{#if !isTab1Valid && activeTab !== 'basic'}
									<CircleAlert class="size-3 text-destructive" />
								{/if}
							</Tabs.Trigger>
							<Tabs.Trigger value="demographics-social" class="flex items-center gap-2 text-xs">
								<Users class="size-4" />
								<span class="hidden lg:inline">Demographics & Social</span>
							</Tabs.Trigger>
							<Tabs.Trigger value="livelihoods" class="flex items-center gap-2 text-xs">
								<Sprout class="size-4" />
								<span class="hidden lg:inline">Livelihoods & Economy</span>
							</Tabs.Trigger>
							<Tabs.Trigger value="infrastructure" class="flex items-center gap-2 text-xs">
								<Building class="size-4" />
								<span class="hidden lg:inline">Infrastructure & Housing</span>
							</Tabs.Trigger>
							<Tabs.Trigger value="community" class="flex items-center gap-2 text-xs">
								<HandHelping class="size-4" />
								<span class="hidden lg:inline">Community Services</span>
							</Tabs.Trigger>
						</Tabs.List>
					</Card.CardContent>
				</Card.Card>

				<!-- Tab Content -->
				<Tabs.Content value="basic">
					<BasicInfoTab
						bind:municipality
						bind:barangay
						bind:name
						bind:province
						bind:population
						bind:households
						bind:coordinates
						bind:coding
						demographicsTotal={demographics.total}
					/>
				</Tabs.Content>

				<Tabs.Content value="demographics-social">
					<DemographicsSocialTab
						bind:male={demographics.male}
						bind:female={demographics.female}
						bind:total={demographics.total}
						bind:age_0_14={demographics.age_0_14}
						bind:age_15_64={demographics.age_15_64}
						bind:age_65_above={demographics.age_65_above}
						bind:registered_voters={social_services.registered_voters}
						bind:philhealth_beneficiaries={social_services.philhealth_beneficiaries}
						bind:fourps_beneficiaries={social_services.fourps_beneficiaries}
						{population}
					/>
				</Tabs.Content>

				<Tabs.Content value="livelihoods">
					<LivelihoodsEconomyTab
						bind:employments={economic_condition.employments}
						bind:income_brackets={economic_condition.income_brackets}
						bind:farmers_count={agriculture.farmers_count}
						bind:farmer_associations={agriculture.farmer_associations}
						bind:farm_area_hectares={agriculture.farm_area_hectares}
						bind:top_crops={agriculture.top_crops}
						bind:pigs={livestock_poultry.pigs}
						bind:cows={livestock_poultry.cows}
						bind:carabaos={livestock_poultry.carabaos}
						bind:horses={livestock_poultry.horses}
						bind:goats={livestock_poultry.goats}
						bind:chickens={livestock_poultry.chickens}
						bind:ducks={livestock_poultry.ducks}
						bind:households_with_backyard_garden={food_security.households_with_backyard_garden}
						bind:common_garden_commodities={food_security.common_garden_commodities}
					/>
				</Tabs.Content>

				<Tabs.Content value="infrastructure">
					<InfrastructureHousingTab
						bind:water_systems_count={water_sanitation.water_systems_count}
						bind:water_sources={water_sanitation.water_sources}
						bind:households_without_toilet={water_sanitation.households_without_toilet}
						bind:toilet_facility_types={water_sanitation.toilet_facility_types}
						bind:waste_segregation_practice={water_sanitation.waste_segregation_practice}
						bind:households_with_electricity={utilities.households_with_electricity}
						bind:alternative_electricity_sources={utilities.alternative_electricity_sources}
						bind:quality_types={housing.quality_types}
						bind:ownership_types={housing.ownership_types}
					/>
				</Tabs.Content>

				<Tabs.Content value="community">
					<CommunityServicesTab
						bind:sectoral_organizations={community_empowerment.sectoral_organizations}
						bind:info_dissemination_methods={community_empowerment.info_dissemination_methods}
						bind:transportation_methods={community_empowerment.transportation_methods}
						bind:dogs={domestic_animals.dogs}
						bind:cats={domestic_animals.cats}
						bind:dogs_vaccinated={domestic_animals.dogs_vaccinated}
						bind:cats_vaccinated={domestic_animals.cats_vaccinated}
					/>
				</Tabs.Content>
			</Tabs.Root>

			<!-- Navigation Buttons -->
			<Card.Card class="mt-6 p-0">
				<Card.CardContent class="flex justify-between p-4">
					<Button variant="outline" onclick={previousTab} disabled={!canGoPrevious} class="gap-2">
						<ArrowLeft class="size-4" />
						Previous
					</Button>
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						Step {currentTabIndex + 1} of {tabOrder.length}
					</div>
					<Button variant="outline" onclick={nextTab} disabled={!canGoNext} class="gap-2">
						Next
						<ArrowRight class="size-4" />
					</Button>
				</Card.CardContent>
			</Card.Card>
		</div>
	</div>
</div>

<!-- Cancel Confirmation Dialog -->
<AlertDialog.Root bind:open={cancelDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Discard Changes</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to cancel? Any unsaved changes will be lost.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Continue Editing</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmCancel} class="bg-destructive hover:bg-destructive/60">
				Discard Changes
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
