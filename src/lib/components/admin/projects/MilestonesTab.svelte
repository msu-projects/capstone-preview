<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { Project } from '$lib/types';
	import { CircleCheck, Plus } from '@lucide/svelte';

	interface Props {
		milestones: Project['milestones'];
		showMilestoneForm: boolean;
	}

	let { milestones = $bindable(), showMilestoneForm = $bindable() }: Props = $props();

	function toggleMilestoneForm() {
		showMilestoneForm = !showMilestoneForm;
	}

	function formatCurrency(amount: string): string {
		const num = Number(amount);
		if (isNaN(num)) return '₱0';
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 0
		}).format(num);
	}
</script>

<Card.Card>
	<Card.CardHeader>
		<div class="flex items-center justify-between">
			<div>
				<Card.CardTitle>Project Milestones</Card.CardTitle>
				<Card.CardDescription>Track key deliverables and checkpoints</Card.CardDescription>
			</div>
			<Button onclick={toggleMilestoneForm}>
				<Plus class="mr-2 size-4" />
				Add Milestone
			</Button>
		</div>
	</Card.CardHeader>
	<Card.CardContent>
		{#if milestones && milestones.length > 0}
			<div class="space-y-4">
				{#each milestones as milestone (milestone.id)}
					<div class="rounded-lg border bg-card p-4">
						<div class="mb-2 flex items-start justify-between">
							<div class="flex-1">
								<h4 class="font-semibold">{milestone.name}</h4>
								<p class="text-sm text-muted-foreground">{milestone.description}</p>
							</div>
							<Badge
								variant={milestone.status === 'completed'
									? 'default'
									: milestone.status === 'in_progress'
										? 'outline'
										: milestone.status === 'delayed'
											? 'destructive'
											: 'secondary'}
							>
								{milestone.status.replace('_', ' ')}
							</Badge>
						</div>
						<div class="grid gap-2 text-sm md:grid-cols-3">
							<div>
								<span class="text-muted-foreground">Progress:</span>
								{milestone.completion_percentage}%
							</div>
							<div>
								<span class="text-muted-foreground">Owner:</span>
								{milestone.owner}
							</div>
							<div>
								<span class="text-muted-foreground">Budget:</span>
								{formatCurrency(milestone.budget_allocation.toString())}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-8 text-center">
				<CircleCheck class="mx-auto mb-2 size-12 text-muted-foreground/50" />
				<p class="text-muted-foreground">No milestones added yet</p>
				<Button variant="outline" class="mt-4" onclick={toggleMilestoneForm}>
					<Plus class="mr-2 size-4" />
					Add Your First Milestone
				</Button>
			</div>
		{/if}

		{#if showMilestoneForm}
			<div class="mt-6 rounded-lg border bg-muted/30 p-4">
				<h4 class="mb-4 font-semibold">Add New Milestone</h4>
				<p class="text-sm text-muted-foreground">
					Milestone management coming soon. This feature will allow you to add, edit, and track
					project milestones.
				</p>
				<Button variant="outline" class="mt-4" onclick={toggleMilestoneForm}>Close</Button>
			</div>
		{/if}
	</Card.CardContent>
</Card.Card>
