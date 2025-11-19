<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Plus, X } from '@lucide/svelte';

	interface Props {
		projectManager: string;
		pmAgency: string;
		technicalLead: string;
		contractor: string;
		oversightCommittee: string[];
		newCommitteeMember: string;
		technicalContact: string;
		administrativeContact: string;
	}

	let {
		projectManager = $bindable(),
		pmAgency = $bindable(),
		technicalLead = $bindable(),
		contractor = $bindable(),
		oversightCommittee = $bindable(),
		newCommitteeMember = $bindable(),
		technicalContact = $bindable(),
		administrativeContact = $bindable()
	}: Props = $props();

	function addCommitteeMember() {
		if (newCommitteeMember.trim()) {
			oversightCommittee = [...oversightCommittee, newCommitteeMember.trim()];
			newCommitteeMember = '';
		}
	}

	function removeCommitteeMember(index: number) {
		oversightCommittee = oversightCommittee.filter((_, i) => i !== index);
	}
</script>

<div class="space-y-6">
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Key Personnel</Card.CardTitle>
			<Card.CardDescription>Responsible parties and contact information</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="projectManager">Project Manager</Label>
					<Input id="projectManager" bind:value={projectManager} placeholder="Full name" />
				</div>

				<div class="space-y-2">
					<Label for="pmAgency">PM Agency</Label>
					<Input id="pmAgency" bind:value={pmAgency} placeholder="Agency/Department" />
				</div>

				<div class="space-y-2">
					<Label for="technicalLead">Technical Lead</Label>
					<Input id="technicalLead" bind:value={technicalLead} placeholder="Full name" />
				</div>

				<div class="space-y-2">
					<Label for="contractor">Contractor</Label>
					<Input id="contractor" bind:value={contractor} placeholder="Company name" />
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Oversight Committee -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Oversight Committee</Card.CardTitle>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			<div class="flex gap-2">
				<Input
					bind:value={newCommitteeMember}
					placeholder="Add committee member"
					onkeydown={(e) => e.key === 'Enter' && addCommitteeMember()}
				/>
				<Button type="button" onclick={addCommitteeMember}>
					<Plus class="size-4" />
				</Button>
			</div>

			{#if oversightCommittee.length > 0}
				<div class="space-y-2">
					{#each oversightCommittee as member, index (index)}
						<div class="flex items-center justify-between rounded-lg border bg-card p-3">
							<span>{member}</span>
							<Button variant="ghost" size="icon" onclick={() => removeCommitteeMember(index)}>
								<X class="size-4" />
							</Button>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-center text-sm text-muted-foreground">No committee members added</p>
			{/if}
		</Card.CardContent>
	</Card.Card>

	<!-- Escalation Contacts -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Escalation Contacts</Card.CardTitle>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			<div class="space-y-2">
				<Label for="technicalContact">Technical Contact</Label>
				<Input
					id="technicalContact"
					bind:value={technicalContact}
					placeholder="Name and contact details"
				/>
			</div>

			<div class="space-y-2">
				<Label for="administrativeContact">Administrative Contact</Label>
				<Input
					id="administrativeContact"
					bind:value={administrativeContact}
					placeholder="Name and contact details"
				/>
			</div>
		</Card.CardContent>
	</Card.Card>
</div>
