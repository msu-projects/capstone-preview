<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Users, UserPlus, X, Building, Shield } from '@lucide/svelte';

	let {
		projectManager = $bindable(''),
		pmAgency = $bindable(''),
		technicalLead = $bindable(''),
		implementationPartners = $bindable<string[]>([]),
		lguCounterparts = $bindable<string[]>([]),
		provincialTeam = $bindable<string[]>([]),
		dilgRep = $bindable(''),
		sectoralRep = $bindable(''),
		sitioCoordinators = $bindable<
			Array<{
				sitio_id: number;
				sitio_name: string;
				barangay_captain?: string;
				sitio_leader?: string;
				volunteer_coordinator?: string;
				contact_numbers?: string;
			}>
		>([])
	} = $props<{
		projectManager: string;
		pmAgency: string;
		technicalLead: string;
		implementationPartners: string[];
		lguCounterparts: string[];
		provincialTeam: string[];
		dilgRep: string;
		sectoralRep: string;
		sitioCoordinators: Array<{
			sitio_id: number;
			sitio_name: string;
			barangay_captain?: string;
			sitio_leader?: string;
			volunteer_coordinator?: string;
			contact_numbers?: string;
		}>;
	}>();

	let newPartner = $state('');
	let newLguCounterpart = $state('');
	let newProvincialMember = $state('');

	function addPartner() {
		if (newPartner.trim()) {
			implementationPartners = [...implementationPartners, newPartner.trim()];
			newPartner = '';
		}
	}

	function removePartner(index: number) {
		implementationPartners = implementationPartners.filter((_: string, i: number) => i !== index);
	}

	function addLguCounterpart() {
		if (newLguCounterpart.trim()) {
			lguCounterparts = [...lguCounterparts, newLguCounterpart.trim()];
			newLguCounterpart = '';
		}
	}

	function removeLguCounterpart(index: number) {
		lguCounterparts = lguCounterparts.filter((_: string, i: number) => i !== index);
	}

	function addProvincialMember() {
		if (newProvincialMember.trim()) {
			provincialTeam = [...provincialTeam, newProvincialMember.trim()];
			newProvincialMember = '';
		}
	}

	function removeProvincialMember(index: number) {
		provincialTeam = provincialTeam.filter((_: string, i: number) => i !== index);
	}
</script>

<div class="space-y-6">
	<!-- Project Management Team -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle class="flex items-center gap-2">
				<Users class="size-5" />
				Project Management Team
			</Card.CardTitle>
			<Card.CardDescription>
				Core team responsible for project implementation and management
			</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="project-manager" class="required">Project Manager</Label>
					<Input
						id="project-manager"
						bind:value={projectManager}
						placeholder="Name of project manager"
					/>
				</div>
				<div class="space-y-2">
					<Label for="pm-agency" class="required">Implementing Agency</Label>
					<Input
						id="pm-agency"
						bind:value={pmAgency}
						placeholder="e.g., Provincial Engineer's Office"
					/>
				</div>
				<div class="space-y-2 md:col-span-2">
					<Label for="technical-lead">Technical Lead</Label>
					<Input
						id="technical-lead"
						bind:value={technicalLead}
						placeholder="Name of technical lead"
					/>
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Implementation Partners -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle class="flex items-center gap-2">
				<Building class="size-5" />
				Implementation Partners
			</Card.CardTitle>
			<Card.CardDescription>NGOs, CSOs, Private Sector, or National Agencies involved</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			{#if implementationPartners.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each implementationPartners as partner, index}
						<Badge variant="secondary" class="gap-2">
							{partner}
							<button type="button" onclick={() => removePartner(index)} class="hover:text-destructive">
								<X class="size-3" />
							</button>
						</Badge>
					{/each}
				</div>
			{/if}
			<div class="flex gap-2">
				<Input
					bind:value={newPartner}
					placeholder="Partner organization name"
					onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addPartner())}
				/>
				<Button type="button" onclick={addPartner} variant="outline" class="gap-2 shrink-0">
					<UserPlus class="size-4" />
					Add
				</Button>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- LGU Counterpart Personnel -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle class="flex items-center gap-2">
				<Building class="size-5" />
				LGU Counterpart Personnel
			</Card.CardTitle>
			<Card.CardDescription>Local government unit staff supporting the project</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			{#if lguCounterparts.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each lguCounterparts as counterpart, index}
						<Badge variant="secondary" class="gap-2">
							{counterpart}
							<button
								type="button"
								onclick={() => removeLguCounterpart(index)}
								class="hover:text-destructive"
							>
								<X class="size-3" />
							</button>
						</Badge>
					{/each}
				</div>
			{/if}
			<div class="flex gap-2">
				<Input
					bind:value={newLguCounterpart}
					placeholder="LGU personnel name or office"
					onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addLguCounterpart())}
				/>
				<Button type="button" onclick={addLguCounterpart} variant="outline" class="gap-2 shrink-0">
					<UserPlus class="size-4" />
					Add
				</Button>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Oversight Structure -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle class="flex items-center gap-2">
				<Shield class="size-5" />
				Oversight Structure
			</Card.CardTitle>
			<Card.CardDescription>Provincial and sectoral oversight team members</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent class="space-y-6">
			<!-- Provincial Monitoring Team -->
			<div class="space-y-3">
				<Label>Provincial Monitoring Team Members</Label>
				{#if provincialTeam.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each provincialTeam as member, index}
							<Badge variant="secondary" class="gap-2">
								{member}
								<button
									type="button"
									onclick={() => removeProvincialMember(index)}
									class="hover:text-destructive"
								>
									<X class="size-3" />
								</button>
							</Badge>
						{/each}
					</div>
				{/if}
				<div class="flex gap-2">
					<Input
						bind:value={newProvincialMember}
						placeholder="Team member name or office"
						onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addProvincialMember())}
					/>
					<Button
						type="button"
						onclick={addProvincialMember}
						variant="outline"
						class="gap-2 shrink-0"
					>
						<UserPlus class="size-4" />
						Add
					</Button>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<!-- DILG Representative -->
				<div class="space-y-2">
					<Label for="dilg-rep">DILG Representative</Label>
					<Input id="dilg-rep" bind:value={dilgRep} placeholder="DILG representative name" />
				</div>

				<!-- Sectoral Representative -->
				<div class="space-y-2">
					<Label for="sectoral-rep">Sectoral Representative</Label>
					<Input
						id="sectoral-rep"
						bind:value={sectoralRep}
						placeholder="Based on project category"
					/>
					<p class="text-xs text-muted-foreground">
						e.g., DA for Agriculture, DepEd for Education, etc.
					</p>
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Sitio-Level Coordinators -->
	{#if sitioCoordinators.length > 0}
		<Card.Card>
			<Card.CardHeader>
				<Card.CardTitle>Sitio-Level Coordinators</Card.CardTitle>
				<Card.CardDescription>Local coordinators for each selected sitio</Card.CardDescription>
			</Card.CardHeader>
			<Card.CardContent>
				<div class="space-y-4">
					{#each sitioCoordinators as coordinator}
						<div class="rounded-lg border p-4 space-y-3">
							<div class="font-medium text-sm flex items-center gap-2">
								<Badge variant="outline">{coordinator.sitio_name}</Badge>
							</div>
							<div class="grid gap-3 md:grid-cols-2">
								<div class="space-y-1.5">
									<Label for={`bc-${coordinator.sitio_id}`} class="text-xs">Barangay Captain</Label>
									<Input
										id={`bc-${coordinator.sitio_id}`}
										bind:value={coordinator.barangay_captain}
										placeholder="Barangay Captain name"
										class="h-9"
									/>
								</div>
								<div class="space-y-1.5">
									<Label for={`sl-${coordinator.sitio_id}`} class="text-xs">Sitio Leader</Label>
									<Input
										id={`sl-${coordinator.sitio_id}`}
										bind:value={coordinator.sitio_leader}
										placeholder="Sitio Leader name"
										class="h-9"
									/>
								</div>
								<div class="space-y-1.5">
									<Label for={`vc-${coordinator.sitio_id}`} class="text-xs">Volunteer Coordinator</Label>
									<Input
										id={`vc-${coordinator.sitio_id}`}
										bind:value={coordinator.volunteer_coordinator}
										placeholder="Volunteer Coordinator name"
										class="h-9"
									/>
								</div>
								<div class="space-y-1.5">
									<Label for={`cn-${coordinator.sitio_id}`} class="text-xs">Contact Numbers</Label>
									<Input
										id={`cn-${coordinator.sitio_id}`}
										bind:value={coordinator.contact_numbers}
										placeholder="e.g., 0912-345-6789, 0923-456-7890"
										class="h-9"
									/>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</Card.CardContent>
		</Card.Card>
	{/if}
</div>

<style>
	:global(.required::after) {
		content: ' *';
		color: hsl(var(--destructive));
	}
</style>
