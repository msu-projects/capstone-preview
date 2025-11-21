<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { sitios } from '$lib/mock-data';
	import type { PriorityLevel, ProjectSitio, Sitio } from '$lib/types';
	import { cn } from '$lib/utils';
	import { Check, Home, MapPin, Plus, Search, Trash2, TrendingUp, Users } from '@lucide/svelte';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';

	let { projectSitios = $bindable([]), showSitioSelection = $bindable(true) } = $props<{
		projectSitios: Omit<ProjectSitio, 'project_id'>[];
		showSitioSelection: boolean;
	}>();

	let selectedSitioId = $state<number | undefined>(undefined);
	let beneficiariesTarget = $state('');
	let priorityLevel = $state<PriorityLevel>('medium');
	let focalPerson = $state('');
	let focalContact = $state('');

	// Popover state
	let popoverOpen = $state(false);
	let searchQuery = $state('');
	let selectedMunicipality = $state('');
	let selectedBarangay = $state('');

	// Filter out already selected sitios
	const availableSitios = $derived(
		sitios.filter(
			(s) => !projectSitios.some((ps: Omit<ProjectSitio, 'project_id'>) => ps.sitio_id === s.id)
		)
	);

	// Get unique municipalities and barangays
	const municipalities = $derived([...new Set(availableSitios.map((s) => s.municipality))].sort());
	const barangays = $derived(
		selectedMunicipality
			? [
					...new Set(
						availableSitios
							.filter((s) => s.municipality === selectedMunicipality)
							.map((s) => s.barangay)
					)
				].sort()
			: [...new Set(availableSitios.map((s) => s.barangay))].sort()
	);

	// Filtered sitios based on search and filters
	const filteredSitios = $derived(
		availableSitios.filter((sitio) => {
			const matchesSearch =
				!searchQuery ||
				sitio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sitio.barangay.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sitio.municipality.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesMunicipality =
				!selectedMunicipality || sitio.municipality === selectedMunicipality;
			const matchesBarangay = !selectedBarangay || sitio.barangay === selectedBarangay;

			return matchesSearch && matchesMunicipality && matchesBarangay;
		})
	);

	// Get selected sitio data
	const selectedSitioData = $derived(
		selectedSitioId ? sitios.find((s) => s.id === selectedSitioId) : undefined
	);

	// Calculate percentage of households with smooth animation
	const beneficiariesPercentage = new Tween(0, {
		duration: 500,
		easing: cubicOut
	});

	$effect(() => {
		if (!selectedSitioData || !beneficiariesTarget) {
			beneficiariesPercentage.target = 0;
			return;
		}
		const target = Number(beneficiariesTarget);
		if (isNaN(target) || target === 0) {
			beneficiariesPercentage.target = 0;
			return;
		}
		const percentage = Math.round((target / selectedSitioData.households) * 100);
		beneficiariesPercentage.target = percentage;
	});

	function selectSitio(sitio: Sitio) {
		selectedSitioId = sitio.id;
		// Auto-populate with sitio's household count
		beneficiariesTarget = sitio.households.toString();
		popoverOpen = false;
		searchQuery = '';
	}

	function clearFilters() {
		searchQuery = '';
		selectedMunicipality = '';
		selectedBarangay = '';
	}

	// Calculated totals
	const totalSitios = $derived(projectSitios.length);
	const totalBeneficiaries = $derived(
		projectSitios.reduce(
			(sum: number, ps: Omit<ProjectSitio, 'project_id'>) => sum + ps.beneficiaries_target,
			0
		)
	);
	const totalMunicipalities = $derived(
		[...new Set(projectSitios.map((ps: Omit<ProjectSitio, 'project_id'>) => ps.municipality))]
			.length
	);
	const totalBarangays = $derived(
		[...new Set(projectSitios.map((ps: Omit<ProjectSitio, 'project_id'>) => ps.barangay))].length
	);

	function addSitio() {
		if (!selectedSitioId || !beneficiariesTarget) {
			return;
		}

		const sitio = sitios.find((s) => s.id === selectedSitioId);
		if (!sitio) return;

		const newProjectSitio: Omit<ProjectSitio, 'project_id'> = {
			sitio_id: sitio.id,
			sitio_name: sitio.name,
			municipality: sitio.municipality,
			barangay: sitio.barangay,
			beneficiaries_target: Number(beneficiariesTarget),
			priority_level: priorityLevel,
			focal_person: focalPerson || undefined,
			focal_contact: focalContact || undefined
		};

		projectSitios = [...projectSitios, newProjectSitio];

		// Reset form
		selectedSitioId = undefined;
		beneficiariesTarget = '';
		priorityLevel = 'medium';
		focalPerson = '';
		focalContact = '';
		showSitioSelection = false;
	}

	function removeSitio(sitioId: number) {
		projectSitios = projectSitios.filter(
			(ps: Omit<ProjectSitio, 'project_id'>) => ps.sitio_id !== sitioId
		);
	}

	function getPriorityColor(priority: PriorityLevel): 'destructive' | 'outline' | 'secondary' {
		switch (priority) {
			case 'high':
				return 'destructive';
			case 'medium':
				return 'outline';
			case 'low':
				return 'secondary';
			default:
				return 'secondary';
		}
	}
</script>

<div class="space-y-6">
	<!-- Summary Cards -->
	{#if projectSitios.length > 0}
		<div class="grid gap-4 md:grid-cols-4">
			<Card.Card>
				<Card.CardContent class="">
					<div class="flex items-center gap-5">
						<MapPin class="size-5 text-primary" />
						<div>
							<p class="text-sm text-muted-foreground">Total Sitios</p>
							<p class="text-2xl font-bold">{totalSitios}</p>
						</div>
					</div>
				</Card.CardContent>
			</Card.Card>
			<Card.Card>
				<Card.CardContent class="">
					<div class="flex items-center gap-5">
						<Users class="size-5 text-primary" />
						<div>
							<p class="text-sm text-muted-foreground">Total Beneficiaries</p>
							<p class="text-2xl font-bold">{totalBeneficiaries.toLocaleString()}</p>
						</div>
					</div>
				</Card.CardContent>
			</Card.Card>
			<Card.Card>
				<Card.CardContent class="">
					<div class="flex items-center gap-5">
						<Home class="size-5 text-primary" />
						<div>
							<p class="text-sm text-muted-foreground">Municipalities</p>
							<p class="text-2xl font-bold">{totalMunicipalities}</p>
						</div>
					</div>
				</Card.CardContent>
			</Card.Card>
			<Card.Card>
				<Card.CardContent class="">
					<div class="flex items-center gap-5">
						<TrendingUp class="size-5 text-primary" />
						<div>
							<p class="text-sm text-muted-foreground">Barangays</p>
							<p class="text-2xl font-bold">{totalBarangays}</p>
						</div>
					</div>
				</Card.CardContent>
			</Card.Card>
		</div>
	{/if}

	<!-- Selected Sitios Table -->
	{#if projectSitios.length > 0}
		<Card.Card>
			<Card.CardHeader>
				<Card.CardTitle>Selected Sitios</Card.CardTitle>
				<Card.CardDescription>
					Multi-sitio projects allow a single project to benefit multiple communities simultaneously
				</Card.CardDescription>
			</Card.CardHeader>
			<Card.CardContent>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Sitio Name</Table.Head>
							<Table.Head>Municipality</Table.Head>
							<Table.Head>Barangay</Table.Head>
							<Table.Head>Beneficiaries</Table.Head>
							<Table.Head>Priority</Table.Head>
							<Table.Head>Focal Person</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each projectSitios as ps}
							<Table.Row>
								<Table.Cell class="font-medium">{ps.sitio_name}</Table.Cell>
								<Table.Cell>{ps.municipality}</Table.Cell>
								<Table.Cell>{ps.barangay}</Table.Cell>
								<Table.Cell>{ps.beneficiaries_target}</Table.Cell>
								<Table.Cell>
									<Badge variant={getPriorityColor(ps.priority_level)}>
										{ps.priority_level}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<div class="text-sm">
										{ps.focal_person || '—'}
										{#if ps.focal_contact}
											<br />
											<span class="text-muted-foreground">{ps.focal_contact}</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => removeSitio(ps.sitio_id)}
										class="text-destructive hover:text-destructive"
									>
										<Trash2 class="size-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.CardContent>
		</Card.Card>
	{/if}

	<!-- Add Sitio Form -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>
				{projectSitios.length === 0 ? 'Select Project Location(s)' : 'Add Another Sitio'}
			</Card.CardTitle>
			<Card.CardDescription>
				{projectSitios.length === 0
					? 'Start by selecting the first sitio for this project'
					: 'You can add multiple sitios to create a multi-sitio project'}
			</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent>
			{#if showSitioSelection || projectSitios.length === 0}
				<div class="grid gap-4 md:grid-cols-2">
					<!-- Sitio Selection with Popover -->
					<div class="space-y-2 md:col-span-2">
						<Label for="sitio" class="required">Select Sitio</Label>
						<Popover.Root bind:open={popoverOpen}>
							<Popover.Trigger
								class={cn(
									'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
								)}
							>
								{#if selectedSitioData}
									<div class="flex flex-col items-start">
										<span class="font-medium">{selectedSitioData.name}</span>
										<span class="text-xs text-muted-foreground">
											{selectedSitioData.barangay}, {selectedSitioData.municipality}
										</span>
									</div>
								{:else}
									<span class="text-muted-foreground">Select a sitio...</span>
								{/if}
								<Search class="ml-2 size-4 shrink-0 opacity-50" />
							</Popover.Trigger>
							<Popover.Content class="w-[500px] p-0" align="start">
								<div class="space-y-3 border-b p-3">
									<!-- Search Input -->
									<div class="relative">
										<Search class="absolute top-2.5 left-2 size-4 text-muted-foreground" />
										<Input placeholder="Search sitios..." bind:value={searchQuery} class="pl-8" />
									</div>

									<!-- Filter Dropdowns -->
									<!-- <div class="grid gap-2 md:grid-cols-2"> -->
									<div class="flex gap-3">
										<Select.Root type="single" bind:value={selectedMunicipality}>
											<Select.Trigger class="h-9">
												<span class="text-xs">
													{selectedMunicipality || 'All Municipalities'}
												</span>
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="">All Municipalities</Select.Item>
												{#each municipalities as municipality}
													<Select.Item value={municipality}>{municipality}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>

										<Select.Root type="single" bind:value={selectedBarangay}>
											<Select.Trigger class="h-9">
												<span class="text-xs">
													{selectedBarangay || 'All Barangays'}
												</span>
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="">All Barangays</Select.Item>
												{#each barangays as barangay}
													<Select.Item value={barangay}>{barangay}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</div>

									<!-- Clear Filters Button -->
									{#if searchQuery || selectedMunicipality || selectedBarangay}
										<Button
											variant="ghost"
											size="sm"
											class="h-7 w-full text-xs"
											onclick={clearFilters}
										>
											Clear Filters
										</Button>
									{/if}
								</div>

								<!-- Sitio List -->
								<div class="max-h-[300px] overflow-y-auto">
									{#if filteredSitios.length === 0}
										<div class="p-4 text-center text-sm text-muted-foreground">
											{availableSitios.length === 0
												? 'All sitios have been selected'
												: 'No sitios found matching your filters'}
										</div>
									{:else}
										<div class="p-1">
											{#each filteredSitios as sitio (sitio.id)}
												<button
													type="button"
													class={cn(
														'relative flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-sm transition-colors outline-none select-none hover:bg-accent/30',
														selectedSitioId === sitio.id && 'bg-accent'
													)}
													onclick={() => selectSitio(sitio)}
												>
													<div class="flex flex-1 flex-col items-start gap-1">
														<span class="font-medium">{sitio.name}</span>
														<span class="text-xs text-muted-foreground">
															{sitio.barangay}, {sitio.municipality}
														</span>
														<div class="flex gap-2 text-xs text-muted-foreground">
															<span>Pop: {sitio.population.toLocaleString()}</span>
															<span>•</span>
															<span>HH: {sitio.households.toLocaleString()}</span>
														</div>
													</div>
													{#if selectedSitioId === sitio.id}
														<Check class="size-4 shrink-0" />
													{/if}
												</button>
											{/each}
										</div>
									{/if}
								</div>
							</Popover.Content>
						</Popover.Root>
					</div>

					<!-- Beneficiaries Target -->
					<div class="space-y-2">
						<Label for="beneficiaries-target" class="required">Target Beneficiary Households</Label>
						<Input
							id="beneficiaries-target"
							type="number"
							bind:value={beneficiariesTarget}
							placeholder="Enter number of households"
							min="1"
							max={selectedSitioData?.households}
						/>
						{#if selectedSitioData && beneficiariesTarget}
							<div class="flex items-center gap-2 text-xs">
								<div class="flex-1">
									<div class="mb-1 flex items-center justify-between">
										<span class="text-muted-foreground">
											{beneficiariesTarget} of {selectedSitioData.households.toLocaleString()} households
										</span>
										<span class="font-medium">{Math.round(beneficiariesPercentage.current)}%</span>
									</div>
									<div class="h-2 overflow-hidden rounded-full bg-secondary">
										<div
											class="h-full bg-primary"
											style="width: {Math.min(beneficiariesPercentage.current, 100)}%"
										></div>
									</div>
								</div>
							</div>
						{/if}
					</div>
					<!-- Priority Level -->
					<div class="space-y-2">
						<Label for="priority" class="required">Implementation Priority</Label>
						<Select.Root type="single" bind:value={priorityLevel}>
							<Select.Trigger class="w-full">
								{priorityLevel.charAt(0).toUpperCase() + priorityLevel.slice(1)}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="high" label="High">
									<Badge variant="destructive">High</Badge>
								</Select.Item>
								<Select.Item value="medium" label="Medium">
									<Badge variant="outline">Medium</Badge>
								</Select.Item>
								<Select.Item value="low" label="Low">
									<Badge variant="secondary">Low</Badge>
								</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Focal Person -->
					<div class="space-y-2">
						<Label for="focal-person">Local Focal Person</Label>
						<Input
							id="focal-person"
							bind:value={focalPerson}
							placeholder="Name of local coordinator"
						/>
					</div>

					<!-- Focal Contact -->
					<div class="space-y-2">
						<Label for="focal-contact">Contact Number</Label>
						<Input id="focal-contact" bind:value={focalContact} placeholder="0912-345-6789" />
					</div>

					<!-- Action Buttons -->
					<div class="flex gap-2 md:col-span-2">
						<Button
							onclick={addSitio}
							disabled={!selectedSitioId || !beneficiariesTarget}
							class="gap-2"
						>
							<Plus class="size-4" />
							Add Sitio
						</Button>
						{#if projectSitios.length > 0}
							<Button variant="outline" onclick={() => (showSitioSelection = false)}>Cancel</Button>
						{/if}
					</div>
				</div>
			{:else}
				<Button onclick={() => (showSitioSelection = true)} variant="outline" class="gap-2">
					<Plus class="size-4" />
					Add Another Sitio
				</Button>
			{/if}
		</Card.CardContent>
	</Card.Card>
</div>

<style>
	:global(.required::after) {
		content: ' *';
		color: hsl(var(--destructive));
	}
</style>
