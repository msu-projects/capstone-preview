<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Plus, Trash2 } from '@lucide/svelte';

	let {
		sectoral_organizations = $bindable(0),
		info_dissemination_methods = $bindable<string[]>([]),
		transportation_methods = $bindable<string[]>([]),
		dogs = $bindable(0),
		cats = $bindable(0),
		dogs_vaccinated = $bindable(0),
		cats_vaccinated = $bindable(0),
		local_officials = $bindable<Array<{ name: string; position: string }>>([]),
		rst_officials = $bindable<Array<{ name: string; position: string }>>([]),
		issues_concerns = $bindable<string[]>([]),
		proposed_ppas = $bindable<string[]>([])
	}: {
		sectoral_organizations: number;
		info_dissemination_methods: string[];
		transportation_methods: string[];
		dogs: number;
		cats: number;
		dogs_vaccinated: number;
		cats_vaccinated: number;
		local_officials: Array<{ name: string; position: string }>;
		rst_officials: Array<{ name: string; position: string }>;
		issues_concerns: string[];
		proposed_ppas: string[];
	} = $props();

	// Computed values
	const total_count = $derived(dogs + cats);
	const dog_vaccination_rate = $derived(
		dogs > 0 ? ((dogs_vaccinated / dogs) * 100).toFixed(1) : '0'
	);
	const cat_vaccination_rate = $derived(
		cats > 0 ? ((cats_vaccinated / cats) * 100).toFixed(1) : '0'
	);
	const overall_vaccination_rate = $derived(
		total_count > 0 ? (((dogs_vaccinated + cats_vaccinated) / total_count) * 100).toFixed(1) : '0'
	);

	const infoDisseminationMethods = [
		'Radio',
		'Signages',
		'Person in Authority',
		'Assembly',
		'Newspaper',
		'TV',
		'Internet/Social Media'
	];
	const transportationMethods = ['Motorcycle', 'Tricycle', '4-Wheels', 'Boat'];

	const localOfficialPositions = [
		'Sitio/Purok Leader',
		'Vice-President',
		'Secretary',
		'Treasurer',
		'Auditor',
		'PIO',
		'PIO/Bus. Manager',
		'Business Manager'
	];

	const rstOfficialPositions = ['Team Leader', 'Assistant Team Leader', 'Secretary', 'Member'];

	function toggleItem(arr: string[], item: string) {
		if (arr.includes(item)) {
			return arr.filter((i) => i !== item);
		} else {
			return [...arr, item];
		}
	}

	// Local Officials management
	function addLocalOfficial() {
		local_officials = [...local_officials, { name: '', position: '' }];
	}

	function removeLocalOfficial(index: number) {
		local_officials = local_officials.filter((_, i) => i !== index);
	}

	// RST Officials management
	function addRstOfficial() {
		rst_officials = [...rst_officials, { name: '', position: '' }];
	}

	function removeRstOfficial(index: number) {
		rst_officials = rst_officials.filter((_, i) => i !== index);
	}

	// Issues management
	let newIssue = $state('');
	function addIssue() {
		if (newIssue.trim()) {
			issues_concerns = [...issues_concerns, newIssue.trim()];
			newIssue = '';
		}
	}

	function removeIssue(index: number) {
		issues_concerns = issues_concerns.filter((_, i) => i !== index);
	}

	// PPAs management
	let newPpa = $state('');

	function addPpa() {
		if (newPpa.trim()) {
			proposed_ppas = [...proposed_ppas, newPpa.trim()];
			newPpa = '';
		}
	}

	function removePpa(index: number) {
		proposed_ppas = proposed_ppas.filter((_, i) => i !== index);
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Community Services</Card.Title>
		<Card.Description>
			Community empowerment, communication, transportation, and public health
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Community Empowerment -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Community Empowerment</h3>
			<div class="space-y-2">
				<Label for="sectoral_organizations">Sectoral Organizations</Label>
				<NumberInput
					id="sectoral_organizations"
					bind:value={sectoral_organizations}
					placeholder="0"
					min={0}
				/>
			</div>
		</div>

		<!-- Information Dissemination -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Information Dissemination</h3>
			<div class="space-y-3">
				<Label>Available Methods</Label>
				<div class="grid grid-cols-2 gap-3">
					{#each infoDisseminationMethods as method}
						<div class="flex items-center space-x-2">
							<Checkbox
								id={`info_${method}`}
								checked={info_dissemination_methods.includes(method)}
								onCheckedChange={() => {
									info_dissemination_methods = toggleItem(info_dissemination_methods, method);
								}}
							/>
							<Label for={`info_${method}`} class="cursor-pointer font-normal">{method}</Label>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Transportation -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Transportation</h3>
			<div class="space-y-3">
				<Label>Available Methods</Label>
				<div class="grid grid-cols-2 gap-3">
					{#each transportationMethods as method}
						<div class="flex items-center space-x-2">
							<Checkbox
								id={`transport_${method}`}
								checked={transportation_methods.includes(method)}
								onCheckedChange={() => {
									transportation_methods = toggleItem(transportation_methods, method);
								}}
							/>
							<Label for={`transport_${method}`} class="cursor-pointer font-normal">{method}</Label>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Domestic Animals (Public Health) -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Domestic Animals (Public Health)</h3>
			<p class="text-sm text-muted-foreground">
				Track domestic animals for rabies control and public health monitoring
			</p>

			<!-- Dogs -->
			<div class="space-y-2">
				<Label class="text-base">Dogs</Label>
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<Label for="dogs" class="whitespace-nowrap">Total:</Label>
						<NumberInput id="dogs" bind:value={dogs} placeholder="0" min={0} class="w-24" />
					</div>
					<div class="flex items-center gap-2">
						<Label for="dogs_vaccinated" class="whitespace-nowrap">Vaccinated:</Label>
						<NumberInput
							id="dogs_vaccinated"
							bind:value={dogs_vaccinated}
							placeholder="0"
							min={0}
							max={dogs}
							class="w-24"
						/>
					</div>
					{#if dogs > 0}
						<span class="text-sm text-muted-foreground">({dog_vaccination_rate}% vaccinated)</span>
					{/if}
				</div>
			</div>

			<!-- Cats -->
			<div class="space-y-2">
				<Label class="text-base">Cats</Label>
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<Label for="cats" class="whitespace-nowrap">Total:</Label>
						<NumberInput id="cats" bind:value={cats} placeholder="0" min={0} class="w-24" />
					</div>
					<div class="flex items-center gap-2">
						<Label for="cats_vaccinated" class="whitespace-nowrap">Vaccinated:</Label>
						<NumberInput
							id="cats_vaccinated"
							bind:value={cats_vaccinated}
							placeholder="0"
							min={0}
							max={cats}
							class="w-24"
						/>
					</div>
					{#if cats > 0}
						<span class="text-sm text-muted-foreground">({cat_vaccination_rate}% vaccinated)</span>
					{/if}
				</div>
			</div>

			<!-- Summary -->
			<div class="rounded-md border bg-muted/50 p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium">Total Domestic Animals</p>
						<p class="text-2xl font-bold">{total_count}</p>
					</div>
					<div class="text-right">
						<p class="text-sm font-medium">Overall Vaccination Rate</p>
						<p class="text-2xl font-bold">{overall_vaccination_rate}%</p>
						<p class="text-xs text-muted-foreground">
							{dogs_vaccinated + cats_vaccinated} of {total_count} vaccinated
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Local Officials -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-semibold">Sitio/Purok Officials</h3>
					<p class="text-sm text-muted-foreground">Local leaders and officers of the sitio</p>
				</div>
				<Button type="button" variant="outline" size="sm" onclick={addLocalOfficial}>
					<Plus class="mr-1 size-4" />
					Add Official
				</Button>
			</div>

			{#if local_officials.length === 0}
				<p class="text-sm text-muted-foreground italic">No officials added yet.</p>
			{:else}
				<div class="space-y-3">
					{#each local_officials as official, i (i)}
						<div class="flex items-center gap-3">
							<Input bind:value={official.name} placeholder="Official name" class="flex-1" />
							<Select.Root
								type="single"
								value={official.position}
								onValueChange={(v) => (official.position = v)}
							>
								<Select.Trigger class="w-48">
									{official.position || 'Select position...'}
								</Select.Trigger>
								<Select.Content>
									{#each localOfficialPositions as position}
										<Select.Item value={position}>{position}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onclick={() => removeLocalOfficial(i)}
							>
								<Trash2 class="size-4 text-destructive" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- RST Officials -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-semibold">RST (Resident Support Team) Officials</h3>
					<p class="text-sm text-muted-foreground">Members of the Resident Support Team</p>
				</div>
				<Button type="button" variant="outline" size="sm" onclick={addRstOfficial}>
					<Plus class="mr-1 size-4" />
					Add RST Official
				</Button>
			</div>

			{#if rst_officials.length === 0}
				<p class="text-sm text-muted-foreground italic">No RST officials added yet.</p>
			{:else}
				<div class="space-y-3">
					{#each rst_officials as official, i (i)}
						<div class="flex items-center gap-3">
							<Input bind:value={official.name} placeholder="Official name" class="flex-1" />
							<Select.Root
								type="single"
								value={official.position}
								onValueChange={(v) => (official.position = v)}
							>
								<Select.Trigger class="w-48">
									{official.position || 'Select position...'}
								</Select.Trigger>
								<Select.Content>
									{#each rstOfficialPositions as position}
										<Select.Item value={position}>{position}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onclick={() => removeRstOfficial(i)}
							>
								<Trash2 class="size-4 text-destructive" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Issues & Concerns -->
		<div class="space-y-4">
			<div>
				<h3 class="text-lg font-semibold">Issues & Concerns</h3>
				<p class="text-sm text-muted-foreground">
					Primary issues identified by the community (e.g., Flooding, No Water System)
				</p>
			</div>

			{#if issues_concerns.length > 0}
				<div class="space-y-2">
					{#each issues_concerns as issue, i (i)}
						<div class="flex items-center gap-2">
							<span class="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm">{issue}</span>
							<Button type="button" variant="ghost" size="icon" onclick={() => removeIssue(i)}>
								<Trash2 class="size-4 text-destructive" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}

			<div class="flex items-center gap-2">
				<Input
					bind:value={newIssue}
					placeholder="Add an issue or concern..."
					class="flex-1"
					onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addIssue())}
				/>
				<Button type="button" variant="outline" size="sm" onclick={addIssue}>
					<Plus class="mr-1 size-4" />
					Add
				</Button>
			</div>
		</div>

		<!-- Proposed PPAs -->
		<div class="space-y-4">
			<div>
				<h3 class="text-lg font-semibold">Proposed PPAs (Programs, Projects, and Activities)</h3>
				<p class="text-sm text-muted-foreground">
					General proposed interventions to address community needs
				</p>
			</div>

			{#if proposed_ppas.length > 0}
				<div class="space-y-2">
					{#each proposed_ppas as ppa, i (i)}
						<div class="flex items-start gap-2">
							<span class="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm">{ppa}</span>
							<Button type="button" variant="ghost" size="icon" onclick={() => removePpa(i)}>
								<Trash2 class="size-4 text-destructive" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}

			<div class="flex items-start gap-2">
				<Textarea
					bind:value={newPpa}
					placeholder="Add a proposed PPA..."
					class="min-h-[60px] flex-1"
				/>
				<Button type="button" variant="outline" size="sm" onclick={addPpa} class="mt-1">
					<Plus class="mr-1 size-4" />
					Add
				</Button>
			</div>
		</div>
	</Card.Content>
</Card.Root>
