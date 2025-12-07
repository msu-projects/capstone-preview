<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import BasicInfoTab from '$lib/components/admin/sitios/BasicInfoTab.svelte';
	import CommunityServicesTab from '$lib/components/admin/sitios/CommunityServicesTab.svelte';
	import DemographicsSocialTab from '$lib/components/admin/sitios/DemographicsSocialTab.svelte';
	import InfrastructureHousingTab from '$lib/components/admin/sitios/InfrastructureHousingTab.svelte';
	import LivelihoodsEconomyTab from '$lib/components/admin/sitios/LivelihoodsEconomyTab.svelte';
	import NeedsAssessmentTab from '$lib/components/admin/sitios/NeedsAssessmentTab.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { FormStepper, type Step } from '$lib/components/ui/form-stepper';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { Sitio, SitioIssue, SitioPPA } from '$lib/types';
	import { getNeedLevelFromScore } from '$lib/types';
	import { validateDemographics } from '$lib/utils/demographic-validation';
	import { getSitioById, updateSitio } from '$lib/utils/storage';
	import {
		ArrowLeft,
		ArrowRight,
		Building,
		HandHelping,
		Loader2,
		MapPin,
		Save,
		Sprout,
		Target,
		Users,
		X
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	const isMobile = new IsMobile();

	let isSaving = $state(false);
	let isLoading = $state(true);
	let sitioNotFound = $state(false);
	let activeStep = $state('basic');
	let cancelDialogOpen = $state(false);
	let sitioId: number;

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
	let economic_condition = $state<{
		employments: Array<{ type: string; count: number }>;
		income_brackets: Array<{ bracket: string; households: number }>;
	}>({
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
	let water_sanitation = $state<{
		water_systems_count: number;
		water_sources: Array<{ source: string; status: string }>;
		households_without_toilet: number;
		toilet_facility_types: string[];
		waste_segregation_practice: boolean | null;
	}>({
		water_systems_count: 0,
		water_sources: [{ source: '', status: '' }],
		households_without_toilet: 0,
		toilet_facility_types: [],
		waste_segregation_practice: null
	});

	// Tab 7: Livestock
	let livestock_poultry = $state<string[]>([]);

	// Tab 8: Additional Info
	let utilities = $state<{
		households_with_electricity: number;
		alternative_electricity_sources: string[];
	}>({
		households_with_electricity: 0,
		alternative_electricity_sources: []
	});

	let community_empowerment = $state<{
		sectoral_organizations: number;
		info_dissemination_methods: string[];
		transportation_methods: string[];
	}>({
		sectoral_organizations: 0,
		info_dissemination_methods: [],
		transportation_methods: []
	});

	let housing = $state<{
		quality_types: Array<{ type: string; count: number }>;
		ownership_types: Array<{ type: string; count: number }>;
	}>({
		quality_types: [],
		ownership_types: []
	});

	let domestic_animals = $state({
		dogs: 0,
		cats: 0,
		dogs_vaccinated: 0,
		cats_vaccinated: 0
	});

	let food_security = $state({
		households_with_backyard_garden: 0,
		common_garden_commodities: ['', '', '']
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

	// Load sitio data on mount
	onMount(() => {
		// Check permissions
		if (!authStore.canPerform('sitios', 'write')) {
			toast.error('Access Denied', {
				description: 'You do not have permission to edit sitios.'
			});
			goto('/admin/sitios');
			return;
		}

		sitioId = parseInt($page.params.id || '0', 10);
		if (isNaN(sitioId)) {
			sitioNotFound = true;
			isLoading = false;
			return;
		}
		const sitio = getSitioById(sitioId);

		if (!sitio) {
			sitioNotFound = true;
			isLoading = false;
			toast.error('Sitio not found');
			return;
		}

		// Prefill all form fields with existing sitio data
		municipality = sitio.municipality || '';
		barangay = sitio.barangay || '';
		name = sitio.name || '';
		province = sitio.province || '';
		population = sitio.population || 0;
		households = sitio.households || 0;
		coordinates = sitio.coordinates || { lat: 0, lng: 0 };
		coding = sitio.coding || '';
		needScore = sitio.need_score ?? 5;

		demographics = {
			male: sitio.demographics?.male || 0,
			female: sitio.demographics?.female || 0,
			total: sitio.demographics?.total || 0,
			age_0_14: sitio.demographics?.age_0_14 || 0,
			age_15_64: sitio.demographics?.age_15_64 || 0,
			age_65_above: sitio.demographics?.age_65_above || 0
		};

		social_services = {
			registered_voters: sitio.social_services?.registered_voters || 0,
			philhealth_beneficiaries: sitio.social_services?.philhealth_beneficiaries || 0,
			fourps_beneficiaries: sitio.social_services?.fourps_beneficiaries || 0
		};

		economic_condition = {
			employments: sitio.economic_condition?.employments || [],
			income_brackets: sitio.economic_condition?.income_brackets || []
		};

		agriculture = {
			farmers_count: sitio.agriculture?.farmers_count || 0,
			farmer_associations: sitio.agriculture?.farmer_associations || 0,
			farm_area_hectares: sitio.agriculture?.farm_area_hectares || 0,
			top_crops: sitio.agriculture?.top_crops || ['']
		};

		water_sanitation = {
			water_systems_count: sitio.water_sanitation?.water_systems_count || 0,
			water_sources: sitio.water_sanitation?.water_sources || [{ source: '', status: '' }],
			households_without_toilet: sitio.water_sanitation?.households_without_toilet || 0,
			toilet_facility_types: sitio.water_sanitation?.toilet_facility_types || [],
			waste_segregation_practice: sitio.water_sanitation?.waste_segregation_practice || null
		};

		livestock_poultry = sitio.livestock_poultry || [];

		utilities = {
			households_with_electricity: sitio.utilities?.households_with_electricity || 0,
			alternative_electricity_sources: sitio.utilities?.alternative_electricity_sources || []
		};

		community_empowerment = {
			sectoral_organizations: sitio.community_empowerment?.sectoral_organizations || 0,
			info_dissemination_methods: sitio.community_empowerment?.info_dissemination_methods || [],
			transportation_methods: sitio.community_empowerment?.transportation_methods || []
		};

		housing = {
			quality_types: Array.isArray(sitio.housing?.quality_types)
				? sitio.housing.quality_types.map((item) =>
						typeof item === 'string' ? { type: item, count: 0 } : item
					)
				: [],
			ownership_types: Array.isArray(sitio.housing?.ownership_types)
				? sitio.housing.ownership_types.map((item) =>
						typeof item === 'string' ? { type: item, count: 0 } : item
					)
				: []
		};

		domestic_animals = {
			dogs: sitio.domestic_animals?.dogs || 0,
			cats: sitio.domestic_animals?.cats || 0,
			dogs_vaccinated: sitio.domestic_animals?.dogs_vaccinated || 0,
			cats_vaccinated: sitio.domestic_animals?.cats_vaccinated || 0
		};

		food_security = {
			households_with_backyard_garden: sitio.food_security?.households_with_backyard_garden || 0,
			common_garden_commodities: sitio.food_security?.common_garden_commodities || ['', '', '']
		};

		// Load new fields
		ethnicities = sitio.ethnicities || [];
		religions = sitio.religions || [];
		local_officials = sitio.local_officials || [];
		rst_officials = sitio.rst_officials || [];
		issues_concerns = sitio.issues_concerns || [];
		proposed_ppas = sitio.proposed_ppas || [];

		isLoading = false;
	});

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

		const updatedSitio: Partial<Sitio> = {
			name,
			municipality,
			barangay,
			province,
			population,
			households,
			coordinates,
			coding,
			need_score: needScore,
			need_level: getNeedLevelFromScore(needScore),
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

		const success = updateSitio(sitioId, updatedSitio);

		isSaving = false;

		if (success) {
			toast.success('Sitio updated successfully!');
			window.location.href = '/admin/sitios';
		} else {
			toast.error('Failed to update sitio. Storage may be full.');
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
	<title>Edit Sitio - Admin</title>
</svelte:head>

{#if isLoading}
	<div class="flex min-h-screen items-center justify-center bg-muted/30">
		<div class="flex flex-col items-center gap-4">
			<Loader2 class="size-8 animate-spin text-primary" />
			<p class="text-sm text-muted-foreground">Loading sitio data...</p>
		</div>
	</div>
{:else if sitioNotFound}
	<div class="flex min-h-screen items-center justify-center bg-muted/30">
		<Card.Card class="w-full max-w-md">
			<Card.CardHeader>
				<Card.CardTitle>Sitio Not Found</Card.CardTitle>
				<Card.CardDescription>
					The sitio you're trying to edit doesn't exist or has been deleted.
				</Card.CardDescription>
			</Card.CardHeader>
			<Card.CardContent>
				<Button onclick={() => (window.location.href = '/admin/sitios')} class="w-full">
					Back to Sitios
				</Button>
			</Card.CardContent>
		</Card.Card>
	</div>
{:else}
	<div class="flex min-h-screen flex-col bg-muted/30">
		<!-- Header -->
		<AdminHeader
			sticky
			title="Edit Sitio"
			description="Update information for {name || 'this sitio'}"
		>
			{#snippet actions()}
				<Button
					variant="outline"
					onclick={handleCancel}
					disabled={isSaving}
					class="gap-2"
					size="sm"
				>
					<X class="size-4" />
					<span class="hidden sm:inline">Cancel</span>
				</Button>
				<Button onclick={handleSave} disabled={!canSave || isSaving} class="gap-2" size="sm">
					<Save class="size-4" />
					<span class="hidden sm:inline">{isSaving ? 'Saving...' : 'Update Sitio'}</span>
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
					<p class="mb-4 text-sm text-muted-foreground">
						Fields marked with <span class="text-destructive">*</span> are required.
					</p>
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
					<Card.Root class="mt-6 p-0">
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
{/if}
