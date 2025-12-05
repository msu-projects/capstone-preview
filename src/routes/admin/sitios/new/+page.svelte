<script lang="ts">
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import BasicInfoTab from '$lib/components/admin/sitios/BasicInfoTab.svelte';
	import CommunityServicesTab from '$lib/components/admin/sitios/CommunityServicesTab.svelte';
	import DemographicsSocialTab from '$lib/components/admin/sitios/DemographicsSocialTab.svelte';
	import FormStepper, { type Step } from '$lib/components/admin/sitios/FormStepper.svelte';
	import InfrastructureHousingTab from '$lib/components/admin/sitios/InfrastructureHousingTab.svelte';
	import LivelihoodsEconomyTab from '$lib/components/admin/sitios/LivelihoodsEconomyTab.svelte';
	import NeedsAssessmentTab from '$lib/components/admin/sitios/NeedsAssessmentTab.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { Sitio, SitioIssue, SitioPPA } from '$lib/types';
	import { getNeedLevelFromScore } from '$lib/types';
	import { logAuditAction } from '$lib/utils/audit';
	import { validateDemographics } from '$lib/utils/demographic-validation';
	import { loadSitios, saveSitios } from '$lib/utils/storage';
	import {
		ArrowLeft,
		ArrowRight,
		Building,
		HandHelping,
		MapPin,
		Save,
		Sprout,
		Target,
		Users,
		X
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let isSaving = $state(false);
	let activeStep = $state('basic');
	let cancelDialogOpen = $state(false);

	// Tab 1: Basic Info
	let municipality = $state('');
	let barangay = $state('');
	let name = $state('');
	let province = $state('');
	let population = $state(0);
	let households = $state(0);
	let coordinates = $state({ lat: 0, lng: 0 });
	let coding = $state('');
	let needScore = $state(5);

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
		top_crops: []
	});

	// Tab 6: Water & Sanitation
	let water_sanitation = $state({
		water_systems_count: 0,
		water_sources: [],
		households_without_toilet: 0,
		toilet_facility_types: [],
		waste_segregation_practice: null
	});

	// Tab 7: Livestock
	let livestock_poultry = $state<string[]>([]);

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
		common_garden_commodities: []
	});

	// Ethnicity and Religion
	let ethnicities = $state<string[]>([]);
	let religions = $state<string[]>([]);

	// Local Officials
	let local_officials = $state<Array<{ name: string; position: string }>>([]);
	let rst_officials = $state<Array<{ name: string; position: string }>>([]);

	// Primary Priorities - Issues & Concerns (structured)
	let issues_concerns = $state<SitioIssue[]>([]);

	// Proposed PPAs (Programs, Projects, and Activities) (structured)
	let proposed_ppas = $state<SitioPPA[]>([]);

	// Validation
	const isBasicInfoValid = $derived(
		municipality.trim() !== '' && barangay.trim() !== '' && name.trim() !== ''
	);

	const isDemographicsValid = $derived(
		population === 0 || demographics.total === 0 || population === demographics.total
	);

	const isNeedsAssessmentValid = $derived(needScore >= 1 && needScore <= 10);

	const canSave = $derived(isBasicInfoValid && isNeedsAssessmentValid);

	// Step configuration
	const steps: Step[] = $derived([
		{
			id: 'basic',
			label: 'Basic Information',
			shortLabel: 'Basic Info',
			icon: MapPin,
			isValid: isBasicInfoValid,
			hasError: !isBasicInfoValid && activeStep !== 'basic'
		},
		{
			id: 'demographics-social',
			label: 'Demographics & Social',
			shortLabel: 'Demographics',
			icon: Users,
			isValid: demographics.total > 0,
			hasError: !isDemographicsValid
		},
		{
			id: 'livelihoods',
			label: 'Livelihoods & Economy',
			shortLabel: 'Livelihoods',
			icon: Sprout,
			isValid:
				economic_condition.employments.length > 0 ||
				agriculture.farmers_count > 0 ||
				livestock_poultry.length > 0
		},
		{
			id: 'infrastructure',
			label: 'Infrastructure & Housing',
			shortLabel: 'Infrastructure',
			icon: Building,
			isValid:
				water_sanitation.water_systems_count > 0 ||
				utilities.households_with_electricity > 0 ||
				housing.quality_types.length > 0
		},
		{
			id: 'community',
			label: 'Community Services',
			shortLabel: 'Community',
			icon: HandHelping,
			isValid: community_empowerment.sectoral_organizations > 0 || local_officials.length > 0
		},
		{
			id: 'needs-assessment',
			label: 'Needs Assessment',
			shortLabel: 'Needs',
			icon: Target,
			isValid: isNeedsAssessmentValid,
			hasError: !isNeedsAssessmentValid && activeStep !== 'needs-assessment'
		}
	]);

	// Step navigation
	const stepOrder = [
		'basic',
		'demographics-social',
		'livelihoods',
		'infrastructure',
		'community',
		'needs-assessment'
	];
	const currentStepIndex = $derived(stepOrder.indexOf(activeStep));
	const canGoNext = $derived(currentStepIndex < stepOrder.length - 1);
	const canGoPrevious = $derived(currentStepIndex > 0);
	const nextStepLabel = $derived(
		canGoNext ? steps[currentStepIndex + 1]?.shortLabel || steps[currentStepIndex + 1]?.label : null
	);
	const prevStepLabel = $derived(
		canGoPrevious
			? steps[currentStepIndex - 1]?.shortLabel || steps[currentStepIndex - 1]?.label
			: null
	);

	$effect(() => {
		currentStepIndex;
		scrollTo({ top: 0 });
	});

	function nextStep() {
		if (canGoNext) {
			activeStep = stepOrder[currentStepIndex + 1];
		}
	}

	function previousStep() {
		if (canGoPrevious) {
			activeStep = stepOrder[currentStepIndex - 1];
		}
	}

	async function handleSave() {
		if (!isBasicInfoValid) {
			toast.error('Please complete required fields in Basic Information');
			activeStep = 'basic';
			return;
		}

		if (!isNeedsAssessmentValid) {
			toast.error('Please complete the Needs Assessment section');
			activeStep = 'needs-assessment';
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
			activeStep = 'demographics-social';
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
			need_score: needScore,
			need_level: getNeedLevelFromScore(needScore),
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
			food_security,
			ethnicities,
			religions,
			local_officials,
			rst_officials,
			issues_concerns,
			proposed_ppas
		};

		sitios.push(newSitio);
		const success = saveSitios(sitios);

		isSaving = false;

		if (success) {
			logAuditAction(
				'create',
				'sitio',
				newSitio.id,
				newSitio.name,
				`Created sitio in ${newSitio.barangay}, ${newSitio.municipality}`
			);
			toast.success('Sitio created successfully!');
			window.location.href = '/admin/sitios';
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
	<AdminHeader sticky title="Create New Sitio" description="Enter sitio data step by step">
		{#snippet actions()}
			<Button variant="outline" onclick={handleCancel} disabled={isSaving} class="gap-2" size="sm">
				<X class="size-4" />
				<span class="hidden sm:inline">Cancel</span>
			</Button>
			<Button onclick={handleSave} disabled={!canSave || isSaving} class="gap-2" size="sm">
				<Save class="size-4" />
				<span class="hidden sm:inline">{isSaving ? 'Saving...' : 'Create Sitio'}</span>
			</Button>
		{/snippet}
	</AdminHeader>

	<!-- Content -->
	<div class="flex-1 p-4 md:p-6">
		<div class="flex flex-col gap-6 lg:flex-row">
			<!-- Stepper Sidebar -->
			<FormStepper {steps} bind:activeStep />

			<!-- Form Content -->
			<div class="min-w-0 flex-1">
				{#if activeStep === 'basic'}
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
				{:else if activeStep === 'demographics-social'}
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
						bind:ethnicities
						bind:religions
						{population}
						{households}
					/>
				{:else if activeStep === 'livelihoods'}
					<LivelihoodsEconomyTab
						bind:employments={economic_condition.employments}
						bind:income_brackets={economic_condition.income_brackets}
						bind:farmers_count={agriculture.farmers_count}
						bind:farmer_associations={agriculture.farmer_associations}
						bind:farm_area_hectares={agriculture.farm_area_hectares}
						bind:top_crops={agriculture.top_crops}
						bind:livestock_poultry
						bind:households_with_backyard_garden={food_security.households_with_backyard_garden}
						bind:common_garden_commodities={food_security.common_garden_commodities}
						{households}
						{population}
					/>
				{:else if activeStep === 'infrastructure'}
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
				{:else if activeStep === 'community'}
					<CommunityServicesTab
						bind:sectoral_organizations={community_empowerment.sectoral_organizations}
						bind:info_dissemination_methods={community_empowerment.info_dissemination_methods}
						bind:transportation_methods={community_empowerment.transportation_methods}
						bind:dogs={domestic_animals.dogs}
						bind:cats={domestic_animals.cats}
						bind:dogs_vaccinated={domestic_animals.dogs_vaccinated}
						bind:cats_vaccinated={domestic_animals.cats_vaccinated}
						bind:local_officials
						bind:rst_officials
					/>
				{:else if activeStep === 'needs-assessment'}
					<NeedsAssessmentTab bind:needScore bind:issues_concerns bind:proposed_ppas />
				{/if}

				<!-- Navigation Buttons -->
				<Card.Root class="mt-6 py-0">
					<Card.Content class="flex items-center justify-between p-4">
						<Button
							variant="outline"
							onclick={previousStep}
							disabled={!canGoPrevious}
							class="gap-2"
						>
							<ArrowLeft class="size-4" />
							<span class="hidden sm:inline">{prevStepLabel || 'Previous'}</span>
							<span class="sm:hidden">Back</span>
						</Button>

						<div class="flex items-center gap-2">
							<!-- Step dots for mobile -->
							<div class="flex items-center gap-1.5 lg:hidden">
								{#each steps as step, index}
									<div
										class="size-2 rounded-full transition-all {index === currentStepIndex
											? 'w-4 bg-primary'
											: step.isValid
												? 'bg-primary/50'
												: 'bg-muted-foreground/30'}"
									></div>
								{/each}
							</div>
							<!-- Step text for desktop -->
							<span class="hidden text-sm text-muted-foreground lg:block">
								Step {currentStepIndex + 1} of {stepOrder.length}
							</span>
						</div>

						<Button variant="outline" onclick={nextStep} disabled={!canGoNext} class="gap-2">
							<span class="hidden sm:inline">{nextStepLabel || 'Next'}</span>
							<span class="sm:hidden">Next</span>
							<ArrowRight class="size-4" />
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
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
