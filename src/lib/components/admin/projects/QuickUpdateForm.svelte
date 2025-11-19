<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { ProjectStatus } from '$lib/types';
	import { Zap } from '@lucide/svelte';

	interface Props {
		status: ProjectStatus;
		physicalActual: string;
		statusStage: string;
		statusIssues: string;
		statusRecommendations: string;
		catchUpPlan: string;
		maleEmployment: string;
		femaleEmployment: string;
		onSwitchToFull: () => void;
	}

	let {
		status = $bindable(),
		physicalActual = $bindable(),
		statusStage = $bindable(),
		statusIssues = $bindable(),
		statusRecommendations = $bindable(),
		catchUpPlan = $bindable(),
		maleEmployment = $bindable(),
		femaleEmployment = $bindable(),
		onSwitchToFull
	}: Props = $props();

	// Derived computed values
	let totalEmployment = $derived(Number(maleEmployment || 0) + Number(femaleEmployment || 0));

	// Get status label for display
	const getStatusLabel = (s: ProjectStatus) => {
		switch (s) {
			case 'planning':
				return 'Planning';
			case 'in-progress':
				return 'In Progress';
			case 'completed':
				return 'Completed';
			case 'suspended':
				return 'Suspended';
			default:
				return 'Select status';
		}
	};
</script>

<div class="space-y-6">
	<!-- Header with icon and description -->
	<div class="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
		<Zap class="mt-0.5 size-5 text-primary" />
		<div class="flex-1">
			<h3 class="text-sm font-semibold">Quick Update Mode</h3>
			<p class="text-xs text-muted-foreground">
				Update the most commonly changed monitoring fields. Need to edit project details?
				<button
					type="button"
					onclick={onSwitchToFull}
					class="text-primary underline-offset-4 hover:underline"
				>
					Switch to Full Edit
				</button>
			</p>
		</div>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Project Status & Progress</Card.Title>
			<Card.Description>Update project status and completion percentage</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<!-- Status -->
				<div class="space-y-2">
					<Label for="status">Project Status</Label>
					<Select.Root type="single" bind:value={status}>
						<Select.Trigger id="status" class="w-full">
							{getStatusLabel(status)}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="planning" label="Planning">Planning</Select.Item>
							<Select.Item value="in-progress" label="In Progress">In Progress</Select.Item>
							<Select.Item value="completed" label="Completed">Completed</Select.Item>
							<Select.Item value="suspended" label="Suspended">Suspended</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Completion Percentage -->
				<div class="space-y-2">
					<Label for="completion">Completion Percentage</Label>
					<div class="relative">
						<Input
							id="completion"
							type="number"
							min="0"
							max="100"
							bind:value={physicalActual}
							placeholder="0"
						/>
						<span class="pointer-events-none absolute top-2.5 right-3 text-sm text-muted-foreground"
							>%</span
						>
					</div>
				</div>

				<!-- Current Stage -->
				<div class="space-y-2 md:col-span-2">
					<Label for="current-stage">Current Stage</Label>
					<Input
						id="current-stage"
						type="text"
						bind:value={statusStage}
						placeholder="e.g., Foundation work ongoing, Installation phase"
					/>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Status Summary</Card.Title>
			<Card.Description>Document issues, recommendations, and catch-up plans</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<!-- Issues -->
			<div class="space-y-2">
				<Label for="issues">Issues Encountered</Label>
				<Textarea
					id="issues"
					bind:value={statusIssues}
					placeholder="Describe any issues or challenges encountered during implementation"
					rows={3}
				/>
			</div>

			<!-- Recommendations -->
			<div class="space-y-2">
				<Label for="recommendations">Recommendations</Label>
				<Textarea
					id="recommendations"
					bind:value={statusRecommendations}
					placeholder="Provide recommendations for addressing issues or improving implementation"
					rows={3}
				/>
			</div>

			<!-- Catch-Up Plan -->
			<div class="space-y-2">
				<Label for="catchup-plan">Catch-Up Plan</Label>
				<Textarea
					id="catchup-plan"
					bind:value={catchUpPlan}
					placeholder="Outline action plans to address delays or improve progress"
					rows={3}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Employment Generated</Card.Title>
			<Card.Description>Track jobs created by this project</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-4 md:grid-cols-3">
				<!-- Male Employment -->
				<div class="space-y-2">
					<Label for="male-employment">Male</Label>
					<Input
						id="male-employment"
						type="number"
						min="0"
						bind:value={maleEmployment}
						placeholder="0"
					/>
				</div>

				<!-- Female Employment -->
				<div class="space-y-2">
					<Label for="female-employment">Female</Label>
					<Input
						id="female-employment"
						type="number"
						min="0"
						bind:value={femaleEmployment}
						placeholder="0"
					/>
				</div>

				<!-- Total Employment (Calculated) -->
				<div class="space-y-2">
					<Label for="total-employment">Total Employment</Label>
					<Input
						id="total-employment"
						type="number"
						value={totalEmployment}
						disabled
						class="opacity-75"
					/>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
