<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import FormSection from '$lib/components/ui/form-section/form-section.svelte';
	import HelpTooltip from '$lib/components/ui/help-tooltip/help-tooltip.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { NumberInput } from '$lib/components/ui/number-input';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		AlertTriangle,
		Bus,
		Cat,
		Dog,
		Megaphone,
		Plus,
		Target,
		Trash2,
		Users
	} from '@lucide/svelte';

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

<div class="space-y-6">
	<!-- Community Empowerment -->
	<FormSection
		title="Community Empowerment"
		description="Sectoral organizations and community structures"
		icon={Users}
		variant="default"
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<Label for="sectoral_organizations" class="flex items-center gap-1.5">
					Sectoral Organizations
					<HelpTooltip
						content="Number of community-based sectoral organizations (e.g., women's group, youth group, farmers' association)"
					/>
				</Label>
				<NumberInput
					id="sectoral_organizations"
					bind:value={sectoral_organizations}
					placeholder="0"
					min={0}
				/>
			</div>
		</div>
	</FormSection>

	<!-- Information Dissemination & Transportation -->
	<FormSection
		title="Communication & Transportation"
		description="Methods of information sharing and available transport"
		icon={Megaphone}
		variant="info"
		defaultOpen={false}
	>
		<div class="space-y-4">
			<div class="space-y-3">
				<Label>Information Dissemination Methods</Label>
				<div class="flex flex-wrap gap-2">
					{#each infoDisseminationMethods as method}
						<div
							class="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50 {info_dissemination_methods.includes(
								method
							)
								? 'bg-info/10 border-info/30'
								: ''}"
						>
							<Checkbox
								id={`info_${method}`}
								checked={info_dissemination_methods.includes(method)}
								onCheckedChange={() => {
									info_dissemination_methods = toggleItem(info_dissemination_methods, method);
								}}
							/>
							<Label for={`info_${method}`} class="cursor-pointer text-sm font-normal"
								>{method}</Label
							>
						</div>
					{/each}
				</div>
			</div>

			<div class="space-y-3">
				<Label class="flex items-center gap-1.5">
					<Bus class="size-4" />
					Transportation Methods
				</Label>
				<div class="flex flex-wrap gap-2">
					{#each transportationMethods as method}
						<div
							class="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50 {transportation_methods.includes(
								method
							)
								? 'bg-info/10 border-info/30'
								: ''}"
						>
							<Checkbox
								id={`transport_${method}`}
								checked={transportation_methods.includes(method)}
								onCheckedChange={() => {
									transportation_methods = toggleItem(transportation_methods, method);
								}}
							/>
							<Label for={`transport_${method}`} class="cursor-pointer text-sm font-normal"
								>{method}</Label
							>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</FormSection>

	<!-- Domestic Animals (Public Health) -->
	<FormSection
		title="Domestic Animals"
		description="Track animals for rabies control and public health"
		icon={Dog}
		variant="warning"
	>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Dogs Card -->
			<div class="rounded-lg border bg-muted/20 p-4">
				<div class="mb-3 flex items-center gap-2">
					<Dog class="size-5 text-muted-foreground" />
					<Label class="text-base font-medium">Dogs</Label>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<Label for="dogs" class="text-xs font-normal text-muted-foreground">Total</Label>
						<NumberInput id="dogs" bind:value={dogs} placeholder="0" min={0} />
					</div>
					<div class="space-y-1.5">
						<Label for="dogs_vaccinated" class="text-xs font-normal text-muted-foreground"
							>Vaccinated</Label
						>
						<NumberInput
							id="dogs_vaccinated"
							bind:value={dogs_vaccinated}
							placeholder="0"
							min={0}
							max={dogs}
						/>
					</div>
				</div>
				{#if dogs > 0}
					<p class="mt-2 text-xs text-muted-foreground">
						{dog_vaccination_rate}% vaccination rate
					</p>
				{/if}
			</div>

			<!-- Cats Card -->
			<div class="rounded-lg border bg-muted/20 p-4">
				<div class="mb-3 flex items-center gap-2">
					<Cat class="size-5 text-muted-foreground" />
					<Label class="text-base font-medium">Cats</Label>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<Label for="cats" class="text-xs font-normal text-muted-foreground">Total</Label>
						<NumberInput id="cats" bind:value={cats} placeholder="0" min={0} />
					</div>
					<div class="space-y-1.5">
						<Label for="cats_vaccinated" class="text-xs font-normal text-muted-foreground"
							>Vaccinated</Label
						>
						<NumberInput
							id="cats_vaccinated"
							bind:value={cats_vaccinated}
							placeholder="0"
							min={0}
							max={cats}
						/>
					</div>
				</div>
				{#if cats > 0}
					<p class="mt-2 text-xs text-muted-foreground">
						{cat_vaccination_rate}% vaccination rate
					</p>
				{/if}
			</div>
		</div>

		<!-- Summary Stats -->
		<div class="rounded-lg border bg-linear-to-r from-warning/5 to-success/5 p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs text-muted-foreground">Total Domestic Animals</p>
					<p class="text-2xl font-bold">{total_count}</p>
				</div>
				<div class="text-right">
					<p class="text-xs text-muted-foreground">Overall Vaccination Rate</p>
					<p class="text-2xl font-bold">{overall_vaccination_rate}%</p>
					<p class="text-xs text-muted-foreground">
						{dogs_vaccinated + cats_vaccinated} of {total_count} vaccinated
					</p>
				</div>
			</div>
		</div>
	</FormSection>

	<!-- Local Officials -->
	<FormSection
		title="Sitio/Purok Officials"
		description="Local leaders and officers"
		icon={Users}
		variant="success"
	>
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<Label>Officials List</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={addLocalOfficial}
					class="h-8 gap-1.5"
				>
					<Plus class="size-3.5" />
					Add
				</Button>
			</div>

			{#if local_officials.length === 0}
				<div
					class="flex flex-col items-center gap-2 rounded-lg border border-dashed py-6 text-center"
				>
					<Users class="size-6 text-muted-foreground/50" />
					<p class="text-sm text-muted-foreground">No officials added yet</p>
				</div>
			{:else}
				<div class="rounded-lg border">
					<table class="w-full">
						<thead>
							<tr class="border-b bg-muted/30">
								<th class="px-3 py-2 text-left text-sm font-medium">Name</th>
								<th class="w-48 px-3 py-2 text-left text-sm font-medium">Position</th>
								<th class="w-10"></th>
							</tr>
						</thead>
						<tbody>
							{#each local_officials as official, i (i)}
								<tr class="border-b last:border-0">
									<td class="px-3 py-2">
										<Input bind:value={official.name} placeholder="Official name" />
									</td>
									<td class="px-3 py-2">
										<Select.Root
											type="single"
											value={official.position}
											onValueChange={(v) => (official.position = v ?? '')}
										>
											<Select.Trigger class="w-full">
												{official.position || 'Select position'}
											</Select.Trigger>
											<Select.Content>
												{#each localOfficialPositions as position}
													<Select.Item value={position}>{position}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</td>
									<td class="px-1 py-2">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											class="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
											onclick={() => removeLocalOfficial(i)}
										>
											<Trash2 class="size-4" />
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</FormSection>

	<!-- RST Officials -->
	<FormSection
		title="RST Officials"
		description="Resident Support Team members"
		icon={Users}
		variant="default"
		defaultOpen={false}
	>
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<Label class="flex items-center gap-1.5">
					Officials List
					<HelpTooltip
						content="Resident Support Team - community volunteers assisting in local governance"
					/>
				</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={addRstOfficial}
					class="h-8 gap-1.5"
				>
					<Plus class="size-3.5" />
					Add
				</Button>
			</div>

			{#if rst_officials.length === 0}
				<div
					class="flex flex-col items-center gap-2 rounded-lg border border-dashed py-6 text-center"
				>
					<Users class="size-6 text-muted-foreground/50" />
					<p class="text-sm text-muted-foreground">No RST officials added yet</p>
				</div>
			{:else}
				<div class="rounded-lg border">
					<table class="w-full">
						<thead>
							<tr class="border-b bg-muted/30">
								<th class="px-3 py-2 text-left text-sm font-medium">Name</th>
								<th class="w-48 px-3 py-2 text-left text-sm font-medium">Position</th>
								<th class="w-10"></th>
							</tr>
						</thead>
						<tbody>
							{#each rst_officials as official, i (i)}
								<tr class="border-b last:border-0">
									<td class="px-3 py-2">
										<Input bind:value={official.name} placeholder="Official name" />
									</td>
									<td class="px-3 py-2">
										<Select.Root
											type="single"
											value={official.position}
											onValueChange={(v) => (official.position = v ?? '')}
										>
											<Select.Trigger class="w-full">
												{official.position || 'Select position'}
											</Select.Trigger>
											<Select.Content>
												{#each rstOfficialPositions as position}
													<Select.Item value={position}>{position}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</td>
									<td class="px-1 py-2">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											class="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
											onclick={() => removeRstOfficial(i)}
										>
											<Trash2 class="size-4" />
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</FormSection>

	<!-- Issues & Concerns -->
	<FormSection
		title="Issues & Concerns"
		description="Primary community issues (e.g., Flooding, No Water System)"
		icon={AlertTriangle}
		variant="warning"
	>
		{#if issues_concerns.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each issues_concerns as issue, i (i)}
					<div class="flex items-center gap-1.5 rounded-lg border bg-warning/5 py-1.5 pr-1.5 pl-3">
						<span class="text-sm">{issue}</span>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="size-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
							onclick={() => removeIssue(i)}
						>
							<Trash2 class="size-3.5" />
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
			<Button type="button" variant="outline" size="sm" onclick={addIssue} class="h-9 gap-1.5">
				<Plus class="size-3.5" />
				Add
			</Button>
		</div>
	</FormSection>

	<!-- Proposed PPAs -->
	<FormSection
		title="Proposed PPAs"
		description="Programs, Projects, and Activities to address community needs"
		icon={Target}
		variant="success"
	>
		{#if proposed_ppas.length > 0}
			<div class="space-y-2">
				{#each proposed_ppas as ppa, i (i)}
					<div class="flex items-start gap-2">
						<div class="flex-1 rounded-lg border bg-success/5 px-3 py-2 text-sm">
							{ppa}
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
							onclick={() => removePpa(i)}
						>
							<Trash2 class="size-4" />
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
			<Button type="button" variant="outline" size="sm" onclick={addPpa} class="mt-1 gap-1.5">
				<Plus class="size-3.5" />
				Add
			</Button>
		</div>
	</FormSection>
</div>
