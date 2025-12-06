<script lang="ts">
	import { goto } from '$app/navigation';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import ConfigArrayEditor from '$lib/components/admin/config/ConfigArrayEditor.svelte';
	import ConfigResetDialog from '$lib/components/admin/config/ConfigResetDialog.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import {
		getSitioOptionsConfig,
		hasSitioOptionsOverride,
		resetSitioOptionsConfig,
		saveSitioOptionsConfig
	} from '$lib/config/sitio-options';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { SitioOptionsConfig } from '$lib/utils/config-storage';
	import { ArrowLeft, RotateCcw, Save } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let config = $state<SitioOptionsConfig | null>(null);
	let hasChanges = $state(false);
	let hasOverride = $state(false);
	let isResetDialogOpen = $state(false);

	const canManageConfig = $derived(authStore.isSuperadmin);

	onMount(() => {
		config = getSitioOptionsConfig();
		hasOverride = hasSitioOptionsOverride();
	});

	function updateField<K extends keyof SitioOptionsConfig>(field: K, value: SitioOptionsConfig[K]) {
		if (!config) return;
		config = { ...config, [field]: value };
		hasChanges = true;
	}

	function handleSave() {
		if (!config) return;
		const success = saveSitioOptionsConfig(config, 'Updated sitio form options');
		if (success) {
			toast.success('Configuration saved successfully');
			hasChanges = false;
			hasOverride = true;
		} else {
			toast.error('Failed to save configuration');
		}
	}

	function handleReset() {
		const success = resetSitioOptionsConfig();
		if (success) {
			config = getSitioOptionsConfig();
			toast.success('Configuration reset to defaults');
			hasChanges = false;
			hasOverride = false;
		} else {
			toast.error('Failed to reset configuration');
		}
		isResetDialogOpen = false;
	}

	interface OptionSection {
		key: keyof SitioOptionsConfig;
		title: string;
		description: string;
	}

	const sections: OptionSection[] = [
		{
			key: 'ethnicityOptions',
			title: 'Ethnicities',
			description: 'Ethnic groups commonly found in the region'
		},
		{
			key: 'religionOptions',
			title: 'Religions',
			description: 'Religious affiliations for demographic data'
		},
		{
			key: 'employmentTypeOptions',
			title: 'Employment Types',
			description: 'Common employment types in rural areas'
		},
		{
			key: 'livestockPoultryOptions',
			title: 'Livestock & Poultry',
			description: 'Types of livestock and poultry raised'
		},
		{
			key: 'cropOptions',
			title: 'Crops',
			description: 'Major agricultural crops in the area'
		},
		{
			key: 'gardenCommodityOptions',
			title: 'Garden Commodities',
			description: 'Common backyard garden commodities'
		},
		{
			key: 'waterSourceOptions',
			title: 'Water Sources',
			description: 'Sources of water for domestic use'
		},
		{
			key: 'waterStatusOptions',
			title: 'Water Status',
			description: 'Water quality and availability status'
		},
		{
			key: 'toiletFacilityTypeOptions',
			title: 'Toilet Facility Types',
			description: 'Types of sanitation facilities'
		},
		{
			key: 'alternativeElectricitySourceOptions',
			title: 'Alternative Electricity Sources',
			description: 'Alternative sources of electricity/power'
		},
		{
			key: 'housingQualityOptions',
			title: 'Housing Quality',
			description: 'Housing quality classifications'
		},
		{
			key: 'housingOwnershipOptions',
			title: 'Housing Ownership',
			description: 'Types of housing ownership'
		},
		{
			key: 'infoDisseminationMethodOptions',
			title: 'Info Dissemination Methods',
			description: 'Methods of information dissemination'
		},
		{
			key: 'transportationMethodOptions',
			title: 'Transportation Methods',
			description: 'Common transportation methods'
		},
		{
			key: 'localOfficialPositionOptions',
			title: 'Local Official Positions',
			description: 'Positions for local officials'
		},
		{
			key: 'rstOfficialPositionOptions',
			title: 'RST Official Positions',
			description: 'Positions for RST officials'
		}
	];
</script>

<svelte:head>
	<title>Sitio Form Options | Configuration</title>
</svelte:head>

<div class="flex flex-col">
	<AdminHeader
		title="Sitio Form Options"
		description="Configure dropdown options for sitio forms"
		breadcrumbs={[{ label: 'Configuration', href: '/admin/config' }, { label: 'Sitio Options' }]}
	>
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => goto('/admin/config')}>
				<ArrowLeft class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Back</span>
			</Button>
			{#if hasOverride}
				<Button variant="outline" size="sm" onclick={() => (isResetDialogOpen = true)}>
					<RotateCcw class="size-4 sm:mr-2" />
					<span class="hidden sm:inline">Reset</span>
				</Button>
			{/if}
			<Button size="sm" onclick={handleSave} disabled={!hasChanges || !canManageConfig}>
				<Save class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Save Changes</span>
			</Button>
		{/snippet}
		{#snippet badges()}
			{#if hasOverride}
				<Badge variant="outline" class="text-amber-600 dark:text-amber-400">Customized</Badge>
			{/if}
			{#if hasChanges}
				<Badge variant="outline" class="text-blue-600 dark:text-blue-400">Unsaved Changes</Badge>
			{/if}
		{/snippet}
	</AdminHeader>

	<div class="flex flex-col gap-6 p-4 md:p-6">
		{#if !canManageConfig}
			<Card.Root>
				<Card.Content class="py-8 text-center">
					<p class="text-muted-foreground">
						You need superadmin privileges to manage configuration.
					</p>
				</Card.Content>
			</Card.Root>
		{:else if config}
			<div class="grid gap-6 lg:grid-cols-2">
				{#each sections as section}
					{@const value = config[section.key]}
					{#if Array.isArray(value) && typeof value[0] === 'string'}
						<Card.Root>
							<Card.Header class="pb-3">
								<Card.Title class="text-base">{section.title}</Card.Title>
								<Card.Description>{section.description}</Card.Description>
							</Card.Header>
							<Card.Content>
								<ConfigArrayEditor
									items={value as string[]}
									onUpdate={(items) =>
										updateField(section.key, items as SitioOptionsConfig[typeof section.key])}
									placeholder="Add new option..."
								/>
							</Card.Content>
						</Card.Root>
					{/if}
				{/each}
			</div>
		{:else}
			<Card.Root>
				<Card.Content class="py-8 text-center">
					<p class="text-muted-foreground">Loading configuration...</p>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
</div>

<ConfigResetDialog
	bind:open={isResetDialogOpen}
	sectionName="Sitio Form Options"
	onConfirm={handleReset}
	onCancel={() => (isResetDialogOpen = false)}
/>
