<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { sitios } from '$lib/mock-data';
	import type { ProjectStatus } from '$lib/types';
	import type { DateValue } from '@internationalized/date';
	import { Calendar as CalendarIcon, MapPin } from '@lucide/svelte';

	interface Props {
		title: string;
		description: string;
		category: string;
		selectedSitio: string;
		status: ProjectStatus;
		startDate: DateValue | undefined;
		endDate: DateValue | undefined;
		budget: string;
		beneficiaries: string;
		implementingAgency: string;
		projectYear: string;
		completionPercentage: string;
		baselineApproved: DateValue | undefined;
		startDateOpen: boolean;
		endDateOpen: boolean;
		baselineApprovedOpen: boolean;
	}

	let {
		title = $bindable(),
		description = $bindable(),
		category = $bindable(),
		selectedSitio = $bindable(),
		status = $bindable(),
		startDate = $bindable(),
		endDate = $bindable(),
		budget = $bindable(),
		beneficiaries = $bindable(),
		implementingAgency = $bindable(),
		projectYear = $bindable(),
		completionPercentage = $bindable(),
		baselineApproved = $bindable(),
		startDateOpen = $bindable(),
		endDateOpen = $bindable(),
		baselineApprovedOpen = $bindable()
	}: Props = $props();

	const selectedSitioData = $derived(sitios.find((s) => s.id === Number(selectedSitio)));

	const categories = [
		'Infrastructure',
		'Agriculture',
		'Education',
		'Health',
		'Water & Sanitation',
		'Livelihood',
		'Environment',
		'Social Services',
		'Other'
	];
</script>

<div class="space-y-6">
	<!-- Project Details -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Project Details</Card.CardTitle>
			<Card.CardDescription>Basic information about the project</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			<!-- Title -->
			<div class="space-y-2">
				<Label for="title">
					Project Title <span class="text-destructive">*</span>
				</Label>
				<Input id="title" bind:value={title} placeholder="Enter project title" required />
			</div>

			<!-- Description -->
			<div class="space-y-2">
				<Label for="description">
					Description <span class="text-destructive">*</span>
				</Label>
				<Textarea
					id="description"
					bind:value={description}
					placeholder="Enter project description"
					rows={4}
					required
				/>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<!-- Category -->
				<div class="space-y-2">
					<Label for="category">
						Category <span class="text-destructive">*</span>
					</Label>
					<Select.Root type="single" bind:value={category}>
						<Select.Trigger id="category" class="w-full">
							{category || 'Select category'}
						</Select.Trigger>
						<Select.Content>
							{#each categories as cat}
								<Select.Item value={cat} label={cat}>{cat}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Status -->
				<div class="space-y-2">
					<Label for="status">Status</Label>
					<Select.Root type="single" bind:value={status}>
						<Select.Trigger id="status" class="w-full">
							{status === 'planning'
								? 'Planning'
								: status === 'in-progress'
									? 'In Progress'
									: status === 'completed'
										? 'Completed'
										: 'Suspended'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="planning" label="Planning">Planning</Select.Item>
							<Select.Item value="in-progress" label="In Progress">In Progress</Select.Item>
							<Select.Item value="completed" label="Completed">Completed</Select.Item>
							<Select.Item value="suspended" label="Suspended">Suspended</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Location & Timeline -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Location & Timeline</Card.CardTitle>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			<!-- Sitio -->
			<div class="space-y-2">
				<Label for="sitio">
					Sitio <span class="text-destructive">*</span>
				</Label>
				<Select.Root type="single" bind:value={selectedSitio}>
					<Select.Trigger id="sitio" class="w-full">
						{#if selectedSitioData}
							{selectedSitioData.name}, {selectedSitioData.municipality}
						{:else}
							Select sitio
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#each sitios as sitio}
							<Select.Item value={sitio.id.toString()} label="{sitio.name}, {sitio.municipality}">
								{sitio.name}, {sitio.municipality}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if selectedSitioData}
					<p class="text-sm text-muted-foreground">
						<MapPin class="mr-1 inline size-3" />
						{selectedSitioData.barangay}, {selectedSitioData.municipality}
					</p>
				{/if}
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<!-- Start Date -->
				<div class="space-y-2">
					<Label for="startDate">
						Start Date <span class="text-destructive">*</span>
					</Label>
					<Popover.Root bind:open={startDateOpen}>
						<Popover.Trigger class="w-full">
							<Button variant="outline" class="w-full justify-start text-left font-normal">
								<CalendarIcon class="mr-2 size-4" />
								{startDate ? startDate.toString() : 'Pick a date'}
							</Button>
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0">
							<Calendar
								type="single"
								bind:value={startDate}
								class="rounded-md border"
								onValueChange={() => (startDateOpen = false)}
							/>
						</Popover.Content>
					</Popover.Root>
				</div>
				<!-- End Date -->
				<div class="space-y-2">
					<Label for="endDate">
						End Date <span class="text-destructive">*</span>
					</Label>
					<Popover.Root bind:open={endDateOpen}>
						<Popover.Trigger class="w-full">
							<Button variant="outline" class="w-full justify-start text-left font-normal">
								<CalendarIcon class="mr-2 size-4" />
								{endDate ? endDate.toString() : 'Pick a date'}
							</Button>
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0">
							<Calendar
								type="single"
								bind:value={endDate}
								class="rounded-md border"
								onValueChange={() => (endDateOpen = false)}
							/>
						</Popover.Content>
					</Popover.Root>
				</div>
			</div>

			<!-- Baseline Approval Date -->
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="baselineApproved">Baseline Approval Date</Label>
					<Popover.Root bind:open={baselineApprovedOpen}>
						<Popover.Trigger class="w-full">
							<Button variant="outline" class="w-full justify-start text-left font-normal">
								<CalendarIcon class="mr-2 size-4" />
								{baselineApproved ? baselineApproved.toString() : 'Pick a date'}
							</Button>
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0">
							<Calendar
								type="single"
								bind:value={baselineApproved}
								class="rounded-md border"
								onValueChange={() => (baselineApprovedOpen = false)}
							/>
						</Popover.Content>
					</Popover.Root>
					<p class="text-sm text-muted-foreground">
						Date when the original project plan was officially approved
					</p>
				</div>
				<div></div>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Budget & Beneficiaries -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Project Impact</Card.CardTitle>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<!-- Budget -->
				<!-- <div class="space-y-2">
					<Label for="budget">
						Budget <span class="text-destructive">*</span>
					</Label>
					<CurrencyInput
						id="budget"
						bind:value={budget}
						placeholder="₱ 0"
						min={0}
						required
					/>
				</div> -->

				<!-- Beneficiaries -->
				<div class="space-y-2">
					<Label for="beneficiaries">
						Beneficiaries <span class="text-destructive">*</span>
					</Label>
					<Input
						id="beneficiaries"
						type="number"
						bind:value={beneficiaries}
						placeholder="0"
						min="0"
						required
					/>
				</div>

				<!-- Implementing Agency -->
				<div class="space-y-2">
					<Label for="implementingAgency">
						Implementing Agency <span class="text-destructive">*</span>
					</Label>
					<Input
						id="implementingAgency"
						bind:value={implementingAgency}
						placeholder="e.g., DPWH, DA, DOH"
						required
					/>
				</div>

				<!-- Project Year -->
				<div class="space-y-2">
					<Label for="projectYear">Project Year</Label>
					<Input id="projectYear" type="number" bind:value={projectYear} min="2000" />
				</div>

				<!-- Completion Percentage -->
				<div class="space-y-2">
					<Label for="completionPercentage">Completion (%)</Label>
					<Input
						id="completionPercentage"
						type="number"
						bind:value={completionPercentage}
						min="0"
						max="100"
						step="0.1"
					/>
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>
</div>
